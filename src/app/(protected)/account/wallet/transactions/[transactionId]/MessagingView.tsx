import React from 'react';
import MessageScreen from '@/components/p2p/MessageScreen';

interface MessagingViewProps {
	sellerName: string;
	currentUserId: string;
	tradeId: string;
	initialMessages: any[];
	currentTimeLeft?: number;
	formatTime: (seconds: number) => string;
	onSendMessage?: (msg: { text: string; metadata?: { image?: string; imageFile?: File } }) => void;
	onToggleScreen: () => void;
	isExpired: boolean;
	messagingDisabled: boolean;
	recipientId: string;
	setImageFile?: (file: File | null) => void; // <-- add prop
	setMessages?: (messages: any[]) => void; // <-- add prop
}

const MessagingView: React.FC<MessagingViewProps> = ({ tradeId, currentUserId, sellerName, initialMessages, currentTimeLeft, formatTime, onSendMessage, onToggleScreen, isExpired, messagingDisabled, recipientId, setImageFile, setMessages }) => (
	<MessageScreen
		sellerName={sellerName}
		initialMessages={initialMessages}
		currentTimeLeft={currentTimeLeft}
		formatTime={formatTime}
		onSendMessage={messagingDisabled || isExpired ? undefined : onSendMessage}
		onToggleScreen={onToggleScreen}
		isExpired={isExpired || messagingDisabled}
		tradeId={tradeId}
		recipientId={recipientId}
		currentUserId={currentUserId}
		setImageFile={setImageFile} // <-- pass prop
		setMessages={setMessages} // <-- pass prop
	/>
);

export default MessagingView;
