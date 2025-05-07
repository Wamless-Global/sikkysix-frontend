import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function PortfolioPage() {
	// Mock data - replace with actual data fetching later
	const activePortfolioValue = '₦0.00';
	const totalInvestments = 0;
	const hasInvestments = false;

	return (
		<div className="space-y-12">
			{/* <h1 className="account-page-title">Portfolio</h1> */}

			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2">
				<CardContent className="p-1 px-6 md:p-6 flex justify-between items-center">
					<div>
						<p className="text-sm opacity-80 mb-1">Active Portfolio</p>
						<p className="text-3xl md:text-4xl font-extrabold">{activePortfolioValue}</p>
					</div>
					<div className="text-right">
						<p className="text-sm opacity-80 mb-1">Total</p>
						<p className="text-3xl font-bold">{totalInvestments}</p>
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="active" className="w-full">
				<TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto gap-4">
					<TabsTrigger
						value="active"
						className="data-[state=active]:category-card-account data-[state=active]:text-[#E6FFFA] dark:data-[state=active]:text-white data-[state=inactive]:bg-muted/30 dark:data-[state=inactive]:bg-muted/10 text-muted-foreground rounded-lg py-5 transition-all duration-200 "
					>
						Active
					</TabsTrigger>
					<TabsTrigger
						value="completed"
						className="data-[state=active]:category-card-account data-[state=active]:text-[#E6FFFA] dark:data-[state=active]:text-white data-[state=inactive]:bg-muted/30 dark:data-[state=inactive]:bg-muted/10 text-muted-foreground rounded-lg py-5 transition-all duration-200"
					>
						Completed
					</TabsTrigger>
				</TabsList>

				{/* Tab Content */}
				<TabsContent value="active" className="mt-6">
					{hasInvestments ? (
						<div>{/* Placeholder for Active Investments List */}</div>
					) : (
						<div className="text-center py-10 px-4 flex flex-col items-center">
							<Image src="/box.png" alt="Empty Box" width={80} height={80} className="mb-6" />
							<h3 className="text-xl font-semibold mb-2 text-foreground">It's Lonely Here!</h3>
							<p className="text-muted-foreground mb-6 leading-8">You're one step away from joining a thriving community of investors, start investing and build your portfolio.</p>

							<Button variant="cta" size="lg">
								Start Now <ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</div>
					)}
				</TabsContent>
				<TabsContent value="completed" className="mt-6">
					{/* Placeholder for Completed Investments List - Can also have an empty state */}
					<div className="text-center py-10 px-4 text-muted-foreground">No completed investments yet.</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
