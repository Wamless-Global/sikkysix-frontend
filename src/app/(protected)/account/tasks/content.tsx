'use client';

import { useState, useEffect, useCallback } from 'react';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage } from '@/lib/helpers';
import { toast } from 'sonner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { CustomLink } from '@/components/ui/CustomLink';
import { Badge } from '@/components/ui/badge';
import nProgress from 'nprogress';

interface Task {
	id: string;
	title: string;
	description: string;
	reward?: string;
	instruction?: string;
	week_number: number;
	year: number;
}

interface UserTaskSubmission {
	id: string;
	task_id: string | number;
}

interface TasksApiResponse {
	status: string;
	tasks: Task[];
	count: number;
	hasMore: boolean;
}

interface SubmissionsApiResponse {
	status: string;
	submissions: UserTaskSubmission[];
	count: number;
	hasMore: boolean;
}

export default function TasksContent() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [submissions, setSubmissions] = useState<UserTaskSubmission[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchTasks = useCallback(async () => {
		nProgress.start();
		setIsLoading(true);
		setError(null);

		try {
			const [tasksResponse, submissionsResponse] = await Promise.all([fetchWithAuth('/api/tasks?pageSize=100'), fetchWithAuth('/api/task-submissions/user/me?pageSize=100')]);

			const tasksData: TasksApiResponse = await tasksResponse.json().catch(() => ({}) as TasksApiResponse);
			const submissionsData: SubmissionsApiResponse = await submissionsResponse.json().catch(() => ({}) as SubmissionsApiResponse);

			if (!tasksResponse.ok) {
				setError(handleFetchMessage(tasksData, 'Failed to load tasks'));
				return;
			}

			if (!submissionsResponse.ok) {
				toast.error(handleFetchMessage(submissionsData, 'Failed to load your submissions'));
			}

			if (tasksData.status === 'success' && Array.isArray(tasksData.tasks)) {
				const sortedTasks = tasksData.tasks.sort((a, b) => {
					if (b.year !== a.year) return b.year - a.year;
					return b.week_number - a.week_number;
				});
				setTasks(sortedTasks);
			} else {
				setTasks([]);
			}

			if (submissionsData.status === 'success' && Array.isArray(submissionsData.submissions)) {
				setSubmissions(submissionsData.submissions);
			} else {
				setSubmissions([]);
			}
		} catch (err) {
			console.error('Error fetching tasks:', err);
			setError('Failed to fetch tasks. Please try again.');
		} finally {
			setIsLoading(false);
			nProgress.done();
		}
	}, []);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	const handleRetry = () => {
		fetchTasks();
	};

	const currentWeek = getISOWeek(new Date());
	const currentYear = getISOWeekYear(new Date());

	return (
		<div className="space-y-6">
			<p className="account-page-title mt-0 mb-4 !text-xm">Tasks</p>

			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i} className="border-none shadow-sm">
							<CardHeader>
								<Skeleton className="h-6 w-1/3" />
							</CardHeader>
							<CardContent className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-10 w-32" />
							</CardContent>
						</Card>
					))}
				</div>
			) : error ? (
				<ErrorMessage message={error} onRetry={handleRetry} />
			) : tasks.length === 0 ? (
				<Card className="border-none shadow-sm">
					<CardContent className="p-6">
						<p className="text-muted-foreground text-center">No tasks found. Check back later!</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{tasks.map((task) => {
						const hasSubmitted = submissions.some((s) => String(s.task_id) === String(task.id));
						const isCurrentWeek = task.week_number === currentWeek && task.year === currentYear;

						return (
							<Card key={task.id} className="border-none shadow-sm">
								<CardHeader>
									<CardTitle>{task.title}</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-sm text-muted-foreground">{task.description}</p>
									{task.reward && <p className="text-yellow-600 dark:text-yellow-400 font-medium">Reward: {task.reward}</p>}
									<p className="text-sm text-muted-foreground">
										Week {task.week_number}, {task.year}
									</p>
									<div className="flex items-center gap-2">
										<Badge variant={hasSubmitted ? 'success' : 'secondary'}>{hasSubmitted ? 'Submitted' : 'Not Submitted'}</Badge>
									</div>
									{isCurrentWeek ? (
										<CustomLink href="/account/tasks/submit">
											<Button variant="default">Submit Entry</Button>
										</CustomLink>
									) : (
										<p className="text-sm text-muted-foreground">Submissions closed</p>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
