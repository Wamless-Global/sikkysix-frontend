'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data (should ideally be shared or fetched, copied for now)
interface Asset {
	id: string;
	symbol: string;
}
const mockAssets: Asset[] = [
	{ id: 'btc', symbol: 'BTC' },
	{ id: 'eth', symbol: 'ETH' },
	{ id: 'usdt', symbol: 'USDT' },
];

interface Merchant {
	id: string;
	name: string;
	buyRateNGN: number; // NGN per Asset
}
const mockMerchants: Merchant[] = [
	// Simplified for this page
	{ id: 'm1', name: 'FastTrader', buyRateNGN: 1650.5 },
	{ id: 'm2', name: 'NairaKing', buyRateNGN: 1651.0 },
	{ id: 'm3', name: 'CryptoQueen', buyRateNGN: 1649.8 },
	{ id: 'm4', name: 'EasyExchange', buyRateNGN: 1650.0 },
];
// End Mock Data

// Reusable OrderDetailItem component (similar to deposit flow)
const OrderDetailItem: React.FC<{ label: string; value: string | number; unit?: string; isBold?: boolean }> = ({ label, value, unit, isBold }) => (
	<div className="flex justify-between items-center py-3">
		<span className="text-sm text-[var(--dashboard-subtext)]">{label}</span>
		<span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-[var(--dashboard-foreground)]`}>
			{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : value} {unit}
		</span>
	</div>
);

function ConfirmP2PWithdrawalContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const merchantId = searchParams.get('merchantId');
	const assetId = searchParams.get('assetId');
	const amountStr = searchParams.get('amount');
	const amount = parseFloat(amountStr || '0');

	const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);
	const [isProcessingOrder, setIsProcessingOrder] = useState(false);

	const selectedAsset = mockAssets.find((a) => a.id === assetId);
	const selectedMerchant = mockMerchants.find((m) => m.id === merchantId);

	useEffect(() => {
		if (!merchantId || !assetId || !amountStr || isNaN(amount) || !selectedAsset || !selectedMerchant) {
			toast.error('P2P order details missing or invalid. Redirecting...');
			router.replace('/account/wallet/withdraw/p2p'); // Go back to merchant list
		}
	}, [merchantId, assetId, amountStr, amount, selectedAsset, selectedMerchant, router]);

	const handleConfirmOrder = () => {
		setIsConfirmOrderModalOpen(true);
	};

	const proceedWithOrderPlacement = () => {
		if (!selectedAsset || !selectedMerchant) return;

		setIsProcessingOrder(true);

		// Simulate API call to create P2P withdrawal order
		setTimeout(() => {
			nProgress.start(); // Start progress on actual redirection
			const mockTransactionId = `TXN-P2P-W-${Date.now()}`; // Generate a mock withdrawal ID
			toast.success('P2P withdrawal order placed! Redirecting to transaction...');

			// Prepare details to pass to the transaction page
			const expectedFiat = amount * selectedMerchant.buyRateNGN;
			const queryParams = new URLSearchParams({
				type: 'p2p_withdrawal', // Indicate transaction type
				status: 'pending_payment', // Initial status
				merchantName: selectedMerchant.name,
				assetSymbol: selectedAsset.symbol,
				assetAmount: String(amount),
				rateNGN: String(selectedMerchant.buyRateNGN),
				expectedFiat: String(expectedFiat),
				// Add other necessary details like user bank info if collected here,
				// or expect it to be handled on the transaction page
			}).toString();

			// Redirect to the generic transaction page to handle the active P2P flow
			router.replace(`/account/wallet/transactions/${mockTransactionId}?${queryParams}`);
			// No need to reset processing state here as we are navigating away
		}, 2000); // 2-second delay
	};

	if (!selectedAsset || !selectedMerchant || isNaN(amount)) {
		return (
			<div className="max-w-2xl space-y-8 flex flex-col items-center justify-center py-10">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>Cannot load order details. Please try again.</AlertDescription>
				</Alert>
				<Button onClick={() => router.push('/account/wallet/withdraw')}>Start Over</Button>
			</div>
		);
	}

	const expectedFiat = amount * selectedMerchant.buyRateNGN;

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Confirm P2P Withdrawal</CardTitle>
					<p className="sub-page-heading-sub-text">
						Review the details for selling {amount} {selectedAsset.symbol} to {selectedMerchant.name}.
					</p>
				</CardHeader>
				<CardContent className="space-y-4 pt-6 px-0">
					<div className="p-4 rounded-lg bg-background dark:bg-muted border border-border space-y-1">
						<h3 className="text-md font-semibold text-foreground mb-2">Sell {selectedAsset.symbol}</h3>
						<OrderDetailItem label="Amount to Sell" value={amount} unit={selectedAsset.symbol} isBold />
						<OrderDetailItem label="Rate" value={selectedMerchant.buyRateNGN} unit={`NGN / ${selectedAsset.symbol}`} />
						<OrderDetailItem label="Expected Fiat" value={expectedFiat} unit="NGN" isBold />
						<OrderDetailItem label="Merchant" value={selectedMerchant.name} />
					</div>
					<Alert variant="default" className="border-yellow-500/50 text-yellow-700 dark:border-yellow-500/30 dark:text-yellow-300 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Important</AlertTitle>
						<AlertDescription>
							Once confirmed, the specified amount of {selectedAsset.symbol} will be held in escrow. Only release the crypto after you have confirmed receipt of the correct fiat amount ({expectedFiat.toLocaleString()} NGN) in your account.
						</AlertDescription>
					</Alert>
					<Button onClick={handleConfirmOrder} size="lg" variant="success" className="w-full group" disabled={isProcessingOrder}>
						{isProcessingOrder ? 'Placing Order...' : 'Confirm & Place Order'}
						{!isProcessingOrder && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
					</Button>
				</CardContent>
			</Card>

			<ConfirmationModal
				isOpen={isConfirmOrderModalOpen}
				onClose={() => {
					if (!isProcessingOrder) {
						setIsConfirmOrderModalOpen(false);
					}
				}}
				onConfirm={proceedWithOrderPlacement}
				title="Confirm P2P Withdrawal Order"
				description={`Place order to sell ${amount} ${selectedAsset.symbol} to ${selectedMerchant.name} for approximately ${expectedFiat.toLocaleString()} NGN?`}
				confirmButtonText="Yes, Place Order"
				cancelButtonText="Cancel"
				isLoading={isProcessingOrder}
			/>
		</div>
	);
}

export default function ConfirmP2PWithdrawalPage() {
	// Wrap with Suspense because useSearchParams() needs it
	return (
		<Suspense fallback={<div className="flex justify-center items-center h-screen">Loading order confirmation...</div>}>
			<ConfirmP2PWithdrawalContent />
		</Suspense>
	);
}
