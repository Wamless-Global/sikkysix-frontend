'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserContext } from '@/context/UserContext';
import NProgress from 'nprogress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { MoreHorizontal, Loader2 } from 'lucide-react';
// Import the new fetch function and action functions along with other utils
import { User, UserStatus, Role, getStatusVariant, ALL_ROLES, fetchUserByUsername, updateUser, deleteUser as deleteUserUtil } from '@/lib/userUtils'; // Renamed deleteUser import
import { toast } from 'sonner';

export default function UserDetailPage() {
	const [currentUser, setCurrentUser] = useState<User | null>(null); // State for the user data
	const [isLoading, setIsLoading] = useState(true); // Loading state
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSuspending, setIsSuspending] = useState(false);
	const [isChangingRole, setIsChangingRole] = useState(false);
	const [changingRoleTo, setChangingRoleTo] = useState<Role | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmAction, setConfirmAction] = useState<'suspend' | 'delete' | null>(null);
	const [dialogDetails, setDialogDetails] = useState({ title: '', description: '', actionText: '' });

	const params = useParams();
	const router = useRouter();
	// Remove outdated functions from context destructuring
	const { getUserByUsername } = useUserContext();

	const username = params?.username as string;

	// Effect to fetch user data
	useEffect(() => {
		if (!username) {
			setIsLoading(false);
			notFound();
			return;
		}

		setIsLoading(true);
		setCurrentUser(null);

		const userFromContext = getUserByUsername(username);

		if (userFromContext) {
			setCurrentUser(userFromContext);
			setIsLoading(false);
		} else {
			// 2. If not in context, use the centralized fetch function
			const loadUser = async () => {
				// Ensure loading is true before starting async fetch
				setIsLoading(true);
				const fetchedUser = await fetchUserByUsername(username);
				if (fetchedUser) {
					setCurrentUser(fetchedUser);
				} else {
					// Handle case where user is not found by the backend or fetch failed
					setCurrentUser(null);
					// Optionally show a toast message here if fetchUserByUsername doesn't already
					toast.error(`User '${username}' not found or failed to load.`);
				}
				// Set loading to false *after* fetch completes (success or fail)
				setIsLoading(false);
			};

			loadUser();
		}
		// Ensure isLoading is set to false if user *was* found in context
		// This handles the case where the effect runs again but finds the user in context this time
		if (userFromContext) {
			setIsLoading(false);
		}
	}, [username, getUserByUsername]); // Rerun effect if username or context function changes

	// --- Loading State ---
	if (isLoading) {
		return (
			<div className="flex items-center justify-center space-x-2 p-10">
				<Loader2 className="h-6 w-6 animate-spin" />
				<span>Loading user details...</span>
			</div>
		);
	}

	// --- Not Found State (after loading) ---
	// Also handles the case where deletion just finished and currentUser became null
	if (!currentUser) {
		// If user not found after trying context and API, or after deletion
		notFound();
		return null; // Render nothing or the 404 component
	}

	// --- Action Handlers (Updated to use currentUser) ---
	const handleToggleSuspendUser = () => {
		if (!currentUser) return; // Should not happen if loading/not found handled
		const isCurrentlySuspended = currentUser.status === 'Suspended';
		const actionText = isCurrentlySuspended ? 'unsuspend (activate)' : 'suspend';
		// const newStatus: UserStatus = isCurrentlySuspended ? 'Active' : 'Suspended'; // Moved to confirm

		setDialogDetails({
			title: `Confirm User ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
			description: `Are you sure you want to ${actionText} ${currentUser.name}?`,
			actionText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
		});
		setConfirmAction('suspend');
		setShowConfirmDialog(true);
	};

	const handleDeleteUser = () => {
		if (!currentUser) return;
		setDialogDetails({
			title: 'Confirm User Deletion',
			description: `Are you sure you want to DELETE ${currentUser.name}? This action cannot be undone.`,
			actionText: 'Delete',
		});
		setConfirmAction('delete');
		setShowConfirmDialog(true);
	};

	const handleConfirmAction = async () => {
		if (!currentUser) return; // Guard against race conditions

		const currentAction = confirmAction;
		const userId = currentUser.id; // Store ID and name before potential state changes
		const userName = currentUser.name;

		if (currentAction === 'suspend') {
			setIsSuspending(true);
			try {
				// await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
				const isCurrentlySuspended = currentUser.status === 'Suspended';
				const newStatus: UserStatus = isCurrentlySuspended ? 'Active' : 'Suspended';

				// --- Call Context/API function ---
				// --- Call userUtils function ---
				const updatedUser = await updateUser(userId, { status: newStatus });

				if (updatedUser) {
					// --- Update Local State on Success ---
					// Toast is handled by updateUser
					setCurrentUser(updatedUser); // Update with the full returned user data
				} else {
					// Error toast handled by updateUser
					// No state update needed on failure
				}
			} catch (error) {
				// Catch unexpected errors during the process
				console.error('Error during status update process:', error);
				toast.error('An unexpected error occurred while updating status.');
			} finally {
				setIsSuspending(false);
				setShowConfirmDialog(false);
				setConfirmAction(null);
			}
		} else if (currentAction === 'delete') {
			setIsDeleting(true); // Keep this for UI feedback if needed, though navigation happens quickly
			try {
				// --- Call userUtils function ---
				const success = await deleteUserUtil(userId); // Use renamed import

				if (success) {
					// --- Navigate on Success ---
					NProgress.start();
					router.push('/admin/users');
					// No need to close dialog manually, component will unmount
				} else {
					// Error toast handled by deleteUserUtil
					// Reset UI state if deletion failed and we are not navigating
					setIsDeleting(false);
					setShowConfirmDialog(false);
					setConfirmAction(null);
				}
			} catch (error) {
				// Catch unexpected errors during the process
				console.error('Error during user deletion process:', error);
				toast.error('An unexpected error occurred while deleting the user.');
				// Only reset/close if an error occurred and we are *not* navigating
				setIsDeleting(false);
				setShowConfirmDialog(false);
				setConfirmAction(null);
			}
			// No finally needed here as success leads to unmount, error is handled in catch
		}
	};

	// --- Render Component (Using currentUser) ---
	// If we reach this point, 'isLoading' is false and 'currentUser' is defined.
	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-4">
					<div className="flex items-center gap-4 flex-1">
						{/* Profile Picture and Basic Info */}
						<div className="flex-shrink-0">{currentUser.profilePictureUrl && <Image src={currentUser.profilePictureUrl} alt={`${currentUser.name}'s profile picture`} width={64} height={64} className="rounded-full" />}</div>
						<div className="flex-1">
							<CardTitle className="text-2xl mb-1">{currentUser.name}</CardTitle>
							<CardDescription>{currentUser.email}</CardDescription>
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
										router.push(`/admin/users/${currentUser.username}/edit`); // Use username
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
												disabled={currentUser.roles === roleOption || isChangingRole || isSuspending || isDeleting}
												onClick={async (event) => {
													event.preventDefault();
													if (!currentUser) return;
													const userId = currentUser.id; // Store ID and name
													const userName = currentUser.name;
													setIsChangingRole(true);
													setChangingRoleTo(roleOption);
													try {
														// await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

														// --- Call userUtils function ---
														const updatedUser = await updateUser(userId, { roles: roleOption });

														if (updatedUser) {
															// --- Update Local State on Success ---
															// Toast handled by updateUser
															setCurrentUser(updatedUser);
														} else {
															// Error toast handled by updateUser
															// No state update needed on failure
														}
													} catch (error) {
														// Catch unexpected errors during the process
														console.error('Error during role change process:', error);
														toast.error('An unexpected error occurred while changing role.');
													} finally {
														setIsChangingRole(false);
														setChangingRoleTo(null);
													}
												}}
												className="cursor-pointer capitalize"
											>
												{isChangingRole && changingRoleTo === roleOption ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Processing...
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
										router.push(`/admin/communication?userId=${currentUser.id}`);
									}}
									className="cursor-pointer"
								>
									Send Message
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										NProgress.start();
										router.push(`/admin/transactions?userId=${currentUser.id}`);
									}}
									className="cursor-pointer"
								>
									View Transactions
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								{/* Dynamic Suspend/Unsuspend */}
								<DropdownMenuItem onClick={handleToggleSuspendUser} className="cursor-pointer" disabled={isSuspending || isDeleting || isChangingRole}>
									{isSuspending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Processing...
										</>
									) : currentUser.status === 'Suspended' ? (
										'Unsuspend User'
									) : (
										'Suspend User'
									)}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleDeleteUser} className="text-red-600 focus:text-red-600 focus:bg-red-100 cursor-pointer" disabled={isDeleting || isSuspending || isChangingRole}>
									{isDeleting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Deleting...
										</>
									) : (
										'Delete User'
									)}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<h3 className="font-semibold">User Information</h3>
						<p>
							<strong>Role:</strong> <span className="capitalize">{currentUser.roles}</span>
						</p>
						<p>
							<strong>Status:</strong> <Badge variant={getStatusVariant(currentUser.status)}>{currentUser.status}</Badge>
						</p>
						<p>
							<strong>Country:</strong> {currentUser.country}
						</p>
						<p>
							<strong>Registration Date:</strong> {currentUser.registrationDate}
						</p>
					</div>
					<div className="space-y-2">
						<h3 className="font-semibold">Investment Details</h3>
						<p>
							<strong>Number of Investments:</strong> {currentUser.investmentCount}
						</p>
						<p>
							<strong>Total Invested:</strong> ${currentUser.totalInvested}
						</p>
						{/* Add more investment-related details if available */}
					</div>
					{/* Add more sections as needed, e.g., Activity Log, Settings */}
				</CardContent>
			</Card>

			{/* Confirmation Dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{dialogDetails.title}</AlertDialogTitle>
						<AlertDialogDescription>{dialogDetails.description}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setConfirmAction(null)} disabled={isSuspending || isDeleting}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								handleConfirmAction();
							}}
							disabled={isSuspending || isDeleting}
							className={confirmAction === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
						>
							{(isSuspending && confirmAction === 'suspend') || (isDeleting && confirmAction === 'delete') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							{isSuspending && confirmAction === 'suspend' ? 'Processing...' : isDeleting && confirmAction === 'delete' ? 'Deleting...' : dialogDetails.actionText}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
