'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function WithdrawPageContent() {
	const router = useRouter();
	const [withdrawalMethod, setWithdrawalMethod] = useState<'onchain' | 'p2p'>('onchain');
	const [selectedAssetId, setSelectedAssetId] = useState<string>('');
	const [amount, setAmount] = useState('');
	const [selectedNetworkId, setSelectedNetworkId] = useState<string>('');
	const [amountError, setAmountError] = useState<string | null>(null);

	const selectedAsset = mockAssets.find((asset) => asset.id === selectedAssetId);

	useEffect(() => {
		setSelectedNetworkId('');
		// setAmount('');
		// setSelectedAssetId('');
	}, [withdrawalMethod]);

	useEffect(() => {
		if (withdrawalMethod === 'onchain') {
			if (selectedAsset && !selectedAsset.networks.find((net) => net.id === selectedNetworkId)) {
				setSelectedNetworkId('');
			}
			if (!selectedAssetId) {
				setSelectedNetworkId('');
			}
		}
	}, [selectedAssetId, selectedAsset, selectedNetworkId, withdrawalMethod]);

	const validateAmount = useCallback(() => {
		if (!selectedAsset || !amount) {
			setAmountError(null);
			return true;
		}
		const numAmount = parseFloat(amount);
		if (isNaN(numAmount) || numAmount <= 0) {
			setAmountError('Please enter a valid amount.');
			return false;
		}
		if (numAmount > selectedAsset.balance) {
			setAmountError(`Insufficient balance. Max: ${selectedAsset.balance} ${selectedAsset.symbol}`);
			return false;
		}
		if (numAmount < selectedAsset.minWithdrawal) {
			setAmountError(`Minimum withdrawal is ${selectedAsset.minWithdrawal} ${selectedAsset.symbol}`);
			return false;
		}
		if (numAmount > selectedAsset.maxWithdrawal) {
			setAmountError(`Maximum withdrawal is ${selectedAsset.maxWithdrawal} ${selectedAsset.symbol}`);
			return false;
		}
		setAmountError(null);
		return true;
	}, [amount, selectedAsset]);
	useEffect(() => {
		if (amount) {
			validateAmount();
		}
	}, [amount, validateAmount]);

	const handleProceed = () => {
		if (!validateAmount() || !selectedAssetId) {
			if (!selectedAssetId) toast.error('Please select an asset.');
			return;
		}

		nProgress.start();

		if (withdrawalMethod === 'onchain') {
			if (!selectedNetworkId) {
				toast.error('Please select a network for on-chain withdrawal.');
				nProgress.done();
				return;
			}
			router.push(`/account/wallet/withdraw/details?assetId=${selectedAssetId}&amount=${amount}&networkId=${selectedNetworkId}`);
		} else if (withdrawalMethod === 'p2p') {
			router.push(`/account/wallet/withdraw/p2p?assetId=${selectedAssetId}&amount=${amount}`);
		}
	};

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Withdraw Funds</CardTitle>
					<p className="sub-page-heading-sub-text">Choose your withdrawal method, asset, and amount.</p>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 px-0">
					<div className="space-y-3">
						<Label className="text-sm font-medium">Select Withdrawal Method</Label>
						<RadioGroup value={withdrawalMethod} onValueChange={(value) => setWithdrawalMethod(value as 'onchain' | 'p2p')} className="space-y-2">
							<Label htmlFor="onchain_withdraw" className="flex items-center space-x-2 p-3 bg-background rounded-md border border-border has-[[data-state=checked]]:border-[var(--dashboard-accent)] has-[[data-state=checked]]:bg-muted/50 transition-all cursor-pointer">
								<RadioGroupItem value="onchain" id="onchain_withdraw" className="border-border data-[state=checked]:border-[var(--dashboard-accent)] data-[state=checked]:bg-[var(--dashboard-accent)] data-[state=checked]:text-accent-foreground" />
								<span className="font-medium flex-1">On-Chain (Crypto Address)</span>
							</Label>
							<Label htmlFor="p2p_withdraw" className="flex items-center space-x-2 p-3 bg-background rounded-md border border-border has-[[data-state=checked]]:border-[var(--dashboard-accent)] has-[[data-state=checked]]:bg-muted/50 transition-all cursor-pointer">
								<RadioGroupItem value="p2p" id="p2p_withdraw" className="border-border data-[state=checked]:border-[var(--dashboard-accent)] data-[state=checked]:bg-[var(--dashboard-accent)] data-[state=checked]:text-accent-foreground" />
								<span className="font-medium flex-1">P2P (Sell to Merchant)</span>
							</Label>
						</RadioGroup>
					</div>

					<div className="space-y-2">
						<Label htmlFor="asset" className="text-sm font-medium">
							Select Asset
						</Label>
						<Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
							<SelectTrigger className="w-full bg-background border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)]">
								<SelectValue placeholder="Choose an asset" />
							</SelectTrigger>
							<SelectContent>
								{mockAssets.map((asset) => (
									<SelectItem key={asset.id} value={asset.id}>
										{asset.name} ({asset.symbol}) - Bal: {asset.balance}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{withdrawalMethod === 'onchain' && selectedAsset && selectedAsset.networks.length > 0 && (
						<div className="space-y-3">
							<Label className="text-sm font-medium">Select Network</Label>
							<RadioGroup value={selectedNetworkId} onValueChange={setSelectedNetworkId} className="space-y-2">
								{selectedAsset.networks.map((network) => (
									<Label key={network.id} htmlFor={network.id} className="flex items-center space-x-2 p-3 bg-background rounded-md border border-border has-[[data-state=checked]]:border-[var(--dashboard-accent)] has-[[data-state=checked]]:bg-muted/50 transition-all cursor-pointer">
										<RadioGroupItem value={network.id} id={network.id} className="border-border data-[state=checked]:border-[var(--dashboard-accent)] data-[state=checked]:bg-[var(--dashboard-accent)] data-[state=checked]:text-accent-foreground" />
										<span className="font-medium flex-1">{network.name}</span>
										<span className="text-xs text-muted-foreground">
											Fee: {network.fee} {network.feeCurrency || selectedAsset.symbol}
										</span>
									</Label>
								))}
							</RadioGroup>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="amount" className="text-sm font-medium">
							Enter Amount ({selectedAsset?.symbol || ''})
						</Label>
						<Input
							id="amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="e.g., 0.1"
							className={`bg-background border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] ${amountError ? 'border-red-500 focus:border-red-500' : ''}`}
							disabled={!selectedAssetId}
						/>
						{amountError && (
							<Alert variant="destructive" className="mt-2">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Validation Error</AlertTitle>
								<AlertDescription>{amountError}</AlertDescription>
							</Alert>
						)}
						{selectedAsset && !amountError && (
							<p className="text-xs text-muted-foreground mt-1">
								Min: {selectedAsset.minWithdrawal} {selectedAsset.symbol} / Max: {selectedAsset.maxWithdrawal} {selectedAsset.symbol}
							</p>
						)}
					</div>

					<Button
						onClick={handleProceed}
						size="lg"
						variant="success"
						className="w-full flex items-center justify-center group"
						disabled={!selectedAssetId || !amount || parseFloat(amount) <= 0 || !!amountError || (withdrawalMethod === 'onchain' && !selectedNetworkId) || nProgress.isStarted()}
					>
						Proceed
						<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
