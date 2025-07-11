'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Application, ApplicationStatus, ApplicationResponse } from '@/types/modules/applications';
import { toast } from 'sonner';
import { formatDateNice, getAgentStatusVariant, handleFetchMessage } from '@/lib/helpers';
import { CustomLink } from '@/components/ui/CustomLink';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal } from 'lucide-react';
import nProgress from 'nprogress';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

const STATUS_OPTIONS: ApplicationStatus[] = ['pending', 'approved', 'rejected', 'needs_more_info'];

export default function SingleApplicationPage() {
	const router = useRouter();
	const [application, setApplication] = useState<Application | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [status, setStatus] = useState<ApplicationStatus>('pending');
	const [adminRemarks, setAdminRemarks] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const params = useParams();

	async function fetchApplication() {
		setIsLoading(true);
		try {
			const res = await fetchWithAuth(`/api/agents/application/${params.applicationId}`);

			if (!res.ok) throw new Error('Failed to fetch application');
			const data: ApplicationResponse = await res.json();

			setApplication(data.data);
			setStatus(data.data.status);
			setAdminRemarks(data.data.admin_remarks || '');
		} catch (err: any) {
			toast.error(err.message || 'Error loading application');
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchApplication();
	}, [params.applicationId]);

	const handleStatusChange = (newStatus: ApplicationStatus) => {
		setStatus(newStatus);
	};

	const handleSubmit = async () => {
		if (!application) return;
		if (['approved', 'rejected', 'needs_more_info'].includes(status) && !adminRemarks.trim()) {
			toast.error('Remarks are required for this status.');
			return;
		}
		setIsSubmitting(true);
		try {
			const res = await fetchWithAuth(`/api/agents/application/${application.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status, admin_remarks: adminRemarks }),
			});

			if (!res.ok) {
				let errorMessage = `API Error: ${res.status} ${res.statusText}`;
				try {
					const errorData = await res.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (_e) {}
				throw new Error(errorMessage);
			}

			const updated = await res.json();
			setApplication((prev) => (prev ? { ...prev, ...updated.data } : prev));

			toast.success('Application status updated successfully.');
		} catch (err: any) {
			const errorMessage = handleFetchMessage(err, 'Error updating application');
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!application) return;
		setIsSubmitting(true);
		try {
			const res = await fetchWithAuth(`/api/agents/application/${application.id}`, {
				method: 'DELETE',
			});

			if (!res.ok) {
				let errorMessage = `API Error: ${res.status} ${res.statusText}`;
				try {
					const errorData = await res.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (_e) {}
				throw new Error(errorMessage);
			}
			nProgress.start();
			toast.success('Application deleted successfully.');
			router.push('/admin/applications');
		} catch (err: any) {
			const errorMessage = handleFetchMessage(err, 'Error deleting application');
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
			setShowDeleteModal(false);
		}
	};

	const { application_data } = application || {};

	return (
		<div className="admin-page space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader className="flex flex-col md:flex-row items-start justify-between gap-4">
					<div>
						<CardTitle>Application Details</CardTitle>
						<CardDescription className="mt-1">Review and manage this agent application.</CardDescription>
					</div>
					{application && application.status !== 'pending' && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="ml-auto">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4 mr-2" />
									Actions
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>Application Actions</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{application.status == 'approved' && (
									<DropdownMenuItem
										onClick={() => {
											nProgress.start();
											router.push(`/admin/agents/${application.user_id}`);
										}}
										className="cursor-pointer"
										disabled={isSubmitting}
									>
										View Agent
									</DropdownMenuItem>
								)}
								<DropdownMenuItem onClick={() => setShowDeleteModal(true)} className="text-red-600 focus:text-red-600 focus:bg-red-100 cursor-pointer" disabled={isSubmitting}>
									Delete Application
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						<div>
							<b>Application ID:</b> {application?.id || <span className="text-muted-foreground">Loading...</span>}
						</div>
						<div>
							<b>Applicant: </b>
							{application?.user.name ? (
								<CustomLink href={`/admin/applications/${application.user_id || ''}`} className="text-primary">
									{application.user.name}
								</CustomLink>
							) : (
								<span className="text-muted-foreground">Loading...</span>
							)}
						</div>
						<div>
							<b>Status:</b> {!isLoading ? <Badge variant={getAgentStatusVariant(status)}>{status.replace(/_/g, ' ')}</Badge> : <span className="text-muted-foreground">Loading...</span>}
						</div>
						<div>
							<b>Submitted:</b> {application ? formatDateNice(new Date(application.created_at)) : <span className="text-muted-foreground">Loading...</span>}
						</div>
						<div>
							<b>Last Updated:</b> {application ? formatDateNice(new Date(application.updated_at)) : <span className="text-muted-foreground">Loading...</span>}
						</div>
						{application?.reviewed_by && (
							<div>
								<b>Reviewed By: </b>
								<CustomLink href={`/admin/applications/${application.reviewed_by || ''}`} className="text-primary">
									{application.reviewer?.name}
								</CustomLink>
								{}
							</div>
						)}
						{application?.reviewed_at && (
							<div>
								<b>Reviewed At:</b> {formatDateNice(new Date(application.reviewed_at))}
							</div>
						)}
					</div>
					<div className="space-y-4">
						<div>
							<b>Full Legal Name:</b> {application_data?.fullName || <span className="text-muted-foreground">Loading...</span>}
						</div>
						<div>
							<b>Date of Birth:</b> {formatDateNice(application_data?.dateOfBirth) || <span className="text-muted-foreground">Loading...</span>}
						</div>
						<div>
							<b>ID Document Type:</b> {application_data?.idDocumentType || <span className="text-muted-foreground">Loading...</span>}
						</div>
						<div>
							<b>ID Document Number:</b> {application_data?.idDocumentNumber || <span className="text-muted-foreground">Loading...</span>}
						</div>
						<div>
							<b>Residential Address:</b> {application_data?.residentialAddress || <span className="text-muted-foreground">Loading...</span>}
						</div>
						{application_data?.identificationUrl && (
							<div>
								<b>ID Document: </b>
								<a href={application_data.identificationUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
									View Document
								</a>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{application?.status == 'pending' && (
				<Card>
					<CardHeader>
						<CardTitle>Admin Review</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-col md:flex-row gap-4 items-center">
							<label className="font-medium">Change Status:</label>
							<div className="flex gap-2 flex-wrap">
								{STATUS_OPTIONS.map((opt) => (
									<Button key={opt} variant={status === opt ? 'default' : 'outline'} onClick={() => handleStatusChange(opt)} disabled={isSubmitting || status === opt || isLoading}>
										{opt.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
									</Button>
								))}
							</div>
						</div>
						<div>
							<label htmlFor="admin-remarks" className="font-medium">
								Admin Remarks {['approved', 'rejected', 'needs_more_info'].includes(status) && <span className="text-destructive">*</span>}
							</label>
							<Textarea
								id="admin-remarks"
								value={adminRemarks}
								onChange={(e) => setAdminRemarks(e.target.value)}
								rows={4}
								className="mt-2"
								placeholder="Enter remarks for this application..."
								required={['approved', 'rejected', 'needs_more_info'].includes(status)}
								disabled={isSubmitting || isLoading}
							/>
						</div>
						<div className="flex gap-2 items-center">
							<Button onClick={handleSubmit} disabled={isSubmitting || isLoading} variant="success">
								{isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
								Save Changes
							</Button>
							<Button variant="outline" onClick={() => router.push('/admin/applications')} disabled={isSubmitting || isLoading}>
								Back to Applications
							</Button>
							{isLoading && <Loader2 className="animate-spin w-4 h-4 ml-2 text-muted-foreground" />}
						</div>
					</CardContent>
				</Card>
			)}

			<AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Application</AlertDialogTitle>
						<AlertDialogDescription>This action cannot be undone. Deleting this application will remove all its data permanently.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting} onClick={() => setShowDeleteModal(false)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isSubmitting}
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							Delete Application
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
