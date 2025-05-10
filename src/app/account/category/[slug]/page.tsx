'use client';
import { useParams } from 'next/navigation';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, TrendingUp, Loader2 } from 'lucide-react';
import InsufficientBalanceModal from '@/components/modals/InsufficientBalanceModal';
import { fetchCurrentUserBalance } from '@/lib/userUtils';
import { toast } from 'sonner';

// Mock data - Replace with actual data fetching based on slug param
const categoryDataMock = {
	name: 'Food',
	ticker: 'FOOD/USDT',
	price: '₦5000.00', // Example price
	changePercent: 0.4,
	imageUrl: '/Variety-fruits-vegetables.png',
	investableAmount: '₦10,000.00',
};

const activityData = [
	{ id: 1, type: 'buy', hash: 'dnwhw82o20wmo29', amount: '20,000.00 NGN', time: '15m ago', icon: ArrowUp, color: 'text-red-500', bg: 'bg-red-500/10', isCredit: true },
	{ id: 2, type: 'sell', hash: 'ks9Qksjws9jkhHw2n', amount: '10,000.00 NGN', time: '10h ago', icon: ArrowDown, color: 'text-green-500', bg: 'bg-green-500/10', isCredit: false },
	{ id: 3, type: 'sell', hash: 'QxhsuHiu92j2njniNn', amount: '10,000.00 NGN', time: '20s ago', icon: ArrowDown, color: 'text-green-500', bg: 'bg-green-500/10', isCredit: true },
];

type CategoryPageParams = {
	// This type might no longer be strictly needed if params prop is not used directly
	// params: {
	//	slug: string;
	// };
};

export default function SingleCategoryPage(/* { params }: CategoryPageParams */) {
	const paramsFromHook = useParams<{ slug: string }>();
	const slug = paramsFromHook.slug;

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentUserBalance, setCurrentUserBalance] = useState<number | undefined>(undefined);
	const [productPrice, setProductPrice] = useState<number | undefined>(undefined);
	const [categoryData, setCategoryData] = useState(categoryDataMock);
	const [isLoadingPurchase, setIsLoadingPurchase] = useState(false);

	useEffect(() => {
		// In a real app, you would fetch categoryData based on slug
		// For now, we parse the price from the mock data
		const rawPrice = categoryData.price;
		const priceString = rawPrice.replace(/[^0-9.]/g, '');
		const parsedPrice = parseFloat(priceString);

		if (!isNaN(parsedPrice)) {
			setProductPrice(parsedPrice);
		} else {
			console.error('Failed to parse product price:', rawPrice);
			toast.error('Could not load product price.');
		}
		// If categoryData were fetched, you'd set it here.
		// setCategoryData(fetchedData);
	}, [slug, categoryData.price]);

	const handleBuyNow = async () => {
		setIsLoadingPurchase(true);
		if (productPrice === undefined) {
			console.error('Product price is not available or invalid.');
			toast.error('Product price is currently unavailable. Please try again later.');
			setIsLoadingPurchase(false);
			return;
		}

		const balance = await fetchCurrentUserBalance();

		if (balance === null) {
			// Error fetching balance is handled by toast within fetchCurrentUserBalance
			setCurrentUserBalance(undefined);
			setIsLoadingPurchase(false);
			return;
		}

		setCurrentUserBalance(balance);

		if (balance < productPrice) {
			setIsModalOpen(true);
		} else {
			console.log('Sufficient balance. Proceeding with purchase...');
			// TODO: Add actual purchase logic here
			toast.success('Purchase initiated! (Placeholder)');
		}
		setIsLoadingPurchase(false);
	};

	return (
		<div className="space-y-6">
			{/* Header Image and Info */}
			<div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
				<Image src={categoryData.imageUrl} alt={categoryData.name} layout="fill" objectFit="cover" className="brightness-75" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
				<div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
					<h1 className="text-2xl md:text-3xl font-bold mb-1">{categoryData.ticker}</h1>
					<div className="flex items-center space-x-2 text-sm">
						<span>{categoryData.price}</span>
						<span className={`flex items-center ${categoryData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
							<TrendingUp className="h-4 w-4 mr-1" /> {categoryData.changePercent}%
						</span>
					</div>
				</div>
			</div>

			<div>
				<div className="bg-muted/20 dark:bg-muted/10 h-64 md:h-80 rounded-lg flex items-center justify-center text-muted-foreground mb-4">Chart Placeholder</div>
				<div className="flex justify-center space-x-2">
					{['1H', '1D', '1W', '1M', '1Y'].map((range) => (
						<Button key={range} variant="ghost" size="sm" className={`px-3 h-8 text-xs ${range === '1H' ? 'bg-muted/50 dark:bg-muted/20 text-foreground' : 'text-muted-foreground'}`}>
							{range}
						</Button>
					))}
				</div>
			</div>

			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] p-4 py-6">
				<CardContent className="px-2 flex justify-between items-center">
					<div>
						<p className="subtext">Investable Amount</p>
						<p className="amount-heading">{categoryData.investableAmount}</p>
					</div>
					<Button onClick={handleBuyNow} size={'lg'} variant={'fixed-cta'} disabled={isLoadingPurchase}>
						{isLoadingPurchase ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							'Buy Now'
						)}
					</Button>
				</CardContent>
			</Card>

			<Tabs defaultValue="activity" className="w-full">
				<TabsList className="bg-transparent p-0 h-auto gap-4 pb-2 mb-4">
					<TabsTrigger value="activity" className="data-[state=active]:text-[var(--dashboard-accent)] data-[state=inactive]:text-muted-foreground rounded-none justify-start pb-2 text-base font-semibold !bg-transparent !border-0">
						Activity
					</TabsTrigger>
					<TabsTrigger value="positions" className="data-[state=active]:text-[var(--dashboard-accent)] data-[state=inactive]:text-muted-foreground rounded-none justify-start pb-2 text-base font-semibold !bg-transparent !border-0">
						Open Positions
					</TabsTrigger>
				</TabsList>

				<TabsContent value="activity" className="mt-0 space-y-4">
					{activityData.length > 0 ? (
						activityData.map((item) => (
							<div key={item.id} className="flex items-center justify-between pl-0 p-3 rounded-lg hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors">
								<div className="flex items-center gap-3">
									{item.isCredit ? (
										<div className="bg-[var(--success)] rounded-full p-3">
											<ArrowDown className="h-6 w-6 text-[var(--success-foreground)]" />
										</div>
									) : (
										<div className="bg-[var(--danger)] rounded-full p-3">
											<ArrowUp className="h-5 w-5 text-[var(--danger-foreground)]" />
										</div>
									)}
									<div>
										<p className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">{item.hash}</p>
										<p className="text-sm text-muted-foreground">{item.time}</p>
									</div>
								</div>
								<span className={`font-semibold ${item.isCredit ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{item.amount}</span>
							</div>
						))
					) : (
						<div className="text-center py-10 text-muted-foreground">No activity yet.</div>
					)}
				</TabsContent>

				<TabsContent value="positions" className="mt-0">
					<div className="text-center py-10 text-muted-foreground">No open positions.</div>
				</TabsContent>
			</Tabs>

			<InsufficientBalanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentBalance={currentUserBalance} requiredAmount={productPrice} />
		</div>
	);
}
