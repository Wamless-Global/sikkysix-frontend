import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type AccountStatus = 'active' | 'inactive' | 'pending';

interface AccountInfo {
	id: string;
	name: string;
	email: string;
	status: AccountStatus;
	signUpDate: string;
	lastActivityDate: string;
	planType: string;
}

interface ActivityItem {
	id: string;
	date: string;
	type: string;
	description: string;
}

interface PortfolioSummary {
	totalValue: number;
	change24h: number;
	topAsset: string;
	currency: string;
}

interface UserReportData {
	accountInfo: AccountInfo;
	recentActivity: ActivityItem[];
	portfolioSummary: PortfolioSummary;
}

// Mock data for the report page
const mockUserReport: UserReportData = {
	accountInfo: {
		id: 'USR12345',
		name: 'Alice Wonderland',
		email: 'alice.w@example.com',
		status: 'active',
		signUpDate: '2023-05-10',
		lastActivityDate: '2025-05-06',
		planType: 'Pro Member',
	},
	recentActivity: [
		{ id: 'ACT001', date: '2025-05-06', type: 'Login', description: 'Logged in from new device (Safari, MacOS)' },
		{ id: 'ACT002', date: '2025-05-05', type: 'Portfolio Update', description: "Investment in 'Eco Innovators Fund' increased by 2.5%" },
		{ id: 'ACT003', date: '2025-05-04', type: 'Transaction', description: 'Withdrawal of $250.00 processed successfully' },
		{ id: 'ACT004', date: '2025-05-01', type: 'Profile Update', description: 'Updated 2FA preferences' },
		{ id: 'ACT005', date: '2025-04-28', type: 'Service Link', description: "Connected 'MyBank Savings Account'" },
	],
	portfolioSummary: {
		totalValue: 15230.75,
		change24h: 1.2,
		topAsset: 'Eco Innovators Fund',
		currency: 'USD',
	},
};

const getStatusBadgeVariant = (status: AccountStatus) => {
	switch (status) {
		case 'active':
			return 'success';
		case 'inactive':
			return 'destructive';
		case 'pending':
			return 'secondary';
		default:
			return 'default';
	}
};

export default function UserReportPage() {
	const { accountInfo, recentActivity, portfolioSummary } = mockUserReport;

	return (
		<div className="space-y-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-foreground">Your Report</h1>
				<p className="text-muted-foreground mt-1">This is a comprehensive report of your activity on the platform so far.</p>
			</div>

			<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle>Account Overview</CardTitle>
						<CardDescription>Key details about your account.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Account ID:</span>
							<span className="text-sm font-medium">{accountInfo.id}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Name:</span>
							<span className="text-sm font-medium">{accountInfo.name}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Email:</span>
							<span className="text-sm font-medium">{accountInfo.email}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Status:</span>
							<Badge variant={getStatusBadgeVariant(accountInfo.status) as any} className="text-xs">
								{accountInfo.status.charAt(0).toUpperCase() + accountInfo.status.slice(1)}
							</Badge>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Plan:</span>
							<span className="text-sm font-medium">{accountInfo.planType}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Member Since:</span>
							<span className="text-sm font-medium">{accountInfo.signUpDate}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Last Activity:</span>
							<span className="text-sm font-medium">{accountInfo.lastActivityDate}</span>
						</div>
					</CardContent>
				</Card>

				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle>Portfolio Snapshot</CardTitle>
						<CardDescription>A quick look at your investments.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex justify-between items-baseline">
							<span className="text-sm text-muted-foreground">Total Value:</span>
							<span className="text-2xl font-semibold text-primary">
								{portfolioSummary.currency} {portfolioSummary.totalValue.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">24h Change:</span>
							<span className={`text-sm font-medium ${portfolioSummary.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
								{portfolioSummary.change24h >= 0 ? '+' : ''}
								{portfolioSummary.change24h.toFixed(1)}%
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Top Performing Asset:</span>
							<span className="text-sm font-medium">{portfolioSummary.topAsset}</span>
						</div>
					</CardContent>
				</Card>

				<Card className="lg:col-span-1 lg:row-span-2">
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>Latest interactions and events.</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-4">
							{recentActivity.slice(0, 5).map((activity) => (
								<li key={activity.id} className="flex flex-col pb-2 border-b border-border last:border-b-0">
									<div className="flex justify-between items-center mb-1">
										<span className="text-sm font-semibold text-foreground">{activity.type}</span>
										<span className="text-xs text-muted-foreground">{activity.date}</span>
									</div>
									<p className="text-sm text-muted-foreground">{activity.description}</p>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
