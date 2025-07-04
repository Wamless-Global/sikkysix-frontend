'use client';

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUp, BanknoteArrowDown, BanknoteArrowUp, Loader2, X, RefreshCcw, DollarSign } from 'lucide-react';
import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/button';
import { formatDate, getTransactionTypeLabel, handleFetchErrorMessage, formatBaseurrency, positiveTransactionTypes, getBaseCurrencyRate, formatCurrency } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiTransaction } from '@/types';
import { cn } from '@/lib/utils';
import { fetchCurrentUserBalance } from '@/lib/userUtils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

function TransactionSkeletonList({ count = 3 }: { count?: number }) {
	return (
		<div className="space-y-2 md:space-y-5">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
					<div className="flex items-center gap-3">
						<Skeleton className="rounded-full p-3 w-12 h-12" />
						<div>
							<Skeleton className="h-4 w-24 mb-2" />
							<Skeleton className="h-3 w-16" />
						</div>
					</div>
					<Skeleton className="h-5 w-16" />
				</div>
			))}
		</div>
	);
}

export default function WalletPageContent() {
	const LIMIT = 3;

	const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalCount, setTotalCount] = useState(0);
	const [balance, setBalance] = useState<number | null>(null);
	const [isBalanceLoading, setIsBalanceLoading] = useState(true);
	const [showFiat, setShowFiat] = useState(false);

	useEffect(() => {
		setIsBalanceLoading(true);
		fetchCurrentUserBalance()
			.then((bal) => {
				if (typeof bal === 'number') setBalance(bal);
				else setBalance(0);
			})
			.catch((err) => {
				handleFetchErrorMessage(err);
				setBalance(0);
			})
			.finally(() => setIsBalanceLoading(false));
	}, []);

	useEffect(() => {
		setIsLoading(true);
		fetchWithAuth(`/api/transactions?page=1&pageSize=${LIMIT}`)
			.then((res) => res.json())
			.then((data) => {
				setTransactions(data.data.transactions || []);
				setTotalCount(data.data.totalCount || 0);
			})
			.catch(() => {
				setTransactions([]);
				setTotalCount(0);
			})
			.finally(() => setIsLoading(false));
	}, []);

	const hasTransactions = transactions.length > 0;

	return (
		<div className="space-y-12">
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2 overflow-hidden">
				<CardContent className="p-1 px-6 md:p-6 flex justify-center items-center relative">
					<button
						type="button"
						className="absolute top-0 left-2 p-1 rounded-full bg-background/30 hover:bg-background/60 border border-border transition items-center justify-center z-10 hidden sm:block cursor-pointer"
						onClick={() => setShowFiat((prev) => !prev)}
						aria-label="Toggle balance display"
					>
						{showFiat ? <DollarSign className="h-4 w-4 text-foreground" /> : <RefreshCcw className="h-4 w-4 text-foreground" />}
					</button>

					<button
						type="button"
						className="absolute -top-4 left-2 p-1 rounded-full bg-background/30 hover:bg-background/60 border border-border transition flex items-center justify-center z-10 sm:hidden cursor-pointer"
						onClick={() => setShowFiat((prev) => !prev)}
						aria-label="Toggle balance display"
					>
						{showFiat ? <DollarSign className="h-3 w-3 text-foreground" /> : <RefreshCcw className="h-3 w-3 text-foreground" />}
					</button>

					<div className="flex items-center flex-col">
						<p className="text-sm opacity-80 mb-1">Available Balance</p>
						<div className="flex items-center gap-2">
							{isBalanceLoading ? (
								<Skeleton className="h-10 w-40 rounded-md bg-background/40" />
							) : showFiat ? (
								<p className="amount-heading-extra-large">{formatCurrency((balance ?? 0) / getBaseCurrencyRate())}</p>
							) : (
								<p className="amount-heading-extra-large">{formatBaseurrency(balance ?? 0)}</p>
							)}
						</div>
					</div>
					<div className="opacity-80 dark:opacity-70 absolute right-0">
						<Image src="/images/wallet.png" alt="Wallet Graphic" width={80} height={50} className="hidden sm:block" />
						<Image src="/images/wallet.png" alt="Wallet Graphic" width={60} height={40} className="sm:hidden" />
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-center gap-8 md:gap-12">
				<CustomLink href={'/account/wallet/deposit'} className="flex flex-col items-center gap-2 cursor-pointer group">
					<div className="bg-[var(--dashboard-accent)] rounded-full p-3 md:p-4 group-hover:opacity-80 transition-opacity">
						<BanknoteArrowDown className="h-6 w-6 md:h-10 md:w-10 text-[var(--success-foreground)]" />
					</div>
					<span className="text-sm font-medium text-foreground">Deposit</span>
				</CustomLink>
				<CustomLink href={'/account/wallet/withdraw'} className="flex flex-col items-center gap-2 cursor-pointer group">
					<div className="bg-[var(--dashboard-accent)] rounded-full p-3 md:p-4 group-hover:opacity-80 transition-opacity">
						<BanknoteArrowUp className="h-6 w-6 md:h-10 md:w-10 text-[var(--success-foreground)]" />
					</div>
					<span className="text-sm font-medium text-foreground">Withdraw</span>
				</CustomLink>
			</div>
			<div className="sm:mt-20">
				<h2 className="text-lg font-semibold text-foreground my-4 text-center">All Contribution & Savings History</h2>
				{isLoading ? (
					<TransactionSkeletonList count={LIMIT} />
				) : hasTransactions ? (
					<div className="space-y-2 md:space-y-5">
						{transactions.slice(0, LIMIT).map((transaction) => (
							<CustomLink href={`/account/wallet/transactions/${transaction.id}`} key={transaction.id} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-background/100">
								<div className="flex items-center gap-3">
									{transaction.status === 'pending' ? (
										<div className="flex justify-center items-center h-full p-3">
											<Loader2 className="h-4 w-4 animate-spin text-slate-400" />
										</div>
									) : (
										<div
											className={`rounded-full p-3 ${
												transaction.status.toLowerCase() === 'failed' || transaction.status.toLowerCase() === 'cancelled'
													? 'bg-muted-foreground'
													: positiveTransactionTypes.some((type) => transaction.type.toLowerCase().includes(type))
													? 'bg-[var(--success)]'
													: 'bg-[var(--danger)]'
											}`}
										>
											{transaction.status.toLowerCase() === 'failed' || transaction.status.toLowerCase() === 'cancelled' ? (
												<X className="h-6 w-6 text-[var(--success-foreground)]" />
											) : positiveTransactionTypes.some((type) => transaction.type.toLowerCase().includes(type)) ? (
												<ArrowDown className="h-6 w-6 text-[var(--success-foreground)]" />
											) : (
												<ArrowUp className="h-5 w-5 text-[var(--danger-foreground)]" />
											)}
										</div>
									)}
									<div>
										<p className="font-bold text-sm md:text-base text-foreground">{getTransactionTypeLabel(transaction.type)}</p>
										<p className="text-xs md:text-sm text-muted-foreground">{formatDate(new Date(transaction.created_at))}</p>
									</div>
								</div>
								<p
									className={cn(
										`font-semibold text-base md:text-lg ${
											transaction.status.toLowerCase() === 'failed' || transaction.status.toLowerCase() === 'cancelled'
												? 'text-muted-foreground'
												: positiveTransactionTypes.some((type) => transaction.type.toLowerCase().includes(type))
												? 'text-[var(--success)]'
												: 'text-[var(--danger)]'
										}`
									)}
								>
									{formatBaseurrency(transaction.amount)}
								</p>
							</CustomLink>
						))}
						{totalCount > LIMIT && (
							<div className="mt-20 text-center">
								<CustomLink href="/account/wallet/transactions">
									<Button variant="success" className="w-full sm:w-auto" size={'lg'}>
										View More history
										<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
									</Button>
								</CustomLink>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-10 px-4 flex flex-col items-center">
						<Image src="/images/box.png" alt="Empty Box" width={80} height={80} className="mb-6" />
						<p className="text-muted-foreground mb-6 leading-8">You haven&apos;t made any contribution yet.</p>
					</div>
				)}
			</div>
		</div>
	);
}
