'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import nProgress from 'nprogress';
import { toast } from 'sonner';

// Mock data (should ideally be shared or fetched, copied for now)
interface Asset {
	id: string;
	name: string;
	symbol: string;
	networks: Network[];
}

interface Network {
	id: string;
	name: string;
	fee: number;
	feeCurrency?: string;
}

const mockAssets: Asset[] = [
	{
		id: 'btc',
		name: 'Bitcoin',
		symbol: 'BTC',
		networks: [{ id: 'btc_mainnet', name: 'Bitcoin', fee: 0.0002, feeCurrency: 'BTC' }],
	},
	{
		id: 'eth',
		name: 'Ethereum',
		symbol: 'ETH',
		networks: [{ id: 'eth_erc20', name: 'Ethereum (ERC20)', fee: 0.005, feeCurrency: 'ETH' }],
	},
	{
		id: 'usdt',
		name: 'TetherUS',
		symbol: 'USDT',
		networks: [
			{ id: 'usdt_trc20', name: 'Tron (TRC20)', fee: 1, feeCurrency: 'USDT' },
			{ id: 'usdt_erc20', name: 'Ethereum (ERC20)', fee: 5, feeCurrency: 'USDT' },
		],
	},
];

function ReviewWithdrawalContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const assetId = searchParams.get('assetId');
	const amountStr = searchParams.get('amount');
	const networkId = searchParams.get('networkId');
	const address = searchParams.get('address');

	const selectedAsset = mockAssets.find((asset) => asset.id === assetId);
	const selectedNetwork = selectedAsset?.networks.find((net) => net.id === networkId);
	const amount = parseFloat(amountStr || '0');

	if (!selectedAsset || !selectedNetwork || isNaN(amount) || !address) {
		useEffect(() => {
			toast.error('Review details are incomplete. Redirecting...');
			router.replace('/account/wallet/withdraw');
		}, [router]);
		return (
			<div className="max-w-2xl space-y-8 flex flex-col items-center justify-center py-10">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>Cannot review withdrawal. Please start over.</AlertDescription>
				</Alert>
				<Button onClick={() => router.push('/account/wallet/withdraw')}>Start Over</Button>
			</div>
		);
	}

	let totalDebit = amount;
	let totalDebitCurrency = selectedAsset.symbol;
	if (selectedNetwork.feeCurrency === selectedAsset.symbol) {
		totalDebit += selectedNetwork.fee;
	}

	const handleProceedToVerification = () => {
		nProgress.start();
		router.push(`/account/wallet/withdraw/verify?assetId=${assetId}&amount=${amountStr}&networkId=${networkId}&address=${encodeURIComponent(address)}`);
	};

	useEffect(() => {
		if (!selectedAsset || !selectedNetwork || isNaN(amount) || !address) {
			toast.error('Review details are incomplete. Redirecting...');
			router.replace('/account/wallet/withdraw');
		}
	}, [selectedAsset, selectedNetwork, amount, address, router]);

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Review Withdrawal</CardTitle>
					<p className="sub-page-heading-sub-text">Please carefully review all details before confirming your withdrawal.</p>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 px-0">
					<Card className="border-border">
						<CardHeader>
							<CardTitle className="text-xl flex items-center">
								<ShieldCheck className="mr-2 h-6 w-6 text-[var(--dashboard-accent)]" />
								Withdrawal Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm">
							<div className="flex justify-between items-center py-3 border-b border-border">
								<span className="text-muted-foreground">Asset</span>
								<span className="font-medium text-foreground">
									{selectedAsset.name} ({selectedAsset.symbol})
								</span>
							</div>
							<div className="flex justify-between items-center py-3 border-b border-border">
								<span className="text-muted-foreground">Amount to Withdraw</span>
								<span className="font-medium text-foreground">
									{amount.toLocaleString()} {selectedAsset.symbol}
								</span>
							</div>
							<div className="flex justify-between items-center py-3 border-b border-border">
								<span className="text-muted-foreground">Network</span>
								<span className="font-medium text-foreground">{selectedNetwork.name}</span>
							</div>
							<div className="flex justify-between items-center py-3 border-b border-border">
								<span className="text-muted-foreground">Recipient Address</span>
								<span className="font-medium text-foreground break-all">{decodeURIComponent(address)}</span>
							</div>
							<div className="flex justify-between items-center py-3 border-b border-border">
								<span className="text-muted-foreground">Network Fee</span>
								<span className="font-medium text-foreground">
									{selectedNetwork.fee.toLocaleString()} {selectedNetwork.feeCurrency || selectedAsset.symbol}
								</span>
							</div>
							<div className="flex justify-between items-center py-3 font-semibold text-base text-foreground bg-muted/20 px-3 rounded-md">
								<span>Total Debit</span>
								<span>
									{totalDebit.toLocaleString()} {totalDebitCurrency}
									{selectedNetwork.feeCurrency !== selectedAsset.symbol && ` + ${selectedNetwork.fee.toLocaleString()} ${selectedNetwork.feeCurrency}`}
								</span>
							</div>
						</CardContent>
					</Card>

					<Alert variant="default" className="border-yellow-500/50 text-yellow-700 dark:border-yellow-500/30 dark:text-yellow-300 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Final Check!</AlertTitle>
						<AlertDescription>Withdrawals are irreversible. Please double-check the recipient address and network. Sikky Six is not responsible for funds sent to incorrect addresses or networks.</AlertDescription>
					</Alert>

					<Button onClick={handleProceedToVerification} size="lg" variant="success" className="w-full flex items-center justify-center group" disabled={nProgress.isStarted()}>
						Confirm & Proceed to Verification
						<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

export default function ReviewWithdrawalPage() {
	return (
		<Suspense fallback={<div className="flex justify-center items-center h-screen">Loading review...</div>}>
			<ReviewWithdrawalContent />
		</Suspense>
	);
}
