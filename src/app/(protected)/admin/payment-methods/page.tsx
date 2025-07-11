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
import { handleFetchMessage } from '@/lib/helpers';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Image from 'next/image';
import { toast } from 'sonner';
import { P2PMethod } from '@/types';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function P2PManagementPage() {
	const [methods, setMethods] = useState<P2PMethod[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const fetchMethods = useCallback(async (page: number) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetchWithAuth(`/api/p2p/payment-methods?page=${page}&limit=${appSettings.itemsPerPage}`);

			const result = await response.json();
			if (!response.ok) {
				setError(handleFetchMessage(result, 'Failed to fetch payment methods'));
				throw new Error('Failed to fetch payment methods');
			}

			setMethods(result.data);

			if (typeof result.count === 'number') {
				const total = Math.max(1, Math.ceil(result.count / appSettings.itemsPerPage));
				setTotalPages(total);
			} else {
				setTotalPages(1);
			}
			setCurrentPage(page);
			setIsLoading(false);
			nProgress.done();
		} catch (err) {
			setMethods([]);
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchMethods(currentPage);
	}, [currentPage, fetchMethods]);

	const handleRetry = () => fetchMethods(currentPage);

	const handlePreviousPage = () => {
		if (currentPage > 1) setCurrentPage((prev) => prev - 1);
	};
	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
	};

	const handleDelete = async (id: string | number, name: string) => {
		if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
		const toastId = toast.loading('Deleting payment method...');

		try {
			const response = await fetchWithAuth(`/api/p2p/payment-methods/${id}`, { method: 'DELETE' });
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || 'Failed to delete payment method');
			}
			toast.success(`Payment method "${name}" deleted successfully.`, { id: toastId });

			fetchMethods(currentPage);
		} catch (err: unknown) {
			toast.error(handleFetchMessage('Failed to delete payment method.'), { id: toastId });
		}
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">P2P Payment Methods</h1>
				<CustomLink href={'/admin/payment-methods/add'}>
					<Button size="lg">
						<PlusCircle className="mr-2 h-5 w-5" /> Add Payment Method
					</Button>
				</CustomLink>
			</div>
			<p className="text-lg text-muted-foreground">Manage all P2P payment methods. View, edit, and control their status.</p>
			{error ? (
				<ErrorMessage message={error} onRetry={handleRetry} />
			) : (
				<>
					<div className="rounded-md border bg-card shadow-sm">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[80px]"></TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Country</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Active</TableHead>
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
											<TableCell className="text-center">
												<Button variant="ghost" className="h-8 w-8 p-0" disabled>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : methods.length > 0 ? (
									methods.map((method) => (
										<TableRow key={method.id} className="hover:bg-muted/50 transition-colors">
											<TableCell>
												{method.logo_url ? (
													<Image width={40} height={40} src={method.logo_url} alt={method.name} className="h-10 w-10 object-cover rounded-sm" />
												) : (
													<div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground">
														<ImageOff size={20} />
													</div>
												)}
											</TableCell>
											<TableCell className="font-medium">{method.name}</TableCell>
											<TableCell className="text-muted-foreground">{method.country_name}</TableCell>
											<TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={method.description || undefined}>
												{method.description || <span className="text-gray-400 italic">No description</span>}
											</TableCell>
											<TableCell>
												<Badge variant={method.is_active ? 'default' : 'destructive'}>{method.is_active ? 'Active' : 'Inactive'}</Badge>
											</TableCell>
											<TableCell className="text-center">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<span className="sr-only">Open menu for {method.name}</span>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem asChild>
															<CustomLink href={`/admin/payment-methods/${method.id}`} className="w-full justify-start cursor-pointer">
																Edit Method
															</CustomLink>
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleDelete(method.id, method.name)}>
															<span className="w-full justify-start cursor-pointer text-destructive">Delete Method</span>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className="h-32 text-center text-lg text-muted-foreground">
											No payment methods found.
											{!isLoading && !error && (
												<Button variant="link" asChild className="ml-2">
													<CustomLink href={'/admin/payment-methods/add'}>Add one now</CustomLink>
												</Button>
											)}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
					{!isLoading && methods.length > 0 && totalPages > 1 && (
						<div className="flex items-center justify-end space-x-2 py-4">
							<span className="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</span>
							<Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading}>
								<ChevronLeft className="mr-1 h-4 w-4" /> Previous
							</Button>
							<Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || isLoading}>
								Next <ChevronRight className="ml-1 h-4 w-4" />
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
