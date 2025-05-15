'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, Loader2 } from 'lucide-react';
import { SortableTransactionKeys, TransactionHistoryTableProps, TransactionStatus } from '@/types';

const getTransactionStatusVariant = (status: TransactionStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
	switch (status) {
		case 'Completed':
			return 'default';
		case 'Pending':
			return 'secondary';
		case 'Processing':
			return 'outline';
		case 'Rejected':
			return 'destructive';
		default:
			return 'outline';
	}
};

export function TransactionHistoryTable({ transactions, isLoading, currentPage, totalPages, totalCount, onPageChange, sortColumn, sortDirection, onSort, loadingButton }: TransactionHistoryTableProps) {
	const handleViewDetails = (transactionId: string) => {
		alert(`Viewing details for ${transactionId}`);
		// TODO: Replace alert with actual detail viewing logic (e.g., open modal or navigate)
	};

	const SortableHeader = ({ columnKey, label }: { columnKey: SortableTransactionKeys; label: string }) => (
		<TableHead onClick={() => onSort(columnKey)} className="cursor-pointer hover:bg-muted/50 transition-colors">
			<div className="flex items-center">
				{label}
				{sortColumn === columnKey && <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />}
				{sortColumn !== columnKey && <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />}
			</div>
		</TableHead>
	);

	return (
		<>
			<div className="rounded-md border mt-4">
				<Table>
					<TableHeader>
						<TableRow>
							<SortableHeader columnKey="date" label="Date" />
							<SortableHeader columnKey="userName" label="User" />
							<SortableHeader columnKey="type" label="Type" />
							<SortableHeader columnKey="amount" label="Amount" />
							<SortableHeader columnKey="status" label="Status" />
							<TableHead>Details</TableHead>
							<TableHead>
								<span className="sr-only">Actions</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && transactions.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
								</TableCell>
							</TableRow>
						) : transactions.length > 0 ? (
							transactions.map((tx) => (
								<TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
									<TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
									<TableCell className="font-medium">
										{tx.userName} ({tx.userId})
									</TableCell>
									<TableCell>
										{tx.type} {tx.method ? `(${tx.method})` : ''}
									</TableCell>
									<TableCell className="text-right">
										{' '}
										{tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</TableCell>
									<TableCell>
										<Badge variant={getTransactionStatusVariant(tx.status)}>{tx.status}</Badge>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={tx.details}>
										{tx.details || '-'}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem onClick={() => handleViewDetails(tx.id)}>View Details</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									No transaction history found matching your criteria.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-between space-x-2 py-4 px-2">
					<div className="text-sm text-muted-foreground">
						Page {currentPage} of {totalPages} ({totalCount} transactions total)
					</div>
					<div className="space-x-2 flex items-center">
						<Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="cursor-pointer">
							{isLoading && loadingButton === 'previous' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4 mr-1" />}
							Previous
						</Button>
						<Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="cursor-pointer">
							Next
							{isLoading && loadingButton === 'next' ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4 ml-1" />}
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
