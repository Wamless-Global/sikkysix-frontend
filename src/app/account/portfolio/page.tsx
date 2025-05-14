'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import PortfolioStartButton from '@/components/ui/portfolio-start-button';
import { useState } from 'react';
import { CustomLink } from '@/components/ui/CustomLink';

interface PortfolioItem {
	id: string;
	category: string;
	currency: string;
	shareId: string;
	startDate: string;
	currentPrice: string;
	value: number;
	progress: number;
	cancelled: boolean;
	completed: boolean;
}

const mockActiveInvestments: PortfolioItem[] = [
	{
		id: 'active1',
		category: 'FOOD',
		currency: 'NGN',
		shareId: 'Share#01',
		startDate: '24/02/25',
		currentPrice: '0.0028321',
		value: 19225.0,
		progress: 70,
		cancelled: false,
		completed: false,
	},
	{
		id: 'active2',
		category: 'TRANSPORT',
		currency: 'NGN',
		shareId: 'Share#02',
		startDate: '0.038321',
		currentPrice: '0.0048321',
		value: 74872.0,
		progress: 40,
		cancelled: false,
		completed: false,
	},
];

const mockCompletedInvestments: PortfolioItem[] = [
	{
		id: 'completed1',
		category: 'REAL ESTATE',
		currency: 'NGN',
		shareId: 'Share#03',
		startDate: '15/01/24',
		currentPrice: 'N/A',
		value: 120000.0,
		progress: 100,
		cancelled: false,
		completed: true,
	},
	{
		id: 'completed2',
		category: 'TECH',
		currency: 'NGN',
		shareId: 'Share#04',
		startDate: '10/11/23',
		currentPrice: 'N/A',
		value: 20000.0,
		progress: 100,
		cancelled: false,
		completed: true,
	},
	{
		id: 'completed2',
		category: 'TECH',
		currency: 'NGN',
		shareId: 'Share#04',
		startDate: '10/11/23',
		currentPrice: 'N/A',
		value: 20000.0,
		progress: 65,
		cancelled: true,
		completed: true,
	},
];

const formatCurrency = (value: number, currency = '₦') => {
	return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function PortfolioPage() {
	const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');

	const investmentsToShow = selectedTab === 'active' ? mockActiveInvestments : mockCompletedInvestments;
	const portfolioValue = investmentsToShow.reduce((sum, item) => sum + item.value, 0);
	const totalInvestments = investmentsToShow.length;
	const hasInvestments = investmentsToShow.length > 0;

	const cardTitle = selectedTab === 'active' ? 'Active Portfolio' : 'Completed Portfolio';
	const cardTotal = selectedTab === 'active' ? mockActiveInvestments.length : mockCompletedInvestments.length;

	return (
		<div className="space-y-8 pb-16">
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2">
				<CardContent className="p-1 px-6 md:p-6 flex justify-between items-center">
					<div>
						<p className="subtext">{cardTitle}</p>
						<p className="amount-heading-extra-large">{formatCurrency(portfolioValue)}</p>
					</div>
					<div className="text-right">
						<p className="subtext">Total</p>
						<p className="amount-heading">{cardTotal}</p>
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
					{hasInvestments && selectedTab === 'active' ? (
						investmentsToShow.map((item) => (
							<CustomLink key={item.id} href={`/account/portfolio/${encodeURIComponent(item.shareId)}`} passHref className="">
								<Card className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0 hover:shadow-md transition-shadow duration-200">
									<CardContent className="p-4 md:p-6">
										<div className="flex justify-between items-start mb-2">
											<div className="flex items-center justify-center gap-4">
												<h3 className="text-base md:text-lg font-semibold text-foreground">{`${item.category}/${item.currency}`}</h3>
												<p className=" text-muted-foreground">{item.shareId}</p>
											</div>
											<p className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(item.value)}</p>
										</div>
										<div className="grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-1 mb-3">
											<div className="text-muted-foreground">
												<span className="text-xs">Start Date: </span>
												<p className="font-medium text-foreground">{item.startDate}</p>
											</div>
											<div className="text-muted-foreground">
												<span className="text-xs">Current Price: </span>
												<p className="font-medium text-foreground">{item.currentPrice}</p>
											</div>
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
											<div className="bg-[var(--dashboard-accent)] h-1.5 md:h-2 rounded-full" style={{ width: `${item.progress}%` }}></div>
										</div>
									</CardContent>
								</Card>
							</CustomLink>
						))
					) : (
						<div className="text-center py-10 px-4 flex flex-col items-center mt-8 md:mt-12">
							<Image src="/box.png" alt="Empty Box" width={72} height={72} className="mb-5 opacity-75" />
							<h3 className="text-xl font-semibold mb-2 text-foreground">It's Lonely Here!</h3>
							<p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">You're one step away from joining a thriving community of investors, start investing and build your portfolio.</p>
							<PortfolioStartButton />
						</div>
					)}
				</TabsContent>

				<TabsContent value="completed" className="mt-6 flex flex-col gap-5">
					{hasInvestments && selectedTab === 'completed' ? (
						investmentsToShow.map((item) => (
							<CustomLink key={item.id} href={`/account/portfolio/${encodeURIComponent(item.shareId)}`} passHref>
								<Card className="bg-card dark:bg-gray-800/60 border border-border dark:border-gray-700/50 shadow-sm rounded-xl overflow-hidden p-0 hover:shadow-md transition-shadow duration-200">
									<CardContent className="p-4 md:p-6">
										<div className="flex justify-between items-start mb-2">
											<div className="flex items-center justify-center gap-4">
												<h3 className="text-base md:text-lg font-semibold text-foreground">{`${item.category}/${item.currency}`}</h3>
												<p className=" text-muted-foreground">{item.shareId}</p>
											</div>
											<p className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(item.value)}</p>
										</div>
										<div className="grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-1 mb-3">
											<div className="text-muted-foreground">
												<span className="text-xs">Start Date: </span>
												<p className="font-medium text-foreground">{item.startDate}</p>
											</div>
											<div className="text-muted-foreground">
												<span className="text-xs">Current Price: </span>
												<p className="font-medium text-foreground">{item.currentPrice}</p>
											</div>
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2 opacity-55">
											<div className={`${!item.cancelled ? 'bg-[var(--dashboard-accent)]' : 'bg-[var(--danger)]'} h-1.5 md:h-2 rounded-full`} style={{ width: `${item.progress}%` }}></div>
										</div>
									</CardContent>
								</Card>
							</CustomLink>
						))
					) : (
						<div className="text-center py-10 px-4 text-muted-foreground mt-8 md:mt-12">
							<Image src="/file.svg" alt="No completed investments" width={60} height={60} className="mb-5 opacity-60" />
							<h3 className="text-lg font-medium mb-2 text-foreground">No Completed Investments</h3>
							<p className="text-sm">Once you complete investments, they will appear here.</p>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
