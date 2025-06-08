'use client';

import { useState, useMemo } from 'react'; // Added imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
// import { TransactionHistoryTable } from '@/components/admin/TransactionHistoryTable';
import { SortableTransactionKeys, TransactionsPaymentMethod, TransactionStatus, TransactionsType } from '@/types';

const ITEMS_PER_PAGE = 10; // Added for pagination

// TODO: Replace with actual data fetching and type definitions
type PendingTransaction = {
	id: string;
	userId: string;
	userName: string;
	type: 'Deposit' | 'Withdrawal';
	method: 'Bank Transfer' | 'Crypto';
	amount: number;
	currency: string;
	submittedDate: string;
	status: 'Pending';
};

const placeholderPending: PendingTransaction[] = [
	{ id: 'pend_1', userId: 'usr_1', userName: 'John Doe', type: 'Withdrawal', method: 'Bank Transfer', amount: 5000, currency: 'NGN', submittedDate: '2024-04-30', status: 'Pending' },
	{ id: 'pend_2', userId: 'usr_3', userName: 'Adekunle Gold', type: 'Deposit', method: 'Crypto', amount: 0.01, currency: 'BTC', submittedDate: '2024-04-29', status: 'Pending' },
	{ id: 'pend_3', userId: 'usr_2', userName: 'Jane Smith', type: 'Deposit', method: 'Bank Transfer', amount: 10000, currency: 'NGN', submittedDate: '2024-04-30', status: 'Pending' },
];

const placeholderHistory = [
	// type TransactionHistory = { ... }; // Defined in TransactionHistoryTable.tsx or shared file
	{ id: 'hist_1', userId: 'usr_1', userName: 'John Doe', type: 'Deposit' as const, method: 'Bank Transfer' as const, amount: 20000, currency: 'NGN', date: '2024-04-15', status: 'Completed' as const },
	{ id: 'hist_2', userId: 'usr_1', userName: 'John Doe', type: 'Investment' as const, amount: 1500, currency: 'NGN', date: '2024-04-16', status: 'Completed' as const, details: 'Foodstuffs Category' },
	{ id: 'hist_3', userId: 'usr_2', userName: 'Jane Smith', type: 'Withdrawal' as const, method: 'Crypto' as const, amount: 0.005, currency: 'BTC', date: '2024-04-20', status: 'Completed' as const },
	{ id: 'hist_4', userId: 'usr_3', userName: 'Adekunle Gold', type: 'Fee' as const, amount: 500, currency: 'NGN', date: '2024-04-21', status: 'Completed' as const, details: 'Withdrawal Fee' },
	{ id: 'hist_5', userId: 'usr_1', userName: 'John Doe', type: 'Referral Bonus' as const, amount: 200, currency: 'NGN', date: '2024-04-25', status: 'Completed' as const, details: 'From usr_5' },
	{ id: 'hist_6', userId: 'usr_4', userName: 'Bob Williams', type: 'Deposit' as const, method: 'Bank Transfer' as const, amount: 5000, currency: 'NGN', date: '2024-04-28', status: 'Rejected' as const, details: 'Proof mismatch' },
];

// Helper for status badges (can be removed if not used elsewhere on this page)
// const getTransactionStatusVariant = (status: 'Completed' | 'Pending' | 'Rejected' | 'Processing'): 'default' | 'secondary' | 'destructive' | 'outline' => {
// 	switch (status) {
// 		case 'Completed':
// 			return 'default';
// 		case 'Pending':
// 			return 'secondary';
// 		case 'Processing':
// 			return 'outline';
// 		case 'Rejected':
// 			return 'destructive';
// 		default:
// 			return 'outline';
// 	}
// };

export default function TransactionsPage() {
	// TODO: Add state/logic for handling approvals/rejections

	// State for TransactionHistoryTable
	const [, setIsLoading] = useState(false); // Example state
	const [, setLoadingButton] = useState<'previous' | 'next' | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortColumn, setSortColumn] = useState<SortableTransactionKeys | null>('date');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

	// Process placeholderHistory to match Transaction[] type for the table
	// This is a simplified mapping; ensure all fields match the Transaction type
	const processedHistory = useMemo(
		() =>
			placeholderHistory.map((item) => ({
				...item,
				// Ensure date is a string that can be parsed by `new Date()` in the child, or parse here
				// For simplicity, assuming date strings are fine for now if child handles parsing.
				// If child expects Date objects, parse here: date: new Date(item.date),
				method: item.method as TransactionsPaymentMethod | undefined, // Cast method if it exists
				type: item.type as TransactionsType, // Cast type
				status: item.status as TransactionStatus, // Cast status
			})),
		[]
	);

	// Memoized and Processed Data for TransactionHistoryTable
	const sortedData = useMemo(() => {
		const data = [...processedHistory]; // Use processedHistory
		if (sortColumn) {
			data.sort((a, b) => {
				let valA = a[sortColumn];
				let valB = b[sortColumn];

				if (sortColumn === 'date') {
					// Ensure date comparison is robust if dates are strings
					valA = new Date(valA as string).getTime();
					valB = new Date(valB as string).getTime();
				} else if (sortColumn === 'amount') {
					// Ensure amount is treated as number
					valA = Number(valA);
					valB = Number(valB);
				}

				let comparison = 0;
				if (valA > valB) comparison = 1;
				else if (valA < valB) comparison = -1;
				return sortDirection === 'desc' ? comparison * -1 : comparison;
			});
		}
		return data;
	}, [processedHistory, sortColumn, sortDirection]);

	const totalCount = sortedData.length;
	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	const _paginatedTransactions = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		const end = start + ITEMS_PER_PAGE;
		return sortedData.slice(start, end);
	}, [sortedData, currentPage]);

	const _handlePageChange = (page: number) => {
		if (page < 1 || page > totalPages) return;
		setLoadingButton(page > currentPage ? 'next' : 'previous');
		setIsLoading(true);
		setCurrentPage(page);
		// Simulate data fetching delay for pagination
		setTimeout(() => {
			setIsLoading(false);
			setLoadingButton(null);
		}, 300);
	};

	const _handleSort = (column: SortableTransactionKeys) => {
		if (sortColumn === column) {
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
		setCurrentPage(1); // Reset to first page on sort
	};

	return (
		<div className="space-y-4">
			<Breadcrumbs />
			<h1 className="text-2xl font-semibold mt-2">Transactions</h1>
			<Tabs defaultValue="pending" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="pending">Pending Approvals ({placeholderPending.length})</TabsTrigger>
					<TabsTrigger value="history">Transaction History</TabsTrigger>
					<TabsTrigger value="ledger">Open Ledger</TabsTrigger>
				</TabsList>

				<TabsContent value="pending">
					<div className="rounded-md border mt-4">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Method</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Submitted</TableHead>
									<TableHead>
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{placeholderPending.length > 0 ? (
									placeholderPending.map((tx) => (
										<TableRow key={tx.id}>
											<TableCell className="font-medium">
												{tx.userName} ({tx.userId})
											</TableCell>
											<TableCell>{tx.type}</TableCell>
											<TableCell>{tx.method}</TableCell>
											<TableCell>
												{tx.amount.toLocaleString()} {tx.currency}
											</TableCell>
											<TableCell>{tx.submittedDate}</TableCell>
											<TableCell>
												<Button variant="outline" size="sm">
													Review
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className="h-24 text-center">
											No pending transactions.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
					{/* TODO: Add Pagination if needed */}
				</TabsContent>

				<TabsContent value="history">
					<div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2 mt-4 mb-4">
						<div className="relative w-full md:w-1/3">
							<Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
							<Input type="search" placeholder="Search transactions..." className="pl-8 w-full" />
						</div>
						<div className="flex items-center space-x-2 w-full md:w-auto">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<Select>
								<SelectTrigger className="w-full md:w-[180px]">
									<SelectValue placeholder="Filter by Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="rejected">Rejected</SelectItem>
									<SelectItem value="processing">Processing</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					{/* <TransactionHistoryTable
						transactions={paginatedTransactions}
						isLoading={isLoading}
						currentPage={currentPage}
						totalPages={totalPages}
						totalCount={totalCount}
						onPageChange={handlePageChange}
						sortColumn={sortColumn}
						sortDirection={sortDirection}
						onSort={handleSort}
						loadingButton={loadingButton}
					/> */}
					{/* TODO: Add Pagination if needed (now handled by table) */}
				</TabsContent>

				<TabsContent value="ledger">
					<div className="rounded-md border mt-4 p-4">
						<h2 className="text-lg font-semibold mb-2">Open Ledger View</h2>
						<p className="text-muted-foreground">This section will display the public ledger data, likely filterable by category.</p>
						{/* TODO: Implement Ledger viewing component/table */}
						<div className="mt-4 h-48 flex items-center justify-center bg-muted rounded-md">Ledger Placeholder</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
