'use client';

import React, { useState } from 'react'; // Import useState
import { useParams, notFound, useRouter } from 'next/navigation'; // Import useRouter
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserContext } from '@/context/UserContext'; // Import context hook
import NProgress from 'nprogress'; // Import NProgress
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub, // Import Sub components
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'; // Import AlertDialog components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
// import { placeholderUsers, User, getStatusVariant } from '../page'; // Import shared data and types - REMOVED
import { MoreHorizontal, Loader2 } from 'lucide-react'; // Import MoreHorizontal and Loader2

// REMOVED local getUserById function

import { User, UserStatus, Role, getStatusVariant, ALL_ROLES } from '@/lib/userUtils'; // Import from utils
import { toast } from 'sonner'; // Import toast

export default function UserDetailPage() {
	const [isDeleting, setIsDeleting] = useState(false); // State to track deletion
	const [isSuspending, setIsSuspending] = useState(false); // State for suspend/unsuspend loading
	const [isChangingRole, setIsChangingRole] = useState(false); // General flag for any role change
	const [changingRoleTo, setChangingRoleTo] = useState<Role | null>(null); // Track specific role being changed
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmAction, setConfirmAction] = useState<'suspend' | 'delete' | null>(null);
	const [dialogDetails, setDialogDetails] = useState({ title: '', description: '', actionText: '' });

	const params = useParams();
	const router = useRouter(); // Get router instance
	const { getUserById, updateUserStatus, updateUserRole, deleteUser } = useUserContext(); // Get context functions
	const userId = params?.userId as string;

	if (!userId) {
		// Handle case where userId is missing, though Next.js routing should prevent this
		notFound();
		return null; // Or return a loading/error state
	}

	const user = getUserById(userId); // Use context function

	// --- Early Return Checks ---
	// 1. If deletion is in progress, stop rendering the user details
	if (isDeleting) {
		return (
			<div className="flex items-center justify-center space-x-2">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span>Deleting user...</span>
			</div>
		); // Or return null
	}

	// 2. If user is not found (after checking isDeleting), show 404 and stop
	if (!user) {
		// If user not found, show a 404 page
		notFound(); // Keep notFound for initial load if user truly doesn't exist
		return null;
	}

	// --- Action Handlers ---
	const handleToggleSuspendUser = () => {
		const isCurrentlySuspended = user.status === 'Suspended';
		const actionText = isCurrentlySuspended ? 'unsuspend (activate)' : 'suspend';
		const newStatus: UserStatus = isCurrentlySuspended ? 'Active' : 'Suspended';

		setDialogDetails({
			title: `Confirm User ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
			description: `Are you sure you want to ${actionText} ${user.name}?`,
			actionText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
		});
		setConfirmAction('suspend');
		setShowConfirmDialog(true);
		// The actual update logic is moved to handleConfirmAction
	};

	const handleDeleteUser = () => {
		setDialogDetails({
			title: 'Confirm User Deletion',
			description: `Are you sure you want to DELETE ${user.name}? This action cannot be undone.`,
			actionText: 'Delete',
		});
		setConfirmAction('delete');
		setShowConfirmDialog(true);
		// The actual delete logic is moved to handleConfirmAction
	};

	const handleConfirmAction = async () => {
		// Make async
		if (!user) return;

		const currentAction = confirmAction; // Store action
		// Keep the dialog open during the operation

		if (currentAction === 'suspend') {
			setIsSuspending(true);
			try {
				await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate delay
				const isCurrentlySuspended = user.status === 'Suspended';
				const newStatus: UserStatus = isCurrentlySuspended ? 'Active' : 'Suspended';
				// --- Action & State Update ---
				updateUserStatus(user.id, newStatus); // Update state only on success
				// --- Success Toast ---
				toast.success(`User ${user.name} has been ${isCurrentlySuspended ? 'unsuspended' : 'suspended'}.`);
			} catch (error) {
				console.error('Failed to update user status:', error);
				toast.error('Failed to update user status. Please try again.');
			} finally {
				setIsSuspending(false); // Reset loading state
				setShowConfirmDialog(false); // Close dialog after operation
				setConfirmAction(null); // Reset action after dialog closes
			}
		} else if (currentAction === 'delete') {
			setIsDeleting(true);
			try {
				await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate delay
				const userName = user.name; // Store name before potential deletion state change
				// --- Action & State Update ---
				deleteUser(user.id); // Update state only on success
				// --- Success Toast & Navigation ---
				toast.success(`User ${userName} has been deleted.`);
				NProgress.start();
				router.push('/admin/users');
				// Dialog will close automatically on navigation/unmount
			} catch (error) {
				console.error('Failed to delete user:', error);
				toast.error('Failed to delete user. Please try again.');
				// Only reset/close if an error occurred
				setIsDeleting(false);
				setShowConfirmDialog(false);
				setConfirmAction(null);
			}
			// No finally needed here as success leads to unmount, error is handled in catch
		}
	};

	// --- Render Component ---
	// If we reach this point, 'user' is defined and 'isDeleting' is false.
	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-4">
					<div className="flex items-center gap-4 flex-1">
						{/* Profile Picture and Basic Info */}
						<div className="flex-shrink-0">
							{user.profilePictureUrl && (
								<Image
									src={user.profilePictureUrl}
									alt={`${user.name}'s profile picture`}
									width={64} // Larger size for detail page
									height={64}
									className="rounded-full"
								/>
							)}
						</div>
						<div className="flex-1">
							<CardTitle className="text-2xl mb-1">{user.name}</CardTitle>
							<CardDescription>{user.email}</CardDescription>
						</div>
					</div>
					{/* Actions Dropdown */}
					<div className="flex-shrink-0">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => {
										NProgress.start();
										router.push(`/admin/users/${user.id}/edit`);
									}}
									className="cursor-pointer"
								>
									Edit Profile
								</DropdownMenuItem>
								{/* Change Role Sub Menu */}
								<DropdownMenuSub>
									<DropdownMenuSubTrigger className="cursor-pointer">Change Role</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuLabel>Select New Role</DropdownMenuLabel>
										<DropdownMenuSeparator />
										{ALL_ROLES.map((roleOption) => (
											<DropdownMenuItem
												key={roleOption}
												disabled={user.roles === roleOption || isChangingRole || isSuspending || isDeleting} // Disable current role and during any action
												onClick={async (event) => {
													event.preventDefault(); // Prevent dropdown close
													if (!user) return; // Guard clause
													setIsChangingRole(true);
													setChangingRoleTo(roleOption); // Set the specific role being changed
													try {
														await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate delay
														// --- Action & State Update ---
														updateUserRole(user.id, roleOption); // Update state only on success
														// --- Success Toast ---
														toast.success(`User ${user.name}'s role changed to ${roleOption}.`);
													} catch (error) {
														console.error('Failed to change user role:', error);
														toast.error('Failed to change user role. Please try again.');
													} finally {
														setIsChangingRole(false); // Reset general flag
														setChangingRoleTo(null); // Reset specific role being changed
													}
												}}
												className="cursor-pointer capitalize"
											>
												{/* Show spinner only for the clicked item */}
												{isChangingRole && changingRoleTo === roleOption ? (
													<>
														<Loader2 className="h-4 w-4 animate-spin" />
														{roleOption}
													</>
												) : (
													roleOption
												)}
											</DropdownMenuItem>
										))}
									</DropdownMenuSubContent>
								</DropdownMenuSub>
								<DropdownMenuItem
									onClick={() => {
										NProgress.start();
										router.push(`/admin/communication?userId=${user.id}`);
									}}
									className="cursor-pointer"
								>
									Send Message
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										NProgress.start();
										router.push(`/admin/transactions?userId=${user.id}`);
									}}
									className="cursor-pointer"
								>
									View Transactions
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								{/* Dynamic Suspend/Unsuspend */}
								<DropdownMenuItem
									onClick={handleToggleSuspendUser}
									className="cursor-pointer"
									disabled={isSuspending || isDeleting || isChangingRole} // Disable during actions
								>
									{isSuspending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
									{isSuspending ? 'Processing...' : user.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleDeleteUser}
									className="text-red-600 focus:text-red-600 focus:bg-red-100 cursor-pointer"
									disabled={isDeleting || isSuspending || isChangingRole} // Disable during actions
								>
									{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
									{isDeleting ? 'Deleting...' : 'Delete User'}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<h3 className="font-semibold">User Information</h3>
						<p>
							<strong>Role:</strong> <span className="capitalize">{user.roles}</span>
						</p>
						<p>
							<strong>Status:</strong> <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
						</p>
						<p>
							<strong>Country:</strong> {user.country}
						</p>
						<p>
							<strong>Registration Date:</strong> {user.registrationDate}
						</p>
					</div>
					<div className="space-y-2">
						<h3 className="font-semibold">Investment Details</h3>
						<p>
							<strong>Number of Investments:</strong> {user.investmentCount}
						</p>
						<p>
							<strong>Total Invested:</strong> ${user.totalInvested.toLocaleString()}
						</p>
						{/* Add more investment-related details if available */}
					</div>
					{/* Add more sections as needed, e.g., Activity Log, Settings */}
				</CardContent>
				{/* Optional: Add CardFooter for actions like Edit, Suspend, etc. */}
				{/* <CardFooter>
                    <Button variant="outline">Edit User</Button>
                </CardFooter> */}
			</Card>

			{/* Confirmation Dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				{/* <AlertDialogTrigger>Handled programmatically</AlertDialogTrigger> */}
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{dialogDetails.title}</AlertDialogTitle>
						<AlertDialogDescription>{dialogDetails.description}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmAction(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault(); // Prevent default dialog close
								handleConfirmAction();
							}}
							disabled={isSuspending || isDeleting} // Disable button while loading
							// Add destructive variant styling for delete
							className={confirmAction === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
						>
							{/* Show loader inside the button */}
							{(isSuspending && confirmAction === 'suspend') || (isDeleting && confirmAction === 'delete') ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
							{/* Show appropriate text */}
							{isSuspending && confirmAction === 'suspend' ? 'Processing...' : isDeleting && confirmAction === 'delete' ? 'Deleting...' : dialogDetails.actionText}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
