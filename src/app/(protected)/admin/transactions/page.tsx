'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { PAYMENT_METHOD, Transaction, TRANSACTION_STATUSES, TRANSACTION_TYPE_VALUES, TransactionApiResponse } from '@/types';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import nProgress from 'nprogress';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBaseurrency, formatDate, getTransactionTypeLabel, positiveTransactionTypes } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 10;
const SORTABLE_COLUMNS = [
	{ key: 'type', label: 'Type' },
	{ key: 'description', label: 'Description' },
	{ key: 'status', label: 'Status' },
	{ key: 'payment_method', label: 'Payment Method' },
	{ key: 'amount', label: 'Amount' },
	{ key: 'currency', label: 'Currency' },
	{ key: 'created_at', label: 'Date' },
];

export default function TransactionsPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// Sorting
	const [sortColumn, setSortColumn] = useState<string>('created_at');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	// Search & Filters
	const [search, setSearch] = useState('');
	const [filterStatus, setFilterStatus] = useState<string>('all');
	const [filterType, setFilterType] = useState<string>('all');
	const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

	const fetchTransactions = useCallback(
		async (page: number) => {
			nProgress.start();
			setIsLoading(true);
			setError(null);
			try {
				const params = new URLSearchParams({
					page: page.toString(),
					limit: ITEMS_PER_PAGE.toString(),
					sortBy: sortColumn,
					sortOrder: sortDirection,
				});
				if (search) params.append('search', search);
				if (filterStatus !== 'all') params.append('status', filterStatus);
				if (filterType !== 'all') params.append('type', filterType);
				if (filterPaymentMethod !== 'all') params.append('paymentMethod', filterPaymentMethod);
				const response = await fetchWithAuth(`/api/transactions/all?${params.toString()}`);
				if (!response.ok) {
					let errorMessage = `API Error: ${response.status} ${response.statusText}`;
					try {
						const errorData = await response.json();
						errorMessage = errorData.message || errorMessage;
					} catch (_jsonError) {}
					throw new Error(errorMessage);
				}
				const result: TransactionApiResponse = await response.json();
				if (result.status !== 'success') {
					throw new Error(result.data?.toString() || 'API returned an error without a message');
				}
				setTransactions(result.data.transactions);
				setCurrentPage(result.data.currentPage);
				setTotalPages(result.data.totalPages);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An unexpected error occurred while fetching transactions.');
				setTransactions([]);
			} finally {
				setIsLoading(false);
				nProgress.done();
			}
		},
		[sortColumn, sortDirection, search, filterStatus, filterType, filterPaymentMethod]
	);

	useEffect(() => {
		fetchTransactions(currentPage);
	}, [currentPage, fetchTransactions]);

	const handleRetry = () => {
		fetchTransactions(currentPage);
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage((prev) => prev + 1);
		}
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Transactions</h1>
			</div>
			<p className="text-lg text-muted-foreground">View and manage all platform transactions. See details, status, and more.</p>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					setCurrentPage(1);
					fetchTransactions(1);
				}}
				className="flex flex-wrap gap-2 items-center mb-2"
			>
				{false && (
					<div className="flex items-center gap-2">
						<Input type="text" placeholder="Search user, description, etc." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
						<Button type="submit" variant="outline" size="icon" className="h-9 w-9">
							<Search className="h-4 w-4" />
						</Button>
					</div>
				)}
				<Select
					value={filterStatus}
					onValueChange={(v) => {
						setFilterStatus(v);
						setCurrentPage(1);
					}}
				>
					<SelectTrigger className="w-36">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						{TRANSACTION_STATUSES.map((type) => (
							<SelectItem className="capitalize" key={type} value={type}>
								{type}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filterType}
					onValueChange={(v) => {
						setFilterType(v);
						setCurrentPage(1);
					}}
				>
					<SelectTrigger className="w-36">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						{TRANSACTION_TYPE_VALUES.map((type) => (
							<SelectItem key={type} value={type}>
								{getTransactionTypeLabel(type)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filterPaymentMethod}
					onValueChange={(v) => {
						setFilterPaymentMethod(v);
						setCurrentPage(1);
					}}
				>
					<SelectTrigger className="w-36">
						<SelectValue placeholder="Payment Method" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem className="capitalize" value="all">
							All Methods
						</SelectItem>
						{PAYMENT_METHOD.map((type) => (
							<SelectItem key={type} value={type}>
								{type}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</form>

			{error ? (
				<ErrorMessage message={error} onRetry={handleRetry} />
			) : (
				<>
					<div className="rounded-md border bg-card shadow-sm">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead></TableHead>
									<TableHead>User</TableHead>
									{SORTABLE_COLUMNS.map((col) => (
										<TableHead
											key={col.key}
											className={col.key === 'amount' || col.key === 'currency' || col.key === 'created_at' ? 'text-right cursor-pointer' : 'cursor-pointer'}
											onClick={() => {
												if (sortColumn === col.key) {
													setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
												} else {
													setSortColumn(col.key);
													setSortDirection('asc');
												}
												setCurrentPage(1);
											}}
										>
											<span className="flex items-center">
												{col.label}
												{sortColumn === col.key && <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
											</span>
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
										<TableRow key={`skeleton-${index}`}>
											<TableCell>
												<Skeleton className="h-4 w-[20px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[120px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[80px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[200px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-[70px] rounded-full" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[80px]" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="h-4 w-[80px] ml-auto" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="h-4 w-[60px] ml-auto" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="h-4 w-[120px] ml-auto" />
											</TableCell>
										</TableRow>
									))
								) : transactions.length > 0 ? (
									transactions.map((tx, i) => {
										return (
											<TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
												<TableCell className="font-medium">{i + (currentPage - 1) * ITEMS_PER_PAGE + 1}</TableCell>
												<TableCell className="font-medium">
													{tx.user_name} <span className="text-xs text-muted-foreground">({tx.user_username})</span>
												</TableCell>
												<TableCell>{getTransactionTypeLabel(tx.type)}</TableCell>
												<TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={tx.description || 'No description'}>
													{tx.description}
												</TableCell>
												<TableCell>
													<Badge
														variant={tx.status.toLowerCase() === 'completed' ? 'default' : 'secondary'}
														className={cn(
															tx.status.toLowerCase() === 'completed'
																? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300'
																: tx.status.toLowerCase() === 'pending'
																? 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300'
																: tx.status.toLowerCase() === 'failed' || tx.status.toLowerCase() === 'cancelled'
																? 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'
																: 'bg-muted text-muted-foreground',
															'text-xs capitalize'
														)}
													>
														{tx.status}
													</Badge>
												</TableCell>
												<TableCell>{tx.payment_method}</TableCell>
												<TableCell className={cn(`text-right font-mono text-[var(--success)]`)}>{formatBaseurrency(tx.amount)}</TableCell>
												<TableCell className="text-right">{tx.currency}</TableCell>
												<TableCell className="text-right">{formatDate(new Date(tx.created_at))}</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={8} className="h-32 text-center text-lg text-muted-foreground">
											No transactions found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{!isLoading && transactions.length > 0 && totalPages > 1 && (
						<div className="flex items-center justify-end space-x-2 py-4">
							<span className="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</span>
							<Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading}>
								Previous
							</Button>
							<Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || isLoading}>
								Next
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
