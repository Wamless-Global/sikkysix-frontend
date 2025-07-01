'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import UserHeader from '@/components/layout/UserHeader';
import UserFooter from '@/components/layout/UserFooter';
import UserMobileSidebar from '@/components/layout/UserMobileSidebar';
import { Home, Briefcase, Wallet, Gamepad2, User as UserIcon, Users, Settings, LogOut, Bell, Loader2, PieChart, LucideProps, BookUp, ComputerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { CustomLink } from '@/components/ui/CustomLink';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import nProgress from 'nprogress';
import { Role } from '@/types';
import { handleFetchErrorMessage } from '@/lib/helpers';
import NotificationCenter from '@/components/ui/NotificationCenter';
import Logo from '@/components/ui/logo';

type desktopNavItemsType = {
	href: string;
	label: string;
	icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
	for: Role;
	hideFor?: Role;
	subMenu?: { href: string; label: string }[];
}[];

const desktopNavItems: desktopNavItemsType = [
	{ href: '/account', label: 'Home', icon: Home, for: 'user' },
	{ href: '/account/my-savings', label: 'My Savings', icon: Briefcase, for: 'user' },
	{ href: '/account/wallet', label: 'Wallet', icon: Wallet, for: 'user' },
	{ href: '/account/games', label: 'Games', icon: Gamepad2, for: 'user' },
	{ href: '/account/profile', label: 'Profile', icon: UserIcon, for: 'user' },
	{ href: '/account/agents-apply', label: 'Become an Agent', icon: BookUp, for: 'user', hideFor: 'agent' },
	{
		href: '/account/agent-portal',
		label: 'Agent Portal',
		icon: ComputerIcon,
		for: 'agent',
		subMenu: [
			{ href: '/account/agent-portal/overview', label: 'overview' },
			{ href: '/account/agent-portal/orders', label: 'orders' },
			{ href: '/account/agent-portal/settings', label: 'settings' },
		],
	},
	{ href: '/account/referrals', label: 'Referrals', icon: Users, for: 'user' },
	{ href: '/account/report', label: 'Report', icon: PieChart, for: 'user' },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [isLogoutLoading, setIsLogoutLoading] = useState(false);
	const [_openSubMenu, setOpenSubMenu] = useState<string | null>(null);
	const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
	const [unreadNotifications, setUnreadNotifications] = useState(0);

	const pathname = usePathname();
	const router = useRouter();
	const { logout, currentUser } = useAuthContext();
	const notifications: string[] = [];

	const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
	const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

	const handleLogout = async () => {
		setIsLogoutLoading(true);
		try {
			await logout();
			toast.success('Logged out successfully!');
			nProgress.start();
			router.replace('/auth/login');
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'An unexpected error occurred during logout.');
			toast.error(errorMessage);
		} finally {
			setIsLogoutLoading(false);
		}
	};

	// Listen for custom event from UserHeader (mobile bell)
	useEffect(() => {
		const handler = () => setNotificationCenterOpen(true);
		window.addEventListener('open-notification-center', handler);
		return () => window.removeEventListener('open-notification-center', handler);
	}, []);

	return (
		<div className="flex min-h-screen bg-background text-foreground relative">
			{currentUser ? (
				<aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
					<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[var(--dashboard-secondary)] px-0 pb-4 rounded-r-2xl">
						<div className="flex h-10 shrink-0 items-center"></div>
						<nav className="flex flex-1 flex-col">
							<ul role="list" className="flex flex-1 flex-col gap-y-7 overflow-x-hidden">
								<li>
									<ul role="list" className="-mx-2 space-y-2 ">
										{desktopNavItems.map((item) => {
											const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/account');
											if (currentUser?.roles.includes(item.for as Role) && !currentUser?.roles.includes(item.hideFor as Role)) {
												if (item.subMenu) {
													const isParentActive = pathname.startsWith(item.href);
													return (
														<li key={item.label} className="pl-6">
															<div
																className={cn(
																	'group flex gap-x-3 rounded-l-full p-3 text-sm leading-6 font-semibold transition-colors duration-150 !pl-6 cursor-pointer',
																	isParentActive ? 'bg-background text-background-foreground dark:bg-background dark:text-foreground !py-5' : 'text-[var(--dashboard-secondary-foreground)] hover:bg-black/5 dark:hover:bg-white/5'
																)}
																onClick={() => setOpenSubMenu(isParentActive ? null : item.label)}
															>
																<item.icon className={cn(isParentActive ? 'text-background-foreground ' : 'text-[var(--dashboard-secondary-foreground)] opacity-70 group-hover:opacity-100', 'h-6 w-6 shrink-0 transition-opacity duration-150')} aria-hidden="true" />
																<span>{item.label}</span>
															</div>
															<ul className={cn('ml-8 mt-1 space-y-1', isParentActive ? 'block' : 'hidden', 'lg:block')}>
																{item.subMenu.map((sub) => (
																	<li key={sub.href} className="capitalize">
																		<CustomLink
																			href={sub.href}
																			className={cn(
																				pathname === sub.href ? 'text-[var(--dashboard-secondary-foreground)] font-bold ' : 'text-[var(--dashboard-secondary-foreground)] hover:font-bold transition',
																				'block py-2 px-4 rounded text-sm transition-colors duration-150'
																			)}
																		>
																			{sub.label}
																		</CustomLink>
																	</li>
																))}
															</ul>
														</li>
													);
												}
												return (
													<li key={item.label} className="pl-6">
														<CustomLink
															href={item.href}
															className={cn(
																isActive ? 'bg-background text-background-foreground dark:bg-background dark:text-foreground !py-5' : 'text-[var(--dashboard-secondary-foreground)] hover:bg-black/5 dark:hover:bg-white/5',
																'group flex gap-x-3 rounded-l-full p-3 text-sm leading-6 font-semibold transition-colors duration-150 !pl-6'
															)}
														>
															<item.icon className={cn(isActive ? 'text-background-foreground ' : 'text-[var(--dashboard-secondary-foreground)] opacity-70 group-hover:opacity-100', 'h-6 w-6 shrink-0 transition-opacity duration-150')} aria-hidden="true" />
															{item.label}
														</CustomLink>
													</li>
												);
											}
										})}
									</ul>
								</li>

								<li className="mt-auto pl-6">
									<CustomLink
										href="/account/profile/preferences"
										className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700/50 w-full mt-1 text-left"
									>
										<Settings className="h-6 w-6 shrink-0" aria-hidden="true" />
										Settings
									</CustomLink>
									<button
										onClick={handleLogout}
										disabled={isLogoutLoading}
										className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700/50 w-full mt-1 text-left items-center disabled:opacity-50 cursor-pointer"
									>
										{isLogoutLoading ? <Loader2 className="h-6 w-6 shrink-0 animate-spin" aria-hidden="true" /> : <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />}
										Log out
									</button>
								</li>
							</ul>
						</nav>
					</div>
				</aside>
			) : (
				<aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
					<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[var(--dashboard-secondary)] px-0 pb-4 rounded-r-2xl">
						<div className="flex h-16 shrink-0 items-center pl-6">
							<Skeleton className="h-6 w-24 bg-background/30 rounded-full" />
						</div>
						<nav className="flex flex-1 flex-col">
							<ul role="list" className="flex flex-1 flex-col gap-y-7 overflow-x-hidden">
								<li>
									<ul role="list" className="-mx-2 space-y-6 px-6 gap-4">
										{[...Array(8)].map((_, i) => (
											<li key={i}>
												<Skeleton className="h-10 w-full rounded-full bg-background/30 cursor-pointer" />
											</li>
										))}
									</ul>
								</li>

								<li className="mt-auto px-6">
									<Skeleton className="h-10 w-full rounded-full mt-1 bg-background/30 cursor-pointer" />
									<Skeleton className="h-10 w-full rounded-full mt-3 bg-background/30 cursor-pointer" />
								</li>
							</ul>
						</nav>
					</div>
				</aside>
			)}

			<UserMobileSidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

			<div className="flex flex-1 flex-col lg:pl-72 lg:pr-8 relative overflow-x-hidden">
				<UserHeader onMenuToggle={toggleMobileSidebar} notifications={notifications} unreadNotifications={unreadNotifications} />

				<div className="!sticky top-0 w-full right-0 z-10 backdrop-blur-sm">
					<div className="hidden lg:flex lg:items-center lg:justify-between px-10 py-3 bg-[var(--dashboard-secondary)]/80 rounded-full shadow mx-8 mt-6 relative">
						<div className="">
							<Logo alt="Sikkysix Logo" size="md" variant="text" className="absolute -top-4" />
						</div>
						<div className="relative">
							<button type="button" className="p-2 rounded-full hover:bg-white/60 cursor-pointer" onClick={() => setNotificationCenterOpen(true)} aria-label="Open notifications">
								<Bell className="h-6 w-6 text-[var(--dashboard-secondary-foreground)] opacity-70 group-hover:opacity-100" />
							</button>
							{unreadNotifications > 0 && <span className="absolute -right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive p-0 text-xs text-destructive-foreground">{unreadNotifications}</span>}
						</div>
					</div>
				</div>

				<NotificationCenter open={notificationCenterOpen} onClose={() => setNotificationCenterOpen(false)} userId={currentUser?.id || ''} handleUnread={setUnreadNotifications} />

				<main className="flex-1 overflow-y-auto p-5 pb-24 md:p-16 lg:p-16 gap-10">
					<Breadcrumbs />
					{children}
				</main>

				<UserFooter />
			</div>
		</div>
	);
}
