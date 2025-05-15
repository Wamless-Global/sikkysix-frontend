'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import OrderDetailItem from '@/components/p2p/OrderDetailItem';
import MessageScreen from '@/components/p2p/MessageScreen';
import AwaitingConfirmationView from '@/components/p2p/AwaitingConfirmationView';
import CompletedTransactionView from '@/components/p2p/CompletedTransactionView';
import copyToClipboard from '@/components/ui/copy-to-clipboard';

const PAYMENT_COUNTDOWN_SECONDS = 14 * 60 + 50; // 14 minutes 50 seconds
const AWAITING_CONFIRMATION_SECONDS = 30 * 60 + 41;

type TransactionFlowState = 'makePayment' | 'awaitingConfirmation' | 'completedTransaction';
interface Message {
	id: string;
	text: string;
	sender: 'user' | 'seller';
	timestamp: Date;
}

// const PAYMENT_COUNTDOWN_SECONDS = 14 * 60 + 50; // Removed, timer logic handled in transactionId page

export default function TransactionDetailsPageContent() {
	const params = useParams();
	const searchParams = useSearchParams();
	const transactionId = params.transactionId as string;

	const [transactionFlowState, setTransactionFlowState] = useState<TransactionFlowState>('makePayment');
	const [isMadePaymentModalOpen, setIsMadePaymentModalOpen] = useState(false);
	const [isProcessingPaymentConfirmation, setIsProcessingPaymentConfirmation] = useState(false);
	const [showMessages, setShowMessages] = useState(false);

	const [messages, setMessages] = useState<Message[]>([]);

	const orderDetails = {
		amountNGN: parseFloat(searchParams.get('amountNGN') || '0'),
		rateNGN: parseFloat(searchParams.get('rateNGN') || '0'),
		quantityUSDT: parseFloat(searchParams.get('quantityUSDT') || '0'),
		transactionFeesNGN: parseFloat(searchParams.get('transactionFeesNGN') || '0'),
	};

	const sellerInfo = {
		name: searchParams.get('name') || 'N/A',
		bankName: searchParams.get('bankName') || 'N/A',
		accountNumber: searchParams.get('accountNumber') || 'N/A',
	};

	const [timeLeft, setTimeLeft] = useState(PAYMENT_COUNTDOWN_SECONDS);

	useEffect(() => {
		if (transactionFlowState === 'makePayment') {
			setTimeLeft(PAYMENT_COUNTDOWN_SECONDS);
			if (!showMessages) window.scrollTo(0, 0);
		} else if (transactionFlowState === 'awaitingConfirmation') {
			setTimeLeft(AWAITING_CONFIRMATION_SECONDS);
		} else if (transactionFlowState === 'completedTransaction') {
			setTimeLeft(0);
		}
	}, [transactionFlowState, showMessages]);

	useEffect(() => {
		if (timeLeft <= 0) {
			if (timeLeft === 0) {
				if (transactionFlowState === 'makePayment') {
					toast.error('Payment time expired. Please contact support if you have made payment.');
				} else if (transactionFlowState === 'awaitingConfirmation') {
					toast.warning('Confirmation period ended. Please check transaction status or contact support.');
				}
			}
			return;
		}

		if (transactionFlowState === 'completedTransaction') {
			return;
		}

		const intervalId = setInterval(() => {
			setTimeLeft((prevTime) => prevTime - 1);
		}, 1000);

		return () => clearInterval(intervalId);
	}, [timeLeft, transactionFlowState]);

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

		setTimeout(() => {
			setTransactionFlowState('awaitingConfirmation');
			setTimeLeft(AWAITING_CONFIRMATION_SECONDS);
			toast.success('Payment marked as made. Waiting for seller&apos;s confirmation.');
			nProgress.done();
			setIsProcessingPaymentConfirmation(false);

			setTimeout(() => {
				setTransactionFlowState('completedTransaction');
				toast.success('Transaction Confirmed! Your payment has been received.');
				setTimeLeft(0);
			}, 15000);
		}, 2000);
	};

	const handleSendMessage = (currentMessage: string) => {
		if (currentMessage.trim() === '') return;
		const newMessage: Message = {
			id: `msg-${Date.now()}`,
			text: currentMessage.trim(),
			sender: 'user',
			timestamp: new Date(),
		};
		setMessages((prevMessages) => [...prevMessages, newMessage]);
	};

	const toggleMessageScreen = () => {
		const currentlyShowingMessages = showMessages;
		setShowMessages(!currentlyShowingMessages);
		if (currentlyShowingMessages) {
			window.scrollTo(0, 0);
		}
	};

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

	if (showMessages) {
		return <MessageScreen sellerName={sellerInfo.name} initialMessages={messages} currentTimeLeft={timeLeft} formatTime={formatTime} onSendMessage={handleSendMessage} onToggleScreen={toggleMessageScreen} />;
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
						Send the exact sum to the agent to receive assets in your wallet. Ensure the seller&apos;s name matches and keep communication within the platform for dispute resolution.
					</p>
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
					<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm px-0">
						<CardHeader className="flex flex-row justify-between items-center px-4">
							<CardTitle className="text-lg text-foreground">Seller&apos;s Information</CardTitle>
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

			{transactionFlowState === 'completedTransaction' && <CompletedTransactionView transactionId={transactionId} orderDetails={orderDetails} />}

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
