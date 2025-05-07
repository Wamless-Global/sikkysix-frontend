'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import nProgress from 'nprogress'; // Added for consistency if actions trigger navigation

const PAYMENT_COUNTDOWN_SECONDS = 14 * 60 + 50; // 14 minutes 50 seconds

// Helper component for order details (copied from P2PNewOrderPage)
const OrderDetailItem: React.FC<{ label: string; value: string | number; unit?: string; isBold?: boolean }> = ({ label, value, unit, isBold }) => (
	<div className="flex justify-between items-center py-3">
		<span className="text-sm text-[var(--dashboard-subtext)]">{label}</span>
		<span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-[var(--dashboard-foreground)]`}>
			{typeof value === 'number' ? value.toFixed(unit === 'USDT' ? 4 : 2) : value} {unit}
		</span>
	</div>
);

export default function TransactionDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const transactionId = params.transactionId as string;

	// Extract order details from query parameters
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
		if (timeLeft > 0) {
			const timer = setInterval(() => {
				setTimeLeft((prevTime) => prevTime - 1);
			}, 1000);
			return () => clearInterval(timer);
		} else if (timeLeft === 0) {
			toast.error('Payment time expired. Please contact support if you have made payment.');
			// Potentially update order status here
		}
	}, [timeLeft]);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const copyToClipboard = (text: string, fieldName: string) => {
		navigator.clipboard.writeText(text).then(
			() => {
				toast.success(`${fieldName} copied to clipboard!`);
			},
			(err) => {
				toast.error(`Failed to copy ${fieldName}.`);
				console.error('Failed to copy text: ', err);
			}
		);
	};

	const handleMadePayment = () => {
		nProgress.start();
		// Simulate API call to confirm payment
		toast.info('Processing payment confirmation...');
		setTimeout(() => {
			// router.push(`/account/wallet/transactions/${transactionId}?status=pending_confirmation`); // Or a different page
			toast.success("Payment marked as made. Waiting for seller's confirmation.");
			// Disable button or change UI state
			nProgress.done();
		}, 2000);
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

	return (
		<div className="max-w-2xl space-y-8">
			<div className="flex flex-row justify-between items-center gap-4">
				<h1 className="sub-page-heading">Make Payment</h1>
				<div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-lg font-mono font-semibold shadow-sm">{formatTime(timeLeft)}</div>
			</div>

			<p className="sub-page-heading-sub-text text-left">
				Transaction ID: <span className="font-mono bg-muted text-muted-foreground p-1 rounded-sm">{transactionId}</span>
				<br />
				Send the exact sum to the agent to receive assets in your wallet. Ensure the seller's name matches and keep communication within the platform for dispute resolution.
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
					<CardTitle className="text-lg text-foreground">Seller's Information</CardTitle>
					<Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => toast.info('Chat functionality coming soon!')}>
						<MessageCircle className="h-10 w-10" />
					</Button>
				</CardHeader>
				<CardContent className="space-y-1 px-4">
					<div className="flex justify-between items-center py-2 border-b border-border">
						<span className="text-sm text-muted-foreground">Account Name</span>
						<Button variant="ghost" className="p-0 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-transparent" onClick={() => copyToClipboard(sellerInfo.name, 'Account Name')}>
							{sellerInfo.name} <Copy className="ml-2 h-3 w-3" />
						</Button>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-border">
						<span className="text-sm text-muted-foreground">Bank</span>
						<Button variant="ghost" className="p-0 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-transparent" onClick={() => copyToClipboard(sellerInfo.bankName, 'Bank Name')}>
							{sellerInfo.bankName} <Copy className="ml-2 h-3 w-3" />
						</Button>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="text-sm text-muted-foreground">Account Number</span>
						<Button variant="ghost" className="p-0 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-transparent" onClick={() => copyToClipboard(sellerInfo.accountNumber, 'Account Number')}>
							{sellerInfo.accountNumber} <Copy className="ml-2 h-3 w-3" />
						</Button>
					</div>
				</CardContent>
			</Card>

			<Button onClick={handleMadePayment} size="lg" variant="success" className="w-full" disabled={timeLeft === 0}>
				I Have Made Payment
			</Button>
		</div>
	);
}
