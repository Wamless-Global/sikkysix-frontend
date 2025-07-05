'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, TrendingUp, Loader2, TrendingDown } from 'lucide-react';
import InsufficientBalanceModal from '@/components/modals/InsufficientBalanceModal';
import { fetchCurrentUserBalance } from '@/lib/userUtils';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { convertCurrency, formatBaseurrency, formatNumber, formatRelativeTime, getBaseCurrency, handleFetchErrorMessage, truncateString } from '@/lib/helpers';
import { AuthenticatedUser, Category, Investment, InvestmentsResponse, Transaction, TransactionResponse, UserSingleCategoryResponse } from '@/types';
import { CustomLink } from '@/components/ui/CustomLink';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';

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
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
	const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);
	const [isLoadingInvestments, setIsLoadingInvestments] = useState(false);
	const [investmentsPage, setInvestmentsPage] = useState(1);
	const [investmentsTotalPages, setInvestmentsTotalPages] = useState(1);
	const { setCurrentUser, currentUser } = useAuthContext();
	const [isRequestingLaunch, setIsRequestingLaunch] = useState(false);

	const fetchUserCategory = useCallback(async (identifier: string) => {
		nProgress.start();
		setIsLoading(true);
		setError(null);
		setCategoryData(null);

		try {
			const response = await fetchWithAuth(`/api/categories/${identifier}`);
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
				const errorMessage = handleFetchErrorMessage(result, 'Failed to fetch category data or data is invalid.');
				throw new Error(errorMessage);
			}
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err);
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
			nProgress.done();
		}
	}, []);

	const fetchTransactions = useCallback(async (categoryId: string, page: number = 1) => {
		setIsLoadingTransactions(true);
		try {
			const response = await fetchWithAuth(`/api/categories/${categoryId}/transactions?page=${page}`);
			if (!response.ok) {
				throw new Error('Failed to fetch transactions');
			}
			const data: TransactionResponse = await response.json();
			setTransactions(data.data.transactions);
			setCurrentPage(data.data.currentPage);
			setTotalPages(data.data.totalPages);
		} catch (err) {
			handleFetchErrorMessage(err);
			toast.error('Failed to load transaction history');
		} finally {
			setIsLoadingTransactions(false);
		}
	}, []);

	const fetchActiveInvestments = useCallback(async (categoryId: string, page: number = 1) => {
		if (!categoryId) return;

		setIsLoadingInvestments(true);
		try {
			const response = await fetchWithAuth(`/api/investments/?status=active&page=${page}&categoryId=${categoryId}`);
			if (!response.ok) {
				throw new Error(handleFetchErrorMessage(await response.json()));
			}
			const data: InvestmentsResponse = await response.json();

			logger.log('Active Investments Data:', data);

			setActiveInvestments(data.data.investments);
			setInvestmentsPage(data.data.currentPage);
			setInvestmentsTotalPages(data.data.totalPages);
		} catch (err: unknown) {
			handleFetchErrorMessage(err);
			// console.error('Error fetching active investments:', err);
			toast.error('Failed to load active investments');
		} finally {
			setIsLoadingInvestments(false);
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

	useEffect(() => {
		if (categoryData?.id) {
			fetchTransactions(categoryData.id);
			fetchActiveInvestments(categoryData.id);
		}
	}, [categoryData?.id, fetchTransactions, fetchActiveInvestments]);

	const validateAmount = (amount: number, balance: number | undefined): string | null => {
		if (isNaN(amount) || amount <= 0) {
			return 'Please enter a valid positive amount.';
		}
		if (!categoryData) {
			return 'Category data not loaded.';
		}
		if (categoryData.minimum_investable !== null && amount < categoryData.minimum_investable) {
			return `Amount must be at least ${formatBaseurrency(categoryData.minimum_investable)}.`;
		}
		if (categoryData.maximum_investable !== null && amount > categoryData.maximum_investable) {
			return `Amount cannot exceed ${formatBaseurrency(categoryData.maximum_investable)}.`;
		}
		if (balance === undefined) {
			return 'Could not verify your balance. Please try again.';
		}
		if (amount > balance) {
			logger.log(balance, amount);

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

		try {
			const bodyData = {
				amount_ngn: amount,
				category_id: categoryData?.id,
			};

			const response = await fetchWithAuth('/api/investments/new', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(bodyData),
			});

			if (response.ok) {
				nProgress.start();

				const balance = await response.json();
				logger.log(balance);

				setCurrentUser({ ...(currentUser as AuthenticatedUser), wallet_balance: (currentUser?.wallet_balance ?? 0) - amount });

				toast.success(`New shares bought successfully!`);
				router.push('/account/my-savings');
			} else {
				let errorMessage = `Failed to create category. Status: ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (_e) {}
				toast.error(errorMessage);
			}
		} catch (error: unknown) {
			// console.error('Error creating category:', error);
			handleFetchErrorMessage(error);
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			nProgress.done();
			setIsLoadingPurchase(false);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (categoryData?.id && newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
			fetchTransactions(categoryData.id, newPage);
		}
	};

	const handleInvestmentsPageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= investmentsTotalPages) {
			setInvestmentsPage(newPage);
			fetchActiveInvestments(categoryData?.id || '', newPage);
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

	if (error || !categoryData) {
		return <ErrorMessage message={error || 'Failed to load category data.'} onRetry={() => slug && fetchUserCategory(slug)} />;
	}

	return (
		<div className="space-y-6">
			<div className="relative h-64 md:h-72 rounded-lg overflow-hidden">
				<Image src={categoryData.image || '/images/Variety-fruits-vegetables.png'} alt={categoryData.name} layout="fill" objectFit="cover" className="brightness-75" unoptimized />
				<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent"></div>
				<div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
					<h1 className="text-2xl md:text-3xl font-bold mb-1">
						{categoryData.name} ({categoryData.ticker})
					</h1>
					<div className="flex items-center space-x-2 text-sm mb-2">
						<span>{formatBaseurrency(categoryData.current_price_per_unit)}</span>
						{categoryData.price_change_24h !== null && categoryData.price_change_24h !== undefined && (
							<span className={`flex items-center ${categoryData.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
								{categoryData.price_change_24h >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
								{categoryData.price_change_24h.toFixed(5)}%
							</span>
						)}
					</div>
					{categoryData.description && <p className="text-sm md:text-base text-white/90 max-w-2xl mb-2 line-clamp-3 md:line-clamp-4 drop-shadow-md">{categoryData.description}</p>}
				</div>
			</div>

			{/* <div>
				<div className="bg-muted/20 dark:bg-muted/10 h-64 md:h-80 rounded-lg flex items-center justify-center text-muted-foreground mb-4">Chart Placeholder</div>
				<div className="flex justify-center space-x-2">
					{['1H', '1D', '1W', '1M', '1Y'].map((range) => (
						<Button key={range} variant="ghost" size="sm" className={`px-3 h-8 text-sm ${range === '1H' ? 'bg-muted/50 dark:bg-muted/20 text-foreground' : 'text-muted-foreground'}`}>
							{range}
						</Button>
					))}
				</div>
			</div> */}

			{/* --- Key Metrics --- */}
			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm border border-border/60">
				<CardHeader className="px-0">
					<CardTitle className="text-lg text-foreground"> CLUB INFORMATION </CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-0">
					{[
						{ label: 'Market Cap', value: formatBaseurrency(categoryData.market_cap ?? categoryData.total_liquidity) },
						{ label: 'Club Members', value: formatNumber(categoryData.holders) },
						{ label: 'Circulating Supply', value: formatNumber(categoryData.circulating_supply ?? categoryData.quantity) + ` ${categoryData.ticker}` },
						{ label: '24h Contribution', value: formatBaseurrency(categoryData.volume_24h ?? 0) },
						{ label: 'Minimum Contribution', value: formatBaseurrency(categoryData.minimum_investable) },
						{ label: 'Maximum Contribution', value: formatBaseurrency(categoryData.maximum_investable) },
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
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-lg rounded-2xl text-[var(--dashboard-secondary-foreground)] p-4 py-6">
				<CardContent className="px-2 flex flex-col sm:flex-row justify-between items-start gap-4">
					<div className="flex-grow w-full sm:w-auto space-y-2">
						{categoryData.is_launched && (
							<div className="flex items-center justify-between">
								<Label htmlFor="amount" className="text-sm">
									Amount to Contribute ({getBaseCurrency()})
								</Label>

								<span className="font-bold">~{convertCurrency(+amountInput)}</span>
							</div>
						)}
						{!categoryData.is_launched ? (
							<div className="flex flex-col items-center justify-center py-6">
								<p className="text-base mb-2">This club is not yet open for contributions.</p>
								<Button
									variant="fixed-cta"
									className=""
									onClick={async () => {
										if (!categoryData?.id || !currentUser?.id) return toast.error('Missing club or user info.');
										setIsRequestingLaunch(true);
										try {
											const formData = new FormData();
											formData.append('new_request', currentUser.id);
											const res = await fetchWithAuth(`/api/categories/${categoryData.id}`, {
												method: 'PUT',
												body: formData,
											});
											if (!res.ok) {
												const data = await res.json().catch(() => ({}));
												throw new Error(handleFetchErrorMessage(data, 'Failed to request club launch.'));
											}
											toast.success('Request sent!');
										} catch (e: unknown) {
											const err = handleFetchErrorMessage(e);
											toast.error(err || 'Failed to request club launch.');
										} finally {
											setIsRequestingLaunch(false);
										}
									}}
									size={'lg'}
									disabled={isRequestingLaunch}
								>
									{isRequestingLaunch ? 'Requesting...' : 'Request Club Launch'}
								</Button>
							</div>
						) : (
							<div className="flex flex-col md:flex-row gap-1 md:gap-4">
								<Input
									id="amount"
									type="text"
									inputMode="decimal"
									placeholder="Enter a	mount"
									value={amountInput}
									onChange={handleAmountChange}
									className={`bg-background/80 dark:bg-black/30 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-12 account-input text-lg ${amountError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
									disabled={categoryData.is_locked || !categoryData.is_launched}
								/>
								<Button
									onClick={handleBuyNow}
									size={'lg'}
									variant={'fixed-cta'}
									disabled={isLoadingPurchase || categoryData.is_locked || !categoryData.is_launched || !amountInput}
									className={`w-full mt-4 sm:w-auto sm:mt-0 sm:self-end h-12 !self-center shadow-md ${categoryData.is_locked ? 'bg-gray-400 text-gray-700 cursor-not-allowed hover:bg-gray-400' : ''}`}
								>
									{categoryData.is_locked ? (
										'Locked'
									) : isLoadingPurchase ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Processing...
										</>
									) : (
										'Save Now'
									)}
								</Button>
							</div>
						)}
						{amountError && <p className="text-sm text-red-400 mt-1 px-1">{amountError}</p>}
					</div>
				</CardContent>
			</Card>

			{/* Only render Tabs if club is launched */}
			{categoryData.is_launched && (
				<Tabs defaultValue="activity" className="w-full">
					<TabsList className="bg-transparent p-0 h-auto gap-4 pb-2 mb-4">
						<TabsTrigger value="activity" className="data-[state=active]:text-[var(--dashboard-accent)] data-[state=inactive]:text-muted-foreground rounded-none justify-start pb-2 text-base font-semibold !bg-transparent !border-0">
							Club Activity
						</TabsTrigger>
						<TabsTrigger value="positions" className="data-[state=active]:text-[var(--dashboard-accent)] data-[state=inactive]:text-muted-foreground rounded-none justify-start pb-2 text-base font-semibold !bg-transparent !border-0">
							My Active Savings
						</TabsTrigger>
					</TabsList>

					<TabsContent value="activity" className="mt-0 space-y-4">
						{isLoadingTransactions ? (
							<div className="space-y-4">
								{[1, 2, 3].map((index) => (
									<Skeleton key={index} className="h-16 w-full rounded-lg" />
								))}
							</div>
						) : transactions.length > 0 ? (
							<>
								{transactions.map((transaction) => {
									const isCredit = transaction.type === 'investment';
									return (
										<div key={transaction.id} className="flex items-center justify-between pl-0 p-3 rounded-lg hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors">
											<div className="flex items-center gap-3">
												{isCredit ? (
													<div className="bg-[var(--success)] rounded-full p-3">
														<ArrowDown className="h-6 w-6 text-[var(--success-foreground)]" />
													</div>
												) : (
													<div className="bg-[var(--danger)] rounded-full p-3">
														<ArrowUp className="h-5 w-5 text-[var(--danger-foreground)]" />
													</div>
												)}
												<div>
													<p className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">{transaction.user_name}</p>
													<p className="text-sm text-muted-foreground">{formatRelativeTime(transaction.created_at)}</p>
												</div>
											</div>
											<span className={`font-semibold ${isCredit ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{formatBaseurrency(transaction.amount)}</span>
										</div>
									);
								})}

								{/* Pagination */}
								{totalPages > 1 && (
									<div className="flex justify-center gap-2 mt-6">
										<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
											Previous
										</Button>
										<span className="flex items-center px-3 text-sm">
											Page {currentPage} of {totalPages}
										</span>
										<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
											Next
										</Button>
									</div>
								)}
							</>
						) : (
							<div className="text-center py-10 text-muted-foreground">No activity yet.</div>
						)}
					</TabsContent>

					<TabsContent value="positions" className="mt-0">
						{isLoadingInvestments ? (
							<div className="space-y-4">
								{[1, 2, 3].map((index) => (
									<Skeleton key={index} className="h-20 w-full rounded-lg" />
								))}
							</div>
						) : activeInvestments.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{activeInvestments.map((inv) => {
									const currentValue = inv.current_value;
									const profit = currentValue - inv.amount_invested;
									return (
										<CustomLink key={inv.id} href={`/account/my-savings/${inv.id}`} className="block">
											<div className="relative bg-card hover:bg-muted/50 transition-colors duration-200 rounded-lg p-4 space-y-3 border-l-4 border-blue-500 shadow-sm">
												<div className="flex justify-between items-center">
													<div>
														<h3 className="font-semibold text-foreground">Contribution ID: {truncateString(inv.id)}</h3>
														<p className="text-xs text-muted-foreground">Started: {new Date(inv.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
													</div>
													<Badge variant={inv.status === 'active' ? 'active' : 'outline'} className="ml-2 capitalize">
														{inv.status}
													</Badge>
												</div>
												<div className="grid grid-cols-2 gap-2 text-sm mt-2">
													<div>
														<span className="text-muted-foreground">Savings</span>
														<div className="font-medium">{formatBaseurrency(inv.amount_invested)}</div>
													</div>
													<div>
														<span className="text-muted-foreground">Units Contributed</span>
														<div className="font-medium">
															{formatNumber(inv.units_purchased)} {inv.ticker}
														</div>
													</div>
													<div>
														<span className="text-muted-foreground">Current Value</span>
														<div className="font-medium">{formatBaseurrency(currentValue)}</div>
													</div>
													<div>
														<span className="text-muted-foreground">Profit/Loss</span>
														<div className={`font-medium ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatBaseurrency(profit)}</div>
													</div>
												</div>
												<Button size="sm" variant="outline" className="mt-2">
													View Details
												</Button>
											</div>
										</CustomLink>
									);
								})}

								{investmentsTotalPages > 1 && (
									<div className="flex justify-center gap-2 mt-6 col-span-full">
										<Button variant="outline" size="sm" onClick={() => handleInvestmentsPageChange(investmentsPage - 1)} disabled={investmentsPage === 1}>
											Previous
										</Button>
										<span className="flex items-center px-3 text-sm">
											Page {investmentsPage} of {investmentsTotalPages}
										</span>
										<Button variant="outline" size="sm" onClick={() => handleInvestmentsPageChange(investmentsPage + 1)} disabled={investmentsPage === investmentsTotalPages}>
											Next
										</Button>
									</div>
								)}
							</div>
						) : (
							<div className="text-center py-10 text-muted-foreground flex flex-col items-center">
								<img src="/images/wallet.png" alt="No positions" className="h-20 w-20 mb-4 opacity-60" />
								No active savings in this club.
							</div>
						)}
					</TabsContent>
				</Tabs>
			)}

			{/* Use validated amount for modal */}
			<InsufficientBalanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentBalance={currentUserBalance} requiredAmount={parseFloat(amountInput) || 0} />
		</div>
	);
}
