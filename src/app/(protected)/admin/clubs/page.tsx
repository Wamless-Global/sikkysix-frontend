'use client';

import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { CustomLink } from '@/components/ui/CustomLink';
import nProgress from 'nprogress';
import { Skeleton } from '@/components/ui/skeleton';
import appSettings from '@/config/app';
import { formatBaseurrency, generateSlug, handleFetchMessage } from '@/lib/helpers';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Category, PaginatedCategoriesResponse } from '@/types';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';

// Helper function to determine badge variant based on lock status
const getLockStatusVariant = (isLocked: boolean): 'destructive' | 'default' => {
	return isLocked ? 'destructive' : 'default';
};

export default function CategoryManagementPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const fetchCategories = useCallback(async (page: number) => {
		nProgress.start();
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetchWithAuth(`/api/categories?page=${page}&limit=${appSettings.itemsPerPage}`);
			if (!response.ok) {
				let errorMessage = `API Error: ${response.status} ${response.statusText}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorMessage;
				} catch (_jsonError) {}
				throw new Error(errorMessage);
			}
			const result: PaginatedCategoriesResponse = await response.json();

			logger.log('Fetched categories:', result);

			if (result.status !== 'success') {
				throw new Error(result.data?.toString() || 'API returned an error without a message');
			}

			setCategories(result.data.categories);
			setCurrentPage(result.data.currentPage);
			setTotalPages(result.data.totalPages);
		} catch (err) {
			// console.error('Failed to fetch categories:', err);
			const errorMessage = handleFetchMessage(err, 'An unexpected error occurred while fetching categories.');
			setError(errorMessage);
			setCategories([]);
		} finally {
			setIsLoading(false);
			nProgress.done();
		}
	}, []);

	useEffect(() => {
		fetchCategories(currentPage);
	}, [currentPage, fetchCategories]);

	const handleRetry = () => {
		fetchCategories(currentPage);
	};

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

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Investment Club Management</h1>
				<CustomLink href={'/admin/clubs/create'}>
					<Button size="lg">
						<PlusCircle className="mr-2 h-5 w-5" /> Create New Club
					</Button>
				</CustomLink>
			</div>

			<p className="text-lg text-muted-foreground">Oversee and manage all investment clubs. View details, edit properties, and monitor performance.</p>

			{error ? (
				<ErrorMessage message={error} onRetry={handleRetry} />
			) : (
				<>
					<div className="rounded-md border bg-card shadow-sm">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[80px]">Image</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Ticker</TableHead>
									<TableHead className="max-w-xs">Description</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Price/Unit</TableHead>
									<TableHead className="text-right">Min Invest</TableHead>
									<TableHead className="text-right">Max Invest</TableHead>
									<TableHead className="text-center">
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: appSettings.itemsPerPage / 2 }).map((_, index) => (
										<TableRow key={`skeleton-${index}`}>
											<TableCell>
												<Skeleton className="h-10 w-10 rounded-sm" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[150px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[80px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[200px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-[70px] rounded-full" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="h-4 w-[100px] ml-auto" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="h-4 w-[70px] ml-auto" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="h-4 w-[70px] ml-auto" />
											</TableCell>
											<TableCell className="text-center">
												<Button variant="ghost" className="h-8 w-8 p-0" disabled>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : categories.length > 0 ? (
									categories.map((category) => (
										<TableRow key={category.id} className="hover:bg-muted/50 transition-colors">
											<TableCell>
												{category.image ? (
													<Image width={40} height={40} src={category.image} alt={category.name} className="h-10 w-10 object-cover rounded-sm" />
												) : (
													<div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground">
														<ImageOff size={20} />
													</div>
												)}
											</TableCell>
											<TableCell className="font-medium">
												<CustomLink href={`/admin/clubs/${generateSlug(category.ticker)}`} className="hover:underline text-primary">
													{category.name}
												</CustomLink>
											</TableCell>
											<TableCell className="text-muted-foreground">{category.ticker}</TableCell>
											<TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={category.description || undefined}>
												{category.description || <span className="text-gray-400 italic">No description</span>}
											</TableCell>
											<TableCell>
												<Badge variant={getLockStatusVariant(category.is_locked)}>{category.is_locked ? 'Locked' : 'Unlocked'}</Badge>
											</TableCell>
											<TableCell className="text-right font-mono">{formatBaseurrency(category.current_price_per_unit)}</TableCell>
											<TableCell className="text-right font-mono">{category.minimum_investable !== undefined ? `${formatBaseurrency(category.minimum_investable, 2, false)}` : <span className="text-gray-400 italic">N/A</span>}</TableCell>
											<TableCell className="text-right font-mono">{category.maximum_investable !== undefined ? `${formatBaseurrency(category.maximum_investable, 2, false)}` : <span className="text-gray-400 italic">N/A</span>}</TableCell>
											<TableCell className="text-center">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<span className="sr-only">Open menu for {category.name}</span>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem asChild>
															<CustomLink href={`/admin/clubs/${generateSlug(category.ticker)}/edit`} className="w-full justify-start cursor-pointer">
																Edit Category
															</CustomLink>
														</DropdownMenuItem>
														<DropdownMenuItem asChild>
															<CustomLink href={`/admin/clubs/${generateSlug(category.ticker)}`} className="w-full justify-start cursor-pointer">
																View Details
															</CustomLink>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={11} className="h-32 text-center text-lg text-muted-foreground">
											No categories found.
											{!isLoading && !error && (
												<Button variant="link" asChild className="ml-2">
													<CustomLink href={'/admin/clubs/create'}>Create one now</CustomLink>
												</Button>
											)}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{!isLoading && categories.length > 0 && totalPages > 1 && (
						<div className="flex items-center justify-end space-x-2 py-4">
							<span className="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</span>
							<Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading}>
								<ChevronLeft className="mr-1 h-4 w-4" />
								Previous
							</Button>
							<Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || isLoading}>
								Next
								<ChevronRight className="ml-1 h-4 w-4" />
							</Button>
						</div>
					)}
				</>
			)}
			{/* TODO: Consider more advanced pagination (e.g., page numbers) or infinite scrolling */}
		</div>
	);
}
