'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { ArrowDown, ArrowUp, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, Search as _SearchIcon, Filter as FilterIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 10;

type AccountTransactionStatus = 'Completed' | 'Pending';
// Assuming types are dynamic strings from data, we can collect them or predefine common ones
const _ALL_TRANSACTION_TYPES = ['Referral Bonus', 'Withdrawal', 'Shares#01 Maturity', 'Deposit'] as const;
type AccountTransactionType = (typeof _ALL_TRANSACTION_TYPES)[number];

interface RawTransaction {
	id: string;
	type: string;
	timestamp: string;
	amount: string;
	isCredit: boolean;
	completed: boolean;
}

export interface AccountTransaction {
	id: string;
	type: AccountTransactionType | string;
	date: Date;
	parsedAmount: number;
	currency: string;
	isCredit: boolean;
	status: AccountTransactionStatus;
	originalType: string;
}

type SortableAccountTransactionKeys = 'date' | 'type' | 'parsedAmount' | 'status';

const parseTimestamp = (timestamp: string): Date => {
	const parts = timestamp.match(/(\d{2}):(\d{2}):(\d{2})\s(\d{2})\/(\d{2})\/(\d{4})/);
	if (!parts) return new Date();
	return new Date(parseInt(parts[6]), parseInt(parts[5]) - 1, parseInt(parts[4]), parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]));
};

const parseAmountString = (amountStr: string): { amount: number; currency: string } => {
	const match = amountStr.match(/([\d,.]+)\s*([A-Z]+)/);
	if (match) {
		const amount = parseFloat(match[1].replace(/,/g, ''));
		const currency = match[2];
		return { amount, currency };
	}
	return { amount: 0, currency: 'N/A' };
};

const getDayWithOrdinal = (day: number): string => {
	if (day > 3 && day < 21) return `${day}th`;
	switch (day % 10) {
		case 1:
			return `${day}st`;
		case 2:
			return `${day}nd`;
		case 3:
			return `${day}rd`;
		default:
			return `${day}th`;
	}
};

const formatTransactionDate = (date: Date): string => {
	const month = date.toLocaleDateString('en-US', { month: 'short' });
	const day = getDayWithOrdinal(date.getDate());
	const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
	return `${month} ${day}, ${time}`;
};

const mockRawTransactionsData: RawTransaction[] = [
	// { id: '1', type: 'Referral Bonus', timestamp: '08:58:52 05/03/2025', amount: '500.00 NGN', completed: false, isCredit: true },
	// { id: '2', type: 'Withdrawal', timestamp: '13:41:22 02/03/2025', amount: '15,000.00 NGN', completed: true, isCredit: false },
	// { id: '3', type: 'Withdrawal', timestamp: '08:29:53 01/03/2025', amount: '5,000.00 NGN', completed: true, isCredit: false },
	// { id: '4', type: 'Shares#01 Maturity', timestamp: '10:00:00 15/02/2025', amount: '20,000.00 NGN', completed: true, isCredit: true },
	// { id: '5', type: 'Deposit', timestamp: '16:20:11 10/02/2025', amount: '10,000.00 NGN', completed: true, isCredit: true },
	// { id: '6', type: 'Deposit', timestamp: '10:15:30 08/02/2025', amount: '2,500.00 NGN', completed: true, isCredit: true },
	// { id: '7', type: 'Withdrawal', timestamp: '14:55:10 05/02/2025', amount: '1,000.00 NGN', completed: true, isCredit: false },
	// { id: '8', type: 'Referral Bonus', timestamp: '09:30:00 01/02/2025', amount: '250.00 NGN', completed: true, isCredit: true },
	// { id: '9', type: 'Deposit', timestamp: '11:00:00 20/01/2025', amount: '300.00 USD', completed: true, isCredit: true },
	// { id: '10', type: 'Withdrawal', timestamp: '12:00:00 18/01/2025', amount: '100.00 USD', completed: false, isCredit: false },
	// { id: '11', type: 'Referral Bonus', timestamp: '13:00:00 15/01/2025', amount: '50.00 NGN', completed: true, isCredit: true },
	// { id: '12', type: 'Shares#01 Maturity', timestamp: '14:00:00 10/01/2025', amount: '1000.00 NGN', completed: true, isCredit: true },
	// { id: '13', type: 'Deposit', timestamp: '15:00:00 05/01/2025', amount: '5000.00 NGN', completed: false, isCredit: true },
	// { id: '14', type: 'Withdrawal', timestamp: '16:00:00 02/01/2025', amount: '200.00 NGN', completed: true, isCredit: false },
];

const masterProcessedTransactions: AccountTransaction[] = mockRawTransactionsData.map((t) => {
	const { amount, currency } = parseAmountString(t.amount);
	return {
		id: t.id,
		type: t.type as AccountTransactionType | string,
		originalType: t.type,
		date: parseTimestamp(t.timestamp),
		parsedAmount: amount,
		currency: currency,
		isCredit: t.isCredit,
		status: t.completed ? 'Completed' : 'Pending',
	};
});

export default function AccountTransactionsPageContent() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [loadingButton, setLoadingButton] = useState<'previous' | 'next' | null>(null);
	const [showFilters, setShowFilters] = useState(false);

	// const [searchTerm, setSearchTerm] = useState('');
	const [filterStatus, setFilterStatus] = useState<AccountTransactionStatus | 'all'>('all');
	const [filterType, setFilterType] = useState<AccountTransactionType | 'all' | string>('all');
	const [filterStartDate, setFilterStartDate] = useState<string>('');
	const [filterEndDate, setFilterEndDate] = useState<string>('');
	const [filterMinAmount, setFilterMinAmount] = useState<string>('');
	const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');

	const [sortColumn, setSortColumn] = useState<SortableAccountTransactionKeys | null>('date');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

	const [currentPage, setCurrentPage] = useState(1);

	const filteredData = useMemo(() => {
		setIsLoading(true);
		let data = [...masterProcessedTransactions];

		// if (searchTerm) {
		// 	data = data.filter((tx) => tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || tx.originalType.toLowerCase().includes(searchTerm.toLowerCase()));
		// }
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
			data = data.filter((tx) => tx.parsedAmount >= minAmount);
		}
		if (!isNaN(maxAmount)) {
			data = data.filter((tx) => tx.parsedAmount <= maxAmount);
		}

		setTimeout(() => setIsLoading(false), 300);
		return data;
	}, [
		// searchTerm,
		filterStatus,
		filterType,
		filterStartDate,
		filterEndDate,
		filterMinAmount,
		filterMaxAmount,
	]);

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

	const totalCount = sortedData.length;
	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	const paginatedTransactions = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		const end = start + ITEMS_PER_PAGE;
		return sortedData.slice(start, end);
	}, [sortedData, currentPage]);

	// Effect to reset page on filter change
	useEffect(() => {
		setCurrentPage(1);
	}, [
		// searchTerm,
		filterStatus,
		filterType,
		filterStartDate,
		filterEndDate,
		filterMinAmount,
		filterMaxAmount,
	]);

	// Effect to clear loading button state
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
		// setSearchTerm('');
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

	const SortableHeader = ({ columnKey, label, className }: { columnKey: SortableAccountTransactionKeys; label: string; className: string }) => (
		<TableHead onClick={() => handleSort(columnKey)} className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors ${className}`}>
			<div className="flex items-center py-2">
				{/* Adjusted padding for account style */}
				{label}
				{sortColumn === columnKey && <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />}
				{sortColumn !== columnKey && <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />}
			</div>
		</TableHead>
	);

	// Collect unique transaction types from data for filter dropdown
	const uniqueTransactionTypes = useMemo(() => {
		const types = new Set(masterProcessedTransactions.map((tx) => tx.originalType));
		return Array.from(types).sort();
	}, []);

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
						{/* Adjusted grid columns for responsiveness */}
						{/* <div className="space-y-1">
                            <Label htmlFor="search-transactions">Search</Label>
                            <Input id="search-transactions" placeholder="Search by ID, type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
                        </div> */}
						<div className="space-y-1">
							<Label htmlFor="filter-status">Status</Label>
							<Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as AccountTransactionStatus | 'all')}>
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
							<Select value={filterType} onValueChange={(value) => setFilterType(value as AccountTransactionType | 'all' | string)}>
								<SelectTrigger id="filter-type" className="w-full">
									<SelectValue placeholder="Filter by Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									{uniqueTransactionTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
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
							{/* Full width on mobile, auto on sm+, specific col start for lg to align right */}
							Reset Filters
						</Button>
					</div>
				</div>
			)}

			<div className="rounded-lg border border-slate-200 dark:border-slate-700">
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
						{isLoading && paginatedTransactions.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="h-36 text-center">
									<Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-500 dark:text-slate-400" />
								</TableCell>
							</TableRow>
						) : paginatedTransactions.length > 0 ? (
							paginatedTransactions.map((transaction) => (
								<TableRow
									key={transaction.id}
									className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
									onClick={() => {
										NProgress.start();
										router.push(`/account/wallet/transactions/${transaction.id}`);
									}}
								>
									<TableCell className="py-3">
										{/* Reduced padding */}
										{transaction.status === 'Pending' ? (
											<div className="flex justify-center items-center h-full p-3">
												<Loader2 className="h-5 w-5 animate-spin text-slate-400" />
											</div>
										) : transaction.isCredit ? (
											<div className="bg-[var(--success)] rounded-full p-3">
												<ArrowDown className="h-6 w-6 text-[var(--success-foreground)]" />
											</div>
										) : (
											<div className="bg-[var(--danger)] rounded-full p-3">
												<ArrowUp className="h-6 w-6 text-[var(--danger-foreground)]" />
											</div>
										)}
									</TableCell>
									<TableCell className="py-3 hidden sm:table-cell">
										<div className="text-sm font-medium text-foreground">{formatTransactionDate(transaction.date)}</div>
									</TableCell>
									<TableCell className="py-3 text-sm text-foreground ">
										<span className="block max-w-[100px] sm:max-w-none">{transaction.originalType}</span>
										<div className="text-xs font-medium text-foreground sm:hidden">{formatTransactionDate(transaction.date)}</div>
									</TableCell>
									{/* Reduced padding */}
									<TableCell className="py-3 hidden sm:table-cell">
										<Badge
											variant={transaction.status === 'Completed' ? 'default' : 'secondary'}
											className={`text-xs ${transaction.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300'}`}
										>
											{transaction.status}
										</Badge>
									</TableCell>
									<TableCell className={`py-3 text-base font-semibold text-right ${transaction.isCredit ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
										{/* Reduced padding */}
										{transaction.parsedAmount.toLocaleString(undefined, { style: 'currency', currency: transaction.currency, minimumFractionDigits: 2 })}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="h-36 text-center text-muted-foreground">
									{/* Adjusted colSpan */}
									No transactions found matching your criteria.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{totalPages > 0 && ( // Show even if only one page, but no transactions found message handles empty state
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
