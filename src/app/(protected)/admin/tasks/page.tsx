'use client';

import { useState, useEffect, useCallback } from 'react';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { handleFetchMessage, formatDateNice } from '@/lib/helpers';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { logger } from '@/lib/logger';

interface Task {
	id: string;
	title: string;
	description: string;
	week_number: number;
	year: number;
	is_active: boolean;
	admin_created_by_id: string;
	created_at: string;
	reward?: string;
	instruction?: string;
}

const ITEMS_PER_PAGE = 10;

const CURRENT_ISO_WEEK = getISOWeek(new Date());
const CURRENT_ISO_YEAR = getISOWeekYear(new Date());

const fetchTasks = async (page: number): Promise<{ tasks: Task[]; totalCount: number }> => {
	const queryParams = new URLSearchParams();
	queryParams.append('page', page.toString());
	queryParams.append('pageSize', ITEMS_PER_PAGE.toString());

	const url = `/api/tasks?${queryParams.toString()}`;

	const response = await fetchWithAuth(url);
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || `Error fetching tasks: ${response.statusText}`);
	}
	const result = await response.json();

	logger.log(result.tasks);

	const fetchedTasks: Task[] = result.tasks.map((task: any) => ({
		id: task.id,
		title: task.title || '',
		description: task.description || '',
		week_number: task.week_number,
		year: task.year,
		is_active: task.is_active,
		admin_created_by_id: task.admin_created_by_id,
		created_at: task.created_at,
		reward: task.reward,
		instruction: task.instruction,
	}));

	return { tasks: fetchedTasks, totalCount: result.count };
};

export default function TasksPage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [retryCount, setRetryCount] = useState(0);

	// Create form state
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [weekNumber, setWeekNumber] = useState(CURRENT_ISO_WEEK.toString());
	const [year, setYear] = useState(CURRENT_ISO_YEAR.toString());
	const [reward, setReward] = useState('');
	const [instruction, setInstruction] = useState('');
	const [isActive, setIsActive] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Edit state
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<Partial<Task>>({});
	const [isSaving, setIsSaving] = useState(false);

	// Delete state
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	const loadTasks = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const { tasks: fetchedTasks, totalCount: fetchedTotalCount } = await fetchTasks(currentPage);
			setTasks(fetchedTasks);
			setTotalCount(fetchedTotalCount);
		} catch (err: any) {
			const errorMessage = handleFetchMessage(err, 'Failed to fetch tasks');
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}, [currentPage]);

	useEffect(() => {
		const timer = setTimeout(() => {
			loadTasks();
		}, 300);
		return () => clearTimeout(timer);
	}, [loadTasks, retryCount]);

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

	const resetForm = () => {
		setTitle('');
		setDescription('');
		setWeekNumber('');
		setYear(new Date().getFullYear().toString());
		setReward('');
		setInstruction('');
		setIsActive(true);
	};

	const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetchWithAuth('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description,
					week_number: parseInt(weekNumber, 10),
					year: parseInt(year, 10),
					reward: reward || undefined,
					instruction: instruction || undefined,
					is_active: isActive,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create task');
			}

			toast.success('Task created successfully!');
			resetForm();
			setCurrentPage(1);
			setRetryCount((c) => c + 1);
		} catch (err: any) {
			const errorMessage = handleFetchMessage(err, 'Failed to create task');
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditClick = (task: Task) => {
		setEditingId(task.id);
		setEditForm({
			title: task.title,
			description: task.description,
			week_number: task.week_number,
			year: task.year,
			reward: task.reward,
			instruction: task.instruction,
			is_active: task.is_active,
		});
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditForm({});
	};

	const handleSaveEdit = async (task: Task) => {
		setIsSaving(true);
		try {
			const numericId = parseInt(task.id, 10);
			const response = await fetchWithAuth(`/api/tasks/${numericId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: editForm.title,
					description: editForm.description,
					week_number: editForm.week_number,
					year: editForm.year,
					reward: editForm.reward,
					instruction: editForm.instruction,
					is_active: editForm.is_active,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to update task');
			}

			toast.success('Task updated successfully!');
			setEditingId(null);
			setEditForm({});
			setRetryCount((c) => c + 1);
		} catch (err: any) {
			const errorMessage = handleFetchMessage(err, 'Failed to update task');
			toast.error(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async (task: Task) => {
		if (!window.confirm('Are you sure you want to delete this task?')) return;

		setDeletingId(task.id);
		try {
			const numericId = parseInt(task.id, 10);
			const response = await fetchWithAuth(`/api/tasks/${numericId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to delete task');
			}

			toast.success('Task deleted successfully!');
			setRetryCount((c) => c + 1);
		} catch (err: any) {
			const errorMessage = handleFetchMessage(err, 'Failed to delete task');
			toast.error(errorMessage);
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-3xl font-bold">Tasks</h1>
			<p className="text-lg text-muted-foreground">Create and manage weekly tasks.</p>

			{/* Create Task Form */}
			<div className="bg-card rounded-lg border border-border p-6">
				<h2 className="text-xl font-semibold mb-4">Create Task</h2>
				<form onSubmit={handleCreate} className="space-y-4">
					<div>
						<Label htmlFor="title">Title</Label>
						<Input id="title" placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} />
					</div>
					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea id="description" placeholder="Enter task description" value={description} onChange={(e) => setDescription(e.target.value)} required disabled={isSubmitting} />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="week_number">Week Number</Label>
							<Select value={weekNumber} onValueChange={(value) => setWeekNumber(value)} disabled={isSubmitting}>
								<SelectTrigger id="week_number">
									<SelectValue placeholder="Select week" />
								</SelectTrigger>
								<SelectContent>
									{WEEK_OPTIONS.map((opt) => (
										<SelectItem key={opt} value={opt}>
											{opt}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="year">Year</Label>
							<Select value={year} onValueChange={(value) => setYear(value)} disabled={isSubmitting}>
								<SelectTrigger id="year">
									<SelectValue placeholder="Select year" />
								</SelectTrigger>
								<SelectContent>
									{YEAR_OPTIONS.map((opt) => (
										<SelectItem key={opt} value={opt}>
											{opt}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div>
						<Label htmlFor="reward">Reward (optional)</Label>
						<Input id="reward" placeholder="Enter reward" value={reward} onChange={(e) => setReward(e.target.value)} disabled={isSubmitting} />
					</div>
					<div>
						<Label htmlFor="instruction">Instruction (optional)</Label>
						<Textarea id="instruction" placeholder="Enter instruction" value={instruction} onChange={(e) => setInstruction(e.target.value)} disabled={isSubmitting} />
					</div>
					<div className="flex items-center gap-2">
						<Checkbox id="is_active" checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} disabled={isSubmitting} />
						<Label htmlFor="is_active" className="cursor-pointer">
							Is Active
						</Label>
					</div>
					<Button type="submit" disabled={isSubmitting || !title || !description || !weekNumber || !year}>
						{isSubmitting ? 'Creating...' : 'Create Task'}
					</Button>
				</form>
			</div>

			{/* Task List */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Task List</h2>
				{error ? (
					<ErrorMessage message={error} onRetry={handleRetry} />
				) : (
					<>
						<div className="rounded-md border mt-4">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Title</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Week</TableHead>
										<TableHead>Year</TableHead>
										<TableHead>Reward</TableHead>
										<TableHead>Active</TableHead>
										<TableHead>Created At</TableHead>
										<TableHead>Actions</TableHead>
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
													<Skeleton className="h-4 w-[60px]" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-[60px]" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-[100px]" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-[60px]" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-[120px]" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-[100px]" />
												</TableCell>
											</TableRow>
										))
									) : tasks.length > 0 ? (
										tasks.map((task) => (
											<TableRow key={task.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
												{editingId === task.id ? (
													<>
														<TableCell>
															<Input value={editForm.title || ''} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} disabled={isSaving} />
														</TableCell>
														<TableCell>
															<Textarea value={editForm.description || ''} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} disabled={isSaving} className="min-h-[60px]" />
														</TableCell>
														<TableCell>
															<Select
																value={editForm.week_number?.toString()}
																onValueChange={(value) =>
																	setEditForm((prev) => ({
																		...prev,
																		week_number: parseInt(value, 10),
																	}))
																}
																disabled={isSaving}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select week" />
																</SelectTrigger>
																<SelectContent>
																	{WEEK_OPTIONS.map((opt) => (
																		<SelectItem key={opt} value={opt}>
																			{opt}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</TableCell>
														<TableCell>
															<Select
																value={editForm.year?.toString()}
																onValueChange={(value) =>
																	setEditForm((prev) => ({
																		...prev,
																		year: parseInt(value, 10),
																	}))
																}
																disabled={isSaving}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select year" />
																</SelectTrigger>
																<SelectContent>
																	{YEAR_OPTIONS.map((opt) => (
																		<SelectItem key={opt} value={opt}>
																			{opt}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</TableCell>
														<TableCell>
															<Input value={editForm.reward || ''} onChange={(e) => setEditForm((prev) => ({ ...prev, reward: e.target.value }))} disabled={isSaving} />
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<Checkbox
																	checked={editForm.is_active ?? false}
																	onCheckedChange={(checked) =>
																		setEditForm((prev) => ({
																			...prev,
																			is_active: checked === true,
																		}))
																	}
																	disabled={isSaving}
																/>
															</div>
														</TableCell>
														<TableCell>{formatDateNice(new Date(task.created_at))}</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<Button size="sm" variant="outline" onClick={() => handleSaveEdit(task)} disabled={isSaving}>
																	{isSaving ? 'Saving...' : 'Save'}
																</Button>
																<Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isSaving}>
																	Cancel
																</Button>
															</div>
														</TableCell>
													</>
												) : (
													<>
														<TableCell className="font-medium">{task.title}</TableCell>
														<TableCell className="max-w-xs truncate">{task.description}</TableCell>
														<TableCell>{task.week_number}</TableCell>
														<TableCell>{task.year}</TableCell>
														<TableCell>{task.reward || '—'}</TableCell>
														<TableCell>{task.is_active ? 'Yes' : 'No'}</TableCell>
														<TableCell>{formatDateNice(new Date(task.created_at))}</TableCell>
														<TableCell>
															<div className="flex items-center gap-2">
																<Button size="sm" variant="outline" onClick={() => handleEditClick(task)} disabled={isLoading || deletingId === task.id}>
																	Edit
																</Button>
																<Button size="sm" variant="destructive" onClick={() => handleDelete(task)} disabled={isLoading || deletingId === task.id}>
																	{deletingId === task.id ? 'Deleting...' : 'Delete'}
																</Button>
															</div>
														</TableCell>
													</>
												)}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={8} className="h-24 text-center">
												No tasks found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						{totalPages > 1 && (
							<div className="flex items-center justify-between space-x-2 py-4 px-2">
								<div className="text-sm text-muted-foreground">
									Showing page {currentPage} of {totalPages} ({totalCount} tasks total)
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
