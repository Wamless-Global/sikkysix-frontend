'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import nProgress from 'nprogress';
import { toast } from 'sonner';

interface Asset {
	id: string;
	name: string;
	symbol: string;
	balance: number;
	minWithdrawal: number;
	maxWithdrawal: number;
	networks: Network[];
	iconUrl?: string;
}

interface Network {
	id: string;
	name: string;
	fee: number;
	feeCurrency?: string;
	addressRegex?: string;
}

const mockAssets: Asset[] = [
	{
		id: 'btc',
		name: 'Bitcoin',
		symbol: 'BTC',
		balance: 0.5,
		minWithdrawal: 0.001,
		maxWithdrawal: 2,
		iconUrl: '/icons/btc.svg',
		networks: [{ id: 'btc_mainnet', name: 'Bitcoin', fee: 0.0002, feeCurrency: 'BTC', addressRegex: '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$' }],
	},
	{
		id: 'eth',
		name: 'Ethereum',
		symbol: 'ETH',
		balance: 10,
		minWithdrawal: 0.01,
		maxWithdrawal: 50,
		iconUrl: '/icons/eth.svg',
		networks: [{ id: 'eth_erc20', name: 'Ethereum (ERC20)', fee: 0.005, feeCurrency: 'ETH', addressRegex: '^0x[a-fA-F0-9]{40}$' }],
	},
	{
		id: 'usdt',
		name: 'TetherUS',
		symbol: 'USDT',
		balance: 5000,
		minWithdrawal: 10,
		maxWithdrawal: 100000,
		iconUrl: '/icons/usdt.svg',
		networks: [
			{ id: 'usdt_trc20', name: 'Tron (TRC20)', fee: 1, feeCurrency: 'USDT', addressRegex: '^T[A-Za-z1-9]{33}$' },
			{ id: 'usdt_erc20', name: 'Ethereum (ERC20)', fee: 5, feeCurrency: 'USDT', addressRegex: '^0x[a-fA-F0-9]{40}$' },
		],
	},
];

function WithdrawDetailsContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const assetId = searchParams.get('assetId');
	const amountStr = searchParams.get('amount');
	const networkId = searchParams.get('networkId');

	const [recipientAddress, setRecipientAddress] = useState('');
	const [addressError, setAddressError] = useState<string | null>(null);

	const selectedAsset = mockAssets.find((asset) => asset.id === assetId);
	const selectedNetwork = selectedAsset?.networks.find((net) => net.id === networkId);
	const amount = parseFloat(amountStr || '0');

	useEffect(() => {
		if (!assetId || !amountStr || !networkId || !selectedAsset || !selectedNetwork) {
			toast.error('Withdrawal details missing or invalid. Redirecting...');
			router.replace('/account/wallet/withdraw');
		}
	}, [assetId, amountStr, networkId, selectedAsset, selectedNetwork, router]);

	const validateAddress = () => {
		if (!recipientAddress) {
			setAddressError('Recipient address is required.');
			return false;
		}
		if (selectedNetwork?.addressRegex) {
			const regex = new RegExp(selectedNetwork.addressRegex);
			if (!regex.test(recipientAddress)) {
				setAddressError(`Invalid address format for ${selectedNetwork.name}.`);
				return false;
			}
		}
		setAddressError(null);
		return true;
	};

	const handleProceed = () => {
		if (!validateAddress()) {
			return;
		}
		nProgress.start();
		router.push(`/account/wallet/withdraw/review?assetId=${assetId}&amount=${amountStr}&networkId=${networkId}&address=${encodeURIComponent(recipientAddress)}`);
	};

	if (!selectedAsset || !selectedNetwork || isNaN(amount)) {
		return (
			<div className="max-w-2xl space-y-8 flex flex-col items-center justify-center py-10">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>Invalid withdrawal parameters. Please start over.</AlertDescription>
				</Alert>
				<Button onClick={() => router.push('/account/wallet/withdraw')}>Go Back</Button>
			</div>
		);
	}

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Recipient Details</CardTitle>
					<p className="sub-page-heading-sub-text">Enter the recipient's address for your withdrawal.</p>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 px-0">
					<Card className="bg-muted/30">
						<CardHeader>
							<CardTitle className="text-lg">Withdrawal Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span>Asset:</span>{' '}
								<span className="font-medium">
									{selectedAsset.name} ({selectedAsset.symbol})
								</span>
							</div>
							<div className="flex justify-between">
								<span>Amount:</span>{' '}
								<span className="font-medium">
									{amount} {selectedAsset.symbol}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Network:</span> <span className="font-medium">{selectedNetwork.name}</span>
							</div>
							<div className="flex justify-between">
								<span>Est. Fee:</span>{' '}
								<span className="font-medium">
									{selectedNetwork.fee} {selectedNetwork.feeCurrency || selectedAsset.symbol}
								</span>
							</div>
						</CardContent>
					</Card>

					<div className="space-y-2">
						<Label htmlFor="recipientAddress" className="text-sm font-medium">
							Recipient's {selectedAsset.symbol} Address ({selectedNetwork.name})
						</Label>
						<Input
							id="recipientAddress"
							type="text"
							value={recipientAddress}
							onChange={(e) => {
								setRecipientAddress(e.target.value);
								if (addressError) validateAddress();
							}}
							placeholder={`Enter ${selectedNetwork.name} address`}
							className={`bg-background border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] ${addressError ? 'border-red-500 focus:border-red-500' : ''}`}
						/>
						{addressError && (
							<Alert variant="destructive" className="mt-2">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Validation Error</AlertTitle>
								<AlertDescription>{addressError}</AlertDescription>
							</Alert>
						)}
					</div>

					<Alert>
						<Info className="h-4 w-4" />
						<AlertTitle>Important Notice</AlertTitle>
						<AlertDescription>Ensure the address is correct and on the {selectedNetwork.name} network. Sending to a wrong address or network may result in permanent loss of funds.</AlertDescription>
					</Alert>

					<Button onClick={handleProceed} size="lg" variant="success" className="w-full flex items-center justify-center group" disabled={!recipientAddress || !!addressError || nProgress.isStarted()}>
						Proceed to Review
						<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

export default function WithdrawDetailsPage() {
	return (
		<Suspense fallback={<div className="flex justify-center items-center h-screen">Loading details...</div>}>
			<WithdrawDetailsContent />
		</Suspense>
	);
}
