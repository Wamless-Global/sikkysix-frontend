'use client';

import { useState, useEffect } from 'react';
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
import { User, UserStatus, Role, getStatusVariant, ALL_ROLES, fetchUserByUsername, updateUser, deleteUser as deleteUserUtil } from '@/lib/userUtils';
import { toast } from 'sonner';

export default function UserDetailPage() {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSuspending, setIsSuspending] = useState(false);
	const [isChangingRole, setIsChangingRole] = useState(false);
	const [changingRoleTo, setChangingRoleTo] = useState<Role | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmAction, setConfirmAction] = useState<'suspend' | 'delete' | null>(null);
	const [dialogDetails, setDialogDetails] = useState({ title: '', description: '', actionText: '' });

	const params = useParams();
	const router = useRouter();
	const { getUserByUsername } = useUserContext();

	const username = params?.username as string;

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
			const loadUser = async () => {
				setIsLoading(true);
				const fetchedUser = await fetchUserByUsername(username);
				if (fetchedUser) {
					setCurrentUser(fetchedUser);
				} else {
					setCurrentUser(null);
					toast.error(`User '${username}' not found or failed to load.`);
				}
				setIsLoading(false);
			};

			loadUser();
		}
		if (userFromContext) {
			setIsLoading(false);
		}
	}, [username, getUserByUsername]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center space-x-2 p-10">
				<Loader2 className="h-6 w-6 animate-spin" />
				<span>Loading user details...</span>
			</div>
		);
	}

	if (!currentUser) {
		notFound();
		return null;
	}

	const handleToggleSuspendUser = () => {
		if (!currentUser) return;
		const isCurrentlySuspended = currentUser.status === 'Suspended';
		const actionText = isCurrentlySuspended ? 'unsuspend (activate)' : 'suspend';

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
		if (!currentUser) return;

		const currentAction = confirmAction;
		const userId = currentUser.id;
		const userName = currentUser.name;

		if (currentAction === 'suspend') {
			setIsSuspending(true);
			try {
				const isCurrentlySuspended = currentUser.status === 'Suspended';
				const newStatus: UserStatus = isCurrentlySuspended ? 'Active' : 'Suspended';

				const updatedUser = await updateUser(userId, { status: newStatus });

				if (updatedUser) {
					setCurrentUser(updatedUser);
				}
			} catch (error) {
				console.error('Error during status update process:', error);
				toast.error('An unexpected error occurred while updating status.');
			} finally {
				setIsSuspending(false);
				setShowConfirmDialog(false);
				setConfirmAction(null);
			}
		} else if (currentAction === 'delete') {
			setIsDeleting(true);
			try {
				const success = await deleteUserUtil(userId);

				if (success) {
					NProgress.start();
					router.push('/admin/users');
				} else {
					setIsDeleting(false);
					setShowConfirmDialog(false);
					setConfirmAction(null);
				}
			} catch (error) {
				console.error('Error during user deletion process:', error);
				toast.error('An unexpected error occurred while deleting the user.');
				setIsDeleting(false);
				setShowConfirmDialog(false);
				setConfirmAction(null);
			}
		}
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-4">
					<div className="flex items-center gap-4 flex-1">
						<div className="flex-shrink-0">{currentUser.profilePictureUrl && <Image src={currentUser.profilePictureUrl} alt={`${currentUser.name}'s profile picture`} width={64} height={64} className="rounded-full" />}</div>
						<div className="flex-1">
							<CardTitle className="text-2xl mb-1">{currentUser.name}</CardTitle>
							<CardDescription>{currentUser.email}</CardDescription>
						</div>
					</div>
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
										router.push(`/admin/users/${currentUser.username}/edit`);
									}}
									className="cursor-pointer"
								>
									Edit Profile
								</DropdownMenuItem>
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
													const userId = currentUser.id;
													const userName = currentUser.name;
													setIsChangingRole(true);
													setChangingRoleTo(roleOption);
													try {
														const updatedUser = await updateUser(userId, { roles: roleOption });

														if (updatedUser) {
															setCurrentUser(updatedUser);
														}
													} catch (error) {
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
					</div>
				</CardContent>
			</Card>

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
