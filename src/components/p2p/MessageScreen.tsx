import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Paperclip, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
	id: string;
	text: string;
	sender: 'user' | 'seller';
	timestamp: Date;
}

interface MessageScreenProps {
	sellerName: string;
	initialMessages: Message[];
	currentTimeLeft: number; // To display the relevant countdown
	formatTime: (seconds: number) => string;
	onSendMessage: (messageText: string) => void; // Callback to parent to handle actual sending
	onToggleScreen: () => void;
}

const MessageScreen: React.FC<MessageScreenProps> = ({ sellerName, initialMessages, currentTimeLeft, formatTime, onSendMessage, onToggleScreen }) => {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [currentMessage, setCurrentMessage] = useState('');
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMessages(initialMessages);
	}, [initialMessages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleLocalSendMessage = () => {
		if (currentMessage.trim() === '' || isSending) return;

		setIsSending(true);
		const messageToSend = currentMessage.trim();
		setCurrentMessage(''); // Clear input immediately

		// Simulate network delay
		setTimeout(() => {
			onSendMessage(messageToSend);
			setIsSending(false);
			// Optimistic update (optional, parent should be source of truth)
			// const newMessage: Message = {
			//   id: `msg-local-${Date.now()}`,
			//   text: messageToSend,
			//   sender: 'user',
			//   timestamp: new Date(),
			// };
			// setMessages(prev => [...prev, newMessage]);
		}, 1000); // 1 second delay
	};

	return (
		<div className="max-w-2xl space-y-6">
			<div className="flex flex-row justify-between items-center gap-4">
				<h1 className="sub-page-heading">Message</h1>
				<div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-lg font-mono font-semibold shadow-sm">{formatTime(currentTimeLeft)}</div>
			</div>
			<p className="sub-page-heading-sub-text text-left">Keep the message area clean and cordial.</p>
			<Card className="bg-background dark:bg-muted/50 shadow-none border-0">
				<CardHeader className="px-4 py-0 sm:py-3 border-b border-border">
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg text-foreground">{sellerName}</CardTitle>
						<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => toast.info('Call feature coming soon!')}>
							<Phone className="h-5 w-5" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="px-2 sm:px-4 pt-4 pb-2 space-y-4">
					<div className="h-80 overflow-y-auto space-y-4 pr-2">
						{messages.length === 0 ? (
							<p className="text-muted-foreground text-center py-10">No message here</p>
						) : (
							messages.map((msg) => (
								<div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} mb-1`}>
									<div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-foreground text-background rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
										<p className="text-sm whitespace-pre-wrap">{msg.text}</p>
									</div>
									<p className={`text-xs mt-1 px-1 ${msg.sender === 'user' ? 'text-muted-foreground/90' : 'text-muted-foreground/70'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
								</div>
							))
						)}
						<div ref={messagesEndRef} />
					</div>
					<div className="mt-auto pt-2 flex items-center gap-2 border-t border-border">
						<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => toast.info('Attachment feature coming soon!')}>
							<Paperclip className="h-5 w-5" />
						</Button>
						<input
							type="text"
							placeholder="Start Typing...."
							className="input flex-grow h-10 bg-muted focus:ring-primary border-border placeholder:text-muted-foreground/70"
							value={currentMessage}
							onChange={(e) => setCurrentMessage(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleLocalSendMessage()}
						/>
						<Button variant="default" size="icon" onClick={handleLocalSendMessage} disabled={!currentMessage.trim() || isSending}>
							{isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
						</Button>
					</div>
				</CardContent>
			</Card>
			<Button onClick={onToggleScreen} variant="outline" className="w-full" size={'lg'}>
				Back to Transaction Details
			</Button>
		</div>
	);
};

export default MessageScreen;
