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
import { formatDateNice, getAgentStatusVariant, handleFetchErrorMessage } from '@/lib/helpers';
import { Application, ApplicationStatus } from '@/types';

// Define ApplicationFilters type based on API endpoint parameters
interface ApplicationFilters {
	searchTerm?: string;
	status?: ApplicationStatus;
}

// Assuming these constants exist or need to be defined
const ALL_APPLICATION_STATUSES = ['pending', 'approved', 'rejected', 'needs_more_info'];

const ITEMS_PER_PAGE = 10;

// Function to fetch applications from the API
const fetchApplications = async (filters: ApplicationFilters, page: number): Promise<{ applications: Application[]; totalCount: number }> => {
	const queryParams = new URLSearchParams();

	if (filters.searchTerm) {
		queryParams.append('searchTerm', filters.searchTerm);
	}
	if (filters.status) {
		queryParams.append('status', filters.status);
	}

	// Add pagination parameters
	queryParams.append('page', page.toString());
	queryParams.append('pageSize', ITEMS_PER_PAGE.toString());

	const url = `/api/agents/applications?${queryParams.toString()}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || `Error fetching applications: ${response.statusText}`);
		}
		const result = await response.json();

		console.log(result.data.applications);

		const fetchedApplications: Application[] = result.data.applications.map((app: any) => ({
			id: app.id,
			user_id: app.user_id,
			application_data: app.application_data,
			admin_remarks: app.admin_remarks,
			reviewed_by: app.reviewed_by,
			reviewed_at: app.reviewed_at,
			updated_at: app.updated_at,
			created_at: app.created_at,
			status: app.status,
			user: {
				id: app.user.id,
				name: app.user.name,
				email: app.user.email,
				avatar_url: app.user.avatar_url,
			},
		}));

		return { applications: fetchedApplications, totalCount: result.data.totalCount };
	} catch (error: any) {
		throw error;
	}
};

export default function ApplicationsPage() {
	const [applications, setApplications] = useState<Application[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);

	const [searchTerm, setSearchTerm] = useState('');
	const [filterStatus, setFilterStatus] = useState<'all' | Application['status']>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [retryCount, setRetryCount] = useState(0);

	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	const filters: ApplicationFilters = {
		searchTerm: searchTerm || undefined,
		status: filterStatus === 'all' ? undefined : filterStatus,
	};

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const { applications: fetchedApplications, totalCount: fetchedTotalCount } = await fetchApplications(filters, currentPage);
				console.log(fetchedApplications);

				setApplications(fetchedApplications);
				setTotalCount(fetchedTotalCount);
			} catch (err: any) {
				const errorMessage = handleFetchErrorMessage(err, `Failed to fetch applications`);
				setError(errorMessage);
			} finally {
				setIsLoading(false);
			}
		};

		const timer = setTimeout(() => {
			fetchData();
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, filterStatus, currentPage, retryCount]);

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
		setFilterStatus('all');
		setCurrentPage(1);
	};

	const handleRetry = () => {
		setRetryCount((c) => c + 1);
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-3xl font-bold">Agent Applications</h1>

			<p className="text-lg text-muted-foreground">Use the filter below to refine the application list.</p>

			{error ? (
				<ErrorMessage message={error} onRetry={handleRetry} />
			) : (
				<>
					<div className="flex flex-wrap gap-2 items-end mt-8">
						{/* Status Filter */}
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="status-filter">Status</Label>
							<Select
								value={filterStatus}
								onValueChange={(value) => {
									setFilterStatus(value as 'all' | Application['status']);
									setCurrentPage(1);
								}}
							>
								<SelectTrigger className="w-full sm:w-[160px]" id="status-filter">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									{ALL_APPLICATION_STATUSES.map((status) => (
										<SelectItem key={status} value={status}>
											{status.charAt(0).toUpperCase() + status.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Button variant="outline" onClick={handleResetFilters} className="self-end">
							Reset Filters
						</Button>
					</div>

					<div className="rounded-md border mt-4">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Applicant</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Submission Date</TableHead>
									<TableHead>Status</TableHead>
									{/* <TableHead>Reviewed By</TableHead> */}
									<TableHead>Reviewed At</TableHead>
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
												<Skeleton className="h-4 w-[150px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-[70px] rounded-full" />
											</TableCell>
											{/* <TableCell>
												<Skeleton className="h-4 w-[120px]" />
											</TableCell> */}
											<TableCell>
												<Skeleton className="h-4 w-[150px]" />
											</TableCell>
										</TableRow>
									))
								) : applications.length > 0 ? (
									applications.map((app: Application) => (
										<TableRow key={app.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
											<TableCell className="font-medium">
												<CustomLink href={`/admin/applications/${app.id}`} className="flex items-center gap-3 text-primary">
													{app.user.avatar_url && <Image src={app.user.avatar_url} alt={`${app.user.name}'s profile picture`} width={40} height={40} className="rounded-full" />}
													<span>{app.user.name}</span>
												</CustomLink>
											</TableCell>
											<TableCell>{app.user.email}</TableCell>
											<TableCell>{formatDateNice(new Date(app.created_at))}</TableCell>
											<TableCell>
												<Badge variant={getAgentStatusVariant(app.status)}>{app.status}</Badge>
											</TableCell>
											{/* <TableCell>{app.reviewed_by ? app.reviewer?.name : 'N/A'}</TableCell> */}
											<TableCell>{app.reviewed_at ? formatDateNice(new Date(app.reviewed_at)) : 'N/A'}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className="h-24 text-center">
											No applications found {searchTerm || filterStatus !== 'all' ? 'matching your criteria' : ''}.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{totalPages > 1 && (
						<div className="flex items-center justify-between space-x-2 py-4 px-2">
							<div className="text-sm text-muted-foreground">
								Showing page {currentPage} of {totalPages} ({totalCount} applications total)
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
