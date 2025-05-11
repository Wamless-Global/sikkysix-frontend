'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Info, MoreHorizontal, Edit3, Trash2, Lock, Unlock, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import InvestmentPerformanceChart from '@/components/charts/InvestmentPerformanceChart';
import TransactionHistoryTable from '@/components/transactions/TransactionHistoryTable';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// --- NEW TYPE DEFINITIONS FOR CRYPTO ASSETS ---
type AssetMetricDetails = {
	currentPriceUSD: number;
	priceChange24hPercent: number;
	priceChange7dPercent: number;
	priceChange30dPercent: number;
	volume24hUSD: number;
	liquidityUSD: number;
	marketCapUSD: number;
	totalSupply: number;
	circulatingSupply: number;
	holdersCount: number;
};

type AssetSimulatedParameters = {
	volatilityFactor: number;
	baseTransactionFee: number;
};

type AssetDefinition = {
	id: string;
	slug: string;
	name: string;
	symbol: string;
	description: string;
	logoUrl: string;
	status: 'Active' | 'Locked' | 'Delisted';
	statusReason?: string;
	metrics: AssetMetricDetails;
	simulatedParameters: AssetSimulatedParameters;
};

type AssetDetailsMock = {
	[key: string]: AssetDefinition;
};

// --- UPDATED MOCK DATA FOR SIMULATED CRYPTO ASSETS ---
const assetDetailsMock: AssetDetailsMock = {
	'eth-usd': {
		id: 'asset_eth_001',
		slug: 'eth-usd',
		name: 'Simulated Ethereum',
		symbol: 'sETH',
		description: 'A simulated version of Ethereum for testing and educational purposes within the platform. Price and volume are algorithmically generated.',
		logoUrl: '/crypto_logos/eth.png',
		status: 'Active',
		metrics: {
			currentPriceUSD: 2050.75,
			priceChange24hPercent: 2.5,
			priceChange7dPercent: -1.2,
			priceChange30dPercent: 15.8,
			volume24hUSD: 12500000,
			liquidityUSD: 50000000,
			marketCapUSD: 246000000000,
			totalSupply: 120000000,
			circulatingSupply: 120000000,
			holdersCount: 15203,
		},
		simulatedParameters: {
			volatilityFactor: 0.03,
			baseTransactionFee: 0.0005,
		},
	},
	'btc-usd': {
		id: 'asset_btc_002',
		slug: 'btc-usd',
		name: 'Simulated Bitcoin',
		symbol: 'sBTC',
		description: 'A simulated version of Bitcoin. Allows users to experience BTC trading dynamics in a sandboxed environment.',
		logoUrl: '/crypto_logos/btc.png',
		status: 'Active',
		metrics: {
			currentPriceUSD: 30100.2,
			priceChange24hPercent: -0.8,
			priceChange7dPercent: 3.1,
			priceChange30dPercent: 8.2,
			volume24hUSD: 25000000,
			liquidityUSD: 100000000,
			marketCapUSD: 580000000000,
			totalSupply: 21000000,
			circulatingSupply: 19500000,
			holdersCount: 8750,
		},
		simulatedParameters: {
			volatilityFactor: 0.02,
			baseTransactionFee: 0.0002,
		},
	},
	'sol-usd': {
		id: 'asset_sol_003',
		slug: 'sol-usd',
		name: 'Simulated Solana',
		symbol: 'sSOL',
		description: 'Experience the high-throughput nature of Solana in a simulated setting.',
		logoUrl: '/crypto_logos/sol.png',
		status: 'Locked',
		statusReason: 'Network upgrade simulation in progress',
		metrics: {
			currentPriceUSD: 22.5,
			priceChange24hPercent: 0.1,
			priceChange7dPercent: -5.5,
			priceChange30dPercent: 25.0,
			volume24hUSD: 8000000,
			liquidityUSD: 30000000,
			marketCapUSD: 9000000000,
			totalSupply: 500000000,
			circulatingSupply: 400000000,
			holdersCount: 6100,
		},
		simulatedParameters: {
			volatilityFactor: 0.05,
			baseTransactionFee: 0.00001,
		},
	},
};

const assetTransactionHistoryMock = [
	{ id: 'txn_asset_1', timestamp: '2025-10-19T10:35:00Z', maskedInvestorId: 'User...a4f8', type: 'Buy sETH', amount: 2.5, currency: 'sETH', usdValue: 5126.88, status: 'Completed' },
	{ id: 'txn_asset_2', timestamp: '2025-10-18T15:22:00Z', maskedInvestorId: 'User...b8e1', type: 'Sell sBTC', amount: 0.1, currency: 'sBTC', usdValue: 3010.02, status: 'Completed' },
	{ id: 'txn_asset_3', timestamp: '2025-10-18T09:05:00Z', maskedInvestorId: 'User...c3d7', type: 'Deposit USD', amount: 1000, currency: 'USD', usdValue: 1000, status: 'Completed' },
];

export default function AdminSingleCategoriesPage() {
	const params = useParams<{ slug: string }>();
	const router = useRouter();
	const slug = params?.slug || 'eth-usd';

	const [assetData, setAssetData] = useState<AssetDefinition | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessingAction, setIsProcessingAction] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmAction, setConfirmAction] = useState<'lock' | 'unlock' | 'delist' | null>(null);
	const [dialogDetails, setDialogDetails] = useState({ title: '', description: '', actionText: '' });

	useEffect(() => {
		setIsLoading(true);
		setTimeout(() => {
			const data = assetDetailsMock[slug];
			if (data) {
				setAssetData(data);
			} else {
				toast.error(`Asset "${slug}" not found.`);
				nProgress.start();
				router.push('/admin/categories');
			}
			setIsLoading(false);
		}, 300);
	}, [slug, router]);

	const handleEdit = () => {
		if (!assetData) return;
		nProgress.start();
		router.push(`/admin/categories/${slug}/edit`);
	};

	const prepareConfirmAction = (action: 'lock' | 'unlock' | 'delist') => {
		if (!assetData) return;
		let title = '',
			description = '',
			actionText = '';
		switch (action) {
			case 'lock':
				title = 'Confirm Asset Lock';
				description = `Are you sure you want to lock trading for "${assetData.name} (${assetData.symbol})"? Users will not be able to buy or sell this asset.`;
				actionText = 'Lock Asset';
				break;
			case 'unlock':
				title = 'Confirm Asset Unlock';
				description = `Are you sure you want to unlock trading for "${assetData.name} (${assetData.symbol})"? Users will be able to resume buying and selling.`;
				actionText = 'Unlock Asset';
				break;
			case 'delist':
				title = 'Confirm Asset Delisting';
				description = `Are you sure you want to DELIST "${assetData.name} (${assetData.symbol})"? This action is significant and may have irreversible consequences for simulated user holdings.`;
				actionText = 'Delist Asset';
				break;
		}
		setDialogDetails({ title, description, actionText });
		setConfirmAction(action);
		setShowConfirmDialog(true);
	};

	const executeConfirmedAction = async () => {
		if (!assetData || !confirmAction) return;
		setIsProcessingAction(true);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		let newStatus: AssetDefinition['status'] = assetData.status;
		let toastMessage = '';

		if (confirmAction === 'lock') {
			newStatus = 'Locked';
			toastMessage = `Asset "${assetData.name}" has been locked.`;
		} else if (confirmAction === 'unlock') {
			newStatus = 'Active';
			toastMessage = `Asset "${assetData.name}" has been unlocked.`;
		} else if (confirmAction === 'delist') {
			newStatus = 'Delisted';
			toastMessage = `Asset "${assetData.name}" has been delisted.`;
		}

		const updatedAsset = { ...assetData, status: newStatus, statusReason: newStatus !== 'Active' ? `Manually ${newStatus.toLowerCase()} by admin` : '' };
		assetDetailsMock[slug] = updatedAsset;
		setAssetData(updatedAsset);
		toast.success(toastMessage);

		if (confirmAction === 'delist') {
			// router.push('/admin/assets');
		}

		setIsProcessingAction(false);
		setShowConfirmDialog(false);
		setConfirmAction(null);
	};

	const formatUSD = (amount: number, precision = 2) => {
		// Correctly named function
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: precision, maximumFractionDigits: precision }).format(amount);
	};
	const formatNumber = (amount: number, options?: Intl.NumberFormatOptions) => {
		return new Intl.NumberFormat('en-US', options).format(amount);
	};
	const PriceChangeIndicator = ({ value }: { value: number }) => {
		const isPositive = value >= 0;
		return (
			<span className={`flex items-center text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
				{isPositive ? <ArrowUpCircle className="mr-1 h-4 w-4" /> : <ArrowDownCircle className="mr-1 h-4 w-4" />}
				{value.toFixed(2)}%
			</span>
		);
	};
	const getStatusBadgeVariant = (status: AssetDefinition['status']): 'default' | 'secondary' | 'destructive' => {
		switch (status) {
			case 'Active':
				return 'default';
			case 'Locked':
				return 'secondary';
			case 'Delisted':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	if (isLoading || !assetData) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-200px)]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="ml-4 text-lg text-muted-foreground">Loading asset details...</p>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className="space-y-6">
				<Breadcrumbs />
				<Card className="overflow-hidden">
					<CardHeader className="flex flex-row items-start gap-4 bg-muted/30 dark:bg-background/20 p-4 md:p-6">
						<div className="flex-shrink-0">
							<Image src={assetData.logoUrl} alt={`${assetData.name} logo`} width={64} height={64} className="rounded-md aspect-square object-contain border bg-background" />
						</div>
						<div className="flex-1">
							<div className="flex flex-col sm:flex-row justify-between sm:items-start">
								<div>
									<CardTitle className="text-2xl md:text-3xl font-bold">
										{assetData.name} ({assetData.symbol})
									</CardTitle>
									<CardDescription className="text-sm text-muted-foreground mt-1">{assetData.description}</CardDescription>
								</div>
								<Badge
									variant={getStatusBadgeVariant(assetData.status)}
									className={`text-xs md:text-sm px-2.5 py-1 mt-2 sm:mt-0 whitespace-nowrap self-start sm:self-auto ${
										assetData.status === 'Active'
											? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
											: assetData.status === 'Locked'
											? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-700'
											: assetData.status === 'Delisted'
											? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-400 dark:border-red-700'
											: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700'
									}`}
								>
									Status: {assetData.status}
									{(assetData.status === 'Locked' || assetData.status === 'Delisted') && assetData.statusReason && (
										<Tooltip>
											<TooltipTrigger asChild>
												<Info className="h-3 w-3 ml-1.5 cursor-help opacity-70" />
											</TooltipTrigger>
											<TooltipContent>
												<p>{assetData.statusReason}</p>
											</TooltipContent>
										</Tooltip>
									)}
								</Badge>
							</div>
						</div>
						<div className="flex-shrink-0">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" /> <span className="sr-only">Asset Actions</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
									<DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
										<Edit3 className="mr-2 h-4 w-4" /> Edit Details
									</DropdownMenuItem>
									{assetData.status === 'Active' && (
										<DropdownMenuItem onClick={() => prepareConfirmAction('lock')} className="cursor-pointer">
											<Lock className="mr-2 h-4 w-4" /> Lock Asset
										</DropdownMenuItem>
									)}
									{assetData.status === 'Locked' && (
										<DropdownMenuItem onClick={() => prepareConfirmAction('unlock')} className="cursor-pointer">
											<Unlock className="mr-2 h-4 w-4" /> Unlock Asset
										</DropdownMenuItem>
									)}
									{assetData.status !== 'Delisted' && <DropdownMenuSeparator />}
									{assetData.status !== 'Delisted' && (
										<DropdownMenuItem onClick={() => prepareConfirmAction('delist')} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
											<Trash2 className="mr-2 h-4 w-4" /> Delist Asset
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Key Asset Metrics (Simulated)</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
						{[
							{ label: 'Current Price', value: formatUSD(assetData.metrics.currentPriceUSD), size: 'large' },
							{ label: '24h Change', value: <PriceChangeIndicator value={assetData.metrics.priceChange24hPercent} /> },
							{ label: '7d Change', value: <PriceChangeIndicator value={assetData.metrics.priceChange7dPercent} /> },
							{ label: '30d Change', value: <PriceChangeIndicator value={assetData.metrics.priceChange30dPercent} /> },
							{ label: '24h Volume', value: formatUSD(assetData.metrics.volume24hUSD, 0) },
							{ label: 'Liquidity (TVL)', value: formatUSD(assetData.metrics.liquidityUSD, 0), tooltip: 'Total Value Locked in simulated liquidity pools.' },
							{ label: 'Market Cap', value: formatUSD(assetData.metrics.marketCapUSD, 0) },
							{ label: 'Circulating Supply', value: formatNumber(assetData.metrics.circulatingSupply) + ' ' + assetData.symbol },
							{ label: 'Total Supply', value: formatNumber(assetData.metrics.totalSupply) + ' ' + assetData.symbol },
							{ label: 'Holders', value: formatNumber(assetData.metrics.holdersCount) },
						].map((metric) => (
							<div key={metric.label} className={`p-4 bg-muted/20 dark:bg-background/40 rounded-lg border ${metric.size === 'large' ? 'md:col-span-1 lg:row-span-2 flex flex-col justify-center' : ''}`}>
								<div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
									<span>{metric.label}</span>
									{metric.tooltip && (
										<Tooltip>
											<TooltipTrigger asChild>
												<Info className="h-3.5 w-3.5 cursor-help opacity-60" />
											</TooltipTrigger>
											<TooltipContent>
												<p>{metric.tooltip}</p>
											</TooltipContent>
										</Tooltip>
									)}
								</div>
								<p className={`font-semibold ${metric.size === 'large' ? 'text-3xl' : 'text-xl'}`}>{metric.value}</p>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Historical Performance (Simulated)</CardTitle>
					</CardHeader>
					<CardContent>
						<InvestmentPerformanceChart />
					</CardContent>
				</Card>

				<div className="mt-8">
					<h2 className="text-2xl font-semibold mb-4">Simulated Transaction Ledger for {assetData.symbol}</h2>
					<TransactionHistoryTable transactions={assetTransactionHistoryMock.map((tx) => ({ ...tx, type: tx.type.includes(assetData.symbol) ? tx.type : `${tx.type} (General)` }))} showMyTransactionsToggle={false} />
				</div>
			</div>

			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{dialogDetails.title}</AlertDialogTitle>
						<AlertDialogDescription>{dialogDetails.description}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmAction(null)} disabled={isProcessingAction}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={executeConfirmedAction} disabled={isProcessingAction} className={confirmAction === 'delist' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
							{isProcessingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							{isProcessingAction ? 'Processing...' : dialogDetails.actionText}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</TooltipProvider>
	);
}
