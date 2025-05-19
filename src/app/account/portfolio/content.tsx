'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import PortfolioStartButton from '@/components/ui/portfolio-start-button';
import { CustomLink } from '@/components/ui/CustomLink';
import { formatCurrency } from '@/lib/helpers';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { Investment } from '@/types';
import { Badge } from '@/components/ui/badge';

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
	const [error, setError] = useState<string | null>(null);

	const fetchInvestments = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		nProgress.start();

		try {
			const response = await fetch('/api/users/investments?with_metrics=true');
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
			console.error('Error fetching investments:', err);
			setError(err instanceof Error ? err.message : 'Failed to load investments');
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

	const portfolioValue = investmentsToShow.reduce((sum, item) => (sum + item.status === 'active' ? item.current_value : (item.details?.sold_at ?? 0) * (item.details?.initial_units_purchased ?? 0)), 0);
	const hasInvestments = investmentsToShow.length > 0;

	return (
		<div className="space-y-8 pb-16">
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2">
				<CardContent className="p-1 px-6 md:p-6 flex justify-between items-center">
					<div>
						<p className="subtext">{selectedTab === 'active' ? 'Active Portfolio' : 'Completed Portfolio'}</p>
						{isLoading ? (
							<div className="animate-pulse">
								<div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
							</div>
						) : (
							<p className="amount-heading-extra-large">{formatCurrency(portfolioValue)}</p>
						)}
					</div>
					<div className="text-right">
						<p className="subtext">Total</p>
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
						Array.from({ length: 2 }).map((_, index) => (
							<Card key={`skeleton-${index}`} className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0">
								<CardContent className="p-4 md:p-6">
									<div className="animate-pulse space-y-4">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
										<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
										<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
									</div>
								</CardContent>
							</Card>
						))
					) : hasInvestments && selectedTab === 'active' ? (
						investmentsToShow.map((item) => (
							<CustomLink key={item.id} href={`/account/portfolio/${item.id}`} passHref>
								<Card className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0 hover:shadow-md transition-shadow duration-200">
									<CardContent className="p-4 md:p-6">
										<div className="flex justify-between items-start mb-2">
											<div className="flex items-center justify-center gap-4">
												<h3 className="text-base md:text-lg font-semibold text-foreground">{item.ticker} Investment</h3>
												{/* <Badge variant="outline">{formatCurrency(item.profit)}</Badge> */}
											</div>
											<p className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(item.current_value)}</p>
										</div>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mb-3">
											<div className="text-muted-foreground">
												<span className="text-xs">Initial Investment: </span>
												<p className="font-medium text-foreground">{formatCurrency(item.amount_invested)}</p>
											</div>
											<div className="text-muted-foreground">
												<span className="text-xs">Target Value: </span>
												<p className="font-medium text-foreground">{formatCurrency(item.target_total_value)}</p>
											</div>
											<div className="text-muted-foreground">
												<span className="text-xs">Progress: </span>
												<p className="font-medium text-foreground">{(item.progress_percentage ?? 0).toFixed(2)}%</p>
											</div>
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
											<div className="bg-[var(--dashboard-accent)] h-1.5 md:h-2 rounded-full" style={{ width: `${item.progress_percentage}%` }}></div>
										</div>
									</CardContent>
								</Card>
							</CustomLink>
						))
					) : (
						<div className="text-center py-10 px-4 flex flex-col items-center mt-8 md:mt-12">
							<Image src="/box.png" alt="Empty Box" width={72} height={72} className="mb-5 opacity-75" />
							<h3 className="text-xl font-semibold mb-2 text-foreground">It&apos;s Lonely Here!</h3>
							<p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">You&apos;re one step away from joining a thriving community of investors, start investing and build your portfolio.</p>
							<PortfolioStartButton />
						</div>
					)}
				</TabsContent>

				<TabsContent value="completed" className="mt-6 flex flex-col gap-5">
					{isLoading ? (
						Array.from({ length: 2 }).map((_, index) => (
							<Card key={`skeleton-${index}`} className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0">
								<CardContent className="p-4 md:p-6">
									<div className="animate-pulse space-y-4">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
										<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
										<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
									</div>
								</CardContent>
							</Card>
						))
					) : hasInvestments && selectedTab === 'completed' ? (
						investmentsToShow.map((item) => (
							<CustomLink key={item.id} href={`/account/portfolio/${item.id}`} passHref>
								<Card className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0 hover:shadow-md transition-shadow duration-200">
									<CardContent className="p-4 md:p-6">
										<div className="flex justify-between items-start mb-2">
											<div className="flex items-center justify-center gap-4">
												<h3 className="text-base md:text-lg font-semibold text-foreground">{item.ticker} Investment</h3>
												<Badge variant={item.cancelled ? 'destructive' : 'completed'}>{item.cancelled ? 'Cancelled' : 'Completed'}</Badge>
											</div>
											<p className="text-lg md:text-xl font-bold text-foreground">{formatCurrency((item.details?.sold_at ?? 0) * (item.details?.initial_units_purchased ?? 0))}</p>
										</div>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mb-3">
											<div className="text-muted-foreground">
												<span className="text-xs">Initial Investment: </span>
												<p className="font-medium text-foreground">{formatCurrency(item.amount_invested)}</p>
											</div>
											<div className="text-muted-foreground">
												<span className="text-xs">Final Profit: </span>
												<p className="font-medium text-foreground">{formatCurrency(item.details?.realized_value ?? 0)}</p>
											</div>
											{/* <div className="text-muted-foreground">
												<span className="text-xs">Return: </span>
												<p className="font-medium text-foreground">{item.percentage_change.toFixed(2)}%</p>
											</div> */}
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2 opacity-55">
											<div className={`${item.cancelled ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'} h-1.5 md:h-2 rounded-full`} style={{ width: '100%' }}></div>
										</div>
									</CardContent>
								</Card>
							</CustomLink>
						))
					) : (
						<div className="text-center py-10 px-4 flex flex-col items-center mt-8 md:mt-12">
							<Image src="/box.png" alt="Empty Box" width={72} height={72} className="mb-5 opacity-75" />
							<h3 className="text-lg font-medium mb-2 text-foreground">No Completed Investments</h3>
							<p className="text-sm">Once you complete investments, they will appear here.</p>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
