import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Paperclip, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchP2PMessages, sendP2PMessage } from '@/lib/p2p-messaging';
import { handleFetchMessage } from '@/lib/helpers';
import { useAuthContext } from '@/context/AuthContext';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import OnlineBadge from '../ui/online-badge';
import { useOnlineContext } from '@/context/OnlineContext';

// Update Message type to support optional metadata
interface Message {
	id: string;
	text: string;
	sender: 'user' | 'seller';
	timestamp: Date;
	metadata?: { image?: string; imageUrl?: string; imageFile?: File };
}

interface MessageScreenProps {
	sellerName: string;
	initialMessages: Message[];
	tradeId: string;
	currentUserId: string;
	recipientId: string; // <-- add this prop
	currentTimeLeft?: number;
	formatTime?: (seconds: number) => string;
	onSendMessage?: (msg: { text: string; metadata?: { image?: string; imageFile?: File } }) => void;
	onToggleScreen: () => void;
	isExpired?: boolean;
	setImageFile?: (file: File | null) => void;
	setMessages?: (messages: Message[]) => void;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MessageScreen: React.FC<MessageScreenProps> = ({ sellerName, initialMessages, tradeId, currentUserId, recipientId, currentTimeLeft, formatTime, onToggleScreen, isExpired, setImageFile, setMessages: setMessagesProp }) => {
	const [messages, setMessagesState] = useState<Message[]>(initialMessages);
	const [currentMessage, setCurrentMessage] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [imageFile, _setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [modalImage, setModalImage] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { currentUser } = useAuthContext();
	const { isUserOnline } = useOnlineContext();

	// Only set messages from initialMessages on mount
	useEffect(() => {
		setMessagesState(initialMessages);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Scroll to bottom when messages change, with image load handling
	useEffect(() => {
		if (!messages.length) return;
		// If the last message has an image, wait for it to load before scrolling
		const lastMsg = messages[messages.length - 1];
		const imageUrl = lastMsg.metadata?.imageUrl || lastMsg.metadata?.image;
		if (imageUrl) {
			const img = new window.Image();
			img.onload = () => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
			};
			img.onerror = () => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
			};
			img.src = imageUrl;
		} else {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		_setImageFile(file);
		if (setImageFile) setImageFile(file); // <-- call prop if provided
		if (file) {
			setImagePreview(URL.createObjectURL(file));
		} else {
			setImagePreview(null);
		}
	};

	// Helper to update messages and persist
	const setMessages = (msgs: Message[]) => {
		setMessagesState(msgs);
		if (setMessagesProp) setMessagesProp(msgs);
	};

	// Supabase Realtime subscription
	useEffect(() => {
		if (!tradeId) return;

		const channel = supabase.channel(`messages-${tradeId}`);

		channel
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `related_transaction_id=eq.${tradeId}`,
				},
				(payload) => {
					const msg = payload.new;
					const imageUrl = msg.metadata?.imageUrl || msg.image_url || undefined;
					const newMsg: Message = {
						id: msg.id,
						text: msg.content,
						sender: msg.sender_id === currentUserId ? 'user' : 'seller',
						timestamp: new Date(msg.created_at),
						metadata: imageUrl ? { imageUrl } : undefined,
					};

					// If state is stale (e.g. user navigated away and back), fetch all messages
					if (!messages.length || (messages[messages.length - 1]?.id !== newMsg.id && newMsg.timestamp > messages[messages.length - 1]?.timestamp)) {
						// Fetch all messages from backend (simulate, or you can call a fetch function here)
						// For now, just append
						setMessages([...messages, newMsg]);
						return;
					}

					// Remove optimistic message if present (by matching text, sender, and image)
					const filtered = messages.filter((m) => {
						if (!m.id.startsWith('temp-')) return true;
						if (m.text === newMsg.text && m.sender === newMsg.sender) {
							if (m.metadata?.image && newMsg.metadata?.imageUrl) return false;
							if (!m.metadata?.image && !newMsg.metadata?.imageUrl) return false;
						}
						return true;
					});
					setMessages([...filtered, newMsg]);
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [tradeId, currentUserId, messages]);

	// 1. Only optimistically add the message if sending succeeds
	const handleSend = async () => {
		if (isExpired || isSending || (!currentMessage.trim() && !imageFile)) return;
		setIsSending(true);

		try {
			const msgToSend = {
				text: currentMessage.trim(), // This will be '' for image-only
				metadata: imageFile ? { imageFile } : undefined,
			};

			if (!currentUser || !tradeId || !recipientId) throw new Error('User, trade, or recipient not found');
			await sendP2PMessage({
				sender_id: currentUser.id,
				recipient_id: recipientId,
				content: msgToSend.text, // '' is valid for image-only
				message_type: 'message',
				related_transaction_id: tradeId,
				metadata: msgToSend.metadata,
				imageFile: imageFile || undefined,
			});

			setCurrentMessage('');
			_setImageFile(null);
			if (setImageFile) setImageFile(null);
			setImagePreview(null);
		} catch (err) {
			toast.error('Failed to send message.');
		} finally {
			setIsSending(false);
		}
	};

	// 3. On mount, always fetch messages from backend to refresh state in case it's stale
	useEffect(() => {
		async function fetchMessages() {
			try {
				const apiMessages = await fetchP2PMessages(tradeId);
				const mapped = apiMessages.map((msg: any) => ({
					id: msg.id,
					text: msg.content,
					sender: msg.sender_id === currentUserId ? 'user' : 'seller',
					timestamp: new Date(msg.created_at),
					metadata: msg.metadata?.imageUrl || msg.image_url ? { imageUrl: msg.metadata?.imageUrl || msg.image_url } : undefined,
				}));
				setMessages(mapped);
			} catch (err) {
				handleFetchMessage(err);
			}
		}
		if (tradeId && currentUserId) fetchMessages();
	}, [tradeId, currentUserId]);

	const counterpartOnline = isUserOnline(recipientId);

	return (
		<div className="max-w-2xl space-y-6 mb-0 sm:mb-10 md:mb-16">
			<div className="flex flex-row justify-between items-center gap-4">
				<h1 className="sub-page-heading">Chat</h1>
				{!isExpired && formatTime && typeof currentTimeLeft === 'number' ? <div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-lg font-mono font-semibold shadow-sm">{formatTime(currentTimeLeft)}</div> : null}
			</div>
			<Card className="bg-background/80 dark:bg-muted/60 shadow-none border-0">
				<CardHeader className="px-4 py-2 border-b border-border flex flex-row items-center justify-between">
					<div className="flex items-center gap-2">
						<CardTitle className="text-lg text-foreground">{sellerName}</CardTitle>
						<OnlineBadge online={counterpartOnline} />
					</div>
					{!isExpired && (
						<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => toast.info('Call feature coming soon!')}>
							<Phone className="h-5 w-5" />
						</Button>
					)}
				</CardHeader>
				<CardContent className="px-2 sm:px-4 pb-2 space-y-4">
					<div className="h-96 overflow-y-auto space-y-2 bg-muted/40 rounded-md p-2 flex flex-col">
						{messages.length === 0 ? (
							<p className="text-muted-foreground text-center py-10">No messages yet. Start the conversation!</p>
						) : (
							messages.map((msg, idx) => {
								const isUser = msg.sender === 'user';
								const showSender = idx === 0 || messages[idx - 1].sender !== msg.sender;
								return (
									<div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-1`}>
										{showSender && <span className={`text-xs font-semibold mb-1 px-1 ${isUser ? 'text-primary' : 'text-muted-foreground/80'}`}>{isUser ? 'You' : sellerName}</span>}
										<div
											className={`relative max-w-[90%] p-3 rounded-2xl shadow-sm break-words overflow-wrap break-all whitespace-pre-wrap ${
												isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-foreground rounded-bl-none border border-gray-300 dark:border-gray-600'
											}`}
										>
											{(msg.metadata?.imageUrl || msg.metadata?.image) && (
												<img
													src={msg.metadata.imageUrl || msg.metadata.image}
													alt="attachment"
													className="max-w-xs max-h-60 rounded mb-2 cursor-pointer"
													onClick={() => setModalImage(msg.metadata?.imageUrl || msg.metadata?.image || null)}
													onError={(e) => (e.currentTarget.style.display = 'none')}
												/>
											)}
											{msg.text && <p className="text-sm break-words overflow-wrap break-all whitespace-pre-wrap">{msg.text}</p>}
										</div>
										<p className={`text-xs mt-1 px-1 ${isUser ? 'text-muted-foreground/90 text-right' : 'text-muted-foreground/70 text-left'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
									</div>
								);
							})
						)}
						<div ref={messagesEndRef} />
					</div>
					{/* Image Modal */}
					{modalImage && (
						<Dialog open={!!modalImage} onOpenChange={() => setModalImage(null)}>
							<DialogContent className="flex items-center justify-center bg-black p-0 border-0 shadow-none max-w-none w-screen h-screen max-h-screen">
								<div className="relative w-[80vw] h-[80vh]">
									<DialogTitle className="sr-only">Enlarged chat image</DialogTitle>
									<Image src={modalImage} alt="Enlarged chat image" fill style={{ objectFit: 'contain' }} className="bg-black rounded" sizes="80vw" priority />
								</div>
							</DialogContent>
						</Dialog>
					)}
					<div className="flex items-center gap-2 border-t border-border py-3 bg-background/80 rounded-b-md">
						<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => document.getElementById('p2p-image-input')?.click()} disabled={isExpired}>
							<Paperclip className="h-5 w-5" />
						</Button>
						<input id="p2p-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isExpired} />
						{imagePreview && <img src={imagePreview} alt="preview" className="max-h-12 max-w-16 rounded mr-2" />}
						<input
							type="text"
							placeholder={isExpired ? 'Messaging disabled' : 'Type your message...'}
							className="input flex-grow h-12 bg-muted/60 focus:ring-primary border-border placeholder:text-muted-foreground/70 rounded-full px-4 text-base"
							value={currentMessage}
							onChange={(e) => setCurrentMessage(e.target.value)}
							onKeyDown={(e) => !isExpired && e.key === 'Enter' && (currentMessage.trim() || imageFile) && handleSend()}
							disabled={isExpired}
						/>
						<Button variant="default" size="icon" onClick={() => handleSend()} disabled={isExpired || (!currentMessage.trim() && !imageFile) || isSending} className="rounded-full h-12 w-12">
							{isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
						</Button>
					</div>
				</CardContent>
			</Card>
			<Button onClick={onToggleScreen} variant="outline" className="w-full mt-2" size={'lg'}>
				Back to Transaction Details
			</Button>
		</div>
	);
};

export default MessageScreen;
