import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/ui/CustomLink';
import InvestmentTrendChart from '@/components/charts/InvestmentTrendChart';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import { Users, Activity, DollarSign, ListChecks, HandCoins } from 'lucide-react';
import { cn } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const kpiCardGradients = ['from-violet-500 to-purple-600', 'from-cyan-400 to-sky-500', 'from-emerald-400 to-green-500', 'from-amber-400 to-orange-500', 'from-pink-500 to-rose-500'];

const kpiData = [
	{ title: 'Total Users', value: '1,234', description: '+20.1% from last month', icon: Users },
	{ title: 'Active Users (Monthly)', value: '890', description: '+15.5% from last month', icon: Activity },
	{ title: 'Total Invested', value: '$150,678', description: '+5.2% from last month', icon: DollarSign },
	{ title: 'Pending Approvals', value: '15', description: 'Deposits & Withdrawals', icon: ListChecks },
	{ title: 'Fees Collected (Month)', value: '$2,345', description: '+8.1% from last month', icon: HandCoins },
];

export default function AdminDashboardPage() {
	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">Dashboard</h1>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{kpiData.map((kpi, index) => {
					const Icon = kpi.icon;
					const gradientClass = kpiCardGradients[index % kpiCardGradients.length];

					return (
						<Card key={index} className={cn('text-white bg-gradient-to-br', gradientClass)}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-white/90">{kpi.title}</CardTitle>
								<Icon className="h-4 w-4 text-white/80" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{kpi.value}</div>
								<p className="text-xs text-white/70">{kpi.description}</p>
							</CardContent>
						</Card>
					);
				})}
			</div>
			<div>
				<h2 className="text-xl font-semibold mb-3">Quick CustomLinks</h2>
				<div className="flex flex-wrap gap-2">
					<Button asChild variant="outline">
						<CustomLink href="/admin/transactions">Approve Transactions</CustomLink>
					</Button>
					<Button asChild variant="outline">
						<CustomLink href="/admin/categories">Manage Categories</CustomLink>
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
						<CardTitle>Recent Investment Trends</CardTitle>
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
		</div>
	);
}
