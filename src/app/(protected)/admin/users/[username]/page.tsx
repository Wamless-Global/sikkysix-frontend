'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import NProgress from 'nprogress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { MoreHorizontal, Loader2, User as UserIcon, Mail, Phone, MapPin, Calendar, Clock, Link as LinkIcon, Users, CheckCircle, XCircle, HelpCircle, Wallet, TrendingUp, TrendingDown, DollarSign, MinusCircle, PlusCircle, Activity, Edit } from 'lucide-react';
import { fetchUserByUsername, updateUser, deleteUser as deleteUserUtil } from '@/lib/userUtils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { formatBaseurrency, getEmailStatusVariant, getStatusVariant, handleFetchErrorMessage } from '@/lib/helpers';
import { AdjustBalanceModal } from '@/components/modals/AdjustBalanceModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Country, User, UserStatus } from '@/types';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { useOnlineContext } from '@/context/OnlineContext';
import OnlineBadge from '@/components/ui/online-badge';
import nProgress from 'nprogress';
import { useAuthContext } from '@/context/AuthContext';

export default function UserDetailPage() {
	const [thisUser, setthisUser] = useState<User | null>(null);
	const [countries, setCountries] = useState<Array<Country>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSuspending, setIsSuspending] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmAction, setConfirmAction] = useState<'suspend' | 'delete' | null>(null);
	const [dialogDetails, setDialogDetails] = useState({ title: '', description: '', actionText: '' });
	const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
	const [isAdjustingBalance, setIsAdjustingBalance] = useState(false);
	const [isImpersonating, setIsImpersonating] = useState(false);
	const { isUserOnline } = useOnlineContext();
	const { currentUser } = useAuthContext();

	const params = useParams();
	const router = useRouter();

	const username = params?.username as string;

	useEffect(() => {
		const fetchUser = async () => {
			if (!username) {
				setIsLoading(false);
				notFound();
				return;
			}

			setIsLoading(true);
			setthisUser(null);

			const fetchedUser = await fetchUserByUsername(username);
			if (fetchedUser) {
				setthisUser(fetchedUser);
			} else {
				setthisUser(null);
				toast.error(`User '${username}' not found or failed to load.`);
			}
			setIsLoading(false);
		};
		fetchUser();
	}, [username]);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const countriesRes = await fetchWithAuth(`/api/auth/all-countries`);
				if (countriesRes.ok) {
					const data = await countriesRes.json();
					logger.info(data);
					setCountries(data.countries || []);
				}
			} catch (e) {}
		};
		fetchCountries();
	}, []);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-5 w-32" />

				<Card>
					<CardHeader className="flex flex-col md:flex-row items-start justify-between gap-4">
						<div className="flex items-center gap-4 flex-1">
							<Skeleton className="h-20 w-20 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-7 w-48" /> {/* Name */}
								<Skeleton className="h-4 w-32" /> {/* Username */}
								<Skeleton className="h-4 w-64" /> {/* Email */}
								<Skeleton className="h-4 w-40" /> {/* Phone (optional) */}
							</div>
						</div>
						<div className="flex-shrink-0 self-start md:self-center">
							<Skeleton className="h-9 w-24" /> {/* Actions Button */}
						</div>
					</CardHeader>
					<CardContent className="grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
						{/* Column 1 */}
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</div>
						{/* Column 2 */}
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</div>
						{/* Column 3 */}
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<Skeleton className="h-6 w-40" /> {/* Title */}
						<Skeleton className="h-9 w-32" /> {/* Adjust Button */}
					</CardHeader>
					<CardContent className="grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4">
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-5/6" />
						</div>
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-4 w-5/6" />
						</div>
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
						</div>
					</CardContent>
				</Card>

				<div>
					<Skeleton className="h-10 w-full mb-4" /> {/* Tab List */}
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-48" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-20 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (!thisUser) {
		notFound();
		return null;
	}

	const handleToggleSuspendUser = () => {
		if (!thisUser) return;
		const isCurrentlySuspended = thisUser.status === 'Suspended';
		const actionText = isCurrentlySuspended ? 'unsuspend (activate)' : 'suspend';

		setDialogDetails({
			title: `Confirm User ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
			description: `Are you sure you want to ${actionText} ${thisUser.name}?`,
			actionText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
		});
		setConfirmAction('suspend');
		setShowConfirmDialog(true);
	};

	const handleDeleteUser = () => {
		if (!thisUser) return;
		setDialogDetails({
			title: 'Confirm User Deletion',
			description: `Are you sure you want to DELETE ${thisUser.name}? This action cannot be undone.`,
			actionText: 'Delete',
		});
		setConfirmAction('delete');
		setShowConfirmDialog(true);
	};

	const handleConfirmAction = async () => {
		if (!thisUser) return;

		const currentAction = confirmAction;
		const userId = thisUser.id;
		const _userName = thisUser.name;

		if (currentAction === 'suspend') {
			setIsSuspending(true);
			try {
				const isCurrentlySuspended = thisUser.status === 'Suspended';
				const newStatus: UserStatus = isCurrentlySuspended ? 'Active' : 'Suspended';

				const updatedUser = await updateUser(userId, { status: newStatus });

				if (updatedUser) {
					setthisUser(updatedUser);
				}
			} catch {
				// console.error('Error during status update process:', error);
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
			} catch {
				// console.error('Error during user deletion process:', error);
				toast.error('An unexpected error occurred while deleting the user.');
				setIsDeleting(false);
				setShowConfirmDialog(false);
				setConfirmAction(null);
			}
		}
	};

	const handleAdjustBalanceSubmit = async (amount: number, reason: string) => {
		if (!thisUser) return;
		setIsAdjustingBalance(true);

		try {
			const response = await fetchWithAuth(`/api/users/${thisUser.id}/wallet`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount, reason }),
			});

			const result = await response.json();

			if (!response.ok) {
				const errorMessage = handleFetchErrorMessage(result, 'An unexpected error occurred.');
				toast.error(errorMessage);
				return;
			}

			// Update local state with the new balance confirmed by the API
			logger.log('Adjusting balance for user:', thisUser.id, 'New balance:', result.data.wallet_balance);
			setthisUser((prevUser) => (prevUser ? { ...prevUser, wallet_balance: result.data.wallet_balance } : null));
			toast.success(result.message || 'Balance adjusted successfully!');
			setIsAdjustModalOpen(false); // Close modal on success
		} catch (err) {
			// console.error('Error adjusting balance:', err);
			const errorMessage = handleFetchErrorMessage(err, 'An unexpected error occurred.');
			toast.error(errorMessage);
		} finally {
			setIsAdjustingBalance(false);
		}
	};

	const loginAsUser = async () => {
		if (!thisUser) return;
		setIsImpersonating(true);
		try {
			const response = await fetchWithAuth(`/api/users/${thisUser.id}/impersonate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || 'Failed to log in as user.');
			}

			if (data.status === 'success' && data.data?.link && data.data?.user) {
				nProgress.start();

				logger.info('Impersonation response data:', data);

				if (typeof window !== 'undefined') {
					localStorage.setItem(`admin-login-request`, JSON.stringify(true));
				}

				router.push(data.data.link);
				toast.success("Successfully retrieved user's information");
			} else {
				logger.error('Impersonation response did not contain expected data:', data);
				throw new Error('No token or user received from impersonation endpoint.');
			}
		} catch (err) {
			logger.error('Error during user impersonation:', err);
			const errorMessage = handleFetchErrorMessage(err, 'Failed to log in as user.');
			toast.error(errorMessage);
		} finally {
			setIsImpersonating(false);
		}
	};

	const userOnline = isUserOnline(thisUser.id);

	return (
		<div className="space-y-6">
			<Breadcrumbs />

			<Card>
				<CardHeader className="flex flex-col md:flex-row items-start justify-between gap-4">
					<div className="flex items-center gap-4 flex-1">
						<div className="flex-shrink-0">
							{thisUser.avatar_url ? (
								<Image src={thisUser.avatar_url} alt={`${thisUser.name}&apos;s profile picture`} width={80} height={80} className="rounded-full border" />
							) : (
								<div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border">
									<UserIcon className="w-10 h-10 text-muted-foreground" />
								</div>
							)}
						</div>
						<div className="flex-1 space-y-1">
							<div className="flex gap-2 items-center">
								<CardTitle className="text-2xl">{thisUser.name}</CardTitle>
								<OnlineBadge online={userOnline} />
							</div>
							<CardDescription className="flex items-center gap-1.5 text-sm">
								<UserIcon className="w-3.5 h-3.5" /> {thisUser.username}
							</CardDescription>
							<CardDescription className="flex items-center gap-1.5 text-sm">
								<Mail className="w-3.5 h-3.5" /> {thisUser.email}
								<Badge variant={getEmailStatusVariant(thisUser.email_status)} className="ml-1 px-1.5 py-0 text-xs">
									{thisUser.email_status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
									{thisUser.email_status === 'Active' ? 'Verified' : 'Not Verified'}
								</Badge>
							</CardDescription>
							{thisUser.phone_number && (
								<CardDescription className="flex items-center gap-1.5 text-sm">
									<Phone className="w-3.5 h-3.5" /> {thisUser.phone_number}
								</CardDescription>
							)}
						</div>
					</div>

					{/* Right Side: Actions Dropdown */}
					<div className="flex-shrink-0 self-start md:self-center">
						<DropdownMenu open={isImpersonating ? true : undefined}>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="ml-auto">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4 mr-2" />
									Actions
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>Account Actions</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => {
										NProgress.start();
										router.push(`/admin/users/${thisUser.username}/edit`);
									}}
									className="cursor-pointer"
								>
									Edit Profile
								</DropdownMenuItem>

								<DropdownMenuItem onClick={handleToggleSuspendUser} className="cursor-pointer" disabled={isSuspending || isDeleting}>
									{isSuspending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
										</>
									) : thisUser.status === 'Suspended' ? (
										'Unsuspend User'
									) : (
										'Suspend User'
									)}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Navigation</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => {
										NProgress.start();
										router.push(`/admin/users/${thisUser.username}/edit`);
									}}
									className="cursor-pointer"
								>
									Edit Profile
								</DropdownMenuItem>
								{currentUser?.id !== thisUser.id && (
									<>
										<DropdownMenuItem
											onClick={() => {
												NProgress.start();
												router.push(`/admin/users/${thisUser.username}/edit`);
											}}
											className="cursor-pointer"
										>
											Edit Profile
										</DropdownMenuItem>
										<DropdownMenuItem onClick={loginAsUser} className="cursor-pointer" disabled={isImpersonating}>
											{isImpersonating ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging you in...
												</>
											) : (
												'Login As User'
											)}
										</DropdownMenuItem>
									</>
								)}
								<DropdownMenuItem
									onClick={() => {
										NProgress.start();
										router.push(`/admin/transactions?userId=${thisUser.id}`);
									}}
									className="cursor-pointer"
								>
									View Transactions
								</DropdownMenuItem>
								{/* TODO: Add Financial Actions (Adjust Balance, Set Multiplier) */}
								{/* TODO: Add Task/Withdrawal Actions */}
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleDeleteUser} className="text-red-600 focus:text-red-600 focus:bg-red-100 cursor-pointer" disabled={isDeleting || isSuspending}>
									{isDeleting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
										</>
									) : (
										'Delete User'
									)}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
					{/* Column 1 */}
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<UserIcon className="w-4 h-4" /> <span>User ID:</span> <span className="font-mono text-foreground">{thisUser.id}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Users className="w-4 h-4" /> <span>Role:</span> <span className="capitalize text-foreground">{Array.isArray(thisUser.roles) ? thisUser.roles.join(', ') : thisUser.roles}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<HelpCircle className="w-4 h-4" /> <span>Account Status:</span>
							<Badge variant={thisUser.is_active ? 'default' : 'secondary'} className="ml-1">
								{thisUser.is_active ? 'Active' : 'Inactive'}
							</Badge>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<HelpCircle className="w-4 h-4" /> <span>User Status:</span>
							<Badge variant={getStatusVariant(thisUser.status)} className="ml-1">
								{thisUser.status}
							</Badge>
						</div>
					</div>
					{/* Column 2 */}
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<MapPin className="w-4 h-4" /> <span>Country:</span> <span className="text-foreground">{countries.find((c) => c.id === thisUser.country)?.name ?? thisUser.country}</span>
						</div>
						{thisUser.telegram_user_id && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
									<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.17.91-.497 1.209-.82 1.234c-.696.055-1.226-.46-1.9-1.088c-.848-.787-1.322-1.278-2.12-1.965c-.944-.793-.315-1.215.19-1.905c.14-.193.25-.397.37-.623c.166-.31.328-.624.518-.966c.18-.32.06-.607-.1-.758c-.16-.15-.49-.105-.71.037c-.21.13-.42.26-.63.39c-1.06.64-1.78.99-2.48 1c-.69.01-.97-.24-.97-.85c0-.48.28-1.03.82-1.58c2.39-2.32 4.1-3.7 5.07-4.35c.75-.49 1.18-.7 1.5-.7z" />
								</svg>
								<span>Telegram:</span> <span className="text-foreground">{thisUser.telegram_user_id}</span>
							</div>
						)}
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="w-4 h-4" /> <span>Registered:</span> <span className="text-foreground">{thisUser.registrationDate ? format(new Date(thisUser.registrationDate), 'PPpp') : 'N/A'}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Clock className="w-4 h-4" /> <span>Last Login:</span> <span className="text-foreground">{thisUser.last_login ? format(new Date(thisUser.last_login), 'PPpp') : 'Never'}</span>
						</div>
					</div>
					{/* Column 3 */}
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<LinkIcon className="w-4 h-4" /> <span>Referral Code:</span> <span className="font-mono text-foreground">{thisUser.referral_code ?? 'N/A'}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Users className="w-4 h-4" /> <span>Referred By:</span>
							<span className="text-foreground">
								{thisUser.referred_by_user_id ? `User ID: ${thisUser.referred_by_user_id}` : 'None'} {/* TODO: Fetch referrer name */}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Financial Overview Card (Placeholder) */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Financial Overview</CardTitle>
					<Button variant="outline" size="sm" onClick={() => setIsAdjustModalOpen(true)}>
						<Edit className="mr-2 h-3.5 w-3.5" />
						Adjust Balance
					</Button>
				</CardHeader>
				<CardContent className="grid gap-x-8 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4">
					{/* Column 1 */}
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Wallet className="w-4 h-4" /> <span>Wallet Balance:</span> <span className="font-semibold text-foreground">{formatBaseurrency(thisUser.wallet_balance ?? 0)}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<DollarSign className="w-4 h-4" /> <span>Total Invested:</span> <span className="font-semibold text-foreground">{formatBaseurrency(thisUser.totalInvested ?? 0)}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Activity className="w-4 h-4" /> <span>Active Investments:</span> <span className="font-semibold text-foreground">{thisUser.investmentCount ?? 0}</span>
						</div>
					</div>
					{/* Column 2 */}
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<TrendingUp className="w-4 h-4" /> <span>Current Savings Value:</span> <span className="font-semibold text-foreground">{/* TODO: Calculate */} TBD</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<TrendingDown className="w-4 h-4" /> <span>Total Withdrawn:</span> <span className="font-semibold text-foreground">{/* TODO: Calculate */} TBD</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<MinusCircle className="w-4 h-4" /> <span>Total Fees Paid:</span> <span className="font-semibold text-foreground">{/* TODO: Calculate */} TBD</span>
						</div>
					</div>
					{/* Column 3 */}
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<PlusCircle className="w-4 h-4" /> <span>Overall Profit/Loss:</span> <span className="font-semibold text-foreground">{/* TODO: Calculate */} TBD</span>
						</div>
						{/* Add more financial details here if needed */}
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="investments">
				<TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-4 h-12">
					<TabsTrigger className="" value="investments">
						Active Investments
					</TabsTrigger>
					<TabsTrigger value="investment-history">Investment History</TabsTrigger>
					<TabsTrigger value="transactions">Transactions</TabsTrigger>
					<TabsTrigger value="wallet">Wallet History</TabsTrigger>
					<TabsTrigger value="referrals">Referrals</TabsTrigger>
					<TabsTrigger value="tasks">Tasks</TabsTrigger>
				</TabsList>
				<TabsContent value="investments">
					<Card>
						<CardHeader>
							<CardTitle>Active Investments</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">Active investments table...</p>
						</CardContent>
						{/* TODO: Implement Tab 1 */}
					</Card>
				</TabsContent>
				<TabsContent value="investment-history">
					<Card>
						<CardHeader>
							<CardTitle>Investment History</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">Investment history table...</p>
						</CardContent>
						{/* TODO: Implement Tab 2 */}
					</Card>
				</TabsContent>
				<TabsContent value="transactions">
					<Card>
						<CardHeader>
							<CardTitle>Transaction History</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">Transaction history table with filters...</p>
						</CardContent>
						{/* TODO: Implement Tab 3 */}
					</Card>
				</TabsContent>
				<TabsContent value="wallet">
					<Card>
						<CardHeader>
							<CardTitle>Wallet History</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">Wallet history table...</p>
						</CardContent>
						{/* TODO: Implement Tab 4 */}
					</Card>
				</TabsContent>
				<TabsContent value="referrals">
					<Card>
						<CardHeader>
							<CardTitle>Users Referred</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">Referred users table...</p>
						</CardContent>
						{/* TODO: Implement Tab 5 */}
					</Card>
				</TabsContent>
				<TabsContent value="tasks">
					<Card>
						<CardHeader>
							<CardTitle>Task History & Withdrawal Status</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">Task details and withdrawal eligibility...</p>
						</CardContent>
						{/* TODO: Implement Tab 6 */}
					</Card>
				</TabsContent>
			</Tabs>

			{/* Confirmation Dialog (Remains the same for now) */}
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

			{thisUser && <AdjustBalanceModal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} onSubmit={handleAdjustBalanceSubmit} currentBalance={thisUser.wallet_balance ?? 0} isSubmitting={isAdjustingBalance} />}
		</div>
	);
}
