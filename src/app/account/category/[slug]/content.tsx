'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, TrendingUp, Loader2 } from 'lucide-react';
import InsufficientBalanceModal from '@/components/modals/InsufficientBalanceModal';
import { fetchCurrentUserBalance } from '@/lib/userUtils';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNaira, formatNumber } from '@/lib/helpers';
import { Category, UserSingleCategoryResponse } from '@/types';

// Mock activity data (keep for now until real data is fetched)
const activityData = [
	{ id: 1, type: 'buy', hash: 'dnwhw82o20wmo29', amount: '20,000.00 NGN', time: '15m ago', icon: ArrowUp, color: 'text-red-500', bg: 'bg-red-500/10', isCredit: true },
	{ id: 2, type: 'sell', hash: 'ks9Qksjws9jkhHw2n', amount: '10,000.00 NGN', time: '10h ago', icon: ArrowDown, color: 'text-green-500', bg: 'bg-green-500/10', isCredit: false },
	{ id: 3, type: 'sell', hash: 'QxhsuHiu92j2njniNn', amount: '10,000.00 NGN', time: '20s ago', icon: ArrowDown, color: 'text-green-500', bg: 'bg-green-500/10', isCredit: true },
];

export default function SingleCategoryContent() {
	const paramsFromHook = useParams<{ slug: string }>();
	const slug = paramsFromHook.slug;
	const router = useRouter();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentUserBalance, setCurrentUserBalance] = useState<number | undefined>(undefined);
	const [categoryData, setCategoryData] = useState<Category | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isLoadingPurchase, setIsLoadingPurchase] = useState(false);
	const [amountInput, setAmountInput] = useState('');
	const [amountError, setAmountError] = useState<string | null>(null);

	const fetchUserCategory = useCallback(async (identifier: string) => {
		nProgress.start();
		setIsLoading(true);
		setError(null);
		setCategoryData(null);

		try {
			const response = await fetch(`/api/users/categories/${identifier}`);
			if (!response.ok) {
				let errorMessage = `API Error: ${response.status} ${response.statusText}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (_e) {}
				throw new Error(errorMessage);
			}

			const result: UserSingleCategoryResponse = await response.json();

			if (result.status === 'success' && result.data && typeof result.data !== 'string') {
				const fetchedCategory = result.data;

				fetchedCategory.is_launched = fetchedCategory.is_launched === undefined ? true : fetchedCategory.is_launched;
				setCategoryData(fetchedCategory);
			} else {
				const errorMessage = typeof result.data === 'string' ? result.data : result.message || 'Failed to fetch category data or data is invalid';
				throw new Error(errorMessage);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Could not load category details.';
			console.error('Failed to fetch user category:', err);
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
			nProgress.done();
		}
	}, []);

	useEffect(() => {
		if (slug) {
			fetchUserCategory(slug);
		} else {
			setError('Category identifier missing from URL.');
			setIsLoading(false);
		}
	}, [slug, fetchUserCategory]);

	const validateAmount = (amount: number, balance: number | undefined): string | null => {
		if (isNaN(amount) || amount <= 0) {
			return 'Please enter a valid positive amount.';
		}
		if (!categoryData) {
			return 'Category data not loaded.';
		}
		if (categoryData.minimum_investable !== null && amount < categoryData.minimum_investable) {
			return `Amount must be at least ${formatNaira(categoryData.minimum_investable)}.`;
		}
		if (categoryData.maximum_investable !== null && amount > categoryData.maximum_investable) {
			return `Amount cannot exceed ${formatNaira(categoryData.maximum_investable)}.`;
		}
		if (balance === undefined) {
			return 'Could not verify your balance. Please try again.';
		}
		if (amount > balance) {
			return 'Insufficient balance.';
		}
		return null;
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Allow only numbers and one decimal point
		if (/^\d*\.?\d*$/.test(value)) {
			setAmountInput(value);
			// Clear error on change, re-validate on submit
			if (amountError) {
				setAmountError(null);
			}
		}
	};

	const handleBuyNow = async () => {
		setAmountError(null);
		setIsLoadingPurchase(true);

		const amount = parseFloat(amountInput);

		const balance = await fetchCurrentUserBalance();
		setCurrentUserBalance(balance ?? undefined);

		const validationError = validateAmount(amount, balance ?? undefined);

		if (validationError) {
			setAmountError(validationError);
			if (validationError === 'Insufficient balance.') {
				setIsModalOpen(true);
			} else {
				toast.error(validationError);
			}
			setIsLoadingPurchase(false);
			return;
		}

		nProgress.start();
		try {
			const bodyData = {
				amount_ngn: amount,
				category_id: categoryData?.id,
			};

			console.log(JSON.stringify(bodyData));

			const response = await fetch('/api/users/investments/new', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(bodyData),
				credentials: 'include',
			});

			if (response.ok) {
				// nProgress.start();
				const { data } = await response.json();
				console.log(data);

				// toast.success(`Category "${data.name}" created successfully!`);
				router.push('/account/portfolio');
			} else {
				let errorMessage = `Failed to create category. Status: ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (_e) {}
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error('Error creating category:', error);
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			nProgress.done();

			setIsLoadingPurchase(false);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6 animate-pulse">
				<Skeleton className="h-48 md:h-64 rounded-lg w-full" />

				<Skeleton className="h-64 md:h-80 rounded-lg w-full" />

				<div className="flex justify-center space-x-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-8 w-10 rounded" />
					))}
				</div>
				<Skeleton className="h-24 rounded-2xl w-full" />

				<div className="flex space-x-4 pb-2 mb-4 border-b">
					<Skeleton className="h-6 w-20" />
					<Skeleton className="h-6 w-24" />
				</div>

				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-16 w-full rounded-lg" />
					))}
				</div>
			</div>
		);
	}

	// --- Error State ---
	if (error || !categoryData) {
		return <ErrorMessage message={error || 'Failed to load category data.'} onRetry={() => slug && fetchUserCategory(slug)} />;
	}

	return (
		<div className="space-y-6">
			<div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
				<Image src={categoryData.image || '/Variety-fruits-vegetables.png'} alt={categoryData.name} layout="fill" objectFit="cover" className="brightness-75" unoptimized />
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
				<div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
					<h1 className="text-2xl md:text-3xl font-bold mb-1">{categoryData.ticker}</h1>
					<div className="flex items-center space-x-2 text-sm">
						<span>{formatNaira(categoryData.current_price_per_unit)}</span>
						{categoryData.price_change_24h !== null && categoryData.price_change_24h !== undefined && (
							<span className={`flex items-center ${categoryData.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
								<TrendingUp className="h-4 w-4 mr-1" /> {categoryData.price_change_24h.toFixed(2)}%
							</span>
						)}
					</div>
				</div>
			</div>

			<div>
				<div className="bg-muted/20 dark:bg-muted/10 h-64 md:h-80 rounded-lg flex items-center justify-center text-muted-foreground mb-4">Chart Placeholder</div>
				<div className="flex justify-center space-x-2">
					{['1H', '1D', '1W', '1M', '1Y'].map((range) => (
						<Button key={range} variant="ghost" size="sm" className={`px-3 h-8 text-sm ${range === '1H' ? 'bg-muted/50 dark:bg-muted/20 text-foreground' : 'text-muted-foreground'}`}>
							{range}
						</Button>
					))}
				</div>
			</div>

			{/* --- Key Metrics --- */}
			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg text-foreground">Key Metrics</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
					{[
						{ label: 'Total Value', value: formatNaira(categoryData.market_cap ?? categoryData.total_liquidity) },
						{ label: 'Holders', value: formatNumber(categoryData.holders) },
						{ label: 'Circulating Supply', value: formatNumber(categoryData.circulating_supply ?? categoryData.quantity) },
						{ label: '24h Volume', value: formatNaira(categoryData.volume_24h) },
						{ label: 'Min Investable', value: formatNaira(categoryData.minimum_investable) },
						{ label: 'Max Investable', value: formatNaira(categoryData.maximum_investable) },
					]
						.filter((metric) => metric.value !== 'N/A' && metric.value !== undefined && metric.value !== null)
						.map((metric) => (
							<div key={metric.label}>
								<p className="text-sm text-muted-foreground">{metric.label}</p>
								<p className="text-lg sm:text-xl font-semibold text-foreground">{metric.value}</p>
							</div>
						))}
				</CardContent>
			</Card>

			{/* --- Buy Action Card --- */}
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] p-4 py-6">
				<CardContent className="px-2 flex flex-col sm:flex-row justify-between items-start gap-4">
					<div className="flex-grow w-full sm:w-auto space-y-2">
						<Label htmlFor="amount" className="text-sm text-muted-foreground">
							Amount to Invest (NGN)
						</Label>

						<div className="flex gap-4">
							<Input
								id="amount"
								type="text"
								inputMode="decimal"
								placeholder="Enter amount"
								value={amountInput}
								onChange={handleAmountChange}
								className={`bg-background/80 dark:bg-black/30 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-12 account-input text-lg ${amountError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
								disabled={categoryData.is_locked || !categoryData.is_launched}
							/>

							<Button onClick={handleBuyNow} size={'lg'} variant={'fixed-cta'} disabled={isLoadingPurchase || categoryData.is_locked || !categoryData.is_launched || !amountInput} className="w-full mt-4 sm:w-auto sm:mt-0 sm:self-end h-12 !self-center">
								{isLoadingPurchase ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									'Buy Now'
								)}
							</Button>
						</div>

						{amountError && <p className="text-sm text-red-400 mt-1 px-1">{amountError}</p>}
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="activity" className="w-full">
				<TabsList className="bg-transparent p-0 h-auto gap-4 pb-2 mb-4">
					<TabsTrigger value="activity" className="data-[state=active]:text-[var(--dashboard-accent)] data-[state=inactive]:text-muted-foreground rounded-none justify-start pb-2 text-base font-semibold !bg-transparent !border-0">
						Activity
					</TabsTrigger>
					<TabsTrigger value="positions" className="data-[state=active]:text-[var(--dashboard-accent)] data-[state=inactive]:text-muted-foreground rounded-none justify-start pb-2 text-base font-semibold !bg-transparent !border-0">
						Open Positions
					</TabsTrigger>
				</TabsList>

				<TabsContent value="activity" className="mt-0 space-y-4">
					{activityData.length > 0 ? (
						activityData.map((item) => (
							<div key={item.id} className="flex items-center justify-between pl-0 p-3 rounded-lg hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors">
								<div className="flex items-center gap-3">
									{item.isCredit ? (
										<div className="bg-[var(--success)] rounded-full p-3">
											<ArrowDown className="h-6 w-6 text-[var(--success-foreground)]" />
										</div>
									) : (
										<div className="bg-[var(--danger)] rounded-full p-3">
											<ArrowUp className="h-5 w-5 text-[var(--danger-foreground)]" />
										</div>
									)}
									<div>
										<p className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">{item.hash}</p>
										<p className="text-sm text-muted-foreground">{item.time}</p>
									</div>
								</div>
								<span className={`font-semibold ${item.isCredit ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{item.amount}</span>
							</div>
						))
					) : (
						<div className="text-center py-10 text-muted-foreground">No activity yet.</div>
					)}
				</TabsContent>

				<TabsContent value="positions" className="mt-0">
					<div className="text-center py-10 text-muted-foreground">No open positions.</div>
				</TabsContent>
			</Tabs>

			{/* Use validated amount for modal */}
			<InsufficientBalanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentBalance={currentUserBalance} requiredAmount={parseFloat(amountInput) || 0} />
		</div>
	);
}
