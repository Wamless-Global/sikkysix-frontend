import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle } from 'lucide-react';
import OrderDetailItem from '@/components/p2p/OrderDetailItem';

interface AwaitingConfirmationViewProps {
	transactionId: string;
	timeLeft: number;
	formatTime: (seconds: number) => string;
	orderDetails: {
		amountNGN: number;
		rateNGN: number;
		quantityUSDT: number;
	};
	sellerInfo: {
		name: string;
	};
	onToggleMessageScreen: () => void;
}

const AwaitingConfirmationView: React.FC<AwaitingConfirmationViewProps> = ({ transactionId, timeLeft, formatTime, orderDetails, sellerInfo, onToggleMessageScreen }) => {
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
				Please wait for the agent to confirm the payment. This may take a few minutes.
			</p>
			<Card className="bg-background border-0 shadow-none">
				<CardHeader className="px-0">
					<CardTitle className="text-lg text-foreground">Order Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1 px-0">
					<OrderDetailItem label="Amount Paid" value={orderDetails.amountNGN} unit="NGN" isBold />
					<OrderDetailItem label="Exchange Rate" value={orderDetails.rateNGN} unit="NGN" />
					<OrderDetailItem label="Quantity to Receive" value={orderDetails.quantityUSDT} unit="USDT" />
				</CardContent>
			</Card>
			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm px-0">
				<CardHeader className="flex flex-row justify-between items-center px-4">
					<CardTitle className="text-lg text-foreground">Seller&apos;s Information</CardTitle>
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
			<p className="text-center text-muted-foreground">Your payment is being confirmed. You will be notified once the transaction is complete.</p>
		</>
	);
};

export default AwaitingConfirmationView;
