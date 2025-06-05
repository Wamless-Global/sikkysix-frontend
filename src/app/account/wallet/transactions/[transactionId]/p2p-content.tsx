'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import OrderDetailItem from '@/components/p2p/OrderDetailItem';
import AwaitingConfirmationView from '@/components/p2p/AwaitingConfirmationView';
import CompletedTransactionView from '@/components/p2p/CompletedTransactionView';
import copyToClipboard from '@/components/ui/copy-to-clipboard';
import { cn } from '@/lib/utils';
import type { TradeResponse } from '@/types/modules/trade';
import { Transaction } from '@/types';
import { handleFetchErrorMessage } from '@/lib/helpers';
import MakePaymentView from './MakePaymentView';
import MessagingView from './MessagingView';
import DisputeModal from './DisputeModal';
import CancelTradeModal from './CancelTradeModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { fetchP2PMessages, sendP2PMessage } from '@/lib/p2p-messaging';
import { useAuthContext } from '@/context/AuthContext';

interface P2PContentProps {
	transaction?: Transaction;
}

type TransactionFlowState = 'makePayment' | 'awaitingConfirmation' | 'completedTransaction';
interface Message {
	id: string;
	text: string;
	sender: 'user' | 'seller';
	timestamp: Date;
}

export default function P2PContent({ transaction }: P2PContentProps) {
	const params = useParams();
	const [trade, setTrade] = useState<TradeResponse | null>(null);
	const [newTran, setNewTran] = useState<TradeResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [transactionFlowState, setTransactionFlowState] = useState<TransactionFlowState>('makePayment');
	const [isMadePaymentModalOpen, setIsMadePaymentModalOpen] = useState(false);
	const [isProcessingPaymentConfirmation, setIsProcessingPaymentConfirmation] = useState(false);
	const [showMessages, setShowMessages] = useState(false);
	const [_fetchingMessages, setFetchingMessages] = useState(false);
	const [_sendingMessage, setSendingMessage] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);
	const [isExpired, setIsExpired] = useState(false);
	// Add state for dispute
	const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
	const [isRaisingDispute, setIsRaisingDispute] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

	// Get transactionId from props or params
	const transactionId = transaction?.details?.p2p_trade_id || params?.tradeId;
	const { currentUser } = useAuthContext();

	useEffect(() => {
		if (!transactionId) {
			setError('No trade ID found in transaction.');
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		fetch(`/api/p2p/trades/${transactionId}`)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to fetch trade details');
				return res.json();
			})
			.then(({ data }: { data: TradeResponse }) => {
				setTrade(data);
				setNewTran(data);
			})
			.catch((_err) => {
				setError('Could not load trade details.');
			})
			.finally(() => setLoading(false));
	}, [transactionId]);

	useEffect(() => {
		if (transactionFlowState === 'makePayment') {
			setTimeLeft(0);
			if (!showMessages) window.scrollTo(0, 0);
		} else if (transactionFlowState === 'awaitingConfirmation') {
			setTimeLeft(0);
		} else if (transactionFlowState === 'completedTransaction') {
			setTimeLeft(0);
		}
	}, [transactionFlowState, showMessages]);

	useEffect(() => {
		setIsExpired(timeLeft === 0 && !!trade?.expires_at && new Date(trade.expires_at).getTime() < Date.now());
	}, [timeLeft, trade?.expires_at]);

	useEffect(() => {
		if (!trade?.expires_at || isExpired) return;
		const expiresAt = new Date(trade.expires_at).getTime();
		let expiredToastShown = false;

		const updateTimer = async () => {
			const now = Date.now();
			const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
			setTimeLeft(diff);
			if (diff <= 0 && !expiredToastShown) {
				expiredToastShown = true;
				if (transactionFlowState === 'makePayment') {
					toast.error('Payment time expired. Please contact support if you have made payment.');
				} else if (transactionFlowState === 'awaitingConfirmation') {
					toast.warning('Confirmation period ended. Please check transaction status or contact support.');
				}

				try {
					const res = await fetch(`/api/p2p/trades/${transactionId}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: 'expired' }),
					});
					if (!res.ok) throw new Error('Failed to update trade status');
				} catch (err) {
					const errorMessage = handleFetchErrorMessage(err, 'Failed to update trade status to expired. Please refresh or contact support.');
					toast.error(errorMessage);
				}
				setIsExpired(true);
			}
		};
		updateTimer();
		const intervalId = setInterval(updateTimer, 1000);
		return () => clearInterval(intervalId);
	}, [trade?.expires_at, transactionFlowState, isExpired, transactionId]);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const openMadePaymentModal = () => {
		setIsMadePaymentModalOpen(true);
	};

	const handleConfirmMadePayment = async () => {
		setIsMadePaymentModalOpen(false);
		setIsProcessingPaymentConfirmation(true);
		nProgress.start();
		toast.info('Processing payment confirmation...');
		try {
			const res = await fetch(`/api/p2p/trades/${transactionId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'fiat_payment_confirmed_by_buyer' }),
			});

			if (!res.ok) throw new Error('Failed to update payment status');

			// Refetch the latest trade data after status update
			const tradeRes = await fetch(`/api/p2p/trades/${transactionId}`);
			if (!tradeRes.ok) throw new Error('Failed to fetch updated trade details');
			const { data: updatedTrade } = await tradeRes.json();
			setTrade(updatedTrade);
			setNewTran(updatedTrade);

			setTransactionFlowState('awaitingConfirmation');
			setTimeLeft(0);
			toast.success("Payment marked as made. Waiting for seller's confirmation.");
			nProgress.done();
			setIsProcessingPaymentConfirmation(false);
			// Optionally, you can keep the timeout for demo, but the UI will now reflect the new status immediately
			// setTimeout(() => {
			// 	setTransactionFlowState('completedTransaction');
			// 	toast.success('Transaction Confirmed! Your payment has been received.');
			// 	setTimeLeft(0);
			// }, 15000);
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'Failed to update payment status.');
			toast.error(errorMessage);
			setIsProcessingPaymentConfirmation(false);
			nProgress.done();
		}
	};

	const toggleMessageScreen = () => {
		const currentlyShowingMessages = showMessages;
		setShowMessages(!currentlyShowingMessages);
		if (currentlyShowingMessages) {
			window.scrollTo(0, 0);
		}
	};

	const handleCancelTrade = async () => {
		setIsCancelling(true);
		try {
			const res = await fetch(`/api/p2p/trades/${transactionId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'cancelled_by_buyer' }),
			});
			if (!res.ok) throw new Error('Failed to cancel trade');
			toast.success('Trade cancelled successfully.');
			setTransactionFlowState('completedTransaction');
			setTimeLeft(0);
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'Failed to cancel trade. Please try again.');
			toast.error(errorMessage);
		}
		setIsCancelling(false);
	};

	const isLoading = loading || !trade?.id;

	if (isLoading) {
		return (
			<div className="max-w-2xl space-y">
				<Card className="bg-background border-0 shadow-none">
					<CardHeader className="px-0">
						<Skeleton className="h-8 w-1/2 mb-2 rounded" />
					</CardHeader>
					<CardContent className="px-0 space-y-4">
						<Skeleton className="h-6 w-1/3 mb-2 rounded" />
						<div className="space-y-2">
							<Skeleton className="h-5 w-full rounded" />
							<Skeleton className="h-5 w-2/3 rounded" />
							<Skeleton className="h-5 w-1/2 rounded" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm px-0">
					<CardHeader className="flex flex-row justify-between items-center px-4">
						<Skeleton className="h-6 w-1/4 rounded" />
						<Skeleton className="h-6 w-6 rounded-full" />
					</CardHeader>
					<CardContent className="space-y-2 px-4">
						<Skeleton className="h-5 w-1/2 rounded" />
						<Skeleton className="h-5 w-1/3 rounded" />
					</CardContent>
				</Card>
				<div className="flex flex-col md:flex-row gap-2 mt-4">
					<Skeleton className="h-10 w-40 rounded" />
					<Skeleton className="h-10 w-40 rounded" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<Card className="bg-background border-0 shadow-none">
					<CardHeader className="px-0">
						<CardTitle className="sub-page-heading">Transaction Details</CardTitle>
					</CardHeader>
					<CardContent className="px-0">
						<p className="text-muted-foreground">{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Extract order and user info from the live trade data
	const orderDetails = {
		amountNGN: trade?.fiat_amount ? parseFloat(trade.fiat_amount) : 0,
		rateNGN: trade?.price_per_unit ? parseFloat(trade.price_per_unit) : 0,
		quantityUSDT: trade?.platform_currency_amount ? parseFloat(trade.platform_currency_amount) : 0,
		transactionFeesNGN: 0,
	};

	// Helper to check if transaction is a non-empty object
	const isUserFlow = !!transaction && typeof transaction === 'object' && Object.keys(transaction).length > 0;
	const isAgentFlow = !isUserFlow;

	// For user flow, show seller info; for agent flow, show buyer info
	const infoUser = isUserFlow ? trade?.seller_user : trade?.buyer_user;
	const infoLabel = isUserFlow ? "Seller's Information" : "Buyer's Information";

	// For payment fields, use the payment option as before
	let paymentFields: Array<{ name: string; label: string; type: string }> = [];
	let accountDetails: Record<string, string> = {};
	if (isUserFlow) {
		// User flow: show seller's payment info
		const paymentOption = trade?.selected_agent_payment_option;
		accountDetails = paymentOption?.account_details || {};
		try {
			if (paymentOption?.payment_method?.details) {
				paymentFields = JSON.parse(paymentOption.payment_method.details);
			}
		} catch (e) {
			paymentFields = [];
		}
	} else {
		// Agent flow: show only buyer's info, no payment fields
		paymentFields = [];
		accountDetails = {};
	}

	if (showMessages) {
		const messagingDisabled = ['completed', 'expired', 'cancelled_by_buyer', 'cancelled_by_seller', 'cancelled'].includes(trade?.status || '');
		return (
			<MessagingView
				sellerName={infoUser.name}
				initialMessages={[]}
				tradeId={trade?.id || ''}
				currentUserId={currentUser?.id || ''}
				currentTimeLeft={isExpired ? undefined : timeLeft}
				formatTime={formatTime}
				onToggleScreen={toggleMessageScreen}
				recipientId={isUserFlow ? trade.seller_id : trade.buyer_id}
				isExpired={isExpired || messagingDisabled}
				messagingDisabled={messagingDisabled}
			/>
		);
	}

	// Helper: show dispute button only for finished trades and not for live or dispute trades
	const finishedStatuses = ['completed', 'expired', 'cancelled_by_buyer', 'cancelled_by_seller', 'cancelled'];
	const isDisputeOpen = trade?.status?.startsWith('dispute');
	const canRaiseDispute = finishedStatuses.includes(trade?.status || '') && !isDisputeOpen;

	// Helper: determine the current view and actions based on trade status
	const getTradeViewState = () => {
		if (!trade) return { title: '', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		switch (trade.status) {
			case 'awaiting_fiat_payment':
				return { title: isUserFlow ? 'Make Payment' : 'Trade Details', showTimer: !isExpired, showPayment: isUserFlow && !isExpired, showCancel: isUserFlow && !isExpired, showDispute: false, showConfirm: false };
			case 'fiat_payment_confirmed_by_buyer':
				return { title: 'Awaiting Confirmation', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
			case 'fiat_received_confirmed_by_seller':
				return { title: 'Payment Confirmed', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
			case 'platform_ngn_released':
				return { title: 'NGN Released', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
			case 'completed':
				return { title: 'Trade Completed', showTimer: false, showPayment: false, showCancel: false, showDispute: true, showConfirm: false };
			case 'expired':
				return { title: 'Expired', showTimer: false, showPayment: false, showCancel: false, showDispute: true, showConfirm: false };
			case 'cancelled_by_buyer':
				return { title: isUserFlow ? 'Cancelled by You' : 'Cancelled by Buyer', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
			case 'cancelled_by_seller':
				return { title: isAgentFlow ? 'Cancelled by Seller' : 'Cancelled by You', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
			case 'dispute_opened':
				return { title: 'Dispute Opened', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
			case 'dispute_resolved_buyer':
			case 'dispute_resolved_seller':
				return { title: 'Dispute Resolved', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
			default:
				return { title: 'Trade Details', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		}
	};
	const tradeView = getTradeViewState();

	return (
		<div className="max-w-2xl space-y-8 mb-0 sm:mb-10 md:mb-16">
			<div className="flex flex-row justify-between items-center gap-4">
				<h1 className="sub-page-heading text-left">{tradeView.title}</h1>
				{tradeView.showTimer ? (
					<div className={cn(`px-3 py-1.5 rounded-md ${isExpired || trade?.status === 'expired' ? 'bg-[var(--danger)]' : 'bg-primary'} text-primary-foreground text-lg font-mono font-semibold shadow-sm`)}>{isExpired || trade?.status === 'expired' ? 'Expired' : formatTime(timeLeft)}</div>
				) : (
					trade && (
						<Badge
							variant={(() => {
								switch (trade.status) {
									case 'completed':
										return 'success';
									case 'expired':
										return 'destructive';
									case 'fiat_payment_confirmed_by_buyer':
									case 'fiat_received_confirmed_by_seller':
									case 'platform_ngn_released':
									case 'dispute_resolved_buyer':
									case 'dispute_resolved_seller':
										return 'info';
									case 'cancelled_by_buyer':
									case 'cancelled_by_seller':
									case 'dispute_opened':
										return 'destructive';
									default:
										return 'outline';
								}
							})()}
							className="px-4 py-1.5 text-lg font-mono font-semibold uppercase"
						>
							{trade.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
						</Badge>
					)
				)}
			</div>
			<p className="sub-page-heading-sub-text text-left -mt-2">
				Transaction ID: <span className="font-mono bg-muted text-muted-foreground p-1 rounded-sm">{transaction?.id || newTran?.id}</span>
				<br />
				{isUserFlow
					? trade?.status === 'awaiting_fiat_payment'
						? "Send the exact sum to the agent to receive assets in your wallet. Ensure the seller's name matches and keep communication within the platform for dispute resolution."
						: trade?.status === 'fiat_payment_confirmed_by_buyer'
						? "You've marked payment as sent. Please wait for the agent to confirm receipt. If there are issues, use the chat or raise a dispute after the timer expires."
						: trade?.status === 'completed'
						? 'Trade completed. Your assets have been delivered. If you have any issues, you may raise a dispute.'
						: trade?.status === 'expired'
						? 'This trade has expired. If you made payment, please contact support or raise a dispute.'
						: trade?.status?.startsWith('cancelled')
						? 'This trade was cancelled. If this was a mistake, please contact support.'
						: trade?.status?.startsWith('dispute')
						? 'A dispute is open for this trade. Our team will review and contact you.'
						: 'Check the trade status and follow the instructions above.'
					: trade?.status === 'awaiting_fiat_payment'
					? 'You are the agent for this trade. Please monitor payment status and confirm receipt as needed. You may also raise a dispute if there is an issue.'
					: trade?.status === 'fiat_payment_confirmed_by_buyer'
					? 'The buyer has marked payment as sent. Please confirm receipt before releasing assets. If you have not received payment, use the chat or raise a dispute.'
					: trade?.status === 'completed'
					? 'Trade completed. Assets have been released. If there are any issues, you may raise a dispute.'
					: trade?.status === 'expired'
					? 'This trade has expired. If you have not received payment, no further action is needed. If you did, please contact support or raise a dispute.'
					: trade?.status?.startsWith('cancelled')
					? 'This trade was cancelled. No further action is required.'
					: trade?.status?.startsWith('dispute')
					? 'A dispute is open for this trade. Our team will review and contact you.'
					: 'Check the trade status and follow the instructions above.'}
			</p>
			<Card className="bg-background border-0 shadow-none">
				<CardHeader className="px-0">
					<CardTitle className="text-lg text-foreground">Order Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1 px-0">
					<OrderDetailItem label={isUserFlow ? 'Amount to Pay' : 'Amount Paid'} value={orderDetails.amountNGN} unit="NGN" isBold />
					<OrderDetailItem label="Exchange Rate" value={orderDetails.rateNGN} unit="NGN" />
					<OrderDetailItem label={isUserFlow ? 'Quantity to Receive' : 'Quantity Sent'} value={orderDetails.quantityUSDT} unit="USDT" />
					<OrderDetailItem label="Fees" value={orderDetails.transactionFeesNGN} unit="NGN" />
				</CardContent>
			</Card>

			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm px-0">
				<CardHeader className="flex flex-row justify-between items-center px-4">
					<CardTitle className="text-lg text-foreground">{infoLabel}</CardTitle>
					<div className="text-muted-foreground hover:text-foreground" onClick={toggleMessageScreen}>
						<MessageCircle className="h-6 w-6" />
					</div>
				</CardHeader>
				<CardContent className="space-y-1 px-4">
					<div className="mb-2">
						<div className="text-sm font-semibold text-muted-foreground">Name</div>
						<div className="text-base font-medium">{infoUser?.name || 'N/A'}</div>
					</div>
					{isUserFlow && paymentFields.length > 0 ? (
						paymentFields.map((field) => (
							<div key={field.name} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
								<span className="text-sm text-muted-foreground">{field.label}</span>
								<Button variant="ghost" className="p-0 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-transparent" onClick={() => copyToClipboard(accountDetails[field.name] || '', `${field.label} copied to clipboard!`)} disabled={!accountDetails[field.name]}>
									{accountDetails[field.name] || 'N/A'} <Copy className="ml-2 h-3 w-3" />
								</Button>
							</div>
						))
					) : isUserFlow ? (
						<div className="text-muted-foreground text-sm">No payment details available.</div>
					) : null}
				</CardContent>
			</Card>
			<div className="flex flex-col md:flex-row gap-2 mt-4">
				{tradeView.showPayment && (
					<MakePaymentView
						orderDetails={orderDetails}
						paymentFields={paymentFields}
						accountDetails={accountDetails}
						infoUser={infoUser}
						onCopy={copyToClipboard}
						onMadePayment={openMadePaymentModal}
						isProcessing={isProcessingPaymentConfirmation}
						onCancel={handleCancelTrade}
						isCancelling={isCancelling}
						openCancelModal={() => setIsCancelModalOpen(true)}
					/>
				)}
				<CancelTradeModal isOpen={isCancelModalOpen} isLoading={isCancelling} onClose={() => setIsCancelModalOpen(false)} onConfirm={handleCancelTrade} />
				<DisputeModal
					isOpen={isDisputeModalOpen}
					isLoading={isRaisingDispute}
					onClose={() => setIsDisputeModalOpen(false)}
					onConfirm={async () => {
						setIsRaisingDispute(true);
						try {
							const res = await fetch(`/api/p2p/trades/${newTran?.escrow_transaction_id}/dispute`, { method: 'POST' });
							if (res.ok) {
								toast.success('Dispute raised successfully. Our team will review this trade.');
								setIsDisputeModalOpen(false);
							} else {
								toast.error('Failed to raise dispute. Please try again.');
							}
						} catch {
							toast.error('Failed to raise dispute. Please try again.');
						}
						setIsRaisingDispute(false);
					}}
				/>
			</div>

			{trade.status === 'fiat_payment_confirmed_by_buyer' && (
				<AwaitingConfirmationView transactionId={newTran?.escrow_transaction_id ?? ''} timeLeft={timeLeft} formatTime={formatTime} orderDetails={orderDetails} sellerInfo={isUserFlow ? trade?.seller_user : trade?.buyer_user} onToggleMessageScreen={toggleMessageScreen} />
			)}

			{['completed'].includes(trade.status) && newTran?.escrow_transaction_id && <CompletedTransactionView transactionId={newTran.escrow_transaction_id} orderDetails={orderDetails} />}
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
