'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import copyToClipboard from '@/components/ui/copy-to-clipboard';

interface Asset {
	id: string;
	symbol: string;
}
const mockAssets: Asset[] = [
	{ id: 'btc', symbol: 'BTC' },
	{ id: 'eth', symbol: 'ETH' },
	{ id: 'usdt', symbol: 'USDT' },
];

function SuccessStatusContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const txId = searchParams.get('txId');
	const assetId = searchParams.get('asset');
	const amount = searchParams.get('amount');
	const address = searchParams.get('address');

	const selectedAsset = mockAssets.find((a) => a.id === assetId);

	return (
		<div className="max-w-lg mx-auto space-y-8 py-10">
			<Card className="bg-background border-0 shadow-none">
				<CardHeader className="px-0 text-center items-center">
					<CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
					<CardTitle className="sub-page-heading text-2xl">Withdrawal Successful!</CardTitle>
					<CardDescription className="sub-page-heading-sub-text pt-1">
						Your withdrawal of {amount || 'N/A'} {selectedAsset?.symbol || assetId || ''} has been processed.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 px-0">
					{txId && (
						<div className="p-4 border border-border rounded-md bg-muted/30">
							<h3 className="text-sm font-medium mb-2 text-muted-foreground">Transaction Details:</h3>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Amount:</span>
									<span className="font-medium text-foreground">
										{amount} {selectedAsset?.symbol || ''}
									</span>
								</div>
								{address && (
									<div className="flex justify-between items-start">
										<span className="text-muted-foreground pt-0.5">To Address:</span>
										<div className="flex items-center gap-1 text-right">
											<span className="font-medium text-foreground break-all">{decodeURIComponent(address)}</span>
											<Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(decodeURIComponent(address), 'Address copied!')}>
												<Copy className="h-3.5 w-3.5" />
											</Button>
										</div>
									</div>
								)}
								<div className="flex justify-between items-center">
									<span className="text-muted-foreground">Transaction ID:</span>
									<div className="flex items-center gap-1">
										<span className="font-medium text-foreground break-all">{txId}</span>
										<Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(txId, 'Transaction ID copied!')}>
											<Copy className="h-3.5 w-3.5" />
										</Button>
									</div>
								</div>
								<Button variant="outline" size="sm" className="w-full mt-3 border-border hover:border-[var(--dashboard-accent)]">
									View on Explorer (Mock)
									<ExternalLink className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					)}

					<div className="flex flex-col sm:flex-row gap-3 mt-8">
						<Button onClick={() => router.push('/account/wallet')} variant="success" size="lg" className="w-full">
							Back to Wallet
						</Button>
						<Button onClick={() => router.push('/account/wallet/withdraw')} variant="outline" size="lg" className="w-full border-border">
							Make Another Withdrawal
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function WithdrawalSuccessPage() {
	return (
		<Suspense fallback={<div className="flex justify-center items-center h-screen">Loading status...</div>}>
			<SuccessStatusContent />
		</Suspense>
	);
}
