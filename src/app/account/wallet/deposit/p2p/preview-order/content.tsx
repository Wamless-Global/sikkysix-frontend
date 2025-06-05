'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { Skeleton } from '@/components/ui/skeleton';
import OrderDetailItem from '@/components/p2p/OrderDetailItem';
import { handleFetchErrorMessage } from '@/lib/helpers';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function P2PNewOrderPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const agentId = searchParams.get('agentId');
	const amount = searchParams.get('amount');
	const orderId = searchParams.get('orderId');
	const type = 'buy';

	const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);
	const [isProcessingOrder, setIsProcessingOrder] = useState(false);
	const [loading, setLoading] = useState(true);
	const [softError, setSoftError] = useState<string | null>(null);
	const [preview, setPreview] = useState<any>(null);
	const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

	useEffect(() => {
		if (!agentId || !amount || !orderId) {
			nProgress.start();
			router.push('/account/wallet/deposit');
			setSoftError('Missing required order parameters. Please go back and try again.');
			return;
		}

		const fetchPreview = async () => {
			setLoading(true);
			setSoftError(null);
			try {
				const res = await fetch('/api/p2p/orders/preview', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ agentId, amount, orderId, type }),
					credentials: 'include',
				});
				const data = await res.json();

				if (data?.status === 'success' && data?.data) {
					setPreview({
						amountNGN: Number(data.data.amount),
						rateNGN: Number(data.data.rate),
						quantityUSDT: Number(data.data.quantity),
						transactionFeesNGN: Number(data.data.transactionFee),
						methods: data.data.methods || [],
					});
					// Auto-select first method if only one is available
					if (data.data.methods && data.data.methods.length === 1) {
						setSelectedMethodId(data.data.methods[0].id);
					}
				} else if (data?.error) {
					const msg = handleFetchErrorMessage(data.error, 'Could not fetch order preview.');
					setSoftError(msg);
					toast.error(msg);
				} else {
					setSoftError('Order preview not found. Please try again.');
					toast.error('Order preview not found.');
				}
			} catch (err) {
				const msg = handleFetchErrorMessage(err, 'Failed to fetch order preview.');
				setSoftError(msg);
				toast.error(msg);
			} finally {
				setLoading(false);
			}
		};
		fetchPreview();
	}, [agentId, amount, orderId]);

	const handleConfirmOrder = () => {
		setIsConfirmOrderModalOpen(true);
	};

	const proceedWithOrderPlacement = async () => {
		if (!selectedMethodId) {
			toast.error('Please select a payment method.');
			return;
		}
		setIsProcessingOrder(true);
		try {
			nProgress.start();
			const res = await fetch('/api/p2p/trades/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ agentId, amount, orderId, type, methodId: selectedMethodId }),
				credentials: 'include',
			});
			const data = await res.json();
			if (res.ok && data?.status === 'success') {
				toast.success('Order placed successfully! Redirecting...');
				router.replace(`/account/wallet/transactions/${data.data.escrow_transaction_id}`);
			} else {
				const msg = handleFetchErrorMessage(data, 'Failed to confirm order.');
				toast.error(msg);
			}
		} catch (err) {
			const msg = handleFetchErrorMessage(err, 'Failed to confirm order.');
			toast.error(msg);
		} finally {
			setIsProcessingOrder(false);
			nProgress.done();
		}
	};

	if (loading) {
		return (
			<div className="max-w-2xl space-y-8">
				<p className="text-center text-muted-foreground text-sm mb-2">Fetching order preview…</p>
				<Skeleton className="h-40 w-full rounded-lg mb-4" />
				<Skeleton className="h-12 w-full rounded-lg" />
			</div>
		);
	}

	if (softError) {
		return (
			<div className="max-w-2xl mt-10">
				<div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{softError}</span>
					</div>
					<Button variant="destructive" size="sm" onClick={() => router.push('/account/wallet/deposit')}>
						Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Order Preview</CardTitle>
					<p className="sub-page-heading-sub-text">
						Buy&nbsp;
						<span className="font-semibold text-foreground">{preview?.quantityUSDT?.toLocaleString(undefined, { maximumFractionDigits: 6 })} USDT</span>&nbsp; for&nbsp;
						<span className="font-semibold text-foreground">₦{preview?.amountNGN?.toLocaleString()}</span> at a rate of&nbsp;
						<span className="font-semibold text-foreground">₦{preview?.rateNGN?.toLocaleString()}</span> per USDT.
					</p>
				</CardHeader>
				<CardContent className="space-y-4 pt-6 px-0">
					<div className="p-4 rounded-lg bg-background dark:bg-muted border border-border space-y-1">
						<h3 className="text-md font-semibold text-foreground mb-2">Buy USDT</h3>
						<OrderDetailItem label="Amount" value={preview?.amountNGN} unit="NGN" isBold />
						<OrderDetailItem label="Rate" value={preview?.rateNGN} unit="NGN" />
						<OrderDetailItem label="Quantity" value={preview?.quantityUSDT} unit="USDT" />
						{preview?.transactionFeesNGN === 0 ? <OrderDetailItem label="Transaction Fees" value="No transaction fee" unit="" /> : <OrderDetailItem label="Transaction Fees" value={preview?.transactionFeesNGN} unit="NGN" />}
					</div>
					{preview?.methods && preview.methods.length > 0 && (
						<div className="p-4 rounded-lg bg-background dark:bg-muted border border-border">
							<h3 className="text-md font-semibold text-foreground mb-2">Select Payment Method</h3>
							<RadioGroup value={selectedMethodId ?? ''} onValueChange={setSelectedMethodId} className="space-y-2">
								{preview.methods.map((method: any) => (
									<Label
										key={method.id}
										htmlFor={`method-${method.id}`}
										className="flex items-center space-x-2 p-3 bg-background rounded-md border border-border has-[[data-state=checked]]:border-[var(--dashboard-accent)] has-[[data-state=checked]]:bg-muted/50 transition-all cursor-pointer"
									>
										<RadioGroupItem value={method.id} id={`method-${method.id}`} className="border-border data-[state=checked]:border-[var(--dashboard-accent)] data-[state=checked]:bg-[var(--dashboard-accent)] data-[state=checked]:text-accent-foreground" />
										<span className="font-medium flex-1">{method.name}</span>
									</Label>
								))}
							</RadioGroup>
						</div>
					)}
					<Button onClick={handleConfirmOrder} size="lg" variant="success" className="w-full group" disabled={isProcessingOrder || !selectedMethodId}>
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
				description={`You are about to place an order to buy ${preview?.quantityUSDT?.toLocaleString(undefined, {
					maximumFractionDigits: 6,
				})} USDT for ₦${preview?.amountNGN?.toLocaleString()} at a rate of ₦${preview?.rateNGN?.toLocaleString()} per USDT.\nPlease review your order details. Are you sure you want to proceed?`}
				confirmButtonText="Confirm & Place Order"
				cancelButtonText="Review Order"
				isLoading={isProcessingOrder}
			/>
		</div>
	);
}
