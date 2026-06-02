'use client';

import { useEffect, useState, useCallback } from 'react';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomLink } from '@/components/ui/CustomLink';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorMessage from '@/components/ui/ErrorMessage';
import nProgress from 'nprogress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { handleFetchMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';

interface Task {
	id: string;
	title: string;
	reward: string;
	instruction: string;
	week_number: number;
	year: number;
}

export default function SubmitTaskContent() {
	const [task, setTask] = useState<Task | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [submissionContent, setSubmissionContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isDuplicate, setIsDuplicate] = useState(false);
	const [isWrongWeek, setIsWrongWeek] = useState(false);

	const checkExistingSubmission = useCallback(async (activeTaskId: string) => {
		try {
			const response = await fetchWithAuth('/api/task-submissions/user/me');
			if (response.ok) {
				const data = await response.json();
				if (data.status === 'success' && Array.isArray(data.submissions)) {
					const alreadySubmitted = data.submissions.some((s: any) => s.task_id === activeTaskId);
					if (alreadySubmitted) {
						setIsDuplicate(true);
					}
				}
			}
		} catch {
			// Silently fail — backend will guard duplicates on submit anyway
		}
	}, []);

	const fetchActiveTask = useCallback(async () => {
		nProgress.start();
		setIsLoading(true);
		setError(null);
		setIsWrongWeek(false);

		try {
			const response = await fetchWithAuth('/api/tasks?is_active=true');

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(handleFetchMessage(data, 'Failed to load active task'));
			}

			const taskData = await response.json();
			if (taskData.status === 'success' && Array.isArray(taskData.tasks) && taskData.tasks.length > 0) {
				const loadedTask = taskData.tasks[0];
				const currentWeek = getISOWeek(new Date());
				const currentYear = getISOWeekYear(new Date());

				setTask(loadedTask);

				if (loadedTask.week_number !== currentWeek || loadedTask.year !== currentYear) {
					setIsWrongWeek(true);
				} else {
					await checkExistingSubmission(loadedTask.id);
				}
			}
		} catch (err) {
			const errorMessage = handleFetchMessage(err, 'Failed to fetch task');
			setError(errorMessage);
		} finally {
			setIsLoading(false);
			nProgress.done();
		}
	}, [checkExistingSubmission]);

	useEffect(() => {
		fetchActiveTask();
	}, [fetchActiveTask]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!submissionContent.trim()) {
			toast.error('Please enter your submission');
			return;
		}

		if (!task) {
			toast.error('No active task available');
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetchWithAuth('/api/task-submissions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					task_id: task.id,
					submission_content: submissionContent,
				}),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));

				// Check for duplicate submission error (backend returns 400 with 'Duplicate submission rejected')
				if (data.message?.includes('Duplicate submission rejected')) {
					setIsDuplicate(true);
					toast.error("You've already submitted for this task");
					return;
				}

				throw new Error(data.message || 'Failed to submit entry');
			}

			setIsSubmitted(true);
			setSubmissionContent('');
			toast.success('Your entry has been submitted!');
		} catch (err) {
			toast.error(handleFetchMessage(err, 'Failed to submit entry'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRetry = () => {
		fetchActiveTask();
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-text-primary mb-1">Submit Task Entry</h1>
				<p className="text-text-secondary text-sm">Complete the weekly task and submit your entry below.</p>
			</div>

			{isLoading ? (
				<Card className="border-none shadow-sm">
					<CardHeader>
						<Skeleton className="h-6 w-1/3" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>
			) : error ? (
				<ErrorMessage message={error} onRetry={handleRetry} />
			) : !task ? (
				<Card className="border-none shadow-sm">
					<CardContent className="p-6">
						<p className="text-muted-foreground text-center py-8">No active task right now. Please check back later!</p>
					</CardContent>
				</Card>
			) : isSubmitted ? (
				<Card className="border-none shadow-sm bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
					<CardContent className="p-6">
						<div className="text-center">
							<p className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Success!</p>
							<p className="text-green-600 dark:text-green-400 mb-4">Your entry has been submitted successfully.</p>
							<CustomLink href="/account/tasks">
								<Button variant="default">Back to Home</Button>
							</CustomLink>
						</div>
					</CardContent>
				</Card>
			) : isWrongWeek ? (
				<Card className="border-none shadow-sm">
					<CardContent className="p-6">
						<div className="text-center">
							<p className="text-lg font-semibold text-text-primary mb-2">Submissions Closed</p>
							<p className="text-muted-foreground mb-4">This task is not for the current week. Please check the tasks page for this week&apos;s active task.</p>
							<CustomLink href="/account/tasks">
								<Button variant="default">Back to Tasks</Button>
							</CustomLink>
						</div>
					</CardContent>
				</Card>
			) : isDuplicate ? (
				<Card className="border-none shadow-sm bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
					<CardContent className="p-6">
						<div className="text-center">
							<p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Already Submitted</p>
							<p className="text-yellow-600 dark:text-yellow-400 mb-4">You&apos;ve already submitted an entry for this task.</p>
							<CustomLink href="/account/tasks">
								<Button variant="default">Back to Home</Button>
							</CustomLink>
						</div>
					</CardContent>
				</Card>
			) : (
				<Card className="border-none shadow-sm">
					<CardHeader>
						<CardTitle>{task.title}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<p className="text-sm text-muted-foreground mb-1">Reward</p>
							<p className="text-yellow-600 dark:text-yellow-400 font-semibold text-lg">{task.reward}</p>
						</div>

						<div>
							<p className="text-sm text-muted-foreground mb-2">Task Instructions</p>
							<p className="text-text-primary">{task.instruction}</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">Video Link or Description *</label>
								<Textarea value={submissionContent} onChange={(e) => setSubmissionContent(e.target.value)} placeholder="Enter your submission details, video link, or description..." className="min-h-32 resize-none" required disabled={isSubmitting} />
								<p className="text-xs text-muted-foreground mt-1">Required. Describe your entry or paste a video link.</p>
							</div>

							<div className="flex gap-2">
								<Button type="submit" disabled={isSubmitting || !submissionContent.trim()}>
									{isSubmitting ? 'Submitting...' : 'Submit Entry'}
								</Button>
								<CustomLink href="/account">
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</CustomLink>
							</div>
						</form>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
