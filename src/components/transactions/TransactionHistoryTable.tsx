// 'use client';

// import React, { useState, useMemo } from 'react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card } from '@/components/ui/card'; // Added Card import
// import { ArrowUpDown, Search } from 'lucide-react';
// import { Transaction, TransactionHistoryTableProps } from '@/types';
// import { getStatusBadgeVariant } from '@/lib/helpers';

// const ITEMS_PER_PAGE = 15;

// const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({ transactions, showMyTransactionsToggle = false, currentUserId }) => {
// 	const [searchTerm, setSearchTerm] = useState('');
// 	const [filterType, setFilterType] = useState<string>('all');
// 	// const [filterDateRange, setFilterDateRange] = useState<{ from?: Date; to?: Date }>({}); // For date range filter
// 	const [showOnlyMyTransactions, setShowOnlyMyTransactions] = useState(false);
// 	const [currentPage, setCurrentPage] = useState(1);
// 	const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'ascending' | 'descending' } | null>(null);

// 	const formatDate = (dateString: string) => {
// 		return new Date(dateString).toLocaleString(undefined, {
// 			year: 'numeric',
// 			month: 'short',
// 			day: 'numeric',
// 			hour: '2-digit',
// 			minute: '2-digit',
// 		});
// 	};

// 	const filteredTransactions = useMemo(() => {
// 		let filtered = transactions;

// 		if (showMyTransactionsToggle && showOnlyMyTransactions && currentUserId) {
// 			// This is a placeholder for actual user ID matching.
// 			// In a real app, maskedInvestorId might need a different way to be linked to currentUserId
// 			// or the backend would provide a flag for "isCurrentUserTransaction"
// 			filtered = filtered.filter((tx) => tx.maskedInvestorId.includes(currentUserId.slice(-4))); // Example matching
// 		}

// 		if (searchTerm) {
// 			filtered = filtered.filter((tx) => tx.maskedInvestorId.toLowerCase().includes(searchTerm.toLowerCase()));
// 		}

// 		if (filterType !== 'all') {
// 			filtered = filtered.filter((tx) => tx.type === filterType);
// 		}

// 		// TODO: Implement date range filtering

// 		return filtered;
// 	}, [transactions, searchTerm, filterType, showOnlyMyTransactions, currentUserId, showMyTransactionsToggle]);

// 	const sortedTransactions = useMemo(() => {
// 		const sortableItems = [...filteredTransactions];
// 		if (sortConfig !== null) {
// 			sortableItems.sort((a, b) => {
// 				const valA = a[sortConfig.key] ?? '';
// 				const valB = b[sortConfig.key] ?? '';
// 				if (valA < valB) {
// 					return sortConfig.direction === 'ascending' ? -1 : 1;
// 				}
// 				if (valA > valB) {
// 					return sortConfig.direction === 'ascending' ? 1 : -1;
// 				}
// 				return 0;
// 			});
// 		}
// 		return sortableItems;
// 	}, [filteredTransactions, sortConfig]);

// 	const paginatedTransactions = useMemo(() => {
// 		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
// 		return sortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
// 	}, [sortedTransactions, currentPage]);

// 	const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);

// 	const requestSort = (key: keyof Transaction) => {
// 		let direction: 'ascending' | 'descending' = 'ascending';
// 		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
// 			direction = 'descending';
// 		}
// 		setSortConfig({ key, direction });
// 	};

// 	const getSortIndicator = (key: keyof Transaction) => {
// 		if (!sortConfig || sortConfig.key !== key) {
// 			return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
// 		}
// 		return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
// 	};

// 	return (
// 		<div className="space-y-4">
// 			<div className="flex flex-col md:flex-row gap-4 justify-between">
// 				<div className="relative w-full md:max-w-sm">
// 					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// 					<Input
// 						type="search"
// 						placeholder="Search by Masked Investor ID..."
// 						value={searchTerm}
// 						onChange={(e) => {
// 							setSearchTerm(e.target.value);
// 							setCurrentPage(1);
// 						}}
// 						className="pl-8 w-full"
// 					/>
// 				</div>
// 				<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
// 					<Select
// 						value={filterType}
// 						onValueChange={(value) => {
// 							setFilterType(value);
// 							setCurrentPage(1);
// 						}}
// 					>
// 						<SelectTrigger className="w-full sm:w-[180px]">
// 							<SelectValue placeholder="Filter by Type" />
// 						</SelectTrigger>
// 						<SelectContent>
// 							<SelectItem value="all">All Types</SelectItem>
// 							<SelectItem value="Deposit">Deposit</SelectItem>
// 							<SelectItem value="Withdrawal">Withdrawal</SelectItem>
// 							<SelectItem value="Profit Share">Profit Share</SelectItem>
// 							{/* Add other types dynamically if needed */}
// 						</SelectContent>
// 					</Select>
// 					{/* Placeholder for Date Range Filter */}
// 					<Button variant="outline" className="w-full sm:w-auto">
// 						Date Range
// 					</Button>
// 				</div>
// 			</div>

// 			{showMyTransactionsToggle && (
// 				<div className="flex items-center space-x-2">
// 					<input
// 						type="checkbox"
// 						id="myTransactionsToggle"
// 						checked={showOnlyMyTransactions}
// 						onChange={(e) => {
// 							setShowOnlyMyTransactions(e.target.checked);
// 							setCurrentPage(1);
// 						}}
// 						disabled={!currentUserId}
// 						className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
// 					/>
// 					<label htmlFor="myTransactionsToggle" className="text-sm text-muted-foreground">
// 						View My Transactions Only
// 					</label>
// 					{!currentUserId && (
// 						<Badge variant="outline" className="text-xs">
// 							Login to enable
// 						</Badge>
// 					)}
// 				</div>
// 			)}

// 			<Card>
// 				<Table>
// 					<TableHeader>
// 						<TableRow>
// 							<TableHead onClick={() => requestSort('timestamp')} className="cursor-pointer hover:bg-muted/50">
// 								Timestamp {getSortIndicator('timestamp')}
// 							</TableHead>
// 							<TableHead onClick={() => requestSort('maskedInvestorId')} className="cursor-pointer hover:bg-muted/50">
// 								Investor ID {getSortIndicator('maskedInvestorId')}
// 							</TableHead>
// 							<TableHead onClick={() => requestSort('type')} className="cursor-pointer hover:bg-muted/50">
// 								Type {getSortIndicator('type')}
// 							</TableHead>
// 							<TableHead onClick={() => requestSort('amount')} className="text-right cursor-pointer hover:bg-muted/50">
// 								Amount {getSortIndicator('amount')}
// 							</TableHead>
// 							<TableHead onClick={() => requestSort('status')} className="cursor-pointer hover:bg-muted/50">
// 								Status {getSortIndicator('status')}
// 							</TableHead>
// 						</TableRow>
// 					</TableHeader>
// 					<TableBody>
// 						{paginatedTransactions.length > 0 ? (
// 							paginatedTransactions.map((tx) => (
// 								<TableRow key={tx.id}>
// 									<TableCell>{formatDate(tx.timestamp)}</TableCell>
// 									<TableCell>{tx.maskedInvestorId}</TableCell>
// 									<TableCell>{tx.type}</TableCell>
// 									<TableCell className="text-right">
// 										{tx.usdValue !== undefined ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.usdValue) : `${new Intl.NumberFormat('en-US').format(tx.amount)} ${tx.currency}`}
// 										{tx.usdValue !== undefined && (
// 											<div className="text-xs text-muted-foreground">
// 												({new Intl.NumberFormat('en-US').format(tx.amount)} {tx.currency})
// 											</div>
// 										)}
// 									</TableCell>
// 									<TableCell>
// 										<Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
// 									</TableCell>
// 								</TableRow>
// 							))
// 						) : (
// 							<TableRow>
// 								<TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
// 									No transactions found.
// 								</TableCell>
// 							</TableRow>
// 						)}
// 					</TableBody>
// 				</Table>
// 			</Card>

// 			{totalPages > 1 && (
// 				<div className="flex items-center justify-between pt-4">
// 					<Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
// 						Previous
// 					</Button>
// 					<span className="text-sm text-muted-foreground">
// 						Page {currentPage} of {totalPages}
// 					</span>
// 					<Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
// 						Next
// 					</Button>
// 				</div>
// 			)}
// 			{/* Optional: Export Ledger Button */}
// 			{/* <div className="mt-4 text-right">
//         <Button variant="outline">Export Ledger (CSV/PDF)</Button>
//       </div> */}
// 		</div>
// 	);
// };

// export default TransactionHistoryTable;
