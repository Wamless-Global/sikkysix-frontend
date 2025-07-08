'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/ui/CustomLink';
import InvestmentTrendChart from '@/components/charts/InvestmentTrendChart';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import { Users, Activity, DollarSign, ListChecks, HandCoins } from 'lucide-react';
import { cn } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { useEffect } from 'react';

const kpiCardGradients = ['from-violet-500 to-purple-600', 'from-cyan-400 to-sky-500', 'from-emerald-400 to-green-500', 'from-amber-400 to-orange-500', 'from-pink-500 to-rose-500'];

const kpiConfig = [
	{ key: 'totalUsers', title: 'Total Users', icon: Users },
	{ key: 'totalActiveUsers', title: 'Active Users', icon: Activity },
	{ key: 'totalCategories', title: 'Total Categories', icon: ListChecks },
	{ key: 'totalInvested', title: 'Total Invested', icon: DollarSign },
	{ key: 'totalPendingAgentApplications', title: 'Pending Agent Applications', icon: ListChecks },
	{ key: 'totalFees', title: 'Fees Collected', icon: HandCoins },
	{ key: 'totalDeposits', title: 'Total Deposits', icon: DollarSign },
	{ key: 'totalWithdrawals', title: 'Total Withdrawals', icon: DollarSign },
];

import { useState } from 'react';

export default function AdminDashboardPage() {
	const [stats, setStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const response = await fetchWithAuth(`/api/admin/stats`);
				const result = await response.json();
				if (!response.ok || !result.success) {
					setError('Failed to fetch admin dashboard stats');
					logger.error('Failed to fetch admin dashboard stats:', result);
				} else {
					setStats(result.data);
				}
			} catch (err) {
				setError('Failed to fetch admin dashboard stats');
				logger.error('Failed to fetch admin dashboard stats:', err);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">Dashboard</h1>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{kpiConfig.map((kpi, index) => {
					const Icon = kpi.icon;
					const gradientClass = index < 5 ? kpiCardGradients[index % kpiCardGradients.length] : 'from-gray-400 to-gray-600';
					let value = '';
					if (loading) value = '...';
					else if (error) value = 'Error';
					else if (stats && typeof stats[kpi.key] !== 'undefined') {
						if (['totalInvested', 'totalFees', 'totalDeposits', 'totalWithdrawals'].includes(kpi.key)) {
							value = `$${Number(stats[kpi.key]).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
						} else {
							value = stats[kpi.key].toLocaleString();
						}
					}
					return (
						<Card key={index} className={cn('text-white bg-gradient-to-br', gradientClass)}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-white/90">{kpi.title}</CardTitle>
								<Icon className="h-4 w-4 text-white/80" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{value}</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
			{false && (
				<>
					<div>
						<h2 className="text-xl font-semibold mb-3">Quick CustomLinks</h2>
						<div className="flex flex-wrap gap-2">
							<Button asChild variant="outline">
								<CustomLink href="/admin/transactions">Approve Transactions</CustomLink>
							</Button>
							<Button asChild variant="outline">
								<CustomLink href="/admin/clubs">Manage Clubs</CustomLink>
							</Button>
							<Button asChild variant="outline">
								<CustomLink href="/admin/users">View Users</CustomLink>
							</Button>
							<Button asChild variant="outline">
								<CustomLink href="/admin/communication">Send Broadcast</CustomLink>
							</Button>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Recent Savings Trends</CardTitle>
								<CardDescription>Volume over the last 30 days.</CardDescription>
							</CardHeader>
							<CardContent className="h-[300px] p-0">
								<InvestmentTrendChart />
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>User Registration Growth</CardTitle>
								<CardDescription>New users per week.</CardDescription>
							</CardHeader>
							<CardContent className="h-[300px] p-0">
								<UserGrowthChart />
							</CardContent>
						</Card>
					</div>
				</>
			)}
		</div>
	);
}
