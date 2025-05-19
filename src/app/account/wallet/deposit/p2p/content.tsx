'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import nProgress from 'nprogress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

type AgentType = (typeof mockAgents)[0];

// Mock Data for P2P Agents - Replace with actual data fetching
const mockAgents = [
	{
		id: '1',
		name: 'John Doe',
		transactions: 32,
		completionRate: 91,
		rateNGN: 1653.21,
		rating: 4.5,
	},
	{
		id: '2',
		name: 'Sung Jin Woo',
		transactions: 32,
		completionRate: 91,
		rateNGN: 1653.21,
		rating: 4.0,
	},
	{
		id: '3',
		name: 'Scarlett Johanson',
		transactions: 32,
		completionRate: 91,
		rateNGN: 1653.21,
		rating: 3.5,
	},
	{
		id: '4',
		name: 'Thor Odinsonn',
		transactions: 32,
		completionRate: 91,
		rateNGN: 1653.21,
		rating: 5.0,
	},
];

const StarRating: React.FC<{ rating: number; maxStars?: number }> = ({ rating, maxStars = 5 }) => {
	const fullStars = Math.floor(rating);
	const halfStar = rating % 1 !== 0;
	const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

	return (
		<div className="flex items-center">
			{[...Array(fullStars)].map((_, i) => (
				<Star key={`full-${i}`} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
			))}
			{[...Array(emptyStars)].map((_, i) => (
				<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300 dark:text-gray-600" />
			))}
		</div>
	);
};

export default function P2PAgentListPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const amount = searchParams.get('amount');

	type SortByType = 'price_desc' | 'completion_desc' | 'orders_desc' | 'rating_desc' | 'default';
	const [sortBy, setSortBy] = useState<SortByType>('default');

	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [showSortOptions, setShowSortOptions] = useState(false);
	const [tempMinRating, setTempMinRating] = useState('');
	const [tempMinTransactions, setTempMinTransactions] = useState('');
	const [appliedMinRating, setAppliedMinRating] = useState<number | null>(null);
	const [appliedMinTransactions, setAppliedMinTransactions] = useState<number | null>(null);

	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [selectedAgentForConfirmation, setSelectedAgentForConfirmation] = useState<AgentType | null>(null);
	const [isRedirecting, setIsRedirecting] = useState(false);

	const handleApplyFilters = () => {
		setAppliedMinRating(tempMinRating ? parseFloat(tempMinRating) : null);
		setAppliedMinTransactions(tempMinTransactions ? parseInt(tempMinTransactions, 10) : null);
		setIsFilterOpen(false);
	};

	const handleClearFilters = () => {
		setTempMinRating('');
		setTempMinTransactions('');
		setAppliedMinRating(null);
		setAppliedMinTransactions(null);
		setIsFilterOpen(false);
	};

	const displayAgents = useMemo(() => {
		let agents = [...mockAgents];

		if (appliedMinRating !== null) {
			agents = agents.filter((agent) => agent.rating >= appliedMinRating!);
		}
		if (appliedMinTransactions !== null) {
			agents = agents.filter((agent) => agent.transactions >= appliedMinTransactions!);
		}

		switch (sortBy) {
			case 'price_desc':
				agents.sort((a, b) => b.rateNGN - a.rateNGN);
				break;
			case 'completion_desc':
				agents.sort((a, b) => b.completionRate - a.completionRate);
				break;
			case 'orders_desc':
				agents.sort((a, b) => b.transactions - a.transactions);
				break;
			case 'rating_desc':
				agents.sort((a, b) => b.rating - a.rating);
				break;
			case 'default':
			default:
				break;
		}
		return agents;
	}, [sortBy, appliedMinRating, appliedMinTransactions]);

	const handleSelectAgent = (agent: AgentType) => {
		setSelectedAgentForConfirmation(agent);
		setIsConfirmModalOpen(true);
	};

	const proceedToNewOrder = () => {
		if (!selectedAgentForConfirmation) return;

		setIsRedirecting(true);
		nProgress.start();

		setTimeout(() => {
			router.push(`/account/wallet/deposit/p2p/new-order?agentId=${selectedAgentForConfirmation.id}&amount=${amount}`);
			setIsConfirmModalOpen(false);
			setIsRedirecting(false);
			setSelectedAgentForConfirmation(null);
		}, 2000);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row gap-4 justify-between items-center">
				<h1 className="sub-page-heading">P2P Agents {amount ? `(Buy ₦${amount})` : ''}</h1>

				<div className="flex gap-2 items-center">
					<Button variant="ghost" size="sm" onClick={() => setShowSortOptions(!showSortOptions)} className={`text-muted-foreground hover:text-foreground ${showSortOptions ? 'text-foreground font-bold' : ''}`}>
						Sort By
					</Button>
					<DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
								<Filter className="mr-1 h-4 w-4" />
								Filter
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-64 p-2" align="end">
							<DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">Filter Agents</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<div className="px-1 py-1 space-y-2">
								<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent p-1">
									<div className="flex flex-col w-full space-y-1">
										<Label htmlFor="minRating" className="text-xs px-1">
											Min Rating (0-5)
										</Label>
										<Input id="minRating" type="number" min="0" max="5" step="0.1" value={tempMinRating} onChange={(e) => setTempMinRating(e.target.value)} className="h-8 text-sm" placeholder="e.g. 4.0" />
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent p-1">
									<div className="flex flex-col w-full space-y-1">
										<Label htmlFor="minTransactions" className="text-xs px-1">
											Min Transactions
										</Label>
										<Input id="minTransactions" type="number" min="0" step="1" value={tempMinTransactions} onChange={(e) => setTempMinTransactions(e.target.value)} className="h-8 text-sm" placeholder="e.g. 10" />
									</div>
								</DropdownMenuItem>
							</div>
							<DropdownMenuSeparator />
							<div className="flex justify-end gap-2 px-2 py-1.5">
								<Button variant="outline" size="sm" onClick={handleClearFilters} className="text-xs">
									Clear
								</Button>
								<Button size="sm" onClick={handleApplyFilters} className="text-xs">
									Apply
								</Button>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div
				className={`
                    overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${showSortOptions ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}
                `}
			>
				<div className="pb-0">
					<div className="flex flex-wrap gap-2">
						<Button size="lg" variant={sortBy === 'price_desc' ? 'default' : 'outline'} onClick={() => setSortBy('price_desc')}>
							Price (high to low)
						</Button>
						<Button size="lg" variant={sortBy === 'completion_desc' ? 'default' : 'outline'} onClick={() => setSortBy('completion_desc')}>
							Completion Rate
						</Button>
						<Button size="lg" variant={sortBy === 'orders_desc' ? 'default' : 'outline'} onClick={() => setSortBy('orders_desc')}>
							Completed Orders
						</Button>
						<Button size="lg" variant={sortBy === 'rating_desc' ? 'default' : 'outline'} onClick={() => setSortBy('rating_desc')}>
							Rating
						</Button>
					</div>
				</div>
			</div>
			{displayAgents.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{displayAgents.map((agent) => (
						<Card key={agent.id} className="!bg-background shadow-sm flex flex-col">
							<CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-grow">
								<div className="flex-grow">
									<h3 className="text-lg font-semibold text-foreground mb-0.5">{agent.name}</h3>
									<div className="flex items-center gap-1 mb-1">
										<StarRating rating={agent.rating} />
									</div>
									<p className="text-sm text-muted-foreground">
										NGN <span className="font-semibold text-base text-foreground">{agent.rateNGN.toFixed(5)}</span>
									</p>
								</div>
								<div className="flex flex-col items-start sm:items-end w-full sm:w-auto pt-2 sm:pt-0 mt-auto">
									<p className="text-xs text-muted-foreground mb-0.5">{agent.transactions} Transactions</p>
									<p className="text-xs text-muted-foreground mb-2">{agent.completionRate}% Completion</p>
									<Button variant="success" size="sm" className="w-full sm:w-auto px-6" onClick={() => handleSelectAgent(agent)}>
										Select
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card className="bg-background border-0 shadow-none mt-10 text-center">
					<CardHeader className="px-0">
						<CardTitle className="text-lg text-foreground">No Agents Available</CardTitle>
					</CardHeader>
					<CardContent className="px-0">
						<p className="text-muted-foreground">There are currently no P2P agents matching your criteria. Please try adjusting your filters or sort options, or check back later.</p>
					</CardContent>
				</Card>
			)}

			{selectedAgentForConfirmation && (
				<ConfirmationModal
					isOpen={isConfirmModalOpen}
					onClose={() => {
						if (!isRedirecting) {
							setIsConfirmModalOpen(false);
							setSelectedAgentForConfirmation(null);
						}
					}}
					onConfirm={proceedToNewOrder}
					title="Confirm Agent Selection"
					description={`Are you sure you want to proceed with ${selectedAgentForConfirmation.name}? They have a rate of NGN ${selectedAgentForConfirmation.rateNGN.toFixed(5)}.`}
					confirmButtonText="Proceed"
					cancelButtonText="Cancel"
					isLoading={isRedirecting}
				/>
			)}
		</div>
	);
}
