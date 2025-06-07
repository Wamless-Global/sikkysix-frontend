'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { ArrowDown, ArrowUp, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, Search as _SearchIcon, Filter as FilterIcon, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatBaseurrency, formatDate, getTransactionTypeLabel, handleFetchErrorMessage } from '@/lib/helpers';
import { AccountTransaction, TransactionApiResponse } from '@/types';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import ErrorMessage from '@/components/ui/ErrorMessage';

const ITEMS_PER_PAGE = 10;

type SortableAccountTransactionKeys = 'date' | 'type' | 'amount' | 'status';

export default function AccountTransactionsPageContent() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [loadingButton, setLoadingButton] = useState<'previous' | 'next' | null>(null);
	const [showFilters, setShowFilters] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Filters
	const [filterStatus, setFilterStatus] = useState<'Completed' | 'Pending' | 'all'>('all');
	const [filterType, setFilterType] = useState<string | 'all'>('all');
	const [filterStartDate, setFilterStartDate] = useState<string>('');
	const [filterEndDate, setFilterEndDate] = useState<string>('');
	const [filterMinAmount, setFilterMinAmount] = useState<string>('');
	const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');

	const [sortColumn, setSortColumn] = useState<SortableAccountTransactionKeys | null>('date');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

	const [currentPage, setCurrentPage] = useState(1);
	const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);

	// Fetch transactions from API (live fetch on filter/sort/page change)
	useEffect(() => {
		setIsLoading(true);
		setError(null);
		const params = new URLSearchParams({
			page: currentPage.toString(),
			pageSize: ITEMS_PER_PAGE.toString(),
		});
		if (filterStatus !== 'all') params.append('status', filterStatus);
		if (filterType !== 'all') params.append('type', filterType);
		if (filterStartDate) params.append('startDate', filterStartDate);
		if (filterEndDate) params.append('endDate', filterEndDate);
		if (filterMinAmount) params.append('minAmount', filterMinAmount);
		if (filterMaxAmount) params.append('maxAmount', filterMaxAmount);
		if (sortColumn) params.append('sortBy', sortColumn);
		if (sortDirection) params.append('sortOrder', sortDirection);

		fetchWithAuth(`/api/transactions?${params}`)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to fetch transactions');
				return res.json();
			})
			.then((data: TransactionApiResponse) => {
				const txs = data.data.transactions.map((t) => ({
					id: t.id,
					type: t.type,
					originalType: t.type,
					date: new Date(t.created_at),
					amount: t.amount,
					status: t.status === 'completed' ? 'Completed' : t.status === 'pending' ? 'Pending' : t.status,
				}));
				setTransactions(txs);
				setTotalCount(data.data.totalCount);
				setTotalPages(data.data.totalPages);
				setUniqueTypes(Array.from(new Set(data.data.transactions.map((t) => t.type))).sort());
				setError(null);
			})
			.catch((err) => {
				setTransactions([]);
				setTotalCount(0);
				setTotalPages(1);
				setError(handleFetchErrorMessage(err, 'An error occurred while fetching transactions.'));
			})
			.finally(() => setTimeout(() => setIsLoading(false), 300));
	}, [currentPage, filterStatus, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount, sortColumn, sortDirection]);

	// Filtering
	const filteredData = useMemo(() => {
		let data = [...transactions];
		if (filterStatus !== 'all') {
			data = data.filter((tx) => tx.status === filterStatus);
		}
		if (filterType !== 'all') {
			data = data.filter((tx) => tx.type === filterType);
		}
		if (filterStartDate) {
			data = data.filter((tx) => tx.date >= new Date(filterStartDate));
		}
		if (filterEndDate) {
			const endDate = new Date(filterEndDate);
			endDate.setHours(23, 59, 59, 999);
			data = data.filter((tx) => tx.date <= endDate);
		}
		const minAmount = parseFloat(filterMinAmount);
		const maxAmount = parseFloat(filterMaxAmount);
		if (!isNaN(minAmount)) {
			data = data.filter((tx) => tx.amount >= minAmount);
		}
		if (!isNaN(maxAmount)) {
			data = data.filter((tx) => tx.amount <= maxAmount);
		}
		return data;
	}, [transactions, filterStatus, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount]);

	// Sorting
	const sortedData = useMemo(() => {
		const data = [...filteredData];
		if (sortColumn) {
			data.sort((a, b) => {
				let valA = a[sortColumn];
				let valB = b[sortColumn];
				if (sortColumn === 'date') {
					valA = (valA as Date).getTime();
					valB = (valB as Date).getTime();
				}
				let comparison = 0;
				if (valA > valB) comparison = 1;
				else if (valA < valB) comparison = -1;
				return sortDirection === 'desc' ? comparison * -1 : comparison;
			});
		}
		return data;
	}, [filteredData, sortColumn, sortDirection]);

	// Pagination (client-side for filtered/sorted data)
	const paginatedTransactions = useMemo(() => {
		const start = 0;
		const end = ITEMS_PER_PAGE;
		return sortedData.slice(start, end);
	}, [sortedData]);

	// Reset page on filter change
	useEffect(() => {
		setCurrentPage(1);
	}, [filterStatus, filterType, filterStartDate, filterEndDate, filterMinAmount, filterMaxAmount]);

	useEffect(() => {
		if (!isLoading) {
			setLoadingButton(null);
		}
	}, [isLoading]);

	const handleSort = (column: SortableAccountTransactionKeys) => {
		if (sortColumn === column) {
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
		setCurrentPage(1);
	};

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		setLoadingButton(newPage > currentPage ? 'next' : 'previous');
		setIsLoading(true);
		setCurrentPage(newPage);
	};

	const handleResetFilters = () => {
		setFilterStatus('all');
		setFilterType('all');
		setFilterStartDate('');
		setFilterEndDate('');
		setFilterMinAmount('');
		setFilterMaxAmount('');
		setSortColumn('date');
		setSortDirection('desc');
		setCurrentPage(1);
	};

	// Retry handler for error message
	const handleRetry = () => {
		setError(null);
		setIsLoading(true);
		// Trigger the same effect as filter/sort/page change
		const params = new URLSearchParams({
			page: currentPage.toString(),
			pageSize: ITEMS_PER_PAGE.toString(),
		});
		if (filterStatus !== 'all') params.append('status', filterStatus);
		if (filterType !== 'all') params.append('type', filterType);
		if (filterStartDate) params.append('startDate', filterStartDate);
		if (filterEndDate) params.append('endDate', filterEndDate);
		if (filterMinAmount) params.append('minAmount', filterMinAmount);
		if (filterMaxAmount) params.append('maxAmount', filterMaxAmount);
		if (sortColumn) params.append('sortBy', sortColumn);
		if (sortDirection) params.append('sortOrder', sortDirection);

		fetchWithAuth(`/api/transactions?${params}`)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to fetch transactions');
				return res.json();
			})
			.then((data: TransactionApiResponse) => {
				const txs = data.data.transactions.map((t) => ({
					id: t.id,
					type: t.type,
					originalType: t.type,
					date: new Date(t.created_at),
					amount: t.amount,
					status: t.status === 'completed' ? 'Completed' : t.status === 'pending' ? 'Pending' : t.status,
				}));
				setTransactions(txs);
				setTotalCount(data.data.totalCount);
				setTotalPages(data.data.totalPages);
				setUniqueTypes(Array.from(new Set(data.data.transactions.map((t) => t.type))).sort());
				setError(null);
			})
			.catch((err) => {
				setTransactions([]);
				setTotalCount(0);
				setTotalPages(1);
				setError(handleFetchErrorMessage(err, 'An error occurred while fetching transactions.'));
			})
			.finally(() => setTimeout(() => setIsLoading(false), 300));
	};

	const SortableHeader = ({ columnKey, label, className }: { columnKey: SortableAccountTransactionKeys; label: string; className: string }) => (
		<TableHead onClick={() => handleSort(columnKey)} className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors ${className}`}>
			<div className="flex items-center py-2">
				{label}
				{sortColumn === columnKey && <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />}
				{sortColumn !== columnKey && <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />}
			</div>
		</TableHead>
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="sub-page-heading">All Transactions</h1>
				<p className="sub-page-heading-sub-text">View and filter your complete transaction history below.</p>
			</div>
			<div className="flex justify-end">
				<Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
					<FilterIcon className="h-4 w-4" />
					{showFilters ? 'Hide Filters' : 'Show Filters'}
				</Button>
			</div>
			{showFilters && (
				<div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg animate-in fade-in-0 slide-in-from-top-5 duration-300">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
						<div className="space-y-1">
							<Label htmlFor="filter-status">Status</Label>
							<Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'Completed' | 'Pending' | 'all')}>
								<SelectTrigger id="filter-status" className="w-full">
									<SelectValue placeholder="Filter by Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									<SelectItem value="Completed">Completed</SelectItem>
									<SelectItem value="Pending">Pending</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label htmlFor="filter-type">Type</Label>
							<Select value={filterType} onValueChange={(value) => setFilterType(value as string | 'all')}>
								<SelectTrigger id="filter-type" className="w-full">
									<SelectValue placeholder="Filter by Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									{uniqueTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{getTransactionTypeLabel(type)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label htmlFor="filter-start-date">From Date</Label>
							<Input id="filter-start-date" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="filter-end-date">To Date</Label>
							<Input id="filter-end-date" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} min={filterStartDate} className="w-full" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="filter-min-amount">Min Amount</Label>
							<Input id="filter-min-amount" type="number" placeholder="e.g., 100" value={filterMinAmount} onChange={(e) => setFilterMinAmount(e.target.value)} className="w-full" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="filter-max-amount">Max Amount</Label>
							<Input id="filter-max-amount" type="number" placeholder="e.g., 5000" value={filterMaxAmount} onChange={(e) => setFilterMaxAmount(e.target.value)} className="w-full" />
						</div>
						<Button onClick={handleResetFilters} variant="outline" size={'lg'} className="w-full sm:w-auto sm:self-end lg:col-start-3">
							Reset Filters
						</Button>
					</div>
				</div>
			)}
			<div className="rounded-lg border border-slate-200 dark:border-slate-700">
				{error && !isLoading ? (
					<ErrorMessage message={error} onRetry={handleRetry} />
				) : (
					<Table>
						<TableHeader className="bg-slate-50 dark:bg-slate-800">
							<TableRow>
								<TableHead className="w-[50px] py-2"></TableHead>
								<SortableHeader className="hidden sm:table-cell" columnKey="date" label="Date" />
								<SortableHeader className="" columnKey="type" label="Type" />
								<SortableHeader className="hidden sm:table-cell" columnKey="status" label="Status" />
								<TableHead className="text-right py-2">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && transactions.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="h-36 text-center">
										<Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-500 dark:text-slate-400" />
									</TableCell>
								</TableRow>
							) : transactions.length > 0 ? (
								transactions.map((transaction) => {
									return (
										<TableRow
											key={transaction.id}
											className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
											onClick={() => {
												NProgress.start();
												router.push(`/account/wallet/transactions/${transaction.id}`);
											}}
										>
											<TableCell className="py-3">
												{transaction.status === 'pending' ? (
													<div className="flex justify-center items-center h-full p-3">
														<Loader2 className="h-5 w-5 animate-spin text-slate-400" />
													</div>
												) : (
													<div
														className={`rounded-full p-3 ${
															transaction.status.toLowerCase() === 'failed' || transaction.status.toLowerCase() === 'cancelled'
																? 'bg-muted-foreground'
																: ['deposit', 'credit', 'investment_profit_withdrawal'].some((type) => transaction.type.toLowerCase().includes(type))
																? 'bg-[var(--success)]'
																: 'bg-[var(--danger)]'
														}`}
													>
														{transaction.status.toLowerCase() === 'failed' || transaction.status.toLowerCase() === 'cancelled' ? (
															<X className="h-5 w-5 text-[var(--success-foreground)]" />
														) : ['deposit', 'credit', 'investment_profit_withdrawal'].some((type) => transaction.type.toLowerCase().includes(type)) ? (
															<ArrowDown className="h-5 w-5 text-[var(--success-foreground)]" />
														) : (
															<ArrowUp className="h-5 w-5 text-[var(--danger-foreground)]" />
														)}
													</div>
												)}
											</TableCell>
											<TableCell className="py-3 hidden sm:table-cell">
												<div className="text-sm font-medium text-foreground">{formatDate(transaction.date)}</div>
											</TableCell>
											<TableCell className="py-3 text-sm text-foreground ">
												<span className="block max-w-[100px] sm:max-w-none">{getTransactionTypeLabel(transaction.originalType)}</span>
												<div className="text-xs font-medium text-foreground sm:hidden">{formatDate(transaction.date)}</div>
											</TableCell>
											<TableCell className="py-3 hidden sm:table-cell">
												<Badge
													variant={transaction.status.toLowerCase() === 'completed' ? 'default' : 'secondary'}
													className={cn(
														transaction.status.toLowerCase() === 'completed'
															? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300'
															: transaction.status.toLowerCase() === 'pending'
															? 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300'
															: transaction.status.toLowerCase() === 'failed' || transaction.status.toLowerCase() === 'cancelled'
															? 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'
															: 'bg-muted text-muted-foreground',
														'text-xs capitalize'
													)}
												>
													{transaction.status.toLowerCase()}
												</Badge>
											</TableCell>
											<TableCell
												className={`py-3 text-base font-semibold text-right ${
													transaction.status.toLowerCase() === 'failed' || transaction.status.toLowerCase() === 'cancelled'
														? 'text-muted-foreground'
														: ['deposit', 'credit', 'investment_profit_withwithdrawal'].some((type) => transaction.type.toLowerCase().includes(type))
														? 'text-[var(--success)]'
														: 'text-[var(--danger)]'
												}`}
											>
												{formatBaseurrency(transaction.amount)}
											</TableCell>
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell colSpan={5} className="h-36 text-center text-muted-foreground">
										No transactions found matching your criteria.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				)}
			</div>
			{totalPages > 0 && (
				<div className="flex flex-col items-center sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
					<div className="text-sm text-muted-foreground flex-shrink-0">
						Page {currentPage} of {totalPages} ({totalCount} transactions)
					</div>
					<div className="space-x-2 flex items-center flex-wrap justify-center sm:justify-end mt-2">
						<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="cursor-pointer">
							{isLoading && loadingButton === 'previous' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4 mr-1" />}
							Previous
						</Button>
						<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="cursor-pointer">
							Next
							{isLoading && loadingButton === 'next' ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4 ml-1" />}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
