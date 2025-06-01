'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Loader2, User as UserIcon, Mail, Phone, Calendar, Clock, Users, HelpCircle, TrendingUp, TrendingDown, DollarSign, PlusCircle, MinusCircle, Activity, Edit } from 'lucide-react';
import InvestmentPerformanceChart from '@/components/charts/InvestmentPerformanceChart';
import InvestmentTrendChart from '@/components/charts/InvestmentTrendChart';
import UserGrowthChart from '@/components/charts/UserGrowthChart';
import { Agent } from '@/types';

export default function SingleAgentPage() {
	const params = useParams<{ agentId: string }>();
	const router = useRouter();
	const [agent, setAgent] = useState<Agent | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showSuspend, setShowSuspend] = useState(false);
	const [showRemove, setShowRemove] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmAction, setConfirmAction] = useState<'suspend' | 'remove' | null>(null);
	const [dialogDetails, setDialogDetails] = useState({ title: '', description: '', actionText: '' });

	useEffect(() => {
		const fetchAgent = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(`/api/agents/${params.agentId}`);
				if (!response.ok) throw new Error('Failed to fetch agent');
				const result = await response.json();
				if (result.status !== 'success') throw new Error(result.message || 'API error');
				setAgent(result.data);
			} catch (err: any) {
				setError(err.message || 'Unknown error');
			} finally {
				setIsLoading(false);
			}
		};
		if (params.agentId) fetchAgent();
	}, [params.agentId]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-40" />
				<Card>
					<CardHeader className="flex flex-col md:flex-row items-start justify-between gap-4">
						<div className="flex items-center gap-4 flex-1">
							<Skeleton className="h-20 w-20 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-7 w-48" />
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-64" />
								<Skeleton className="h-4 w-40" />
							</div>
						</div>
						<div className="flex-shrink-0 self-start md:self-center">
							<Skeleton className="h-9 w-24" />
						</div>
					</CardHeader>
					<CardContent className="grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</div>
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</div>
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !agent) {
		return <div className="text-destructive">{error || 'Agent not found.'}</div>;
	}

	// Mock data for charts and metrics (replace with real data integration later)
	const mockMetrics = {
		totalTrades: Number(agent.total_trades_completed ?? 0),
		totalVolume: Number(agent.total_volume_traded_ngn ?? 0),
		positiveFeedback: Number(agent.positive_feedback_count ?? 0),
		negativeFeedback: Number(agent.negative_feedback_count ?? 0),
		avgPaymentTime: agent.avg_payment_time_minutes ?? 'N/A',
		avgReleaseTime: agent.avg_release_time_minutes ?? 'N/A',
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader className="flex flex-col md:flex-row items-start justify-between gap-4">
					<div className="flex items-center gap-4 flex-1">
						<div className="flex-shrink-0">
							{agent.user.avatar_url ? (
								<img src={agent.user.avatar_url} alt={agent.user.name} className="w-20 h-20 rounded-full border" />
							) : (
								<div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border">
									<UserIcon className="w-10 h-10 text-muted-foreground" />
								</div>
							)}
						</div>
						<div className="flex-1 space-y-1">
							<CardTitle className="text-2xl">{agent.user.name}</CardTitle>
							<CardDescription className="flex items-center gap-1.5 text-sm">
								<Mail className="w-3.5 h-3.5" /> {agent.user.email}
							</CardDescription>
							<CardDescription className="flex items-center gap-1.5 text-sm">
								<Users className="w-3.5 h-3.5" /> Agent ID: <span className="font-mono">{agent.id}</span>
							</CardDescription>
							<CardDescription className="flex items-center gap-1.5 text-sm">
								<HelpCircle className="w-3.5 h-3.5" /> Status: <Badge variant={agent.is_active ? 'default' : 'destructive'}>{agent.is_active ? 'Active' : 'Suspended'}</Badge>
							</CardDescription>
							<CardDescription className="flex items-center gap-1.5 text-sm">
								<Phone className="w-3.5 h-3.5" /> {agent.account_details?.phone || 'N/A'}
							</CardDescription>
						</div>
					</div>
					<div className="flex-shrink-0 self-start md:self-center">
						<Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
							<Edit className="mr-2 h-4 w-4" /> Edit Agent
						</Button>
					</div>
				</CardHeader>
				<CardContent className="grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Activity className="w-4 h-4" /> <span>Total Trades:</span> <span className="font-semibold text-foreground">{mockMetrics.totalTrades}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<DollarSign className="w-4 h-4" /> <span>Total Volume (NGN):</span> <span className="font-semibold text-foreground">₦{mockMetrics.totalVolume.toLocaleString()}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<TrendingUp className="w-4 h-4" /> <span>Positive Feedback:</span> <span className="font-semibold text-foreground">{mockMetrics.positiveFeedback}</span>
						</div>
					</div>
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<TrendingDown className="w-4 h-4" /> <span>Negative Feedback:</span> <span className="font-semibold text-foreground">{mockMetrics.negativeFeedback}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Clock className="w-4 h-4" /> <span>Avg. Payment Time:</span> <span className="font-semibold text-foreground">{mockMetrics.avgPaymentTime} min</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Clock className="w-4 h-4" /> <span>Avg. Release Time:</span> <span className="font-semibold text-foreground">{mockMetrics.avgReleaseTime} min</span>
						</div>
					</div>
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="w-4 h-4" /> <span>Last Seen:</span> <span className="font-semibold text-foreground">{agent.last_seen_online ? new Date(agent.last_seen_online).toLocaleString() : 'N/A'}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="w-4 h-4" /> <span>Created At:</span> <span className="font-semibold text-foreground">{new Date(agent.created_at).toLocaleString()}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Charts Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<InvestmentTrendChart />
				<UserGrowthChart />
			</div>
			<div className="mt-6">
				<InvestmentPerformanceChart />
			</div>

			{/* Actions */}
			<div className="flex gap-2 mt-6">
				<Button
					variant="destructive"
					onClick={() => {
						setDialogDetails({
							title: agent.is_active ? 'Suspend Agent' : 'Activate Agent',
							description: `Are you sure you want to ${agent.is_active ? 'suspend' : 'activate'} this agent?`,
							actionText: agent.is_active ? 'Suspend' : 'Activate',
						});
						setConfirmAction('suspend');
						setShowConfirmDialog(true);
					}}
				>
					{agent.is_active ? 'Suspend Agent' : 'Activate Agent'}
				</Button>
				<Button
					variant="secondary"
					onClick={() => {
						setDialogDetails({
							title: 'Remove Agent',
							description: 'Are you sure you want to remove this agent?',
							actionText: 'Remove',
						});
						setConfirmAction('remove');
						setShowConfirmDialog(true);
					}}
				>
					Remove Agent
				</Button>
			</div>

			{/* Confirmation Dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{dialogDetails.title}</AlertDialogTitle>
						<AlertDialogDescription>{dialogDetails.description}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmAction(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								// TODO: Implement suspend/remove logic
								setShowConfirmDialog(false);
							}}
							className={confirmAction === 'remove' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
						>
							{dialogDetails.actionText}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Edit Modal Placeholder */}
			{showEdit && <div className="admin-modal">Edit Agent (form placeholder)</div>}
		</div>
	);
}
