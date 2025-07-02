'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import nProgress from 'nprogress';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatBaseurrency, formatCurrency, getAgentStatusBadgeVariant, getBaseCurrency, handleFetchErrorMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AgentPortalContent = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [trades, setTrades] = useState<any[]>([]);
	const [stats, setStats] = useState([
		{ label: 'Total Trades', value: 0 },
		{ label: 'Total Volume', value: formatCurrency(0) },
		{ label: 'Earnings', value: formatCurrency(0) },
		{ label: 'Active orders', value: 0 },
		{ label: 'Completed Trades', value: 0 },
		{ label: 'Disputes', value: 0 },
	]);
	const [statsLoaded, setStatsLoaded] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);
	const [totalCount, setTotalCount] = useState(0);
	const [sortBy, setSortBy] = useState<'created_at' | 'fiat_amount' | 'status'>('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const { currentUser } = useAuthContext();

	// Add filter toggle for mobile
	const [showFilters, setShowFilters] = useState(typeof window !== 'undefined' && window.innerWidth >= 640 ? true : false);

	// Debounce searchTerm
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 400);
		return () => clearTimeout(handler);
	}, [searchTerm]);

	useEffect(() => {
		if (!statsLoaded && currentUser?.agent_id) {
			const agentId = currentUser.agent_id;
			fetchWithAuth(`/api/agents/${agentId}/stats`)
				.then((res) => res.json())
				.then((data) => {
					if (data.status === 'success' && data.data) {
						setStats([
							{ label: 'Total Trades', value: data.data.totalTrades },
							{ label: 'Total Volume', value: `${formatCurrency(data.data.totalVolume || 0)}` },
							{ label: 'Earnings', value: `${formatCurrency(data.data.earnings || 0)}` },
							{ label: 'Active orders', value: data.data.activeOrders },
							{ label: 'Completed Trades', value: data.data.completedTrades },
							{ label: 'Disputes', value: data.data.disputes },
						]);
					}
				})
				.catch((err) => {
					handleFetchErrorMessage(err);
				})
				.finally(() => setStatsLoaded(true));
		}
	}, [currentUser, statsLoaded]);

	// Only set isLoading to false if agentId exists and data is loaded
	useEffect(() => {
		const agentId = currentUser?.agent_id;
		if (!agentId) {
			setIsLoading(true);
			return;
		}
		setIsLoading(true);
		const params = new URLSearchParams({
			page: String(page),
			pageSize: String(pageSize),
			sortBy,
			sortOrder,
		});
		if (statusFilter) params.append('status', statusFilter);
		if (debouncedSearchTerm) params.append('searchTerm', debouncedSearchTerm);
		fetchWithAuth(`/api/p2p/trades/agent/${agentId}?${params.toString()}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.status === 'success' && data.data?.trades) {
					// Deduplicate here
					const seen = new Set();
					const deduped = data.data.trades.filter((t: any) => {
						if (seen.has(t.id)) return false;
						seen.add(t.id);
						return true;
					});
					setTrades(deduped);
					setTotalCount(data.data.count || 0);
				}
			})
			.catch((err) => {
				handleFetchErrorMessage(err);
			})
			.finally(() => setIsLoading(false));
	}, [currentUser, page, pageSize, sortBy, sortOrder, statusFilter, debouncedSearchTerm]);

	// Real-time subscription for p2p_trades table (insert and update)
	useEffect(() => {
		const agentId = currentUser?.agent_id;
		if (!agentId) return;
		let channel: any;
		let reconnectTimeout: NodeJS.Timeout | null = null;

		// Utility to deduplicate trades by id
		function dedupeTrades(trades: any[]) {
			const seen = new Set();
			return trades.filter((t) => {
				if (seen.has(t.id)) return false;
				seen.add(t.id);
				return true;
			});
		}

		const subscribe = () => {
			logger.log('Subscribing to agent trades channel for agentId:', agentId);
			channel = supabase.channel(`agent-trades-${agentId}`);
			// Listen for INSERT and UPDATE events for trades belonging to this agent
			channel.on(
				'postgres_changes',
				{
					event: '*', // both INSERT and UPDATE
					schema: 'public',
					table: 'p2p_trades',
					filter: `order_creator_id=eq.${agentId}`,
				},
				(payload: { new: any }) => {
					setTrades((prev) => {
						const idx = prev.findIndex((t) => t.id === payload.new.id);
						let updated;
						if (idx !== -1) {
							updated = [...prev];
							updated[idx] = { ...updated[idx], ...payload.new };
						} else {
							updated = [payload.new, ...prev];
						}
						return dedupeTrades(updated);
					});
				}
			);
			channel.on('close', {}, () => {
				reconnectTimeout = setTimeout(() => {
					subscribe();
				}, 2000);
			});
			channel.subscribe();
		};

		subscribe();

		return () => {
			if (channel) channel.unsubscribe();
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
		};
	}, [currentUser]);

	return (
		<div className="space-y-8 pb-16">
			<h1 className="sub-page-heading">P2P Agent Portal</h1>
			<p className="sub-page-heading-sub-text mb-6">Monitor your P2P trading stats and account performance.</p>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{isLoading || !statsLoaded
					? Array.from({ length: 6 }).map((_, i) => (
							<Card key={i} className="border border-border shadow-sm rounded-xl">
								<CardContent className="p-4 flex flex-col items-center">
									<Skeleton className="h-8 w-20 mb-2 rounded" />
									<Skeleton className="h-4 w-16 rounded" />
								</CardContent>
							</Card>
					  ))
					: stats.map((stat, i) => (
							<Card
								key={stat.label}
								className={cn(
									'border border-border shadow-sm rounded-xl',
									i === 0 && 'bg-gradient-to-br from-blue-600/80 to-blue-400/80 text-white',
									i === 1 && 'bg-gradient-to-br from-green-600/80 to-green-400/80 text-white',
									i === 2 && 'bg-gradient-to-br from-yellow-500/80 to-yellow-300/80 text-white',
									i === 3 && 'bg-gradient-to-br from-purple-600/80 to-purple-400/80 text-white',
									i === 4 && 'bg-gradient-to-br from-pink-600/80 to-pink-400/80 text-white',
									i === 5 && 'bg-gradient-to-br from-orange-600/80 to-orange-400/80 text-white'
								)}
							>
								<CardContent className="p-4 flex flex-col items-center">
									<span className="text-2xl font-bold">{stat.value}</span>
									<span className="text-xs mt-1 text-center opacity-90">{stat.label}</span>
								</CardContent>
							</Card>
					  ))}
			</div>

			{/* Trades Table */}
			<div className="mt-10">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
					<h2 className="text-lg font-semibold text-foreground">Recent Trades</h2>
					<Button variant="outline" className="sm:hidden text-sm font-semibold text-blue-700 hover:bg-blue-50 transition" onClick={() => setShowFilters((prev) => !prev)} type="button">
						{showFilters ? 'Hide Filters' : 'Show Filters'}
					</Button>
				</div>
				<Card className="bg-card border border-border shadow-sm rounded-xl py-0">
					<CardContent className="p-0">
						<div className="">
							{/* Filter and sort controls above the table */}
							<div className={cn('flex flex-wrap gap-4 items-end mb-4 bg-muted/40 rounded-lg px-4 shadow-sm pt-4', showFilters ? '' : 'hidden')}>
								<div className="flex flex-col min-w-[200px]">
									<Label className="block text-sm font-semibold mb-1 text-muted-foreground">Search</Label>
									<input
										type="text"
										className="text-base py-2 px-3 border rounded-lg bg-background focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
										placeholder="Search by Trade ID or Counterparty..."
										value={searchTerm}
										onChange={(e) => {
											setSearchTerm(e.target.value);
											setPage(1);
										}}
									/>
								</div>
								<div className="flex flex-col min-w-[160px]">
									<Label className="block text-sm font-semibold mb-1 text-muted-foreground">Status</Label>
									<Select
										value={statusFilter || 'all'}
										onValueChange={(value) => {
											setStatusFilter(value === 'all' ? '' : value);
											setPage(1);
										}}
									>
										<SelectTrigger className="text-base py-2 px-3 border rounded-lg bg-background focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition">
											<SelectValue placeholder="All Statuses" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Statuses</SelectItem>
											<SelectItem value="awaiting_fiat_payment">Awaiting Fiat Payment</SelectItem>
											<SelectItem value="fiat_payment_confirmed_by_buyer">Fiat Payment Confirmed by Buyer</SelectItem>
											<SelectItem value="fiat_received_confirmed_by_seller">Fiat Received Confirmed by Seller</SelectItem>
											<SelectItem value="platform_ngn_released">{getBaseCurrency()} Released</SelectItem>
											<SelectItem value="completed">Completed</SelectItem>
											<SelectItem value="cancelled_by_buyer">Cancelled by Buyer</SelectItem>
											<SelectItem value="cancelled_by_seller">Cancelled by Seller</SelectItem>
											<SelectItem value="dispute_opened">Dispute Opened</SelectItem>
											<SelectItem value="dispute_resolved_buyer">Dispute Resolved Buyer</SelectItem>
											<SelectItem value="dispute_resolved_seller">Dispute Resolved Seller</SelectItem>
											<SelectItem value="expired">Expired</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col min-w-[120px]">
									<Label className="block text-sm font-semibold mb-1 text-muted-foreground">Sort By</Label>
									<Select
										value={sortBy}
										onValueChange={(value) => {
											setSortBy(value as any);
											setPage(1);
										}}
									>
										<SelectTrigger className="text-base py-2 px-3 border rounded-lg bg-background focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="created_at">Date</SelectItem>
											<SelectItem value="fiat_amount">Amount</SelectItem>
											<SelectItem value="status">Status</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col min-w-[120px]">
									<Label className="block text-sm font-semibold mb-1 text-muted-foreground">Order</Label>
									<Select
										value={sortOrder}
										onValueChange={(value) => {
											setSortOrder(value as any);
											setPage(1);
										}}
									>
										<SelectTrigger className="text-base py-2 px-3 border rounded-lg bg-background focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="desc">Descending</SelectItem>
											<SelectItem value="asc">Ascending</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col min-w-[120px]">
									<Label className="block text-sm font-semibold mb-1 text-muted-foreground">Page Size</Label>
									<Select
										value={String(pageSize)}
										onValueChange={(value) => {
											setPageSize(Number(value));
											setPage(1);
										}}
									>
										<SelectTrigger className="text-base py-2 px-3 border rounded-lg bg-background focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="5">5</SelectItem>
											<SelectItem value="10">10</SelectItem>
											<SelectItem value="20">20</SelectItem>
											<SelectItem value="50">50</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Reset Button */}
								<div className="flex flex-col justify-end min-w-[100px]">
									<Button
										variant="outline"
										className="text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
										onClick={() => {
											setSearchTerm('');
											setStatusFilter('');
											setSortBy('created_at');
											setSortOrder('desc');
											setPage(1);
											setPageSize(10);
										}}
										type="button"
									>
										Reset Filters
									</Button>
								</div>
							</div>

							<Table className="text-base border-separate border-spacing-y-1">
								<TableHeader>
									<TableRow>
										<TableHead className="cursor-pointer w-36">Trade ID</TableHead>
										<TableHead className="cursor-pointer w-20">Type</TableHead>
										<TableHead className="w-20">Asset</TableHead>
										<TableHead className="cursor-pointer w-32">Tokens</TableHead>
										<TableHead className="cursor-pointer w-32">Amount</TableHead>
										<TableHead className="cursor-pointer w-40">Status</TableHead>
										<TableHead className="cursor-pointer w-40">Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										// Use table skeleton rows for smooth loading
										<>
											{Array.from({ length: pageSize }).map((_, i) => (
												<TableRow key={i}>
													<TableCell>
														<Skeleton className="h-4 w-24 rounded" />
													</TableCell>
													<TableCell>
														<Skeleton className="h-4 w-12 rounded" />
													</TableCell>
													<TableCell>
														<Skeleton className="h-4 w-10 rounded" />
													</TableCell>
													<TableCell>
														<Skeleton className="h-4 w-16 rounded" />
													</TableCell>
													<TableCell>
														<Skeleton className="h-4 w-20 rounded" />
													</TableCell>
													<TableCell>
														<Skeleton className="h-4 w-20 rounded" />
													</TableCell>
													<TableCell>
														<Skeleton className="h-4 w-24 rounded" />
													</TableCell>
												</TableRow>
											))}
										</>
									) : trades.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center text-muted-foreground">
												<Image src="/images/box.png" alt="No Trades" width={48} height={48} className="mx-auto mb-2 opacity-70" />
												<div className="font-medium">No trades yet</div>
												<div className="text-xs mt-1">Your trades will appear here once you start trading.</div>
											</TableCell>
										</TableRow>
									) : (
										trades.map((trade) => {
											return (
												<TableRow
													key={trade.id}
													className="hover:shadow-lg transition-all duration-150 bg-white dark:bg-muted/80 border border-border cursor-pointer rounded-xl"
													onClick={() => {
														nProgress.start();
														router.push(`/account/agent-portal/overview/${trade.id}`);
													}}
												>
													<TableCell className="font-mono text-base font-semibold text-blue-700 dark:text-blue-300">{trade.id.slice(0, 8)}…</TableCell>
													<TableCell className={`capitalize font-semibold text-base ${currentUser == null && 'italic'}`}>{currentUser == null ? 'N/A' : trade.buyer_id === currentUser.id ? 'Withdrawal' : 'Deposit'}</TableCell>
													<TableCell className="font-semibold text-base">{getBaseCurrency()}</TableCell>
													<TableCell className="font-semibold text-base">{formatBaseurrency(trade.platform_currency_amount)}</TableCell>
													<TableCell className="font-semibold text-base text-green-700 dark:text-green-300">{formatCurrency(trade.fiat_amount)}</TableCell>
													<TableCell>
														<Badge variant={getAgentStatusBadgeVariant(trade.status)} tabIndex={-1} aria-label={trade.status}>
															{trade.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
														</Badge>
													</TableCell>
													<TableCell className="text-base">{new Date(trade.created_at).toLocaleString()}</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Pagination */}
			{!isLoading && totalCount > pageSize && (
				<div className="flex justify-end items-center gap-2 mt-4">
					<Button className="text-base px-3 py-2 rounded border bg-background" disabled={page === 1} onClick={() => setPage(page - 1)} type="button">
						Prev
					</Button>
					<span className="text-base">
						Page {page} of {Math.ceil(totalCount / pageSize)}
					</span>
					<Button className="text-base px-3 py-2 rounded border bg-background" disabled={page * pageSize >= totalCount} onClick={() => setPage(page + 1)} type="button">
						Next
					</Button>
				</div>
			)}
		</div>
	);
};

export default AgentPortalContent;
