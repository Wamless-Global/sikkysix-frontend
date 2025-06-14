'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { getTradeDescription, getTradeStatusToast, getTradeViewState, handleFetchErrorMessage } from '@/lib/helpers';
import MakePaymentView from './MakePaymentView';
import MessagingView from './MessagingView';
import DisputeModal from './DisputeModal';
import CancelTradeModal from './CancelTradeModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import P2PBuyerActions from '@/components/p2p/P2PBuyerActions';
import P2PSellerActions from '@/components/p2p/P2PSellerActions';
import P2PCounterpartyInfo from '@/components/p2p/P2PCounterpartyInfo';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface P2PContentProps {
	transaction?: Transaction;
	isAnAgent?: boolean;
}

type TransactionFlowState = 'makePayment' | 'awaitingConfirmation' | 'completedTransaction';
interface Message {
	id: string;
	text: string;
	sender: 'user' | 'seller';
	timestamp: Date;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function P2PContent({ transaction, isAnAgent = false }: P2PContentProps) {
	const params = useParams();
	const [trade, setTrade] = useState<TradeResponse | null>(null);
	const [newTran, setNewTran] = useState<TradeResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [transactionFlowState, setTransactionFlowState] = useState<TransactionFlowState>('makePayment');
	const [isMadePaymentModalOpen, setIsMadePaymentModalOpen] = useState(false);
	const [isProcessingPaymentConfirmation, setIsProcessingPaymentConfirmation] = useState(false);
	const [showMessages, setShowMessages] = useState(false);
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
		fetchWithAuth(`/api/p2p/trades/${transactionId}`)
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
					const res = await fetchWithAuth(`/api/p2p/trades/${transactionId}`, {
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

	// --- Realtime subscription for p2p_trades table ---
	useEffect(() => {
		if (!trade?.id) return;
		let channel: any;
		let reconnectTimeout: NodeJS.Timeout | null = null;

		const subscribe = () => {
			channel = supabase.channel(`p2p-trades-${trade.id}`);

			channel.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'p2p_trades',
					filter: `id=eq.${trade.id}`,
				},
				(payload: { new: TradeResponse }) => {
					const updatedTrade = payload.new as TradeResponse;
					setTrade((prev) => ({ ...prev, ...updatedTrade }));
					setNewTran((prev) => ({ ...prev, ...updatedTrade }));

					const { status, statusMap } = getTradeStatusToast(updatedTrade);
					if (status && statusMap[status]) {
						const { type, message } = statusMap[status];
						if (type === 'success') {
							toast.success(message);
						} else {
							toast.error(message);
						}
					}
				}
			);

			channel.on('close', {}, () => {
				reconnectTimeout = setTimeout(() => {
					subscribe();
				}, 2000);
			});

			channel.subscribe();
		};

		subscribe();

		return () => {
			if (channel) channel.unsubscribe();
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
		};
	}, [trade?.id]);

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
			const res = await fetchWithAuth(`/api/p2p/trades/${transactionId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'fiat_payment_confirmed_by_buyer' }),
			});

			if (!res.ok) throw new Error('Failed to update payment status');

			// Refetch the latest trade data after status update
			const tradeRes = await fetchWithAuth(`/api/p2p/trades/${transactionId}`);
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
	};

	const handleCancelTrade = async () => {
		setIsCancelling(true);
		try {
			const res = await fetchWithAuth(`/api/p2p/trades/${transactionId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: isBuyer ? 'cancelled_by_buyer' : 'cancelled_by_seller' }),
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
		setIsCancelModalOpen(false);
	};

	// Determine if current user is the seller/agent or buyer
	const isCurrentUserSeller = currentUser?.id && trade?.seller_id && currentUser.id === trade.seller_id;
	const isCurrentUserBuyer = currentUser?.id && trade?.buyer_id && currentUser.id === trade.buyer_id;

	// Seller/agent confirm payment
	const [isProcessingSellerConfirm, setIsProcessingSellerConfirm] = useState(false);
	const handleSellerConfirmPayment = async () => {
		if (!trade?.id) return;
		setIsProcessingSellerConfirm(true);
		nProgress.start();
		try {
			const res = await fetchWithAuth(`/api/p2p/trades/${trade.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'fiat_received_confirmed_by_seller', isSellerAgent: isAnAgent }),
			});
			if (!res.ok) throw new Error('Failed to confirm payment received');
			toast.success('Payment confirmed. Trade will be completed.');
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'Failed to confirm payment.');
			toast.error(errorMessage);
		} finally {
			setIsProcessingSellerConfirm(false);
			nProgress.done();
		}
	};

	// Buyer/user confirm payment
	const [isProcessingBuyerConfirm, setIsProcessingBuyerConfirm] = useState(false);
	const handleBuyerConfirmPayment = async () => {
		if (!trade?.id) return;
		setIsProcessingBuyerConfirm(true);
		nProgress.start();
		try {
			const res = await fetchWithAuth(`/api/p2p/trades/${trade.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'fiat_payment_confirmed_by_buyer' }),
			});
			if (!res.ok) throw new Error('Failed to confirm payment as buyer');
			toast.success('Payment marked as made. Waiting for seller confirmation.');
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'Failed to confirm payment as buyer.');
			toast.error(errorMessage);
		} finally {
			setIsProcessingBuyerConfirm(false);
			nProgress.done();
		}
	};

	// Dispute
	const [isProcessingDispute, setIsProcessingDispute] = useState(false);
	const handleRaiseDispute = async () => {
		setIsProcessingDispute(true);
		try {
			const res = await fetchWithAuth(`/api/p2p/trades/${newTran?.escrow_transaction_id}/dispute`, { method: 'POST' });
			if (res.ok) {
				toast.success('Dispute raised successfully. Our team will review this trade.');
				setIsDisputeModalOpen(false);
			} else {
				toast.error('Failed to raise dispute. Please try again.');
			}
		} catch {
			toast.error('Failed to raise dispute. Please try again.');
		}
		setIsProcessingDispute(false);
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

	// Determine if current user is the seller/agent or buyer
	const isBuyer = !!(currentUser?.id && trade?.buyer_id && currentUser.id === trade.buyer_id);
	const isSeller = !!(currentUser?.id && trade?.seller_id && currentUser.id === trade.seller_id);

	// Extract order and user info from the live trade data
	const orderDetails = {
		amount: trade?.fiat_amount ? parseFloat(trade.fiat_amount) : 0,
		rate: trade?.price_per_unit ? parseFloat(trade.price_per_unit) : 0,
		tokenQuantity: trade?.platform_currency_amount ? parseFloat(trade.platform_currency_amount) : 0,
		transactionFees: trade?.fee ? parseFloat(trade?.fee) : 0,
		fiat_currency: trade.fiat_currency,
	};

	// Helper to check if transaction is a non-empty object
	const isUserFlow = !!transaction && typeof transaction === 'object' && Object.keys(transaction).length > 0;
	const isAgentFlow = !isUserFlow;

	// For user flow, show seller info; for agent flow, show buyer info
	const infoUser = isSeller ? trade?.seller_user : trade?.buyer_user;
	const infoLabel = isBuyer ? "Seller's Information" : "Buyer's Information";

	// For payment fields, use the payment option as before
	let paymentFields: Array<{ name: string; label: string; type: string }> = [];
	let accountDetails: Record<string, string> = {};

	if (isBuyer) {
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
		paymentFields = [];
		accountDetails = {};
	}

	// For counterparty info
	const counterpartyUser = isBuyer ? trade?.seller_user : trade?.buyer_user;
	const counterpartyLabel = isBuyer ? "Seller's Information" : "Buyer's Information";

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
				recipientId={isBuyer ? trade.seller_id : trade.buyer_id}
				isExpired={isExpired || messagingDisabled}
				messagingDisabled={messagingDisabled}
			/>
		);
	}

	// Helper: show dispute button only for finished trades and not for live or dispute trades
	const finishedStatuses = ['completed', 'expired', 'cancelled_by_buyer', 'cancelled_by_seller', 'cancelled'];
	const isDisputeOpen = trade?.status?.startsWith('dispute');

	const canRaiseDispute = (() => {
		if (!trade) return false;
		if (isDisputeOpen) return false;
		if (trade.status === 'expired') {
			if (isBuyer) {
				return !!trade.fiat_paid_at;
			} else {
				return false;
			}
		}
		return finishedStatuses.includes(trade.status);
	})();

	const tradeView = getTradeViewState(trade, isBuyer, isExpired, isAgentFlow);

	return (
		<div className="max-w-2xl space-y-8 mb-0 sm:mb-10 md:mb-16">
			{trade.status !== 'fiat_payment_confirmed_by_buyer' && trade.status !== 'completed' && (
				<>
					<div className="flex flex-row justify-between items-center gap-4">
						<h1 className="sub-page-heading text-left">{tradeView.title}</h1>
						{tradeView.showTimer ? (
							<div className={cn(`px-3 py-1.5 rounded-md ${isExpired || trade?.status === 'expired' ? 'bg-[var(--danger)]' : 'bg-primary'} text-primary-foreground text-lg font-mono font-semibold shadow-sm`)}>
								{isExpired || trade?.status === 'expired' ? 'Expired' : formatTime(timeLeft)}
							</div>
						) : (
							trade && (
								<Badge
									variant={(() => {
										switch (trade.status) {
											case 'expired':
												return 'destructive';
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
						{getTradeDescription(trade, isBuyer, isAnAgent)}
					</p>
					<Card className="bg-background border-0 shadow-none">
						<CardHeader className="px-0">
							<CardTitle className="text-lg text-foreground">Order Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-1 px-0">
							<OrderDetailItem label={isBuyer ? 'Amount to Pay' : 'Amount to Receive'} value={orderDetails.amount} unit={orderDetails.fiat_currency} isBold />
							<OrderDetailItem label="Exchange Rate" value={orderDetails.rate} unit={orderDetails.fiat_currency} />
							<OrderDetailItem label={isBuyer ? (isAnAgent ? 'Quantity to Receive' : 'Quantity to Buy') : 'Quantity to Sell'} value={orderDetails.tokenQuantity} unit={process.env.NEXT_PUBLIC_BASE_CURRENCY} />
							<OrderDetailItem label="Fee" value={orderDetails.transactionFees} unit="%" />
						</CardContent>
					</Card>

					<P2PCounterpartyInfo label={counterpartyLabel} infoUser={counterpartyUser} paymentFields={paymentFields} accountDetails={accountDetails} onCopy={copyToClipboard} onToggleMessageScreen={toggleMessageScreen} isBuyer={isBuyer} />

					<div className="flex flex-col md:flex-row gap-2 mt-4">
						{isBuyer && (
							<P2PBuyerActions
								trade={trade}
								onMadePayment={openMadePaymentModal}
								isProcessing={isProcessingPaymentConfirmation}
								onCancel={handleCancelTrade}
								isCancelling={isCancelling}
								openCancelModal={() => setIsCancelModalOpen(true)}
								canRaiseDispute={canRaiseDispute}
								onRaiseDispute={handleRaiseDispute}
								isProcessingDispute={isProcessingDispute}
							/>
						)}

						{isSeller && <P2PSellerActions trade={trade} onConfirmReceipt={handleSellerConfirmPayment} isProcessing={isProcessingSellerConfirm} canRaiseDispute={canRaiseDispute} onRaiseDispute={handleRaiseDispute} isProcessingDispute={isProcessingDispute} />}

						<CancelTradeModal isOpen={isCancelModalOpen} isLoading={isCancelling} onClose={() => setIsCancelModalOpen(false)} onConfirm={handleCancelTrade} />
						<DisputeModal
							isOpen={isDisputeModalOpen}
							isLoading={isRaisingDispute}
							onClose={() => setIsDisputeModalOpen(false)}
							onConfirm={async () => {
								setIsRaisingDispute(true);
								try {
									const res = await fetchWithAuth(`/api/p2p/trades/${newTran?.escrow_transaction_id}/dispute`, { method: 'POST' });
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
				</>
			)}

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
							const res = await fetchWithAuth(`/api/p2p/trades/${newTran?.escrow_transaction_id}/dispute`, { method: 'POST' });
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
				<AwaitingConfirmationView
					transactionId={newTran?.escrow_transaction_id ?? ''}
					timeLeft={timeLeft}
					formatTime={formatTime}
					orderDetails={orderDetails}
					sellerInfo={isBuyer ? trade?.seller_user : trade?.buyer_user}
					isBuyer={isBuyer}
					description={getTradeDescription(trade, isBuyer)}
					onToggleMessageScreen={toggleMessageScreen}
					{...(isCurrentUserSeller && {
						onSellerConfirmPayment: handleSellerConfirmPayment,
						isProcessingSellerConfirm,
					})}
					{...(isCurrentUserBuyer && {
						onBuyerConfirmPayment: handleBuyerConfirmPayment,
						isProcessingBuyerConfirm,
					})}
					onRaiseDispute={handleRaiseDispute}
					isProcessingDispute={isProcessingDispute}
				/>
			)}

			{['completed'].includes(trade.status) && newTran?.escrow_transaction_id && <CompletedTransactionView trade={newTran} currentUserId={currentUser?.id || ''} isAgent={isAnAgent} />}

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

			{canRaiseDispute && handleRaiseDispute && (
				<Button onClick={handleRaiseDispute} disabled={isProcessingDispute} variant="destructive" size="lg">
					{isProcessingDispute ? 'Raising Dispute...' : 'Raise Dispute'}
				</Button>
			)}
		</div>
	);
}
