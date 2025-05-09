import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomLink } from '../ui/CustomLink';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

interface UserMobileSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

const UserMobileSidebar: React.FC<UserMobileSidebarProps> = ({ isOpen, onClose }) => {
	const [isLogoutLoading, setIsLogoutLoading] = useState(false);
	const router = useRouter();
	const { logout } = useAuthContext();

	const navItems = [
		{ href: '/account', label: 'Home' },
		{ href: '/account/referrals', label: 'Referrals' },
		{ href: '/account/profile', label: 'Profile' },
		// { href: '/account/figure-heads', label: 'Figure Heads' },
		// { href: '/account/agents/apply', label: 'Become an Agent' },
		{ href: '/account/report', label: 'Report' },
		{ href: '/account/profile/preference', label: 'Settings' },
	];

	const handleLogout = async () => {
		setIsLogoutLoading(true);
		try {
			await logout();
			toast.success('Logged out successfully!');
			nProgress.start();
			router.replace('/auth/login');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during logout.';
			toast.error(errorMessage);
		} finally {
			setIsLogoutLoading(false);
		}
	};
	return (
		<div className={cn('fixed inset-0 z-50 flex lg:hidden', isOpen ? 'translate-x-0' : '-translate-x-full', 'transition-transform duration-300 ease-in-out')}>
			{/* Overlay */}
			<div className={cn('fixed inset-0 bg-black/60 backdrop-blur-sm', isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none', 'transition-opacity duration-300 ease-in-out')} onClick={onClose} aria-hidden="true" />

			{/* Sidebar Content */}
			<div className="relative flex h-full w-72 flex-col bg-[oklch(0.11_0.018_270)] text-text-primary shadow-xl">
				<div className="flex items-center justify-between p-4 border-b border-border/40">
					<span className="text-lg font-semibold">Menu</span>
					<Button variant="ghost" size="icon" onClick={onClose} className="text-text-primary hover:bg-white/10">
						<X className="h-6 w-6" />
						<span className="sr-only">Close menu</span>
					</Button>
				</div>
				<nav className="flex-1 space-y-2 p-4">
					{navItems.map((item) => (
						<CustomLink
							key={item.href}
							href={item.href}
							className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
							onClick={onClose} // Close sidebar on navigation
						>
							{item.label === 'Home' ? <span className="text-[oklch(0.69_0.21_145)]">{item.label}</span> : item.label}
						</CustomLink>
					))}
				</nav>
				<div className="mt-auto border-t border-border/40 p-4">
					<Button variant="outline" className="w-full border-muted-foreground/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground" disabled={isLogoutLoading} onClick={handleLogout}>
						{isLogoutLoading && <Loader2 className="h-6 w-6 shrink-0 animate-spin" aria-hidden="true" />}
						Log Out
					</Button>
				</div>
			</div>
		</div>
	);
};

export default UserMobileSidebar;
