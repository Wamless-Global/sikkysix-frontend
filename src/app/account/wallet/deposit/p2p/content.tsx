'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import nProgress from 'nprogress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentType {
	id: string;
	name: string;
	avatar_url?: string;
	transactions: number;
	completionRate: number;
	rateNGN: number;
	rating: number;
}

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

	const [agents, setAgents] = useState<AgentType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);
		fetch(`/api/agents/active-with-orders/?order_type=buy&amount=${amount}`)
			.then((res) => {
				if (!res.ok) throw new Error('Failed to fetch agents');
				return res.json();
			})
			.then((data) => {
				// Map backend data to AgentType[]
				const apiAgents = data?.data?.agents || [];
				const mapped = apiAgents
					.filter((a: any) => Array.isArray(a.orders) && a.orders.length > 0)
					.map((a: any) => {
						const user = a.agent.user;
						const firstOrder = a.orders[0];
						return {
							id: a.agent.id,
							name: user?.name || user?.username || 'Unknown',
							avatar_url: user?.avatar_url,
							transactions: parseInt(a.agent.total_trades_completed || '0', 10),
							completionRate: 100, // Placeholder, backend does not provide
							rateNGN: firstOrder ? parseFloat(firstOrder.price_per_unit) : 0,
							rating: 5, // Placeholder, backend does not provide
						};
					});
				setAgents(mapped);
			})
			.catch(() => {
				setError('Failed to load agents');
			})
			.finally(() => setLoading(false));
	}, []);

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
		let agentsList = [...agents];
		if (appliedMinRating !== null) {
			agentsList = agentsList.filter((agent) => agent.rating >= appliedMinRating!);
		}
		if (appliedMinTransactions !== null) {
			agentsList = agentsList.filter((agent) => agent.transactions >= appliedMinTransactions!);
		}
		switch (sortBy) {
			case 'price_desc':
				agentsList.sort((a, b) => b.rateNGN - a.rateNGN);
				break;
			case 'completion_desc':
				agentsList.sort((a, b) => b.completionRate - a.completionRate);
				break;
			case 'orders_desc':
				agentsList.sort((a, b) => b.transactions - a.transactions);
				break;
			case 'rating_desc':
				agentsList.sort((a, b) => b.rating - a.rating);
				break;
			case 'default':
			default:
				break;
		}
		return agentsList;
	}, [agents, sortBy, appliedMinRating, appliedMinTransactions]);

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
			{loading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i} className="!bg-background shadow-sm flex flex-col">
							<CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-grow">
								<div className="flex items-center gap-3 w-full">
									<Skeleton className="h-12 w-12 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-5 w-32" />
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-4 w-24" />
									</div>
								</div>
								<div className="flex flex-col items-start sm:items-end w-full sm:w-auto pt-2 sm:pt-0 mt-auto">
									<Skeleton className="h-4 w-24 mb-2" />
									<Skeleton className="h-8 w-24" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : error ? (
				<Card className="bg-background border-0 shadow-none mt-10 text-center">
					<CardHeader className="px-0">
						<CardTitle className="text-lg text-foreground">Error</CardTitle>
					</CardHeader>
					<CardContent className="px-0">
						<p className="text-muted-foreground">{error}</p>
					</CardContent>
				</Card>
			) : displayAgents.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{displayAgents.map((agent) => (
						<Card key={agent.id} className="!bg-background shadow-sm flex flex-col transition-transform hover:scale-[1.015] hover:shadow-md border border-border/60">
							<CardContent className="p-4 flex flex-col gap-3 sm:gap-4 flex-grow">
								<div className="flex items-center gap-3">
									{agent.avatar_url ? (
										<img src={agent.avatar_url} alt={agent.name} className="h-12 w-12 rounded-full object-cover border border-border" />
									) : (
										<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">{agent.name[0]}</div>
									)}
									<div className="flex-1 min-w-0">
										<h3 className="text-base font-semibold text-foreground truncate">{agent.name}</h3>
										<div className="flex items-center gap-1 mt-0.5">
											<StarRating rating={agent.rating} />
											<span className="ml-1 text-xs text-muted-foreground">{agent.rating.toFixed(1)}</span>
										</div>
									</div>
									<span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20 ml-auto">Buy</span>
								</div>
								<div className="flex flex-col gap-1 sm:gap-2 mt-2">
									<div className="flex flex-wrap items-center gap-2 text-sm">
										<span className="text-muted-foreground">Price:</span>
										<span className="font-semibold text-base text-foreground">₦{agent.rateNGN.toLocaleString(undefined, { maximumFractionDigits: 5 })}</span>
										<span className="text-xs text-muted-foreground">per NGN</span>
									</div>
									<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
										<span>{agent.transactions} Transactions</span>
										<span className="hidden sm:inline">•</span>
										<span>{agent.completionRate}% Completion</span>
									</div>
								</div>
								<Button variant="success" size="sm" className="w-full mt-3 sm:mt-0 px-6" onClick={() => handleSelectAgent(agent)}>
									Select
								</Button>
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
