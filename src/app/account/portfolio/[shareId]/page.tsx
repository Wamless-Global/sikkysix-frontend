'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CircularProgressDisplay from '@/components/ui/circular-progress-display';
import currencyFormatter from '@/components/ui/currency-formatter';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { toast } from 'sonner';

// Re-using and extending PortfolioItem definition from the main portfolio page
// In a real app, this might come from a shared types file or API response
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
	openPrice?: string;
	endDate?: string;
	endPrice?: string;
	profit?: number;
	percentageChange?: number;
}

// Mock data - copied from portfolio/page.tsx for standalone use here
// Ideally, this would be fetched or passed, or from a shared store/context
const mockAllInvestments: PortfolioItem[] = [
	{
		id: 'active1',
		category: 'FOOD',
		currency: 'NGN',
		shareId: 'Share#01',
		startDate: '24/02/25',
		currentPrice: '₦0.0028321',
		value: 19225.0,
		progress: 70,
		cancelled: false,
		completed: false,
		openPrice: '₦0.0021',
		percentageChange: 92.25,
	},
	{
		id: 'active2',
		category: 'TRANSPORT',
		currency: 'NGN',
		shareId: 'Share#02',
		startDate: '24/01/25',
		currentPrice: '₦0.0048321',
		value: 74872.0,
		progress: 40,
		cancelled: false,
		completed: false,
		openPrice: '₦0.0030',
	},
	{
		id: 'completed1',
		category: 'REAL ESTATE',
		currency: 'NGN',
		shareId: 'Share#03',
		startDate: '15/01/24',
		currentPrice: 'N/A',
		value: 19225.0,
		progress: 100,
		cancelled: false,
		completed: true,
		openPrice: '₦0.0021',
		endDate: '01/03/2025',
		endPrice: '₦0.0023',
		profit: 0,
		percentageChange: 92.25,
	},
	{
		id: 'completed2',
		category: 'TECH',
		currency: 'NGN',
		shareId: 'Share#04',
		startDate: '24/02/2025',
		currentPrice: 'N/A',
		value: 20000.0,
		progress: 100,
		cancelled: false,
		completed: true,
		openPrice: '₦0.0021',
		endDate: '01/03/2025',
		endPrice: '₦0.0023',
		profit: 10000.0,
	},
];

export default function PortfolioItemDetailPage() {
	const router = useRouter();
	const params = useParams();
	const shareId = params.shareId ? decodeURIComponent(params.shareId as string) : undefined;

	const initialItem = mockAllInvestments.find((inv) => inv.shareId === shareId);

	const [currentItem, setCurrentItem] = useState<PortfolioItem | undefined>(initialItem);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isWithdrawing, setIsWithdrawing] = useState(false);

	if (!currentItem) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
				<h1 className="text-2xl font-semibold mb-4">Portfolio Item Not Found</h1>
				<p className="text-muted-foreground mb-6">The item with ID "{shareId}" could not be found.</p>
				<Button onClick={() => router.back()}>Go Back</Button>
			</div>
		);
	}

	const statusText = currentItem.completed ? 'Complete' : 'Active';
	// Assuming 'active' and 'completed' are valid variants or styled via className by user
	// const statusVariant = currentItem.completed ? 'completed' : 'active';

	const handleWithdrawClick = () => {
		setIsModalOpen(true);
	};

	const handleWithdrawConfirm = () => {
		setIsModalOpen(false);
		setIsWithdrawing(true);
		const toastId = toast.loading('Processing withdrawal...');

		setTimeout(() => {
			setCurrentItem((prev) => (prev ? { ...prev, completed: true, progress: 100, endDate: new Date().toLocaleDateString('en-CA') } : undefined));
			setIsWithdrawing(false);
			toast.success('Withdrawal successful! Plan marked as completed.', { id: toastId });
			// Optionally, could update mockAllInvestments if it were managed by context/global state
			// For now, only local currentItem state is updated.
		}, 2000);
	};

	return (
		<div className="max-w-2xl">
			<div>
				<h1 className="sub-page-heading">
					{currentItem.category} Investment ({currentItem.shareId})
				</h1>
				<p className="sub-page-heading-sub-text">Detailed view of your investment in the {currentItem.category.toLowerCase()} category.</p>
			</div>
			<div className="flex items-center justify-between gap-6 md:gap-20 w-full my-10">
				<CircularProgressDisplay active={currentItem.completed} value={currencyFormatter(currentItem.value)} percentage={currentItem.percentageChange} size={220} />
				<div className="flex flex-col sm:flex-col gap-3 mt-4">
					<Link href={`/account/category/${currentItem.category.toLowerCase().replace(/\s+/g, '-')}`} passHref>
						<Button size={'lg'} className="w-full" variant={'success'} disabled={isWithdrawing}>
							Show Plan
						</Button>
					</Link>
					{!currentItem.completed && (
						<Button size={'lg'} variant="outline" className="w-full border-gray-600 text-foreground hover:bg-gray-700 py-3" onClick={handleWithdrawClick} disabled={isWithdrawing}>
							{isWithdrawing ? 'Processing...' : 'Withdraw'}
						</Button>
					)}
				</div>
			</div>

			<div className="w-full space-y-5 mt-6">
				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Start Date</span>
					<span className="font-medium text-foreground">{currentItem.startDate}</span>
				</div>
				{currentItem.completed && currentItem.endDate && (
					<div className="flex justify-between items-center">
						<span className="text-muted-foreground">End Date</span>
						<span className="font-medium text-foreground">{currentItem.endDate}</span>
					</div>
				)}
				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Open Price</span>
					<span className="font-medium text-foreground">{currentItem.openPrice || 'N/A'}</span>
				</div>

				{currentItem.completed ? (
					<div className="flex justify-between items-center">
						<span className="text-muted-foreground">End Price</span>
						<span className="font-medium text-foreground">{currentItem.endPrice || 'N/A'}</span>
					</div>
				) : (
					<div className="flex justify-between items-center">
						<span className="text-muted-foreground">Current Price</span>
						<span className="font-medium text-foreground">{currentItem.currentPrice}</span>
					</div>
				)}

				{currentItem.completed && currentItem.profit !== undefined && (
					<div className="flex justify-between items-center">
						<span className="text-muted-foreground">Profit</span>
						<span className="font-medium text-[var(--success)]">{currencyFormatter(currentItem.profit)}</span>
					</div>
				)}

				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Status</span>
					<Badge variant={currentItem.completed ? 'completed' : 'active'} className={`px-3 py-1 text-xs font-medium`}>
						{statusText}
					</Badge>
				</div>
			</div>

			<ConfirmationModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onConfirm={handleWithdrawConfirm}
				title="Are you sure?"
				description="Ending the plan prematurely will lead to a forfeiture of all the profit made, do you wish to continue?"
				confirmButtonText="Proceed"
				isLoading={isWithdrawing}
			/>
		</div>
	);
}
