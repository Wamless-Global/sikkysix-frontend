'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import appSettings from '@/config/app';
import Image from 'next/image';
import nProgress from 'nprogress';

interface AdminLayoutProps {
	children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [isLogoutLoading, setIsLogoutLoading] = useState(false);
	const [, setError] = useState<string | null>(null);
	const router = useRouter();
	const { logout, currentUser, isLoading: isAuthLoading } = useAuthContext();

	const handleLogout = async () => {
		setIsLogoutLoading(true);
		setError(null);

		try {
			await logout();
			toast.success('Logged out successfully!');
			nProgress.start();
			router.push('/auth/login');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during logout.';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLogoutLoading(false);
		}
	};

	return (
		<div className="flex h-screen bg-background">
			<div className="hidden md:flex">
				<Sidebar />
			</div>

			<div className={cn('fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden', isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
				<div className="relative h-full z-10">
					<Sidebar />
				</div>

				<Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-foreground md:hidden" onClick={() => setIsMobileSidebarOpen(false)}>
					<X className="h-6 w-6" />
					<span className="sr-only">Close sidebar</span>
				</Button>
			</div>

			{isMobileSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>}

			<div className="flex flex-col flex-1 overflow-hidden">
				<header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background px-4 sm:px-6 md:px-6 lg:px-8 py-6 shadow-md">
					<Button variant="outline" size="icon" className="md:hidden shrink-0" onClick={() => setIsMobileSidebarOpen(true)}>
						<Menu className="h-5 w-5" />
						<span className="sr-only">Open sidebar</span>
					</Button>

					<h1 className="text-xl font-semibold text-foreground flex-1">{appSettings.appName} Admin</h1>
					<div className="flex items-center">
						<div className="flex gap-2 items-center">
							{currentUser?.profilePictureUrl && <Image src={currentUser.profilePictureUrl} alt={`${currentUser.name}'s profile picture`} width={20} height={20} className="rounded-full" />}

							{currentUser && <span className="text-sm text-muted-foreground hidden sm:inline-block mr-4">Hello, {currentUser.name}</span>}
						</div>

						<div className="flex-1 mr-2.5"></div>

						<ThemeToggle />

						<Button variant="ghost" size="icon" onClick={handleLogout} className="ml-2 cursor-pointer" disabled={isLogoutLoading}>
							<span className="sr-only">Log out</span>
						</Button>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
};

export default AdminLayout;
