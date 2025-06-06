'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { CustomLink } from '@/components/ui/CustomLink';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorMessage from '@/components/ui/ErrorMessage';
import nProgress from 'nprogress';
import { useAuthContext } from '@/context/AuthContext';
import { generateSlug, handleFetchErrorMessage } from '@/lib/helpers';
import { ApiCategoriesResponse, Category, UserDisplayCategory } from '@/types';

export default function AccountPage() {
	const [categories, setCategories] = useState<UserDisplayCategory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { currentUser } = useAuthContext();

	const fetchUserCategories = useCallback(async () => {
		nProgress.start();
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/categories');

			if (!response.ok) {
				let errorMessage = `API Error: ${response.status} ${response.statusText}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.error || errorMessage;
				} catch (_jsonError) {}
				throw new Error(errorMessage);
			}

			const result: ApiCategoriesResponse = await response.json();

			if (result.status === 'success' && result.data && Array.isArray(result.data.categories)) {
				const transformedCategories: UserDisplayCategory[] = result.data.categories.map((apiCat: Category) => ({
					id: apiCat.id,
					slug: apiCat.ticker,
					title: apiCat.name,
					image: apiCat.image,
					minimum: `${apiCat.minimum_investable}`,
					buttonText: 'View Details',
					buttonEnabled: Boolean(apiCat.is_launched) && !Boolean(apiCat.is_locked),
					description: apiCat.description,
				}));
				setCategories(transformedCategories);
			} else {
				console.warn('Unexpected API response structure or error status:', result);
				const errorMessage = typeof result.data === 'string' ? result.data : 'Failed to parse categories from API response.';
				if (result.status !== 'success') {
					throw new Error(result.data?.toString() || `API returned status: ${result.status}`);
				} else {
					throw new Error(errorMessage);
				}
			}
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'An unexpected error occurred while fetching categories.');
			setError(errorMessage);
			setCategories([]);
		} finally {
			setIsLoading(false);
			nProgress.done();
		}
	}, []);

	useEffect(() => {
		fetchUserCategories();
	}, [fetchUserCategories]);

	const handleRetry = () => {
		fetchUserCategories();
	};

	return (
		<div className="space-y-6">
			<div>
				<p className="account-page-title mt-0 mb-4">Home</p>
				<h2 className="text-2xl font-semibold text-text-primary mb-1">Welcome, {currentUser?.name || 'User'}</h2>
				<p className="text-text-secondary">Get the opportunity to own shares in a unique category</p>
			</div>

			{isLoading && (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={`skeleton-${index}`} className="rounded-lg border bg-card text-card-foreground shadow-sm">
							<div className="p-6 flex flex-col items-start space-y-4">
								<Skeleton className="h-40 w-full rounded-md" />
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-10 w-full rounded-md" />
							</div>
						</div>
					))}
				</div>
			)}

			{error && !isLoading && <ErrorMessage message={error} onRetry={handleRetry} />}

			{!isLoading && !error && categories.length === 0 && (
				<div className="h-[50svh] flex-col flex justify-center items-center">
					<p className="text-xl text-muted-foreground">No categories available at the moment.</p>
					<p className="text-sm text-muted-foreground mt-2">Please check back later or contact support if you believe this is an error.</p>
				</div>
			)}

			{!isLoading && !error && categories.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
					{categories.map((category) =>
						category.buttonEnabled ? (
							<CustomLink key={category.id} href={`/account/category/${generateSlug(category.slug)}`} className="block hover:opacity-90 transition-opacity">
								<DashboardCard title={category.title} image={category.image || '/Variety-fruits-vegetables.png'} minimum={category.minimum} buttonText={category.buttonText} buttonEnabled={category.buttonEnabled} />
							</CustomLink>
						) : (
							<div key={category.id}>
								<DashboardCard title={category.title} image={category.image || '/Variety-fruits-vegetables.png'} minimum={category.minimum} buttonText={category.buttonText} buttonEnabled={category.buttonEnabled} />
							</div>
						)
					)}
				</div>
			)}
		</div>
	);
}
