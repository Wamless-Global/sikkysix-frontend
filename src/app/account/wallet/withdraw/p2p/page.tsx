'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import nProgress from 'nprogress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { toast } from 'sonner';

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
	buyRateNGN: number;
	minAmountAsset: number;
	maxAmountAsset: number;
	paymentMethods: string[];
	completionRate: number;
	trades: number;
	rating: number;
}

const mockMerchants: Merchant[] = [
	{ id: 'm1', name: 'FastTrader', buyRateNGN: 1650.5, minAmountAsset: 10, maxAmountAsset: 5000, paymentMethods: ['Bank Transfer'], completionRate: 98, trades: 150, rating: 4.8 },
	{ id: 'm2', name: 'NairaKing', buyRateNGN: 1651.0, minAmountAsset: 50, maxAmountAsset: 10000, paymentMethods: ['Bank Transfer', 'Chipper Cash'], completionRate: 95, trades: 210, rating: 4.5 },
	{ id: 'm3', name: 'CryptoQueen', buyRateNGN: 1649.8, minAmountAsset: 5, maxAmountAsset: 2000, paymentMethods: ['Bank Transfer'], completionRate: 99, trades: 85, rating: 4.9 },
	{ id: 'm4', name: 'EasyExchange', buyRateNGN: 1650.0, minAmountAsset: 20, maxAmountAsset: 8000, paymentMethods: ['Bank Transfer', 'Mobile Top-up'], completionRate: 92, trades: 300, rating: 4.2 },
];

const StarRating: React.FC<{ rating: number; maxStars?: number }> = ({ rating, maxStars = 5 }) => {
	const fullStars = Math.floor(rating);
	const emptyStars = maxStars - fullStars;
	return (
		<div className="flex items-center">
			{[...Array(fullStars)].map((_, i) => (
				<Star key={`full-${i}`} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
			))}
			{[...Array(emptyStars)].map((_, i) => (
				<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300 dark:text-gray-600" />
			))}
		</div>
	);
};

function P2PWithdrawalContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const assetId = searchParams.get('assetId');
	const amountStr = searchParams.get('amount');
	const amount = parseFloat(amountStr || '0');

	const selectedAsset = mockAssets.find((a) => a.id === assetId);

	type SortByType = 'rate_desc' | 'completion_desc' | 'trades_desc' | 'rating_desc' | 'default';
	const [sortBy, setSortBy] = useState<SortByType>('default');

	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [showSortOptions, setShowSortOptions] = useState(false);
	const [tempMinRating, setTempMinRating] = useState('');
	const [tempMinTrades, setTempMinTrades] = useState('');
	const [appliedMinRating, setAppliedMinRating] = useState<number | null>(null);
	const [appliedMinTrades, setAppliedMinTrades] = useState<number | null>(null);

	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		if (!assetId || !amountStr || isNaN(amount) || !selectedAsset) {
			toast.error('P2P withdrawal details missing or invalid. Redirecting...');
			router.replace('/account/wallet/withdraw');
		}
	}, [assetId, amountStr, amount, selectedAsset, router]);

	const handleApplyFilters = () => {
		setAppliedMinRating(tempMinRating ? parseFloat(tempMinRating) : null);
		setAppliedMinTrades(tempMinTrades ? parseInt(tempMinTrades, 10) : null);
		setIsFilterOpen(false);
	};

	const handleClearFilters = () => {
		setTempMinRating('');
		setTempMinTrades('');
		setAppliedMinRating(null);
		setAppliedMinTrades(null);
		setIsFilterOpen(false);
	};

	const displayMerchants = useMemo(() => {
		let merchants = mockMerchants.filter((m) => m.minAmountAsset <= amount && m.maxAmountAsset >= amount);

		if (appliedMinRating !== null) {
			merchants = merchants.filter((m) => m.rating >= appliedMinRating!);
		}
		if (appliedMinTrades !== null) {
			merchants = merchants.filter((m) => m.trades >= appliedMinTrades!);
		}

		switch (sortBy) {
			case 'rate_desc':
				merchants.sort((a, b) => b.buyRateNGN - a.buyRateNGN);
				break;
			case 'completion_desc':
				merchants.sort((a, b) => b.completionRate - a.completionRate);
				break;
			case 'trades_desc':
				merchants.sort((a, b) => b.trades - a.trades);
				break;
			case 'rating_desc':
				merchants.sort((a, b) => b.rating - a.rating);
				break;
			case 'default':
			default:
				merchants.sort((a, b) => b.buyRateNGN - a.buyRateNGN);
				break;
		}
		return merchants;
	}, [amount, sortBy, appliedMinRating, appliedMinTrades]);

	const handleSelectMerchant = (merchant: Merchant) => {
		setSelectedMerchant(merchant);
		setIsConfirmModalOpen(true);
	};

	const proceedToTrade = () => {
		if (!selectedMerchant || !selectedAsset) return;

		setIsRedirecting(true);
		nProgress.start();

		setTimeout(() => {
			router.push(`/account/wallet/withdraw/p2p/trade?merchantId=${selectedMerchant.id}&assetId=${selectedAsset.id}&amount=${amount}`);
			setIsConfirmModalOpen(false);
			setIsRedirecting(false);
			setSelectedMerchant(null);
		}, 1500);
	};

	if (!selectedAsset || isNaN(amount)) {
		return (
			<div className="max-w-2xl space-y-8 flex flex-col items-center justify-center py-10">
				<p>Loading P2P details...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row gap-4 justify-between items-center">
				<h1 className="sub-page-heading">
					P2P Withdrawal - Sell {amount} {selectedAsset.symbol}
				</h1>
				<div className="flex gap-2 items-center">
					<Button variant="ghost" size="sm" onClick={() => setShowSortOptions(!showSortOptions)} className={`text-muted-foreground hover:text-foreground ${showSortOptions ? 'text-foreground font-bold' : ''}`}>
						Sort By
					</Button>
					<DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
								<Filter className="mr-1 h-4 w-4" />
								Filter
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-64 p-2" align="end">
							<DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">Filter Merchants</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<div className="px-1 py-1 space-y-2">
								<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent p-1">
									<div className="flex flex-col w-full space-y-1">
										<Label htmlFor="minRating" className="text-xs px-1">
											Min Rating (0-5)
										</Label>
										<Input id="minRating" type="number" min="0" max="5" step="0.1" value={tempMinRating} onChange={(e) => setTempMinRating(e.target.value)} className="h-8 text-sm" placeholder="e.g. 4.0" />
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent p-1">
									<div className="flex flex-col w-full space-y-1">
										<Label htmlFor="minTrades" className="text-xs px-1">
											Min Trades
										</Label>
										<Input id="minTrades" type="number" min="0" step="1" value={tempMinTrades} onChange={(e) => setTempMinTrades(e.target.value)} className="h-8 text-sm" placeholder="e.g. 50" />
									</div>
								</DropdownMenuItem>
							</div>
							<DropdownMenuSeparator />
							<div className="flex justify-end gap-2 px-2 py-1.5">
								<Button variant="outline" size="sm" onClick={handleClearFilters} className="text-xs">
									Clear
								</Button>
								<Button size="sm" onClick={handleApplyFilters} className="text-xs">
									Apply
								</Button>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSortOptions ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
				<div className="pb-0">
					<div className="flex flex-wrap gap-2">
						<Button size="lg" variant={sortBy === 'rate_desc' ? 'default' : 'outline'} onClick={() => setSortBy('rate_desc')}>
							Rate (high to low)
						</Button>
						<Button size="lg" variant={sortBy === 'completion_desc' ? 'default' : 'outline'} onClick={() => setSortBy('completion_desc')}>
							Completion Rate
						</Button>
						<Button size="lg" variant={sortBy === 'trades_desc' ? 'default' : 'outline'} onClick={() => setSortBy('trades_desc')}>
							Completed Trades
						</Button>
						<Button size="lg" variant={sortBy === 'rating_desc' ? 'default' : 'outline'} onClick={() => setSortBy('rating_desc')}>
							Rating
						</Button>
					</div>
				</div>
			</div>

			{displayMerchants.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{displayMerchants.map((merchant) => (
						<Card key={merchant.id} className="!bg-background shadow-sm flex flex-col">
							<CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-grow">
								<div className="flex-grow">
									<h3 className="text-lg font-semibold text-foreground mb-0.5">{merchant.name}</h3>
									<div className="flex items-center gap-1 mb-1">
										<StarRating rating={merchant.rating} />
									</div>
									<p className="text-sm text-muted-foreground">
										Rate: <span className="font-semibold text-base text-foreground">{merchant.buyRateNGN.toFixed(2)} NGN</span> / {selectedAsset.symbol}
									</p>
									<p className="text-xs text-muted-foreground">
										Limits: {merchant.minAmountAsset} - {merchant.maxAmountAsset} {selectedAsset.symbol}
									</p>
									<p className="text-xs text-muted-foreground">Payments: {merchant.paymentMethods.join(', ')}</p>
								</div>
								<div className="flex flex-col items-start sm:items-end w-full sm:w-auto pt-2 sm:pt-0 mt-auto">
									<p className="text-xs text-muted-foreground mb-0.5">{merchant.trades} Trades</p>
									<p className="text-xs text-muted-foreground mb-2">{merchant.completionRate}% Completion</p>
									<Button variant="success" size="sm" className="w-full sm:w-auto px-6" onClick={() => handleSelectMerchant(merchant)}>
										Sell {selectedAsset.symbol}
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card className="bg-background border-0 shadow-none mt-10 text-center">
					<CardContent className="px-0">
						<p className="text-muted-foreground">
							No P2P merchants currently match your criteria (Amount: {amount} {selectedAsset.symbol}). Please try adjusting filters or check back later.
						</p>
					</CardContent>
				</Card>
			)}

			{selectedMerchant && (
				<ConfirmationModal
					isOpen={isConfirmModalOpen}
					onClose={() => {
						if (!isRedirecting) {
							setIsConfirmModalOpen(false);
							setSelectedMerchant(null);
						}
					}}
					onConfirm={proceedToTrade}
					title="Confirm Merchant Selection"
					description={`Start P2P withdrawal with ${selectedMerchant.name}? Rate: ${selectedMerchant.buyRateNGN.toFixed(2)} NGN / ${selectedAsset.symbol}.`}
					confirmButtonText="Proceed"
					cancelButtonText="Cancel"
					isLoading={isRedirecting}
				/>
			)}
		</div>
	);
}

export default function P2PWithdrawalPage() {
	return (
		<Suspense fallback={<div className="flex justify-center items-center h-screen">Loading P2P options...</div>}>
			<P2PWithdrawalContent />
		</Suspense>
	);
}
