'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Info, MoreHorizontal, Edit3, Trash2, Lock, Unlock, ArrowUpCircle, ArrowDownCircle, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import InvestmentPerformanceChart from '@/components/charts/InvestmentPerformanceChart';
// import TransactionHistoryTable from '@/components/transactions/TransactionHistoryTable';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { formatNumber, formatUSD, generateSlug } from '@/lib/helpers';
import { Category, SingleCategoryResponse } from '@/types';

// TODO: Replace with actual transaction data fetching for the category
const _assetTransactionHistoryMock = [
	{ id: 'txn_asset_1', timestamp: '2025-10-19T10:35:00Z', maskedInvestorId: 'User...a4f8', type: 'Buy Ticker', amount: 2.5, currency: 'TICK', usdValue: 5126.88, status: 'Completed' },
	{ id: 'txn_asset_2', timestamp: '2025-10-18T15:22:00Z', maskedInvestorId: 'User...b8e1', type: 'Sell Ticker', amount: 0.1, currency: 'TICK', usdValue: 3010.02, status: 'Completed' },
];

export default function AdminSingleCategoriesPage() {
	const params = useParams<{ slug: string }>();
	const router = useRouter();
	const categoryIdentifier = params?.slug;

	const [categoryData, setCategoryData] = useState<Category | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isProcessingAction, setIsProcessingAction] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmAction, setConfirmAction] = useState<'lock' | 'unlock' | 'delete' | null>(null);
	const [dialogDetails, setDialogDetails] = useState({ title: '', description: '', actionText: '' });

	const fetchCategory = useCallback(async (identifier: string) => {
		nProgress.start();
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`/api/admin/categories/${identifier}`);
			if (!response.ok) {
				let errorMessage = `API Error: ${response.status} ${response.statusText}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (_e: unknown) {}
				throw new Error(errorMessage);
			}
			const result: SingleCategoryResponse = await response.json();
			if (result.status === 'success' && result.data) {
				const fetchedCategory = result.data;
				const circulatingSupply = fetchedCategory.circulating_supply ?? fetchedCategory.quantity;

				console.log(result.data);

				setCategoryData({
					...fetchedCategory,
					circulating_supply: circulatingSupply,
					is_launched: fetchedCategory.is_launched === undefined ? true : fetchedCategory.is_launched,
				});
			} else {
				throw new Error(result.data?.toString() || 'Failed to fetch category data or data is invalid');
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Could not load category details.';
			console.error('Failed to fetch category:', err);
			setError(errorMessage);
			toast.error(errorMessage);
			setCategoryData(null);
		} finally {
			setIsLoading(false);
			nProgress.done();
		}
	}, []);

	useEffect(() => {
		if (categoryIdentifier) {
			fetchCategory(categoryIdentifier);
		} else {
			const msg = 'Category identifier is missing.';
			toast.error(msg);
			setError(msg);
			setIsLoading(false);
			nProgress.start();
			router.push('/admin/categories');
		}
	}, [categoryIdentifier, fetchCategory, router]);

	const handleEdit = () => {
		if (!categoryData) return;
		nProgress.start();
		router.push(`/admin/categories/${generateSlug(categoryData.ticker)}/edit`);
	};

	const prepareConfirmAction = (action: 'lock' | 'unlock' | 'delete') => {
		if (!categoryData) return;
		let title = '',
			description = '',
			actionText = '';
		switch (action) {
			case 'lock':
				title = 'Confirm Category Lock';
				description = `Are you sure you want to lock "${categoryData.name} (${categoryData.ticker})"? This may restrict certain user actions.`;
				actionText = 'Lock Category';
				break;
			case 'unlock':
				title = 'Confirm Category Unlock';
				description = `Are you sure you want to unlock "${categoryData.name} (${categoryData.ticker})"?`;
				actionText = 'Unlock Category';
				break;
			case 'delete':
				title = 'Confirm Category Deletion';
				description = `Are you sure you want to permanently delete "${categoryData.name} (${categoryData.ticker})"? This action cannot be undone.`;
				actionText = 'Delete Category';
				break;
		}
		setDialogDetails({ title, description, actionText });
		setConfirmAction(action);
		setShowConfirmDialog(true);
	};

	const executeConfirmedAction = async () => {
		if (!categoryData || !confirmAction) return;
		setIsProcessingAction(true);
		nProgress.start();

		try {
			let response;
			let toastMessage = '';

			if (confirmAction === 'lock' || confirmAction === 'unlock') {
				const newLockedStatus = confirmAction === 'lock';
				const formData = new FormData();
				formData.append('is_locked', newLockedStatus.toString());

				response = await fetch(`/api/admin/categories/${categoryData.id}`, {
					method: 'PUT',
					body: formData,
				});
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.message || `Failed to ${confirmAction} category.`);
				}
				const updatedCategory = await response.json();
				setCategoryData(updatedCategory.data);
				toastMessage = `Category "${categoryData.name}" has been ${newLockedStatus ? 'locked' : 'unlocked'}.`;
				toast.success(toastMessage);
			} else if (confirmAction === 'delete') {
				response = await fetch(`/api/admin/categories/${categoryData.id}`, {
					method: 'DELETE',
				});
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.message || 'Failed to delete category.');
				}
				toastMessage = `Category "${categoryData.name}" has been deleted.`;
				toast.success(toastMessage);
				router.push('/admin/categories');
			}
		} catch (apiError) {
			console.error(`Failed to ${confirmAction} category:`, apiError);
			toast.error((apiError as Error).message || `Could not ${confirmAction} category. Please try again.`);
			if (categoryIdentifier && confirmAction !== 'delete') {
				fetchCategory(categoryIdentifier);
			}
		} finally {
			setIsProcessingAction(false);
			setShowConfirmDialog(false);
			setConfirmAction(null);
			nProgress.done();
		}
	};

	const PriceChangeIndicator = ({ value }: { value: number | undefined | null }) => {
		if (value === undefined || value === null || isNaN(value)) return <span className="text-sm text-muted-foreground">N/A</span>;
		const isPositive = value >= 0;
		return (
			<span className={`flex items-center text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
				{isPositive ? <ArrowUpCircle className="mr-1 h-4 w-4" /> : <ArrowDownCircle className="mr-1 h-4 w-4" />}
				{value.toFixed(2)}%
			</span>
		);
	};

	type CategoryDisplayStatus = 'Active' | 'Locked' | 'Not Launched';
	const getCategoryDisplayStatus = (cat: Category): CategoryDisplayStatus => {
		if (cat.is_locked) return 'Locked';
		if (cat.is_launched === false) return 'Not Launched'; // Check explicitly for false
		return 'Active';
	};

	const getStatusBadgeVariant = (status: CategoryDisplayStatus): 'default' | 'secondary' | 'destructive' => {
		switch (status) {
			case 'Active':
				return 'default';
			case 'Locked':
				return 'destructive';
			case 'Not Launched':
				return 'secondary'; // Changed 'warning' to 'secondary'
			default:
				return 'secondary';
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-200px)]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="ml-4 text-lg text-muted-foreground">Loading category details...</p>
			</div>
		);
	}

	if (error || !categoryData) {
		return (
			<div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
				<Info className="h-12 w-12 text-destructive mb-4" />
				<p className="text-xl text-muted-foreground">{error || 'Category not found or failed to load.'}</p>
				<Button onClick={() => router.push('/admin/categories')} className="mt-4">
					Back to Categories
				</Button>
			</div>
		);
	}
	const displayStatus = getCategoryDisplayStatus(categoryData);

	return (
		<TooltipProvider>
			<div className="space-y-6">
				<Breadcrumbs />
				<Card className="overflow-hidden">
					<CardHeader className="flex flex-row items-start gap-4 bg-muted/30 dark:bg-background/20 p-4 md:p-6">
						<div className="flex-shrink-0">
							{categoryData.image ? (
								<Image src={categoryData.image} alt={`${categoryData.name} logo`} width={64} height={64} className="rounded-md aspect-square object-cover border bg-background" unoptimized />
							) : (
								<div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground border">
									<ImageOff size={32} />
								</div>
							)}
						</div>
						<div className="flex-1">
							<div className="flex flex-col sm:flex-row justify-between sm:items-start">
								<div>
									<CardTitle className="text-2xl md:text-3xl font-bold">
										{categoryData.name} ({categoryData.ticker})
									</CardTitle>
									<CardDescription className="text-sm text-muted-foreground mt-1">{categoryData.description || 'No description available.'}</CardDescription>
								</div>
								<Badge
									variant={getStatusBadgeVariant(displayStatus)}
									className={`text-xs md:text-sm px-2.5 py-1 mt-2 sm:mt-0 whitespace-nowrap self-start sm:self-auto ${
										displayStatus === 'Active'
											? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
											: displayStatus === 'Locked'
											? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-400 dark:border-red-700'
											: displayStatus === 'Not Launched'
											? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-700'
											: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700'
									}`}
								>
									Status: {displayStatus}
									{/* TODO: Add tooltip for status reason if API provides it e.g. categoryData.status_reason */}
								</Badge>
							</div>
						</div>
						<div className="flex-shrink-0">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" /> <span className="sr-only">Category Actions</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
									<DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
										<Edit3 className="mr-2 h-4 w-4" /> Edit Category
									</DropdownMenuItem>
									{!categoryData.is_locked && (
										<DropdownMenuItem onClick={() => prepareConfirmAction('lock')} className="cursor-pointer">
											<Lock className="mr-2 h-4 w-4" /> Lock Category
										</DropdownMenuItem>
									)}
									{categoryData.is_locked && (
										<DropdownMenuItem onClick={() => prepareConfirmAction('unlock')} className="cursor-pointer">
											<Unlock className="mr-2 h-4 w-4" /> Unlock Category
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => prepareConfirmAction('delete')} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
										<Trash2 className="mr-2 h-4 w-4" /> Delete Category
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Key Category Metrics</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
						{[
							{ label: 'Current Price', value: formatUSD(categoryData.current_price_per_unit), size: 'large' },
							{ label: 'Quantity (Total Supply)', value: formatNumber(categoryData.quantity) },
							{ label: 'Circulating Supply', value: formatNumber(categoryData.circulating_supply) + (categoryData.ticker ? ` ${categoryData.ticker}` : '') },
							{ label: 'Market Cap', value: formatUSD(categoryData.market_cap, 0), tooltip: 'Calculated: Price * Circulating Supply' },
							{ label: 'Total Liquidity', value: formatUSD(categoryData.total_liquidity, 0) },
							{ label: 'Minimum Investable', value: formatUSD(categoryData.minimum_investable) },
							{ label: 'Maximum Investable', value: formatUSD(categoryData.maximum_investable) },
							{ label: 'Holders', value: formatNumber(categoryData.holders) },
							{ label: 'Fee (%)', value: categoryData.fee !== null && categoryData.fee !== undefined ? `${categoryData.fee}%` : 'N/A' },
							{ label: 'Volatility Factor', value: categoryData.volatility_factor !== null && categoryData.volatility_factor !== undefined ? categoryData.volatility_factor.toString() : 'N/A' },
							{ label: 'Admin Target Multiplier', value: categoryData.admin_target_multiplier !== null && categoryData.admin_target_multiplier !== undefined ? categoryData.admin_target_multiplier.toString() : 'N/A' },
							{ label: '24h Change', value: <PriceChangeIndicator value={categoryData.price_change_24h} /> },
							{ label: '7d Change', value: <PriceChangeIndicator value={categoryData.price_change_7d} /> },
							{ label: '30d Change', value: <PriceChangeIndicator value={categoryData.price_change_30d} /> },
							{ label: '24h Volume', value: formatUSD(categoryData.volume_24h, 0) },
							{ label: 'Created At', value: new Date(categoryData.created_at).toLocaleDateString() },
							{ label: 'Last Updated', value: categoryData.updated_at ? new Date(categoryData.updated_at).toLocaleDateString() : 'N/A' },
						]
							.filter((metric) => metric.value !== undefined)
							.map((metric) => (
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
						<CardTitle>Historical Performance</CardTitle>
					</CardHeader>
					<CardContent>
						{/* TODO: InvestmentPerformanceChart needs actual data for the category */}
						<InvestmentPerformanceChart />
						<p className="text-sm text-muted-foreground mt-2 text-center">Historical performance chart data is not yet connected for this category.</p>
					</CardContent>
				</Card>

				<div className="mt-8">
					<h2 className="text-2xl font-semibold mb-4">Transaction Ledger for {categoryData.ticker}</h2>
					{/* TODO: TransactionHistoryTable needs actual transaction data for the category */}
					{/* <TransactionHistoryTable transactions={assetTransactionHistoryMock.map((tx) => ({ ...tx, type: tx.type.replace('Ticker', categoryData.ticker).replace('TICK', categoryData.ticker) }))} showMyTransactionsToggle={false} /> */}
					<p className="text-sm text-muted-foreground mt-2 text-center">Transaction history data is not yet connected for this category.</p>
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
						<AlertDialogAction onClick={executeConfirmedAction} disabled={isProcessingAction} className={confirmAction === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
							{isProcessingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							{isProcessingAction ? `${confirmAction === 'delete' ? 'Deleting' : 'Processing'}...` : dialogDetails.actionText}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</TooltipProvider>
	);
}
