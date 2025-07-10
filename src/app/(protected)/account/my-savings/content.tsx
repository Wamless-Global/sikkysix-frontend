'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import { CustomLink } from '@/components/ui/CustomLink';
import { convertCurrency, formatBaseurrency, handleFetchErrorMessage } from '@/lib/helpers';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { Investment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import PortfolioStartButton from '@/components/ui/portfolio-start-button';
import { DollarSign, RefreshCcw } from 'lucide-react';

interface PortfolioResponse {
	status: string;
	data: {
		investments: Investment[];
		hasMore: boolean;
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

export default function PortfolioPageContent() {
	const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
	const [investments, setInvestments] = useState<Investment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [, setError] = useState<string | null>(null);
	const [showFiat, setShowFiat] = useState(false);

	const fetchInvestments = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		nProgress.start();

		try {
			const response = await fetchWithAuth('/api/investments?with_metrics=true&pageSize=50');
			if (!response.ok) {
				throw new Error('Failed to fetch investments');
			}

			const result: PortfolioResponse = await response.json();
			if (result.status === 'success' && result.data) {
				setInvestments(result.data.investments);
			} else {
				throw new Error('Invalid response format from server');
			}
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'Failed to load investments');
			setError(errorMessage);
			toast.error('Failed to load portfolio data');
		} finally {
			setIsLoading(false);
			nProgress.done();
		}
	}, []);

	useEffect(() => {
		fetchInvestments();
	}, [fetchInvestments]);

	const investmentsToShow = investments.filter((item) => (selectedTab === 'active' ? item.status === 'active' && !item.cancelled : item.completed || item.cancelled));

	const portfolioValue = investmentsToShow.reduce((sum, item) => sum + (item.status === 'active' ? item.current_value : item.details?.realized_value ?? 0), 0);
	const hasInvestments = investmentsToShow.length > 0;

	return (
		<div className="space-y-8 pb-16">
			{/* Savings Summary Card */}
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2">
				<CardContent className="p-1 px-6 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 relative">
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

					<div className="flex-1 sm:mt-2">
						<p className="subtext mb-1 text-center md:text-left">{selectedTab === 'active' ? 'Active Savings' : 'Completed Savings'}</p>
						{isLoading ? (
							<div className="animate-pulse">
								<div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
							</div>
						) : showFiat ? (
							<p className="amount-heading-extra-large">{convertCurrency(portfolioValue ?? 0)}</p>
						) : (
							<p className="amount-heading-extra-large">{formatBaseurrency(portfolioValue ?? 0)}</p>
						)}
					</div>
					<div className="text-right flex flex-col items-end">
						<p className="subtext mb-1">Total</p>
						{isLoading ? (
							<div className="animate-pulse">
								<div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto"></div>
							</div>
						) : (
							<p className="amount-heading">{investmentsToShow.length}</p>
						)}
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="active" className="w-full" onValueChange={(value) => setSelectedTab(value as 'active' | 'completed')}>
				<TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto gap-3 md:gap-4">
					<TabsTrigger
						value="active"
						className="data-[state=active]:bg-gray-800 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-white dark:data-[state=active]:text-gray-50 data-[state=inactive]:bg-gray-200 dark:data-[state=inactive]:bg-gray-800/30 text-gray-600 dark:text-gray-400 rounded-lg py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-200"
					>
						Active
					</TabsTrigger>
					<TabsTrigger
						value="completed"
						className="data-[state=active]:bg-gray-800 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-white dark:data-[state=active]:text-gray-50 data-[state=inactive]:bg-gray-200 dark:data-[state=inactive]:bg-gray-800/30 text-gray-600 dark:text-gray-400 rounded-lg py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-200"
					>
						Completed
					</TabsTrigger>
				</TabsList>

				<TabsContent value="active" className="mt-6 flex flex-col gap-5">
					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{Array.from({ length: 2 }).map((_, index) => (
								<Card key={`skeleton-${index}`} className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0">
									<CardContent className="p-4 md:p-6">
										<div className="animate-pulse space-y-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
											<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
											<div className="flex items-center gap-2 mt-4 opacity-60">
												<div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
												<div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : hasInvestments && selectedTab === 'active' ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{investmentsToShow.map((item) => (
								<CustomLink key={item.id} href={`/account/my-savings/${item.id}`} passHref>
									<Card className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0 hover:shadow-lg hover:border-[var(--dashboard-accent)] group transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-[var(--dashboard-accent)]">
										<CardContent className="p-4 md:p-6">
											<div className="flex justify-between items-center mb-2">
												<div className="flex items-center gap-3">
													<h3 className="text-base md:text-lg font-semibold text-foreground group-hover:text-[var(--dashboard-accent)] transition-colors duration-200">{item.ticker} Club</h3>
													<Badge variant="active" className="text-xs px-2 py-0.5">
														Active
													</Badge>
												</div>
												<p className="text-lg md:text-xl font-bold text-foreground">{formatBaseurrency(item.current_value)}</p>
											</div>
											<div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
												<div className="text-muted-foreground">
													<span className="text-xs">Savings: </span>
													<p className="font-medium text-foreground">{formatBaseurrency(item.amount_invested)}</p>
												</div>
												<div className="text-muted-foreground">
													<span className="text-xs">Savings Goal: </span>
													<p className="font-medium text-foreground">{formatBaseurrency(item.target_total_value)}</p>
												</div>
												<div className="text-muted-foreground">
													<span className="text-xs">Progress: </span>
													<p className="font-medium text-foreground">{(item.progress_percentage ?? 0).toFixed(2)}%</p>
												</div>
												<div className="text-muted-foreground">
													<span className="text-xs">Profit/Loss: </span>
													<p className={`font-medium ${item.profit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{formatBaseurrency(item.profit)}</p>
												</div>
											</div>
											<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
												<div className="bg-[var(--dashboard-accent)] h-1.5 md:h-2 rounded-full" style={{ width: `${item.progress_percentage}%` }}></div>
											</div>
											<div className="flex items-center gap-2 mt-4 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
												<span className="text-xs text-muted-foreground">View Details</span>
												<svg className="w-4 h-4 text-[var(--dashboard-accent)] group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
												</svg>
											</div>
										</CardContent>
									</Card>
								</CustomLink>
							))}
						</div>
					) : (
						<div className="text-center py-10 px-4 flex flex-col items-center mt-8 md:mt-12">
							<Image src="/images/box.png" alt="Empty Box" width={72} height={72} className="mb-5 opacity-75" />
							<h3 className="text-xl font-semibold mb-2 text-foreground">It&apos;s Lonely Here!</h3>
							<p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">You&apos;re one step away from joining a thriving community of savers, start contributing and build your savngs.</p>
							<PortfolioStartButton />
						</div>
					)}
				</TabsContent>

				<TabsContent value="completed" className="mt-6 flex flex-col gap-5">
					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{Array.from({ length: 2 }).map((_, index) => (
								<Card key={`skeleton-${index}`} className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0">
									<CardContent className="p-4 md:p-6">
										<div className="animate-pulse space-y-4">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
											<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
											<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
											<div className="flex items-center gap-2 mt-4 opacity-60">
												<div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
												<div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : hasInvestments && selectedTab === 'completed' ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{investmentsToShow.map((item) => {
								return (
									<CustomLink key={item.id} href={`/account/my-savings/${item.id}`} passHref>
										<Card className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0 hover:shadow-lg hover:border-[var(--dashboard-accent)] group transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-[var(--dashboard-accent)]">
											<CardContent className="p-4 md:p-6">
												<div className="flex justify-between items-center mb-2">
													<div className="flex items-center gap-3">
														<h3 className="text-base md:text-lg font-semibold text-foreground group-hover:text-[var(--dashboard-accent)] transition-colors duration-200">Club Savings</h3>
														<Badge variant={item.cancelled ? 'destructive' : 'completed'} className="text-xs px-2 py-0.5">
															{item.cancelled ? 'Cancelled' : 'Completed'}
														</Badge>
													</div>
													<p className="text-lg md:text-xl font-bold text-foreground">{formatBaseurrency(item.details?.realized_value ?? 0)}</p>
												</div>
												<div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
													<div className="text-muted-foreground">
														<span className="text-xs">Savings: </span>
														<p className="font-medium text-foreground">{formatBaseurrency(item.amount_invested)}</p>
													</div>
													<div className="text-muted-foreground">
														<span className="text-xs">Savings Goal: </span>
														<p className="font-medium text-foreground">{formatBaseurrency(item.details?.realized_value ?? 0)}</p>
													</div>
													<div className="text-muted-foreground col-span-2">
														<span className="text-xs">Profit/Loss: </span>
														<p className={`font-medium ${(item.details?.realized_value ?? 0) - item.amount_invested >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{formatBaseurrency((item.details?.realized_value ?? 0) - item.amount_invested)}</p>
													</div>
												</div>
												<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2 opacity-55">
													<div className={`${item.cancelled ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'} h-1.5 md:h-2 rounded-full`} style={{ width: '100%' }}></div>
												</div>
												<div className="flex items-center gap-2 mt-4 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
													<span className="text-xs text-muted-foreground">View Details</span>
													<svg className="w-4 h-4 text-[var(--dashboard-accent)] group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
													</svg>
												</div>
											</CardContent>
										</Card>
									</CustomLink>
								);
							})}
						</div>
					) : (
						<div className="text-center py-10 px-4 flex flex-col items-center mt-8 md:mt-12">
							<Image src="/images/box.png" alt="Empty Box" width={72} height={72} className="mb-5 opacity-75" />
							<h3 className="text-lg font-medium mb-2 text-foreground">No Completed Savings</h3>
							<p className="text-sm">Once you reach your savings goal, they will appear here.</p>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
