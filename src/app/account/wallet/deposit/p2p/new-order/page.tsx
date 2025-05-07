'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react'; // Changed ArrowLeft to ArrowRight for confirm button, removed MessageCircle, Copy
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import ConfirmationModal from '@/components/modals/ConfirmationModal'; // Added

// Mock data - In a real app, fetch this based on agentId and amount
const MOCK_ORDER_DETAILS = {
	amountNGN: 10000.0,
	rateNGN: 1645.01,
	quantityUSDT: 6.0789,
	transactionFeesNGN: 500.0,
};

const MOCK_SELLER_INFO = {
	name: 'Bruce Banner',
	bankName: 'United Bank for Africa',
	accountNumber: '2910292827',
};

// const PAYMENT_COUNTDOWN_SECONDS = 14 * 60 + 50; // Removed, timer logic handled in transactionId page

export default function P2PNewOrderPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const agentId = searchParams.get('agentId');
	const amount = searchParams.get('amount'); // This would be used to calculate order details

	// State for confirmation modal and order processing
	const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);
	const [isProcessingOrder, setIsProcessingOrder] = useState(false);

	const handleConfirmOrder = () => {
		// Open confirmation modal instead of directly processing
		setIsConfirmOrderModalOpen(true);
	};

	const proceedWithOrderPlacement = () => {
		// setIsConfirmOrderModalOpen(false); // Close modal
		setIsProcessingOrder(true);

		// Simulate API call to create order and get transactionId
		setTimeout(() => {
			nProgress.start();
			const mockTransactionId = `TXN-P2P-${Date.now()}`; // Generate a mock ID
			toast.success('Order placed successfully! Redirecting...');

			const queryParams = new URLSearchParams({
				// Spread MOCK_ORDER_DETAILS and MOCK_SELLER_INFO
				// Ensure all values are strings for URLSearchParams
				amountNGN: String(MOCK_ORDER_DETAILS.amountNGN),
				rateNGN: String(MOCK_ORDER_DETAILS.rateNGN),
				quantityUSDT: String(MOCK_ORDER_DETAILS.quantityUSDT),
				transactionFeesNGN: String(MOCK_ORDER_DETAILS.transactionFeesNGN),
				name: MOCK_SELLER_INFO.name,
				bankName: MOCK_SELLER_INFO.bankName,
				accountNumber: MOCK_SELLER_INFO.accountNumber,
			}).toString();
			router.replace(`/account/wallet/transactions/${mockTransactionId}?${queryParams}`);
			setIsProcessingOrder(false);
		}, 2000); // 2-second delay
	};

	const OrderDetailItem: React.FC<{ label: string; value: string | number; unit?: string; isBold?: boolean }> = ({ label, value, unit, isBold }) => (
		<div className="flex justify-between items-center py-3">
			<span className="text-sm text-[var(--dashboard-subtext)]">{label}</span>
			<span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-[var(--dashboard-foreground)]`}>
				{typeof value === 'number' ? value.toFixed(unit === 'USDT' ? 4 : 2) : value} {unit}
			</span>
		</div>
	);

	return (
		<div className="max-w-2xl space-y-8">
			{/* orderState check removed, this page now only handles order confirmation */}
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Order Summary</CardTitle>
					<p className="sub-page-heading-sub-text">Please review and confirm the order details below.</p>
				</CardHeader>
				<CardContent className="space-y-4 pt-6 px-0">
					<div className="p-4 rounded-lg bg-background dark:bg-muted border border-border space-y-1">
						<h3 className="text-md font-semibold text-foreground mb-2">Buy USDT</h3>
						<OrderDetailItem label="Amount" value={MOCK_ORDER_DETAILS.amountNGN} unit="NGN" isBold />
						<OrderDetailItem label="Rate" value={MOCK_ORDER_DETAILS.rateNGN} unit="NGN" />
						<OrderDetailItem label="Quantity" value={MOCK_ORDER_DETAILS.quantityUSDT} unit="USDT" />
						<OrderDetailItem label="Transaction Fees" value={MOCK_ORDER_DETAILS.transactionFeesNGN} unit="NGN" />
					</div>
					<Button onClick={handleConfirmOrder} size="lg" variant="success" className="w-full group" disabled={isProcessingOrder}>
						{isProcessingOrder ? 'Processing...' : 'Confirm Order'}
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
				title="Confirm P2P Order"
				description="Please review your order details. Are you sure you want to proceed with placing this order?"
				confirmButtonText="Confirm & Place Order"
				cancelButtonText="Review Order"
				isLoading={isProcessingOrder}
			/>
		</div>
	);
}
