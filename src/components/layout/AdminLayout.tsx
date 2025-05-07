'use client'; // Required for state

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext'; // Import AuthContext hook
import Sidebar from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // Re-add toast import
import { cn } from '@/lib/utils';
import appSettings from '@/config/app';
import Image from 'next/image';
import nProgress from 'nprogress';

interface AdminLayoutProps {
	children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [isLogoutLoading, setIsLogoutLoading] = useState(false); // Specific loading state for logout
	const [error, setError] = useState<string | null>(null); // Keep error state if needed locally
	const router = useRouter();
	// Get auth state and functions from context
	const { logout, currentUser, isLoading: isAuthLoading } = useAuthContext();

	const handleLogout = async () => {
		setIsLogoutLoading(true); // Start loading the button
		setError(null); // Clear local error state

		try {
			await logout(); // Call the context logout function
			toast.success('Logged out successfully!');
			nProgress.start();
			router.push('/auth/login'); // Redirect after successful logout (context already cleared user)
		} catch (err) {
			// Error handling: The context's logout function throws an error on failure.
			const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during logout.';
			setError(errorMessage); // Set local error state if needed for UI feedback
			// Show the error message from the context's thrown error
			toast.error(errorMessage);
		} finally {
			setIsLogoutLoading(false); // Stop loading the button
		}
	};

	return (
		<div className="flex h-screen bg-background">
			{/* Static Sidebar for larger screens */}
			<div className="hidden md:flex">
				<Sidebar />
			</div>

			{/* Mobile Sidebar Container */}
			<div
				className={cn(
					'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden', // Base mobile styles, z-50 (highest)
					isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full' // Slide in/out
				)}
			>
				{/* Actual Sidebar Content */}
				<div className="relative h-full z-10">
					{/* Removed bg and border */}
					<Sidebar />
				</div>

				{/* Close button inside mobile sidebar container, but high z-index */}
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-4 right-4 z-20 text-foreground md:hidden" // z-20 (above sidebar content)
					onClick={() => setIsMobileSidebarOpen(false)}
				>
					<X className="h-6 w-6" />
					<span className="sr-only">Close sidebar</span>
				</Button>
			</div>

			{/* Optional: Add a backdrop overlay */}
			{isMobileSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 md:hidden" // z-40 (below sidebar container, above main content)
					onClick={() => setIsMobileSidebarOpen(false)} // Close on overlay click
				></div>
			)}

			{/* Main Content Area Wrapper */}
			<div className="flex flex-col flex-1 overflow-hidden">
				{/* Fixed Header - Added bottom border */}
				<header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background px-4 sm:px-6 md:px-6 lg:px-8 py-6 shadow-md">
					{/* Removed h-16, increased py to py-6, changed shadow-sm to shadow-md */} {/* Added border-b back, adjusted padding */}
					{/* Burger Menu Button for Mobile */}
					<Button variant="outline" size="icon" className="md:hidden shrink-0" onClick={() => setIsMobileSidebarOpen(true)}>
						<Menu className="h-5 w-5" />
						<span className="sr-only">Open sidebar</span>
					</Button>
					{/* App Name - Applied original Admin Panel styles */}
					<h1 className="text-xl font-semibold text-foreground flex-1">{appSettings.appName} Admin</h1>
					<div className="flex items-center">
						<div className="flex gap-2 items-center">
							{currentUser?.profilePictureUrl && <Image src={currentUser.profilePictureUrl} alt={`${currentUser.name}'s profile picture`} width={20} height={20} className="rounded-full" />}
							{/* Greeting - Show only when auth is loaded and user exists */}
							{currentUser && <span className="text-sm text-muted-foreground hidden sm:inline-block mr-4">Hello, {currentUser.name}</span>}
						</div>

						{/* Spacer to push ThemeToggle and Logout to the right */}
						<div className="flex-1 mr-2.5"></div>
						{/* Theme Toggle */}
						<ThemeToggle />
						{/* Logout Button - Disable while loading */}
						<Button variant="ghost" size="icon" onClick={handleLogout} className="ml-2 cursor-pointer" disabled={isLogoutLoading}>
							{isLogoutLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />} {/* Use isLogoutLoading */}
							<span className="sr-only">Log out</span>
						</Button>
					</div>
				</header>

				{/* Scrollable Main Content */}
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					{/* Removed mb-6 from old header, added padding here */}
					{children}
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
