// src/components/admin/TransactionHistoryTable.tsx
'use client'; // Mark this as a Client Component

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

// Reuse the type definition (consider moving types to a shared file later)
type TransactionHistory = {
	id: string;
	userId: string;
	userName: string;
	type: 'Deposit' | 'Withdrawal' | 'Fee' | 'Investment' | 'Referral Bonus';
	method?: 'Bank Transfer' | 'Crypto' | 'Platform';
	amount: number;
	currency: string;
	date: string;
	status: 'Completed' | 'Pending' | 'Rejected' | 'Processing';
	details?: string;
};

// Helper for status badges (copied from page.tsx)
const getTransactionStatusVariant = (status: TransactionHistory['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
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

interface TransactionHistoryTableProps {
	transactions: TransactionHistory[];
}

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
	// Define the handler inside the Client Component
	const handleViewDetails = (transactionId: string) => {
		alert(`Viewing details for ${transactionId}`);
		// TODO: Replace alert with actual detail viewing logic (e.g., open modal)
	};

	return (
		<div className="rounded-md border mt-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Date</TableHead>
						<TableHead>User</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Amount</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Details</TableHead>
						<TableHead>
							<span className="sr-only">Actions</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{transactions.length > 0 ? (
						transactions.map((tx) => (
							<TableRow key={tx.id}>
								<TableCell>{tx.date}</TableCell>
								<TableCell className="font-medium">
									{tx.userName} ({tx.userId})
								</TableCell>
								<TableCell>
									{tx.type} {tx.method ? `(${tx.method})` : ''}
								</TableCell>
								<TableCell>
									{tx.amount.toLocaleString()} {tx.currency}
								</TableCell>
								<TableCell>
									<Badge variant={getTransactionStatusVariant(tx.status)}>{tx.status}</Badge>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={tx.details}>
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
											{/* Call the handler defined within this component */}
											<DropdownMenuItem onClick={() => handleViewDetails(tx.id)}>View Details</DropdownMenuItem>
											{/* Add other relevant actions if any */}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={7} className="h-24 text-center">
								No transaction history found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
