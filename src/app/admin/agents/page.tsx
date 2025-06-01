'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { CustomLink } from '@/components/ui/CustomLink';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Agent, AgentFilters } from '@/types';

// Assuming these constants exist or need to be defined
const ALL_AVAILABILITY_STATUSES = ['available', 'offline', 'busy'];
const ALL_ACTIVE_STATUSES = [true, false];

// Assuming this helper function exists or needs to be defined
const getStatusVariant = (status: string) => {
	switch (status) {
		case 'active':
		case 'available':
			return 'default';
		case 'suspended':
		case 'offline':
			return 'destructive';
		case 'busy':
			return 'secondary';
		default:
			return 'default';
	}
};

const ITEMS_PER_PAGE = 10;

const fetchAgents = async (filters: AgentFilters, page: number): Promise<{ agents: Agent[]; totalCount: number }> => {
	const queryParams = new URLSearchParams();

	if (filters.searchTerm) {
		queryParams.append('searchTerm', filters.searchTerm);
	}
	if (filters.availability_status) {
		queryParams.append('availability_status', filters.availability_status);
	}
	if (filters.is_active !== undefined) {
		queryParams.append('is_active', filters.is_active.toString());
	}
	if (filters.minTrades !== undefined) {
		queryParams.append('minTrades', filters.minTrades.toString());
	}
	if (filters.maxTrades !== undefined) {
		queryParams.append('maxTrades', filters.maxTrades.toString());
	}
	if (filters.minVolume !== undefined) {
		queryParams.append('minVolume', filters.minVolume.toString());
	}
	if (filters.maxVolume !== undefined) {
		queryParams.append('maxVolume', filters.maxVolume.toString());
	}

	// Add pagination parameters
	queryParams.append('page', page.toString());
	queryParams.append('pageSize', ITEMS_PER_PAGE.toString());

	const url = `/api/agents?${queryParams.toString()}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || `Error fetching agents: ${response.statusText}`);
		}
		const result = await response.json();

		// Map the fetched data to the Agent interface used in the component
		const fetchedAgents: Agent[] = result.data.agents.map((agent: any) => ({
			id: agent.id,
			user_id: agent.user_id,
			application_id: agent.application_id,
			is_active: agent.is_active,
			availability_status: agent.availability_status,
			total_trades_completed: agent.total_trades_completed,
			total_volume_traded_ngn: agent.total_volume_traded_ngn,
			positive_feedback_count: agent.positive_feedback_count,
			negative_feedback_count: agent.negative_feedback_count,
			avg_payment_time_minutes: agent.avg_payment_time_minutes,
			avg_release_time_minutes: agent.avg_release_time_minutes,
			last_seen_online: agent.last_seen_online,
			updated_at: agent.updated_at,
			account_details: agent.account_details,
			created_at: agent.created_at,
			user: {
				id: agent.user.id,
				name: agent.user.name,
				email: agent.user.email,
				avatar_url: agent.user.avatar_url,
			},
		}));

		return { agents: fetchedAgents, totalCount: result.data.count };
	} catch (error: any) {
		console.error('Failed to fetch agents:', error);
		throw error; // Re-throw to be caught by the component's error state
	}
};

export default function AgentsPage() {
	const [agents, setAgents] = useState<Agent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);

	const [searchTerm, setSearchTerm] = useState('');
	const [filterAvailabilityStatus, setFilterAvailabilityStatus] = useState<'all' | Agent['availability_status']>('all');
	const [filterIsActive, setFilterIsActive] = useState<'all' | 'true' | 'false'>('all');
	const [filterMinTrades, setFilterMinTrades] = useState<string>('');
	const [filterMaxTrades, setFilterMaxTrades] = useState<string>('');
	const [filterMinVolume, setFilterMinVolume] = useState<string>('');
	const [filterMaxVolume, setFilterMaxVolume] = useState<string>('');
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	const filters: AgentFilters = {
		searchTerm: searchTerm || undefined,
		availability_status: filterAvailabilityStatus === 'all' ? undefined : filterAvailabilityStatus,
		is_active: filterIsActive === 'all' ? undefined : filterIsActive === 'true',
		minTrades: filterMinTrades ? parseInt(filterMinTrades, 10) : undefined,
		maxTrades: filterMaxTrades ? parseInt(filterMaxTrades, 10) : undefined,
		minVolume: filterMinVolume ? parseFloat(filterMinVolume) : undefined,
		maxVolume: filterMaxVolume ? parseFloat(filterMaxVolume) : undefined,
	};

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const { agents: fetchedAgents, totalCount: fetchedTotalCount } = await fetchAgents(filters, currentPage);
				setAgents(fetchedAgents);
				setTotalCount(fetchedTotalCount);
			} catch (err: any) {
				setError(err.message || 'Failed to fetch agents.');
			} finally {
				setIsLoading(false);
			}
		};

		const timer = setTimeout(() => {
			fetchData();
		}, 300); // Debounce filter changes

		return () => clearTimeout(timer);
	}, [searchTerm, filterAvailabilityStatus, filterIsActive, filterMinTrades, filterMaxTrades, filterMinVolume, filterMaxVolume, currentPage]); // Added filters and currentPage as dependencies

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage((prev) => prev + 1);
		}
	};

	const handleResetFilters = () => {
		setSearchTerm('');
		setFilterAvailabilityStatus('all');
		setFilterIsActive('all');
		setFilterMinTrades('');
		setFilterMaxTrades('');
		setFilterMinVolume('');
		setFilterMaxVolume('');
		setCurrentPage(1);
	};

	const handleRetry = () => {
		// Re-run the effect by changing a state that triggers it, or directly call fetchData if it were outside useEffect
		// For simplicity, we can just reset filters or page to trigger a fetch, or refetch explicitly if fetchData was standalone
		// Let's just trigger a fetch by resetting page to 1
		setCurrentPage(1);
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-3xl font-bold">Agent Management</h1>

			<p className="text-lg text-muted-foreground">Use the filters below to refine the agent list.</p>

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
				<Input
					placeholder="Search by name or email..."
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setCurrentPage(1);
					}}
					className="max-w-lg w-full md:w-auto flex-grow"
				/>
			</div>

			{error ? (
				<ErrorMessage message={error} onRetry={handleRetry} />
			) : (
				<>
					<div className="flex flex-wrap gap-2 items-end mt-8">
						{/* Availability Status Filter */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="availability-filter">Availability Status</Label>
							<Select
								value={filterAvailabilityStatus}
								onValueChange={(value) => {
									setFilterAvailabilityStatus(value as 'all' | Agent['availability_status']);
									setCurrentPage(1);
								}}
							>
								<SelectTrigger className="w-full sm:w-[160px]" id="availability-filter">
									<SelectValue placeholder="Availability" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									{ALL_AVAILABILITY_STATUSES.map((status) => (
										<SelectItem key={status} value={status}>
											{status.charAt(0).toUpperCase() + status.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Is Active Filter */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="active-filter">Active Status</Label>
							<Select
								value={filterIsActive}
								onValueChange={(value) => {
									setFilterIsActive(value as 'all' | 'true' | 'false');
									setCurrentPage(1);
								}}
							>
								<SelectTrigger className="w-full sm:w-[160px]" id="active-filter">
									<SelectValue placeholder="Active Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="true">Active</SelectItem>
									<SelectItem value="false">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Min Trades Filter */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="min-trades">Min Trades</Label>
							<Input
								id="min-trades"
								type="number"
								value={filterMinTrades}
								onChange={(e) => {
									setFilterMinTrades(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full sm:w-[120px]"
								min="0"
							/>
						</div>

						{/* Max Trades Filter */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="max-trades">Max Trades</Label>
							<Input
								id="max-trades"
								type="number"
								value={filterMaxTrades}
								onChange={(e) => {
									setFilterMaxTrades(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full sm:w-[120px]"
								min="0"
							/>
						</div>

						{/* Min Volume Filter */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="min-volume">Min Volume</Label>
							<Input
								id="min-volume"
								type="number"
								value={filterMinVolume}
								onChange={(e) => {
									setFilterMinVolume(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full sm:w-[120px]"
								min="0"
								step="0.01"
							/>
						</div>

						{/* Max Volume Filter */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="max-volume">Max Volume</Label>
							<Input
								id="max-volume"
								type="number"
								value={filterMaxVolume}
								onChange={(e) => {
									setFilterMaxVolume(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full sm:w-[120px]"
								min="0"
								step="0.01"
							/>
						</div>

						<Button variant="outline" onClick={handleResetFilters} className="self-end">
							Reset Filters
						</Button>
					</div>

					<div className="rounded-md border mt-4">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Availability Status</TableHead>
									<TableHead>Active Status</TableHead>
									<TableHead>Trades</TableHead>
									<TableHead>Volume</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: ITEMS_PER_PAGE / 2 }).map((_, index) => (
										<TableRow key={`skeleton-${index}`}>
											<TableCell className="flex items-center gap-3">
												<Skeleton className="h-10 w-10 rounded-full" />
												<Skeleton className="h-4 w-[120px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[180px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[100px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[100px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[50px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[80px]" />
											</TableCell>
										</TableRow>
									))
								) : agents.length > 0 ? (
									agents.map((agent: Agent) => (
										<TableRow key={agent.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
											<TableCell className="font-medium">
												<CustomLink href={`/admin/agents/${agent.id}`} className="flex items-center gap-3 text-primary">
													{agent.user.avatar_url && <Image src={agent.user.avatar_url} alt={`${agent.user.name}'s profile picture`} width={40} height={40} className="rounded-full" />}
													<span>{agent.user.name}</span>
												</CustomLink>
											</TableCell>
											<TableCell>{agent.user.email}</TableCell>
											<TableCell>
												<Badge variant={getStatusVariant(agent.availability_status)}>{agent.availability_status}</Badge>
											</TableCell>
											<TableCell>
												<Badge variant={getStatusVariant(agent.is_active ? 'active' : 'suspended')}>{agent.is_active ? 'Active' : 'Inactive'}</Badge>
											</TableCell>
											<TableCell>{agent.total_trades_completed}</TableCell>
											<TableCell>${parseFloat(agent.total_volume_traded_ngn).toLocaleString()}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className="h-24 text-center">
											No agents found {searchTerm || filterAvailabilityStatus !== 'all' || filterIsActive !== 'all' || filterMinTrades || filterMaxTrades || filterMinVolume || filterMaxVolume ? 'matching your criteria' : ''}.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{totalPages > 1 && (
						<div className="flex items-center justify-between space-x-2 py-4 px-2">
							<div className="text-sm text-muted-foreground">
								Showing page {currentPage} of {totalPages} ({totalCount} agents total)
							</div>
							<div className="space-x-2 flex items-center">
								<Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading} className="cursor-pointer">
									<ChevronLeft className="h-4 w-4 mr-1" />
									Previous
								</Button>
								<Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || isLoading} className="cursor-pointer">
									Next
									<ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
