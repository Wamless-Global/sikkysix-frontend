'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Goal } from '@/types/modules/taskGoal';
import { Skeleton } from '../ui/skeleton';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from '../ui/sonner';
import { handleFetchMessage, getLoggedInAsUser, getBaseCurrency, convertCurrency } from '@/lib/helpers';
import { Button } from '../ui/button';
import { CustomLink } from '../ui/CustomLink';

interface GoalSetterProps {
	initialGoal?: Goal | null;
	initialRequireNewGoal?: boolean;
}

const GoalSetter = ({ initialGoal, initialRequireNewGoal }: GoalSetterProps) => {
	const hasInitialData = initialGoal !== undefined;

	const [isLoading, setIsLoading] = useState(!hasInitialData);
	const [goal, setGoal] = useState<Goal | null>(initialGoal ?? null);
	const [isEditingGoal, setIsEditingGoal] = useState(false);
	const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
	const [requireNewGoal, setRequireNewGoal] = useState(initialRequireNewGoal ?? true);
	const [goalFormData, setGoalFormData] = useState({ description: '', amount: '', date: '' });

	const isAdminImpersonating = typeof window !== 'undefined' ? !!getLoggedInAsUser() : false;

	const loadGoal = async () => {
		try {
			const response = await fetchWithAuth('/api/goals');
			const result = await response.json();
			if (result.status === 'success' && result.data) {
				setGoal(result.data.goal ?? null);
				setRequireNewGoal(result.data.require_new_goal_after_completion ?? true);
			}
		} catch (err) {
			toast.error(handleFetchMessage(err, 'Failed to load goal'));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (hasInitialData) return; // server already gave us data
		loadGoal();
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const handleRefresh = () => {
			setIsLoading(true);
			loadGoal();
		};
		window.addEventListener('goal:refresh', handleRefresh);
		return () => window.removeEventListener('goal:refresh', handleRefresh);
	}, []);

	const handleGoalSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!goalFormData.description || !goalFormData.amount || !goalFormData.date) {
			toast.error('Please fill all fields');
			return;
		}

		setIsSubmittingGoal(true);
		try {
			const method = goal ? 'PUT' : 'POST';
			const response = await fetchWithAuth('/api/goals', {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					item_description: goalFormData.description,
					target_amount: parseFloat(goalFormData.amount),
					target_date: goalFormData.date,
				}),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.message || 'Failed to save goal');
			}

			const result = await response.json();
			if (result.status === 'success' && result.data && result.data.goal) {
				setGoal(result.data.goal);
				setGoalFormData({
					description: result.data.goal.item_description,
					amount: result.data.goal.target_amount.toString(),
					date: result.data.goal.target_date,
				});
				setIsEditingGoal(false);
				toast.success(goal ? 'Goal updated!' : 'Goal created!');
				if (typeof window !== 'undefined') {
					localStorage.setItem('has-active-goal', JSON.stringify(true));
				}
				// Reload the page so the dashboard re-fetches and shows the new goal
				if (method === 'POST') {
					window.location.reload();
				}
			}
		} catch (err) {
			toast.error(handleFetchMessage(err, 'Failed to save goal'));
		} finally {
			setIsSubmittingGoal(false);
		}
	};

	if (!isLoading && goal && !goal.is_completed) return null;
	if (!isLoading && goal?.is_completed && !requireNewGoal) return null;
	if (isAdminImpersonating) return null;

	return (
		<div className="fixed bottom-0 right-0 left-0 top-0 z-50 w-full h-full bg-gray-700/70 flex items-center justify-center p-4">
			<Card className="border-none shadow-sm w-full max-w-md sm:max-w-lg md:max-w-xl">
				<CardHeader>
					<CardTitle>Goal Tracker</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && !goal ? (
						<div className="space-y-4">
							<Skeleton className="h-6 w-1/3" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					) : isEditingGoal ? (
						<form onSubmit={handleGoalSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">What are you saving for?</label>
								<input type="text" value={goalFormData.description} onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-background border-input" required />
							</div>
							<div>
								<div className="flex items-center justify-between mb-2">
									<label className="block text-sm font-medium">Target Amount</label>
									<span className="text-sm font-bold">~ {convertCurrency(+goalFormData.amount || 0)}</span>
								</div>
								<div className="flex items-center gap-2">
									<input type="number" value={goalFormData.amount} onChange={(e) => setGoalFormData({ ...goalFormData, amount: e.target.value })} className="flex-1 px-3 py-2 border rounded-md bg-background border-input" required step="0.01" />
									<span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{getBaseCurrency()}</span>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">Target Date</label>
								<input type="date" value={goalFormData.date} onChange={(e) => setGoalFormData({ ...goalFormData, date: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-background border-input" required />
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={isSubmittingGoal}>
									{isSubmittingGoal ? 'Saving...' : 'Save Goal'}
								</Button>
								<Button type="button" variant="outline" onClick={() => setIsEditingGoal(false)}>
									Cancel
								</Button>
							</div>
						</form>
					) : !goal ? (
						<form onSubmit={handleGoalSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">What are you saving for?</label>
								<input type="text" value={goalFormData.description} onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-background border-input" placeholder="e.g., Vacation, Emergency Fund" required />
							</div>
							<div>
								<div className="flex items-center justify-between mb-2">
									<label className="block text-sm font-medium">Target Amount</label>
									<span className="text-sm font-bold">~ {convertCurrency(+goalFormData.amount || 0)}</span>
								</div>
								<div className="flex items-center gap-2">
									<input type="number" value={goalFormData.amount} onChange={(e) => setGoalFormData({ ...goalFormData, amount: e.target.value })} className="flex-1 px-3 py-2 border rounded-md bg-background border-input" placeholder="0.00" required step="0.01" />
									<span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{getBaseCurrency()}</span>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">Target Date</label>
								<input type="date" value={goalFormData.date} onChange={(e) => setGoalFormData({ ...goalFormData, date: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-background border-input" required />
							</div>
							<Button type="submit" disabled={isSubmittingGoal}>
								{isSubmittingGoal ? 'Creating...' : 'Create Goal'}
							</Button>
						</form>
					) : goal.is_completed ? (
						<div className="space-y-4">
							<div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
								<p className="text-green-700 dark:text-green-300 font-semibold text-lg mb-1">Goal Achieved!</p>
								<p className="text-sm text-green-600 dark:text-green-400">
									You reached your goal for <strong>{goal.item_description}</strong>. Congratulations!
								</p>
							</div>
							<div className="flex gap-2">
								<Button variant="default" onClick={() => setIsEditingGoal(true)}>
									Set New Goal
								</Button>
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
};

export default GoalSetter;
