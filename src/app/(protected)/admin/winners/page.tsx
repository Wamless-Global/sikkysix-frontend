'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDateNice, handleFetchMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface Winner {
	id: string;
	name: string;
	prize_description: string;
	photo_url?: string;
	created_at: string;
}

const ITEMS_PER_PAGE = 10;

const fetchWinners = async (page: number): Promise<{ winners: Winner[]; totalCount: number }> => {
	const queryParams = new URLSearchParams();
	queryParams.append('page', page.toString());
	queryParams.append('pageSize', ITEMS_PER_PAGE.toString());

	const url = `/api/winners?${queryParams.toString()}`;

	try {
		const response = await fetchWithAuth(url);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || `Error fetching winners: ${response.statusText}`);
		}
		const result = await response.json();

		logger.log(result.winners);

		const fetchedWinners: Winner[] = result.winners.map((winner: any) => ({
			id: winner.id,
			name: winner.name,
			prize_description: winner.prize_description,
			photo_url: winner.photo_url,
			created_at: winner.created_at,
		}));

		return { winners: fetchedWinners, totalCount: result.count };
	} catch (error: any) {
		throw error;
	}
};

export default function WeeklyWinnersPage() {
	const [winners, setWinners] = useState<Winner[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [retryCount, setRetryCount] = useState(0);

	// Form state
	const [winnerName, setWinnerName] = useState('');
	const [prizeDescription, setPrizeDescription] = useState('');
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [weekNumber, setWeekNumber] = useState('');
	const [year, setYear] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const { winners: fetchedWinners, totalCount: fetchedTotalCount } = await fetchWinners(currentPage);
				logger.log(fetchedWinners);

				setWinners(fetchedWinners);
				setTotalCount(fetchedTotalCount);
			} catch (err: any) {
				const errorMessage = handleFetchMessage(err, `Failed to fetch winners`);
				setError(errorMessage);
			} finally {
				setIsLoading(false);
			}
		};

		const timer = setTimeout(() => {
			fetchData();
		}, 300);

		return () => clearTimeout(timer);
	}, [currentPage, retryCount]);

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

	const handleRetry = () => {
		setRetryCount((c) => c + 1);
	};

	const handleSubmitWinner = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Calculate ISO week number if not provided
			const getISOWeek = (date: Date): number => {
				const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
				const dayNum = d.getUTCDay() || 7;
				d.setUTCDate(d.getUTCDate() + 4 - dayNum);
				const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
				return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
			};

			const formData = new FormData();
			formData.append('name', winnerName);
			formData.append('prize_description', prizeDescription);
			formData.append('week_number', weekNumber || getISOWeek(new Date()).toString());
			formData.append('year', year || new Date().getFullYear().toString());
			if (photoFile) {
				formData.append('photo', photoFile);
			}

			const response = await fetchWithAuth('/api/winners', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to add winner');
			}

			toast.success('Winner added successfully!');
			setWinnerName('');
			setPrizeDescription('');
			setPhotoFile(null);
			setWeekNumber('');
			setYear('');
			setCurrentPage(1);
			setRetryCount((c) => c + 1);
		} catch (err: any) {
			const errorMessage = handleFetchMessage(err, 'Failed to add winner');
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-3xl font-bold">Weekly Winners</h1>

			<p className="text-lg text-muted-foreground">Manage weekly winners and their prizes.</p>

			{/* Upload Form Section */}
			<div className="bg-card rounded-lg border border-border p-6">
				<h2 className="text-xl font-semibold mb-4">Add New Winner</h2>
				<form onSubmit={handleSubmitWinner} className="space-y-4">
					<div>
						<Label htmlFor="winner-name">Winner Name</Label>
						<Input id="winner-name" placeholder="Enter winner name" value={winnerName} onChange={(e) => setWinnerName(e.target.value)} required disabled={isSubmitting} />
					</div>

					<div>
						<Label htmlFor="prize-description">Prize Description</Label>
						<Textarea id="prize-description" placeholder="Enter prize description" value={prizeDescription} onChange={(e) => setPrizeDescription(e.target.value)} required disabled={isSubmitting} />
					</div>

					<div>
						<Label htmlFor="photo-upload">Photo</Label>
						<Input id="photo-upload" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} disabled={isSubmitting} />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="week-number">Week Number (optional)</Label>
							<Input id="week-number" type="number" min="1" max="53" placeholder="Current week" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} disabled={isSubmitting} />
						</div>
						<div>
							<Label htmlFor="year">Year (optional)</Label>
							<Input id="year" type="number" min="2020" max={new Date().getFullYear()} placeholder="Current year" value={year} onChange={(e) => setYear(e.target.value)} disabled={isSubmitting} />
						</div>
					</div>

					<Button type="submit" variant="success" disabled={isSubmitting || !winnerName || !prizeDescription}>
						{isSubmitting ? 'Adding...' : 'Add Winner'}
					</Button>
				</form>
			</div>

			{/* Past Winners List Section */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Past Winners</h2>

				{error ? (
					<ErrorMessage message={error} onRetry={handleRetry} />
				) : (
					<>
						<div className="rounded-md border mt-4">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Prize</TableHead>
										<TableHead>Photo</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										Array.from({ length: ITEMS_PER_PAGE / 2 }).map((_, index) => (
											<TableRow key={`skeleton-${index}`}>
												<TableCell>
													<Skeleton className="h-4 w-[120px]" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-[180px]" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-10 w-10 rounded" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-[150px]" />
												</TableCell>
											</TableRow>
										))
									) : winners.length > 0 ? (
										winners.map((winner: Winner) => (
											<TableRow key={winner.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
												<TableCell className="font-medium">{winner.name}</TableCell>
												<TableCell>{winner.prize_description}</TableCell>
												<TableCell>{winner.photo_url ? <Image src={winner.photo_url} alt={`${winner.name}'s photo`} width={40} height={40} className="rounded" /> : <span className="text-muted-foreground">N/A</span>}</TableCell>
												<TableCell>{formatDateNice(new Date(winner.created_at))}</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={4} className="h-24 text-center">
												No winners found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						{totalPages > 1 && (
							<div className="flex items-center justify-between space-x-2 py-4 px-2">
								<div className="text-sm text-muted-foreground">
									Showing page {currentPage} of {totalPages} ({totalCount} winners total)
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
		</div>
	);
}
