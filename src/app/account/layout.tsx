'use client'; // Needed for useState

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added useRouter
import { useAuthContext } from '@/context/AuthContext'; // Import AuthContext hook
import UserHeader from '@/components/layout/UserHeader';
import UserFooter from '@/components/layout/UserFooter';
import UserMobileSidebar from '@/components/layout/UserMobileSidebar';
import { Home, Briefcase, Wallet, Gamepad2, User as UserIcon, Users, BarChart, Settings, LogOut, Bell, Loader2 } from 'lucide-react'; // Import icons (Added Bell, Loader2, Renamed User to UserIcon to avoid conflict)
import { cn } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs'; // Import Breadcrumbs
import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/button'; // Added Button
import { toast } from 'sonner'; // Added toast
import nProgress from 'nprogress'; // Added nProgress
import appSettings from '@/config/app';

const currentpage = 'account';

// Define navigation items for the desktop sidebar
const desktopNavItems = [
	{ href: '/account', label: 'Home', icon: Home },
	{ href: '/account/portfolio', label: 'Portfolio', icon: Briefcase },
	{ href: '/account/wallet', label: 'Wallet', icon: Wallet },
	{ href: '/account/games', label: 'Games', icon: Gamepad2 },
	{ href: '/account/profile', label: 'Profile', icon: UserIcon }, // Renamed User to UserIcon
	{ href: '/account/referrals', label: 'Referrals', icon: Users }, // Assuming '/account/referrals'
	{ href: '/account/agents', label: 'Agents', icon: Users }, // Assuming '/account/agents'
	{ href: '/account/report', label: 'Report', icon: BarChart }, // Assuming '/report'
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [isLogoutLoading, setIsLogoutLoading] = useState(false); // Specific loading state for logout
	const pathname = usePathname();
	const router = useRouter();
	const { logout } = useAuthContext(); // Get logout from context

	const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
	const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

	const handleLogout = async () => {
		setIsLogoutLoading(true);
		try {
			await logout();
			toast.success('Logged out successfully!');
			nProgress.start();
			router.push('/auth/login');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during logout.';
			toast.error(errorMessage);
		} finally {
			setIsLogoutLoading(false);
			// nProgress.done(); // nProgress.start() in router.push will handle this
		}
	};

	return (
		<div className="flex min-h-screen bg-background text-foreground relative">
			{/* Desktop Sidebar (Matches design) */}
			{/* Updated sidebar background to light mint green (light mode) and slightly darker for dark mode */}
			{/* Design bg: #E6FFFA ~ oklch(0.98 0.02 165) */}
			{/* Design active bg: #A0D2DB ~ oklch(0.85 0.05 190) */}
			<aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
				<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[var(--dashboard-secondary)] px-0 pb-4 rounded-r-2xl">
					<div className="flex h-16 shrink-0 items-center">
						{/* Placeholder for Logo if needed */}
						<span className="text-xl font-semibold text-[var(--dashboard-secondary-foreground)] pl-6">Menu</span>
					</div>
					<nav className="flex flex-1 flex-col">
						<ul role="list" className="flex flex-1 flex-col gap-y-7 overflow-x-hidden">
							<li>
								<ul role="list" className="-mx-2 space-y-2 ">
									{desktopNavItems.map((item) => {
										const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/account');
										return (
											<li key={item.label} className="pl-6">
												<CustomLink
													href={item.href}
													className={cn(
														// Active state: Dark background, light text (matching design)
														isActive ? 'bg-[oklch(0.19_0.028_258.6)] text-[oklch(0.988_0.008_303.9)] dark:bg-background dark:text-foreground !py-5' : 'text-[var(--dashboard-secondary-foreground)] hover:bg-black/5 dark:hover:bg-white/5', // Non-active state
														'group flex gap-x-3 rounded-l-full p-3 text-sm leading-6 font-semibold transition-colors duration-150 !pl-6'
													)}
												>
													<item.icon
														className={cn(
															isActive
																? 'text-[oklch(0.988_0.008_303.9)] dark:text-foreground' // Active icon color
																: 'text-[var(--dashboard-secondary-foreground)] opacity-70 group-hover:opacity-100', // Non-active icon color
															'h-6 w-6 shrink-0 transition-opacity duration-150' // Added transition
														)}
														aria-hidden="true"
													/>
													{item.label}
												</CustomLink>
											</li>
										);
									})}
								</ul>
							</li>

							<li className="mt-auto pl-6">
								<CustomLink href="/settings" className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700/50 w-full mt-1 text-left">
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

			{/* Mobile Sidebar Component */}
			<UserMobileSidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

			<div className="flex flex-1 flex-col lg:pl-72 lg:pr-8 relative">
				{/* Mobile/Tablet Header */}
				<UserHeader onMenuToggle={toggleMobileSidebar} />

				{/* Desktop Header Section (Moved Outside Main Content) */}
				<div className="sticky top-0 w-full right-0 z-10 backdrop-blur-sm">
					<div className="hidden lg:flex lg:items-center lg:justify-between px-10 py-3 bg-[var(--dashboard-secondary)]/80 rounded-full shadow mx-8 mt-6">
						<div>
							{/* Can add Breadcrumbs or Page Title here */}
							<h1 className="text-2xl font-nico font-semibold text-[var(--dashboard-secondary-foreground)]">{appSettings.appName}</h1>
						</div>
						<div className="relative">
							{/* Desktop Notification Icon */}
							<button className="p-2 rounded-full hover:bg-muted">
								<Bell className="h-6 w-6 text-[var(--dashboard-secondary-foreground)] opacity-70 group-hover:opacity-100'" />
							</button>
							{/* Notification Badge */}
							<span className="absolute -right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive p-0 text-xs text-destructive-foreground">0 </span>
						</div>
					</div>
				</div>

				{/* Main Content Area */}
				<main className="flex-1 overflow-y-auto p-5 pb-24 md:p-10 lg:p-16 gap-10">
					<Breadcrumbs />
					{children}
				</main>

				<UserFooter />
			</div>
		</div>
	);
}
