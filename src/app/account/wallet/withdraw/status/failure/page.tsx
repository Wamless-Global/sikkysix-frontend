'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link'; // Not strictly needed if using router.push for all actions
import { XCircle, AlertTriangle } from 'lucide-react'; // Using XCircle for failure
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Minimal mock data needed for asset symbol display
interface Asset {
	id: string;
	symbol: string;
}
const mockAssets: Asset[] = [
	{ id: 'btc', symbol: 'BTC' },
	{ id: 'eth', symbol: 'ETH' },
	{ id: 'usdt', symbol: 'USDT' },
];

function FailureStatusContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const errorMessage = searchParams.get('error') || 'An unknown error occurred.';
	const assetId = searchParams.get('asset');
	const amount = searchParams.get('amount');
	const address = searchParams.get('address');

	const selectedAsset = mockAssets.find((a) => a.id === assetId);

	const handleTryAgain = () => {
		// Navigate to the start of the withdrawal flow, potentially pre-filling known details
		// For simplicity, just goes to the start. Could pass params to prefill.
		router.push(`/account/wallet/withdraw?assetId=${assetId || ''}&amount=${amount || ''}&address=${address || ''}`);
	};

	return (
		<div className="max-w-lg mx-auto space-y-8 py-10">
			<Card className="bg-background border-0 shadow-none">
				<CardHeader className="px-0 text-center items-center">
					<XCircle className="h-16 w-16 text-red-500 mb-4" />
					<CardTitle className="sub-page-heading text-2xl">Withdrawal Failed</CardTitle>
					<CardDescription className="sub-page-heading-sub-text pt-1 text-red-600 dark:text-red-400">Unfortunately, we couldn't process your withdrawal at this time.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 px-0">
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Error Details:</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>

					{(assetId || amount || address) && (
						<div className="p-4 border border-border rounded-md bg-muted/30 mt-6">
							<h3 className="text-sm font-medium mb-2 text-muted-foreground">Attempted Transaction:</h3>
							<div className="space-y-2 text-sm">
								{amount && selectedAsset && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Amount:</span>
										<span className="font-medium text-foreground">
											{amount} {selectedAsset.symbol}
										</span>
									</div>
								)}
								{address && (
									<div className="flex justify-between items-start">
										<span className="text-muted-foreground pt-0.5">To Address:</span>
										<span className="font-medium text-foreground break-all">{decodeURIComponent(address)}</span>
									</div>
								)}
							</div>
						</div>
					)}

					<div className="flex flex-col sm:flex-row gap-3 mt-8">
						<Button onClick={handleTryAgain} variant="outline" size="lg" className="w-full border-border">
							Try Again
						</Button>
						<Button onClick={() => router.push('/account/wallet')} variant="success" size="lg" className="w-full">
							Back to Wallet
						</Button>
						{/* Optional: Contact Support Button */}
						{/* <Button variant="secondary" size="lg" className="w-full">Contact Support</Button> */}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function WithdrawalFailurePage() {
	return (
		<Suspense fallback={<div className="flex justify-center items-center h-screen">Loading status...</div>}>
			<FailureStatusContent />
		</Suspense>
	);
}
