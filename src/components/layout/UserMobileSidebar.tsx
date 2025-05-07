import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomLink } from '../ui/CustomLink';

interface UserMobileSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

const UserMobileSidebar: React.FC<UserMobileSidebarProps> = ({ isOpen, onClose }) => {
	const navItems = [
		{ href: '/dashboard', label: 'Home' },
		{ href: '/referrals', label: 'Referrals' }, // Assuming '/referrals' route
		{ href: '/become-agent', label: 'Become An Agent' }, // Assuming '/become-agent' route
		{ href: '/settings', label: 'Settings' }, // Assuming '/settings' route
		{ href: '/report', label: 'Report' }, // Assuming '/report' route
		// Add Log Out functionality separately
	];

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
							{/* Highlight active link if needed */}
							{item.label === 'Home' ? <span className="text-[oklch(0.69_0.21_145)]">{item.label}</span> : item.label}
						</CustomLink>
					))}
				</nav>
				<div className="mt-auto border-t border-border/40 p-4">
					{/* Placeholder for Log Out button */}
					<Button variant="outline" className="w-full border-muted-foreground/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
						Log Out
					</Button>
				</div>
			</div>
		</div>
	);
};

export default UserMobileSidebar;
