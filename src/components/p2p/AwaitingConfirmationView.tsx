'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle } from 'lucide-react';
import OrderDetailItem from '@/components/p2p/OrderDetailItem';
import { getBaseCurrency } from '@/lib/helpers';

interface AwaitingConfirmationViewProps {
	transactionId: string;
	timeLeft: number;
	formatTime: (seconds: number) => string;
	orderDetails: {
		amount: number;
		rate: number;
		tokenQuantity: number;
		transactionFees: number;
		fiat_currency: string | undefined;
	};
	sellerInfo: {
		name: string;
	};
	isBuyer?: boolean;
	description: string;
	onToggleMessageScreen: () => void;
	onSellerConfirmPayment?: () => void;
	isProcessingSellerConfirm?: boolean;
	onBuyerConfirmPayment?: () => void;
	isProcessingBuyerConfirm?: boolean;
	onRaiseDispute?: () => void;
	isProcessingDispute?: boolean;
}

const AwaitingConfirmationView: React.FC<AwaitingConfirmationViewProps> = ({
	transactionId,
	timeLeft,
	formatTime,
	orderDetails,
	sellerInfo,
	isBuyer,
	description,
	onToggleMessageScreen,
	onSellerConfirmPayment,
	isProcessingSellerConfirm,
	onBuyerConfirmPayment,
	isProcessingBuyerConfirm,
	onRaiseDispute,
	isProcessingDispute,
}) => {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<>
			<div className="flex flex-row justify-between items-center gap-4">
				<h1 className="sub-page-heading text-left">Awaiting Confirmation</h1>
				<div className="px-3 py-1.5 rounded-md bg-yellow-500 text-white text-lg font-mono font-semibold shadow-sm flex items-center">
					<Clock className="mr-2 h-5 w-5" /> {formatTime(timeLeft)}
				</div>
			</div>
			<p className="sub-page-heading-sub-text text-left -mt-2">
				Transaction ID: <span className="font-mono bg-muted text-muted-foreground p-1 rounded-sm">{transactionId}</span>
				<br />
				{description}
			</p>
			<Card className="bg-background border-0 shadow-none">
				<CardHeader className="px-0">
					<CardTitle className="text-lg text-foreground">Order Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1 px-0">
					{isBuyer ? (
						<>
							<OrderDetailItem label="Amount Paid" value={orderDetails.amount} unit={orderDetails.fiat_currency} isBold />
							<OrderDetailItem label="Exchange Rate" value={orderDetails.rate} unit={orderDetails.fiat_currency} />
							<OrderDetailItem label="Quantity to Receive" value={orderDetails.tokenQuantity} unit={getBaseCurrency()} />
						</>
					) : (
						<>
							<OrderDetailItem label="Amount to Receive" value={orderDetails.amount} unit={orderDetails.fiat_currency} isBold />
							<OrderDetailItem label="Exchange Rate" value={orderDetails.rate} unit={orderDetails.fiat_currency} />
							<OrderDetailItem label="Quantity to Sell" value={orderDetails.tokenQuantity} unit={getBaseCurrency()} />
						</>
					)}
					<OrderDetailItem label="Fee" value={orderDetails.transactionFees} unit="%" />
				</CardContent>
			</Card>
			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm px-0">
				<CardHeader className="flex flex-row justify-between items-center px-4">
					<CardTitle className="text-lg text-foreground">{isBuyer ? `Seller's Information` : `Buyer's Information`}</CardTitle>
					<Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={onToggleMessageScreen}>
						<MessageCircle className="h-10 w-10" />
					</Button>
				</CardHeader>
				<CardContent className="space-y-1 px-4">
					<div className="flex justify-between items-center py-2">
						<span className="text-sm text-muted-foreground">Account Name</span>
						<span className="text-sm font-medium text-foreground">{sellerInfo.name}</span>
					</div>
				</CardContent>
			</Card>
			{isBuyer && <p className="w-full flex-grow text-muted-foreground">Your payment is being confirmed. You will be notified once the transaction is complete.</p>}
			<div className="flex flex-col sm:flex-row gap-2 mt-4 ">
				{!isBuyer && onSellerConfirmPayment && (
					<Button onClick={onSellerConfirmPayment} disabled={isProcessingSellerConfirm} variant="success" size="lg">
						{isProcessingSellerConfirm ? 'Confirming...' : 'Confirm Payment Received'}
					</Button>
				)}
				{/* Buyer can raise dispute if allowed */}
				{isBuyer && onRaiseDispute && (
					<Button onClick={onRaiseDispute} disabled={isProcessingDispute} variant="destructive" size="lg">
						{isProcessingDispute ? 'Raising Dispute...' : 'Raise Dispute'}
					</Button>
				)}

				{/* Seller can raise dispute if allowed */}
				{!isBuyer && onRaiseDispute && (
					<Button onClick={onRaiseDispute} disabled={isProcessingDispute} variant="destructive" size="lg">
						{isProcessingDispute ? 'Raising Dispute...' : 'Raise Dispute'}
					</Button>
				)}
			</div>
		</>
	);
};

export default AwaitingConfirmationView;
