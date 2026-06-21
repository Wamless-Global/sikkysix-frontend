'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { formatDateNice, handleFetchMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';

interface TaskSubmission {
	id: string;
	user_name: string;
	task_title: string;
	submission_content: string;
	created_at: string;
}

const ITEMS_PER_PAGE = 10;

const fetchTaskSubmissions = async (page: number): Promise<{ submissions: TaskSubmission[]; totalCount: number }> => {
	const queryParams = new URLSearchParams();
	queryParams.append('page', page.toString());
	queryParams.append('pageSize', ITEMS_PER_PAGE.toString());

	const url = `/api/task-submissions?${queryParams.toString()}`;

	try {
		const response = await fetchWithAuth(url);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || `Error fetching task submissions: ${response.statusText}`);
		}
		const result = await response.json();

		logger.log(result.submissions);

		const fetchedSubmissions: TaskSubmission[] = result.submissions.map((submission: any) => ({
			id: submission.id,
			user_name: submission.user_name || 'N/A',
			task_title: submission.task_title || 'N/A',
			submission_content: submission.submission_content || submission.content || '',
			created_at: submission.created_at,
		}));

		return { submissions: fetchedSubmissions, totalCount: result.count };
	} catch (error: any) {
		throw error;
	}
};

export default function TaskSubmissionsPage() {
	const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [retryCount, setRetryCount] = useState(0);
	const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);

	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const { submissions: fetchedSubmissions, totalCount: fetchedTotalCount } = await fetchTaskSubmissions(currentPage);
				logger.log(fetchedSubmissions);

				setSubmissions(fetchedSubmissions);
				setTotalCount(fetchedTotalCount);
			} catch (err: any) {
				const errorMessage = handleFetchMessage(err, `Failed to fetch task submissions`);
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

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-3xl font-bold">Task Submissions</h1>

			<p className="text-lg text-muted-foreground">Review and manage user task submissions.</p>

			{error ? (
				<ErrorMessage message={error} onRetry={handleRetry} />
			) : (
				<>
					<div className="rounded-md border mt-4">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User Name</TableHead>
									<TableHead>Task Title</TableHead>
									<TableHead>Submission Content</TableHead>
									<TableHead>Submitted Date</TableHead>
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
												<Skeleton className="h-4 w-[200px]" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-[150px]" />
											</TableCell>
										</TableRow>
									))
								) : submissions.length > 0 ? (
									submissions.map((submission: TaskSubmission) => (
										<TableRow
											key={submission.id}
											className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
											onClick={() => setSelectedSubmission(submission)}
										>
											<TableCell className="font-medium">{submission.user_name}</TableCell>
											<TableCell>{submission.task_title}</TableCell>
											<TableCell className="max-w-xs truncate">{submission.submission_content}</TableCell>
											<TableCell>{formatDateNice(new Date(submission.created_at))}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4} className="h-24 text-center">
											No task submissions found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					<Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
						<DialogContent className="max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>{selectedSubmission?.task_title || 'Submission Details'}</DialogTitle>
								<DialogDescription className="space-y-2">
									<span className="block">
										<strong>User:</strong> {selectedSubmission?.user_name}
									</span>
									<span className="block">
										<strong>Task:</strong> {selectedSubmission?.task_title}
									</span>
									<span className="block">
										<strong>Submitted Date:</strong>{' '}
										{selectedSubmission ? formatDateNice(new Date(selectedSubmission.created_at)) : null}
									</span>
									<span className="block pt-2">
										<strong>Submission:</strong>
									</span>
									<span className="block whitespace-pre-wrap break-words">{selectedSubmission?.submission_content}</span>
								</DialogDescription>
							</DialogHeader>
						</DialogContent>
					</Dialog>

					{totalPages > 1 && (
						<div className="flex items-center justify-between space-x-2 py-4 px-2">
							<div className="text-sm text-muted-foreground">
								Showing page {currentPage} of {totalPages} ({totalCount} submissions total)
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
