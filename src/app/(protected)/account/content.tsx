'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomLink } from '@/components/ui/CustomLink';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorMessage from '@/components/ui/ErrorMessage';
import nProgress from 'nprogress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/context/AuthContext';
import { adminLoginRequest, getLoggedInAsUser, getSetCookie, handleFetchMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import Image from 'next/image';
import { formatBaseurrency } from '@/lib/helpers';
import { Investment } from '@/types';

const YOUTUBE_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

const CURRENT_ISO_YEAR = getISOWeekYear(new Date());
const CURRENT_ISO_WEEK = getISOWeek(new Date());

const MAX_PAST_TASKS = 3;

interface Winner {
	id: string;
	name: string;
	photo_url: string;
	prize_description: string;
}

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

interface Goal {
	id: string;
	item_description: string;
	target_amount: number;
	target_date: string;
	is_completed?: boolean;
}

interface InvestmentResponse {
	status: string;
	data: {
		investments: Investment[];
		hasMore: boolean;
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
const hashParams = Object.fromEntries(new URLSearchParams(hash).entries());

export default function AccountPage() {
	const [goal, setGoal] = useState<Goal | null>(null);
	const [investments, setInvestments] = useState<Investment[]>([]);
	const [goalError, setGoalError] = useState<string | null>(null);
	const [investmentError, setInvestmentError] = useState<string | null>(null);
	const [winner, setWinner] = useState<Winner | null>(null);
	const [winnerError, setWinnerError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [submissions, setSubmissions] = useState<UserTaskSubmission[]>([]);
	const [isLoadingTasks, setIsLoadingTasks] = useState(true);
	const [tasksError, setTasksError] = useState<string | null>(null);
	const [isDismissedYoutube, setIsDismissedYoutube] = useState(false);

	const currentProfitTotal = investments.filter((item) => item.status === 'active' && !item.cancelled).reduce((sum, item) => sum + (item.current_value - item.amount_invested), 0);
	const { currentUser } = useAuthContext();
	const router = useRouter();

	const fetchAllData = useCallback(async () => {
		nProgress.start();
		setIsLoading(true);
		setIsLoadingTasks(true);
		setGoalError(null);
		setInvestmentError(null);
		setWinnerError(null);
		setTasksError(null);

		try {
			const results = await Promise.allSettled([
				fetchWithAuth('/api/goals'),
				fetchWithAuth(`/api/winners?week_number=${CURRENT_ISO_WEEK}&year=${CURRENT_ISO_YEAR}`),
				fetchWithAuth('/api/investments?with_metrics=true&pageSize=50'),
				fetchWithAuth('/api/tasks?pageSize=100'),
				fetchWithAuth('/api/task-submissions/user/me?pageSize=100'),
			]);

			// Handle goals
			if (results[0].status === 'fulfilled') {
				const goalRes = results[0].value;
				if (goalRes.ok) {
					const goalData = await goalRes.json();
					if (goalData.status === 'success' && goalData.data) {
						setGoal(goalData.data.goal);
					}
				} else {
					const data = await goalRes.json().catch(() => ({}));
					setGoalError(handleFetchMessage(data, 'Failed to load goal'));
				}
			} else if (results[0].status === 'rejected') {
				setGoalError('Failed to fetch goal');
			}

			// Handle winners
			if (results[1].status === 'fulfilled') {
				const winnerRes = results[1].value;
				if (winnerRes.ok) {
					const winnerData = await winnerRes.json();
					if (winnerData.status === 'success' && Array.isArray(winnerData.winners) && winnerData.winners.length > 0) {
						setWinner(winnerData.winners[0]);
					}
				} else {
					const data = await winnerRes.json().catch(() => ({}));
					setWinnerError(handleFetchMessage(data, 'Failed to load winner'));
				}
			} else if (results[1].status === 'rejected') {
				setWinnerError('Failed to fetch winner');
			}

			// Handle investments
			if (results[2].status === 'fulfilled') {
				const investRes = results[2].value;
				if (investRes.ok) {
					const investData: InvestmentResponse = await investRes.json();
					if (investData.status === 'success' && investData.data) {
						setInvestments(investData.data.investments);
					}
				} else {
					const data = await investRes.json().catch(() => ({}));
					setInvestmentError(handleFetchMessage(data, 'Failed to load investments'));
				}
			} else if (results[2].status === 'rejected') {
				setInvestmentError('Failed to fetch investments');
			}

			// Handle tasks
			if (results[3].status === 'fulfilled') {
				const tasksRes = results[3].value;
				if (tasksRes.ok) {
					const tasksData: TasksApiResponse = await tasksRes.json().catch(() => ({}) as TasksApiResponse);
					if (tasksData.status === 'success' && Array.isArray(tasksData.tasks)) {
						const sortedTasks = [...tasksData.tasks].sort((a, b) => {
							if (b.year !== a.year) return b.year - a.year;
							return b.week_number - a.week_number;
						});
						setTasks(sortedTasks);
					} else {
						setTasks([]);
					}
				} else {
					const data = await tasksRes.json().catch(() => ({}));
					setTasksError(handleFetchMessage(data, 'Failed to load tasks'));
				}
			} else if (results[3].status === 'rejected') {
				setTasksError('Failed to fetch tasks');
			}

			// Handle submissions (best-effort: tasks card still renders if this fails)
			if (results[4].status === 'fulfilled') {
				const submissionsRes = results[4].value;
				if (submissionsRes.ok) {
					const submissionsData: SubmissionsApiResponse = await submissionsRes.json().catch(() => ({}) as SubmissionsApiResponse);
					if (submissionsData.status === 'success' && Array.isArray(submissionsData.submissions)) {
						setSubmissions(submissionsData.submissions);
					} else {
						setSubmissions([]);
					}
				}
			} else {
				setSubmissions([]);
			}
		} catch (err) {
			console.error('Unexpected error in fetchAllData:', err);
		} finally {
			setIsLoading(false);
			setIsLoadingTasks(false);
			nProgress.done();
		}
	}, []);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	useEffect(() => {
		if (!getSetCookie() && adminLoginRequest()) {
			const { access_token, refresh_token, expires_at, expires_in } = getLoggedInAsUser();

			if (access_token) {
				const toastId = toast.loading('Completing login...');
				fetch('/api/auth/set-session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ access_token, refresh_token, expires_at, expires_in }),
				})
					.then(async (res) => {
						if (!res.ok) {
							const data = await res.json().catch(() => ({}));
							throw new Error(data.message || 'Failed to set session.');
						}
						toast.success('Login as user completed!', { id: toastId });
						router.replace(window.location.pathname + window.location.search);
						localStorage.setItem('sb-auth-cookie-set', JSON.stringify(true));
					})
					.catch((err) => {
						toast.error(err.message || 'Failed to set session.', { id: toastId });
					});
				router.refresh();
			} else {
				window.location.reload();
			}
		}
	}, []);

	const handleRetry = () => {
		fetchAllData();
	};

	return (
		<div className="space-y-6">
			<p className="account-page-title mt-0 mb-4 !text-xm">Home</p>

			{currentUser ? (
				<div>
					<h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-1">Hello, {currentUser?.name || 'User'}</h2>
					<p className="text-text-secondary text-sm">What is your goal today?</p>
				</div>
			) : (
				<div className="mt-2 space-y-3">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-6 w-3/4" />
				</div>
			)}

			{/* YouTube Card Section */}
			{!isDismissedYoutube && (
				<Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 overflow-hidden">
					<CardContent className="p-0 relative">
						<button onClick={() => setIsDismissedYoutube(true)} className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-900 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-slate-800 transition" aria-label="Dismiss">
							<span className="text-lg">×</span>
						</button>
						<div className="aspect-video">
							<iframe width="100%" height="100%" src={YOUTUBE_URL} title="Learn about savings" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
						</div>
					</CardContent>
				</Card>
			)}

			{/* Goal Tracker Section */}
			{goal && !goal.is_completed && (
				<Card className="border-none shadow-sm">
					<CardHeader>
						<CardTitle>GOAL TRACKER</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">Goal</p>
								<p className="font-semibold text-lg">{goal.item_description}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-2">Progress</p>
								<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
									<div
										className="bg-green-500 h-full rounded-full transition-all"
										style={{
											width: `${Math.min((currentProfitTotal / goal.target_amount) * 100, 100)}%`,
										}}
									/>
								</div>
								<p className="text-sm text-muted-foreground mt-2">
									{formatBaseurrency(currentProfitTotal)} profit earned · {Math.min(Math.round((currentProfitTotal / goal.target_amount) * 100), 100)}% of goal
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Sikky Winner Section */}
			<Card className="border-none shadow-sm">
				<CardHeader>
					<CardTitle>SIKKY WINNER</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && !winner ? (
						<div className="space-y-4">
							<Skeleton className="h-20 w-20 rounded-full" />
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					) : winner ? (
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="relative w-20 h-20 rounded-full overflow-hidden">
									<Image src={winner.photo_url} alt={winner.name} fill className="object-cover" />
								</div>
								<div>
									<p className="font-semibold text-lg">{winner.name}</p>
									<p className="text-sm text-muted-foreground">{winner.prize_description}</p>
								</div>
							</div>
						</div>
					) : (
						<p className="text-muted-foreground">No winner announced for this week yet</p>
					)}
				</CardContent>
			</Card>

			{/* Weekly Tasks Section */}
			<Card className="border-none shadow-sm">
				<CardHeader>
					<CardTitle>WEEKLY TASKS</CardTitle>
				</CardHeader>
				<CardContent>
					{tasksError ? (
						<ErrorMessage message={tasksError} onRetry={handleRetry} />
					) : isLoadingTasks ? (
						<div className="space-y-3">
							{Array.from({ length: 2 }).map((_, i) => (
								<div key={i} className="space-y-2">
									<Skeleton className="h-5 w-1/2" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-9 w-32" />
								</div>
							))}
						</div>
					) : tasks.length === 0 ? (
						<p className="text-muted-foreground">No tasks found. Check back later!</p>
					) : (
						(() => {
							const currentWeekTask = tasks.find((t) => t.week_number === CURRENT_ISO_WEEK && t.year === CURRENT_ISO_YEAR);
							const pastTasks = tasks
								.filter((t) => !(t.week_number === CURRENT_ISO_WEEK && t.year === CURRENT_ISO_YEAR))
								.slice(0, MAX_PAST_TASKS);
							const ordered = currentWeekTask ? [currentWeekTask, ...pastTasks] : pastTasks;

							return (
								<div className="space-y-5">
									{ordered.map((task) => {
										const isCurrentWeek = task.week_number === CURRENT_ISO_WEEK && task.year === CURRENT_ISO_YEAR;
										const hasSubmitted = submissions.some((s) => String(s.task_id) === String(task.id));

										return (
											<div key={task.id} className={`space-y-3 ${isCurrentWeek ? 'pb-4 border-b border-border/60 last:border-b-0 last:pb-0' : 'last:pb-0'}`}>
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0">
														<p className="font-semibold text-foreground">{task.title}</p>
														<p className="text-xs text-muted-foreground mt-0.5">
															Week {task.week_number}, {task.year}
														</p>
													</div>
													<Badge variant={hasSubmitted ? 'success' : 'secondary'}>{hasSubmitted ? 'Submitted' : 'Not Submitted'}</Badge>
												</div>
												<p className="text-sm text-muted-foreground">{task.description}</p>
												{task.reward && <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Reward: {task.reward}</p>}
												{isCurrentWeek ? (
													<CustomLink href="/account/tasks/submit">
														<Button variant="default" size="sm">Submit Entry</Button>
													</CustomLink>
												) : (
													<p className="text-xs text-muted-foreground">Submissions closed</p>
												)}
											</div>
										);
									})}
								</div>
							);
						})()
					)}
				</CardContent>
			</Card>

			{/* Error Messages */}
			{goalError && <ErrorMessage message={goalError} onRetry={handleRetry} />}
			{investmentError && <ErrorMessage message={investmentError} onRetry={handleRetry} />}
			{winnerError && <ErrorMessage message={winnerError} onRetry={handleRetry} />}
		</div>
	);
}
