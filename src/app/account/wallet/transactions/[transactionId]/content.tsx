'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTransactionDate, getTransactionTypeLabel } from '@/lib/helpers';
import { Transaction } from '@/types';

export default function TransactionDetailsPageContent() {
	const params = useParams();
	const transactionId = params.transactionId as string;

	const [transaction, setTransaction] = useState<Transaction | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [P2PContent, setP2PContent] = useState<React.ComponentType<any> | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);
		fetch(`/api/transactions/${transactionId}`)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to fetch transaction');
				return res.json();
			})
			.then(({ data }) => {
				console.log(data);

				setTransaction(data);
			})
			.catch((_err) => {
				setError('Could not load transaction.');
			})
			.finally(() => setLoading(false));
	}, [transactionId]);

	useEffect(() => {
		const isP2P = transaction?.payment_method === 'p2p' || (transaction?.details && transaction.details.type === 'p2p');
		if (isP2P) {
			import('./p2p-content').then((module) => setP2PContent(() => module.default)).catch((error) => console.error('Failed to load P2PContent', error));
		}
	}, [transaction]);

	if (loading) {
		return (
			<div className="max-w-2xl space-y-8">
				<Card className="bg-background border-0 shadow-none">
					<CardHeader className="px-0">
						<CardTitle className="sub-page-heading">Transaction Details</CardTitle>
					</CardHeader>
					<CardContent className="px-0">
						<Skeleton className="h-8 w-1/2 mb-4" />
						<Skeleton className="h-6 w-1/3 mb-2" />
						<Skeleton className="h-6 w-1/4 mb-2" />
						<Skeleton className="h-6 w-1/2 mb-2" />
						<Skeleton className="h-6 w-1/3 mb-2" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !transaction) {
		return (
			<div className="max-w-2xl space-y-8">
				<Card className="bg-background border-0 shadow-none">
					<CardHeader className="px-0">
						<CardTitle className="sub-page-heading">Transaction Details</CardTitle>
					</CardHeader>
					<CardContent className="px-0">
						<p className="text-muted-foreground">{error || 'Transaction not found.'}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (transaction?.payment_method === 'p2p' || (transaction?.details && transaction.details.type === 'p2p')) {
		if (!P2PContent) {
			return <div>Loading P2P Content...</div>;
		}
		return <P2PContent transaction={transaction} />;
	}

	// Non-P2P Transaction Details
	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Transaction Details</CardTitle>
				</CardHeader>
				<CardContent className="px-0 space-y-4">
					<div className="flex flex-row justify-between items-center gap-4">
						<span className="font-mono text-sm bg-muted text-muted-foreground px-2 py-1 rounded">ID: {transaction.id}</span>
						<span className={`px-3 py-1.5 rounded-md text-lg font-mono font-semibold shadow-sm ${transaction.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300'}`}>
							{transaction.status?.toUpperCase()}
						</span>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<p className="text-muted-foreground text-xs mb-1">Type</p>
							<p className="font-medium">{getTransactionTypeLabel(transaction.type)}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs mb-1">Amount</p>
							<p className="font-semibold text-lg">{transaction.amount?.toLocaleString(undefined, { style: 'currency', currency: transaction.currency || 'NGN', minimumFractionDigits: 2 })}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs mb-1">Currency</p>
							<p className="font-medium">{transaction.currency}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs mb-1">Created At</p>
							<p className="font-medium">{formatTransactionDate(new Date(transaction.created_at))}</p>
						</div>
						{transaction.updated_at && (
							<div>
								<p className="text-muted-foreground text-xs mb-1">Updated At</p>
								<p className="font-medium">{formatTransactionDate(new Date(transaction.updated_at))}</p>
							</div>
						)}
						{transaction.payment_method && (
							<div>
								<p className="text-muted-foreground text-xs mb-1">Payment Method</p>
								<p className="font-medium">{transaction.payment_method.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
							</div>
						)}
						{transaction.description && (
							<div className="sm:col-span-2">
								<p className="text-muted-foreground text-xs mb-1">Description</p>
								<p className="font-medium text-sm">{transaction.description}</p>
							</div>
						)}
						{transaction.related_transaction_id && (
							<div>
								<p className="text-muted-foreground text-xs mb-1">Related Transaction</p>
								<p className="font-mono text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{transaction.related_transaction_id}</p>
							</div>
						)}
						{transaction.is_instant !== undefined && !transaction.is_instant && transaction.duration_seconds && (
							<div>
								<p className="text-muted-foreground text-xs mb-1">Duration</p>
								<p className="font-medium">{transaction.duration_seconds} seconds</p>
							</div>
						)}
						{transaction.is_instant !== undefined && (
							<div>
								<p className="text-muted-foreground text-xs mb-1">Instant?</p>
								<p className="font-medium">{transaction.is_instant ? 'Yes' : 'No'}</p>
							</div>
						)}
						{/* Render extra details if present */}
						{transaction.details && Object.keys(transaction.details).length > 0 && (
							<div className="sm:col-span-2">
								<p className="text-muted-foreground text-xs mb-1">Details</p>
								<pre className="bg-muted text-xs rounded p-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(transaction.details, null, 2)}</pre>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
