'use client';

import React, { useState, useEffect } from 'react'; // Added React and useRef
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle } from 'lucide-react'; // Added Phone, Paperclip, Send
import { toast } from 'sonner';
import nProgress from 'nprogress';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import OrderDetailItem from '@/components/p2p/OrderDetailItem';
import MessageScreen from '@/components/p2p/MessageScreen';
import AwaitingConfirmationView from '@/components/p2p/AwaitingConfirmationView'; // Import AwaitingConfirmationView
import CompletedTransactionView from '@/components/p2p/CompletedTransactionView'; // Import CompletedTransactionView
import copyToClipboard from '@/components/ui/copy-to-clipboard';

const PAYMENT_COUNTDOWN_SECONDS = 14 * 60 + 50; // 14 minutes 50 seconds
const AWAITING_CONFIRMATION_SECONDS = 30 * 60 + 41; // 30 minutes 41 seconds (example)

type TransactionFlowState = 'makePayment' | 'awaitingConfirmation' | 'completedTransaction';
interface Message {
	id: string;
	text: string;
	sender: 'user' | 'seller'; // 'user' is the current app user, 'seller' is the P2P counterparty
	timestamp: Date;
}

export default function TransactionDetailsPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const transactionId = params.transactionId as string;

	const [transactionFlowState, setTransactionFlowState] = useState<TransactionFlowState>('makePayment');
	const [isMadePaymentModalOpen, setIsMadePaymentModalOpen] = useState(false);
	const [isProcessingPaymentConfirmation, setIsProcessingPaymentConfirmation] = useState(false);
	const [showMessages, setShowMessages] = useState(false); // For toggling message screen

	const [messages, setMessages] = useState<Message[]>([]);

	// Extract order details from query parameters (memoize to prevent re-renders)
	const orderDetails = {
		// In a real app, this would likely come from a state or context after fetching
		amountNGN: parseFloat(searchParams.get('amountNGN') || '0'),
		rateNGN: parseFloat(searchParams.get('rateNGN') || '0'),
		quantityUSDT: parseFloat(searchParams.get('quantityUSDT') || '0'),
		transactionFeesNGN: parseFloat(searchParams.get('transactionFeesNGN') || '0'),
	};

	const sellerInfo = {
		// Similar to orderDetails, fetch or get from context
		name: searchParams.get('name') || 'N/A',
		bankName: searchParams.get('bankName') || 'N/A',
		accountNumber: searchParams.get('accountNumber') || 'N/A',
	};

	const [timeLeft, setTimeLeft] = useState(PAYMENT_COUNTDOWN_SECONDS); // General timer

	// Effect to initialize/reset timer when transactionFlowState changes
	useEffect(() => {
		if (transactionFlowState === 'makePayment') {
			setTimeLeft(PAYMENT_COUNTDOWN_SECONDS);
			if (!showMessages) window.scrollTo(0, 0); // Scroll to top if not showing messages
		} else if (transactionFlowState === 'awaitingConfirmation') {
			setTimeLeft(AWAITING_CONFIRMATION_SECONDS);
			// AwaitingConfirmationView and CompletedTransactionView handle their own scroll
		} else if (transactionFlowState === 'completedTransaction') {
			setTimeLeft(0); // Stop timer or set to a non-counting state
		}
	}, [transactionFlowState, showMessages]); // Add showMessages dependency

	// Effect for the countdown logic itself
	useEffect(() => {
		if (timeLeft <= 0) {
			// Handle timer expiration messages only once when timeLeft hits 0
			if (timeLeft === 0) {
				if (transactionFlowState === 'makePayment') {
					toast.error('Payment time expired. Please contact support if you have made payment.');
				} else if (transactionFlowState === 'awaitingConfirmation') {
					toast.warning('Confirmation period ended. Please check transaction status or contact support.');
				}
			}
			return; // Stop further interval creation if time is up or negative
		}

		// Do not run interval if transaction is completed
		if (transactionFlowState === 'completedTransaction') {
			return;
		}

		const intervalId = setInterval(() => {
			setTimeLeft((prevTime) => prevTime - 1);
		}, 1000);

		return () => clearInterval(intervalId);
	}, [timeLeft, transactionFlowState]); // Depends on timeLeft to tick and transactionFlowState to stop if completed

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const openMadePaymentModal = () => {
		setIsMadePaymentModalOpen(true);
	};

	const handleConfirmMadePayment = () => {
		setIsMadePaymentModalOpen(false);
		setIsProcessingPaymentConfirmation(true);
		nProgress.start();
		toast.info('Processing payment confirmation...');

		// Simulate API call to mark payment as made by user
		setTimeout(() => {
			setTransactionFlowState('awaitingConfirmation');
			setTimeLeft(AWAITING_CONFIRMATION_SECONDS); // Reset timer for awaiting confirmation phase
			toast.success("Payment marked as made. Waiting for seller's confirmation.");
			nProgress.done();
			setIsProcessingPaymentConfirmation(false);

			// Simulate seller confirming payment after a delay
			setTimeout(() => {
				setTransactionFlowState('completedTransaction');
				toast.success('Transaction Confirmed! Your payment has been received.');
				// Potentially clear timer or set to 0
				setTimeLeft(0);
			}, 15000); // Seller confirms after 15 seconds (example)
		}, 2000); // User confirmation processing delay
	};

	const handleSendMessage = (currentMessage: string) => {
		if (currentMessage.trim() === '') return;
		const newMessage: Message = {
			id: `msg-${Date.now()}`,
			text: currentMessage.trim(),
			sender: 'user', // Assuming the current app user is sending
			timestamp: new Date(),
		};
		setMessages((prevMessages) => [...prevMessages, newMessage]);
	};

	const toggleMessageScreen = () => {
		const currentlyShowingMessages = showMessages;
		setShowMessages(!currentlyShowingMessages);
		if (currentlyShowingMessages) {
			// Means we are toggling from messages to order view
			window.scrollTo(0, 0);
		}
	};

	// Check if essential data is present
	const isLoading = !orderDetails.amountNGN || !sellerInfo.name || sellerInfo.name === 'N/A';

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card className="bg-background border-0 shadow-none">
					<CardHeader className="px-0">
						<CardTitle className="sub-page-heading">Transaction Details</CardTitle>
					</CardHeader>
					<CardContent className="px-0">
						<p className="text-muted-foreground">Loading transaction and payment details...</p>
					</CardContent>
				</Card>
			</div>
		);
	}
	// MessageScreen component and OrderDetailItem are now imported

	if (showMessages) {
		return (
			<MessageScreen
				sellerName={sellerInfo.name}
				initialMessages={messages}
				currentTimeLeft={timeLeft}
				formatTime={formatTime}
				onSendMessage={handleSendMessage} // Pass the original handleSendMessage
				onToggleScreen={toggleMessageScreen}
			/>
		);
	}

	return (
		<div className="max-w-2xl space-y-8">
			{transactionFlowState === 'makePayment' && (
				<>
					<div className="flex flex-row justify-between items-center gap-4">
						<h1 className="sub-page-heading text-left">Make Payment</h1>
						<div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-lg font-mono font-semibold shadow-sm">{formatTime(timeLeft)}</div>
					</div>
					<p className="sub-page-heading-sub-text text-left -mt-2">
						Transaction ID: <span className="font-mono bg-muted text-muted-foreground p-1 rounded-sm">{transactionId}</span>
						<br />
						Send the exact sum to the agent to receive assets in your wallet. Ensure the seller's name matches and keep communication within the platform for dispute resolution.
					</p>
					{/* Order Details Card */}
					<Card className="bg-background border-0 shadow-none">
						<CardHeader className="px-0">
							<CardTitle className="text-lg text-foreground">Order Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-1 px-0">
							<OrderDetailItem label="Amount to Pay" value={orderDetails.amountNGN} unit="NGN" isBold />
							<OrderDetailItem label="Exchange Rate" value={orderDetails.rateNGN} unit="NGN" />
							<OrderDetailItem label="Quantity to Receive" value={orderDetails.quantityUSDT} unit="USDT" />
							<OrderDetailItem label="Fees" value={orderDetails.transactionFeesNGN} unit="NGN" />
						</CardContent>
					</Card>
					{/* Seller's Information Card */}
					<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm px-0">
						<CardHeader className="flex flex-row justify-between items-center px-4">
							<CardTitle className="text-lg text-foreground">Seller's Information</CardTitle>
							<div className="text-muted-foreground hover:text-foreground" onClick={toggleMessageScreen}>
								<MessageCircle className="h-6 w-6" />
							</div>
						</CardHeader>
						<CardContent className="space-y-1 px-4">
							<div className="flex justify-between items-center py-2 border-b border-border">
								<span className="text-sm text-muted-foreground">Account Name</span>
								<Button variant="ghost" className="p-0 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-transparent" onClick={() => copyToClipboard(sellerInfo.name, 'Account Name copied to clipboard!')}>
									{sellerInfo.name} <Copy className="ml-2 h-3 w-3" />
								</Button>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-border">
								<span className="text-sm text-muted-foreground">Bank</span>
								<Button variant="ghost" className="p-0 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-transparent" onClick={() => copyToClipboard(sellerInfo.bankName, 'Bank Name copied to clipboard!')}>
									{sellerInfo.bankName} <Copy className="ml-2 h-3 w-3" />
								</Button>
							</div>
							<div className="flex justify-between items-center py-2">
								<span className="text-sm text-muted-foreground">Account Number</span>
								<Button variant="ghost" className="p-0 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-transparent" onClick={() => copyToClipboard(sellerInfo.accountNumber, 'Account Number copied to clipboard!')}>
									{sellerInfo.accountNumber} <Copy className="ml-2 h-3 w-3" />
								</Button>
							</div>
						</CardContent>
					</Card>
					<Button onClick={openMadePaymentModal} size="lg" variant="success" className="w-full" disabled={timeLeft === 0 || isProcessingPaymentConfirmation}>
						{isProcessingPaymentConfirmation ? 'Processing...' : 'I Have Made Payment'}
					</Button>
				</>
			)}

			{transactionFlowState === 'awaitingConfirmation' && <AwaitingConfirmationView transactionId={transactionId} timeLeft={timeLeft} formatTime={formatTime} orderDetails={orderDetails} sellerInfo={sellerInfo} onToggleMessageScreen={toggleMessageScreen} />}

			{transactionFlowState === 'completedTransaction' && (
				<CompletedTransactionView
					transactionId={transactionId}
					orderDetails={orderDetails}
					// transactionTimeDetails can be passed here if fetched/available
				/>
			)}

			<ConfirmationModal
				isOpen={isMadePaymentModalOpen}
				onClose={() => {
					if (!isProcessingPaymentConfirmation) {
						setIsMadePaymentModalOpen(false);
					}
				}}
				onConfirm={handleConfirmMadePayment}
				title="Confirm Payment"
				description="Please confirm that the funds have been sent before clicking on 'I have made payment'."
				confirmButtonText="Yes, I've Paid"
				cancelButtonText="Cancel"
				isLoading={isProcessingPaymentConfirmation}
			/>
		</div>
	);
}
