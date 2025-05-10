import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import InvestmentTrendChart from '@/components/charts/InvestmentTrendChart';
// import UserGrowthChart from '@/components/charts/UserGrowthChart';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default function ReportingPage() {
	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-2xl font-semibold mt-2">Reporting & Analytics</h1>
			<p className="text-muted-foreground">View investment trends, user activity, and revenue reports.</p>
			{/* TODO: Add date range pickers or other filters */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Investment Trends</CardTitle>
						<CardDescription>Overall and per-category investment performance.</CardDescription>
					</CardHeader>
					<CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
						{/* TODO: Implement detailed investment charts (e.g., stacked area/bar for categories) */}
						Investment Trends Chart Placeholder
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>User Activity</CardTitle>
						<CardDescription>Registrations, active users, task completion.</CardDescription>
					</CardHeader>
					<CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
						{/* TODO: Implement user activity charts/stats */}
						User Activity Chart/Stats Placeholder
					</CardContent>
				</Card>

				<Card className="lg:col-span-3">
					<CardHeader>
						<CardTitle>Revenue Reports</CardTitle>
						<CardDescription>Breakdown of fees collected (deposit, withdrawal, network).</CardDescription>
					</CardHeader>
					<CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
						{/* TODO: Implement revenue charts (e.g., Pie chart for sources) and tables */}
						Revenue Report Chart/Table Placeholder
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
