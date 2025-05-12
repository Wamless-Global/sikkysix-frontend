'use client';

import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, ImageOff, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { CustomLink } from '@/components/ui/CustomLink';
import nProgress from 'nprogress';
import { Skeleton } from '@/components/ui/skeleton';
import appSettings from '@/config/app';
import { generateSlug } from '@/lib/helpers';

interface Category {
	id: string;
	name: string;
	description?: string | null;
	ticker: string;
	is_locked: boolean;
	current_price_per_unit: number;
	quantity: number;
	total_liquidity: number;
	admin_target_multiplier?: number | null;
	created_by_admin_id: string;
	updated_at?: string | null;
	created_at: string;
	image?: string | null;
	is_launched?: boolean;
	fee?: number | null;
	volatility_factor?: number | null;
	circulating_supply?: number;
	market_cap?: number;
	holders?: number;
}

// API response structure for paginated data
interface ApiCategoriesData {
	categories: Category[];
	hasMore: boolean;
	currentPage: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

interface PaginatedCategoriesResponse {
	status: string;
	data: ApiCategoriesData;
}

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
			const response = await fetch(`/api/admin/categories?page=${page}&limit=${appSettings.itemsPerPage}`);
			if (!response.ok) {
				let errorMessage = `API Error: ${response.status} ${response.statusText}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorMessage;
				} catch (jsonError) {}
				throw new Error(errorMessage);
			}
			const result: PaginatedCategoriesResponse = await response.json();

			if (result.status !== 'success') {
				throw new Error(result.data?.toString() || 'API returned an error without a message');
			}

			setCategories(result.data.categories);
			setCurrentPage(result.data.currentPage);
			setTotalPages(result.data.totalPages);
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('An unexpected error occurred while fetching categories.');
			}
			console.error('Failed to fetch categories:', err);
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
				<h1 className="text-3xl font-bold">Investment Category Management</h1>
				<CustomLink href={'/admin/categories/create'}>
					<Button size="lg">
						<PlusCircle className="mr-2 h-5 w-5" /> Create New Category
					</Button>
				</CustomLink>
			</div>

			<p className="text-lg text-muted-foreground">Oversee and manage all investment categories. View details, edit properties, and monitor performance.</p>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between" role="alert">
					<div className="flex items-center">
						<AlertCircle className="h-5 w-5 mr-2" />
						<strong className="font-bold">Error:</strong>
						<span className="block sm:inline ml-2">{error}</span>
					</div>
					<Button onClick={handleRetry} variant="outline" size="sm">
						Retry
					</Button>
				</div>
			)}

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
							<TableHead className="text-right">Market Cap</TableHead>
							<TableHead className="text-right">Holders</TableHead>
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
										<Skeleton className="h-4 w-[120px] ml-auto" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="h-4 w-[60px] ml-auto" />
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
											<img src={category.image} alt={category.name} className="h-10 w-10 object-cover rounded-sm" />
										) : (
											<div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground">
												<ImageOff size={20} />
											</div>
										)}
									</TableCell>
									<TableCell className="font-medium">
										<CustomLink href={`/admin/categories/${category.ticker}`} className="hover:underline text-primary">
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
									<TableCell className="text-right font-mono">${category.current_price_per_unit.toFixed(2)}</TableCell>
									<TableCell className="text-right font-mono">{category.market_cap ? `$${category.market_cap.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : <span className="text-gray-400 italic">N/A</span>}</TableCell>
									<TableCell className="text-right">{category.holders !== undefined ? category.holders.toLocaleString() : <span className="text-gray-400 italic">N/A</span>}</TableCell>
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
													<CustomLink href={`/admin/categories/${generateSlug(category.ticker)}/edit`} className="w-full justify-start cursor-pointer">
														Edit Category
													</CustomLink>
												</DropdownMenuItem>
												{/* <DropdownMenuItem onClick={() => alert(`Toggling lock for ${category.name}`)} className="cursor-pointer">
													{category.is_locked ? 'Unlock' : 'Lock'} Category
												</DropdownMenuItem> */}
												<DropdownMenuItem asChild>
													<CustomLink href={`/admin/categories/${generateSlug(category.ticker)}`} className="w-full justify-start cursor-pointer">
														View Details
													</CustomLink>
												</DropdownMenuItem>
												{/* <DropdownMenuSeparator /> */}
												{/* <DropdownMenuItem className="text-red-600 hover:!text-red-600 hover:!bg-red-100 focus:text-red-600 focus:bg-red-100 cursor-pointer" onClick={() => alert(`Deleting ${category.name}`)}>
													Delete Category
												</DropdownMenuItem> */}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={9} className="h-32 text-center text-lg text-muted-foreground">
									No categories found.
									{!isLoading && !error && (
										<Button variant="link" asChild className="ml-2">
											<CustomLink href={'/admin/categories/create'}>Create one now</CustomLink>
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
			{/* TODO: Consider more advanced pagination (e.g., page numbers) or infinite scrolling */}
		</div>
	);
}
