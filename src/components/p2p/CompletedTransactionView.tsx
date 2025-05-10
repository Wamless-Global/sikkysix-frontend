import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import OrderDetailItem from '@/components/p2p/OrderDetailItem';
import { useRouter } from 'next/navigation';
import nprogress from 'nprogress';

interface CompletedTransactionViewProps {
	transactionId: string;
	orderDetails: {
		amountNGN: number;
		rateNGN: number;
		quantityUSDT: number;
	};
	transactionTimeDetails?: {
		initiated: string;
		finished: string;
		duration: string;
		type: string;
	};
}

const CompletedTransactionView: React.FC<CompletedTransactionViewProps> = ({
	transactionId,
	orderDetails,
	transactionTimeDetails = {
		initiated: 'Jul 27th 2025, 13:53:34',
		finished: 'Jul 27th 2025, 13:53:34',
		duration: '13 Minutes',
		type: 'Transfer',
	},
}) => {
	const router = useRouter();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<>
			<div className="flex flex-row justify-between items-center gap-4">
				<h1 className="sub-page-heading text-left">Completed Transaction</h1>
				<Badge variant="default" className="text-md px-4 py-2 bg-green-500 text-white dark:bg-green-600 dark:text-white">
					<CheckCircle2 className="mr-2 h-5 w-5" /> Completed
				</Badge>
			</div>
			<p className="sub-page-heading-sub-text text-left -mt-2">
				Transaction ID: <span className="font-mono bg-muted text-muted-foreground p-1 rounded-sm">{transactionId}</span>
				<br />
				Your payment has been confirmed and the sum has been credited to your account.
			</p>
			<Card className="bg-background border-0 shadow-none">
				<CardHeader className="px-0">
					<CardTitle className="text-lg text-foreground">Transaction Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1 px-0">
					<OrderDetailItem label="Amount Paid" value={orderDetails.amountNGN} unit="NGN" isBold />
					<OrderDetailItem label="Rate" value={orderDetails.rateNGN} unit="NGN" />
					<OrderDetailItem label="Quantity Received" value={orderDetails.quantityUSDT} unit="USDT" />
					<div className="pt-4 space-y-2 text-sm text-muted-foreground">
						<div className="flex justify-between">
							<p>Initiated:</p> <p>{transactionTimeDetails.initiated}</p>
						</div>
						<div className="flex justify-between">
							<p>Finished:</p> <p>{transactionTimeDetails.finished}</p>
						</div>
						<div className="flex justify-between">
							<p>Duration:</p> <p>{transactionTimeDetails.duration}</p>
						</div>
						<div className="flex justify-between">
							<p>Type:</p> <p>{transactionTimeDetails.type}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<Button
				onClick={() => {
					nprogress.start();
					router.push('/account/wallet');
				}}
				variant="outline"
				className="w-full"
				size={'lg'}
			>
				Back to Wallet
			</Button>
		</>
	);
};

export default CompletedTransactionView;
