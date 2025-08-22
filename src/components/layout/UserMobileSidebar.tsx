import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomLink } from '../ui/CustomLink';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { usePathname, useRouter } from 'next/navigation';
import { handleFetchMessage } from '@/lib/helpers';
import { Role } from '@/types';

interface UserMobileSidebarProps {
	isOpen: boolean;
	isLogoutLoading: boolean;
	onClose: () => void;
	handleLogout: () => void;
}

const UserMobileSidebar: React.FC<UserMobileSidebarProps> = ({ isOpen, isLogoutLoading, onClose, handleLogout }) => {
	const router = useRouter();
	const { logout, currentUser } = useAuthContext();
	const pathname = usePathname();

	const navItems = [
		{ href: '/account', for: 'user', label: 'Home' },
		{ href: '/account/referrals', for: 'user', label: 'Referrals' },
		{ href: '/account/agents-apply', for: 'user', label: 'Become an Agent', hideFor: 'agent' },
		...(currentUser?.roles.includes('agent')
			? [
					{
						href: '/account/agent-portal',
						label: 'Agent Portal',
						subMenu: [
							{ href: '/account/agent-portal/overview', label: 'overview' },
							{ href: '/account/agent-portal/orders', label: 'orders' },
							{ href: '/account/agent-portal/settings', label: 'settings' },
						],
					},
			  ]
			: []),
		{ href: '/account/profile/preferences', label: 'Settings', for: 'user', hideFor: 'figure-head' },
		{ href: '/account/stats', label: 'Figure head', for: 'figure-head' },
	];
	const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

	return (
		<div className={cn('fixed inset-0 z-50 flex lg:hidden', isOpen ? 'translate-x-0' : '-translate-x-full', 'transition-transform duration-300 ease-in-out')}>
			<div className={cn('fixed inset-0 bg-black/60 backdrop-blur-sm', isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none', 'transition-opacity duration-300 ease-in-out')} onClick={onClose} aria-hidden="true" />

			<div className="relative flex h-full w-72 flex-col bg-[oklch(0.11_0.018_270)] text-text-primary shadow-xl">
				<div className="flex items-center justify-between p-4 border-b border-border/40">
					<span className="text-base font-semibold">Menu</span>
					<Button variant="ghost" size="icon" onClick={onClose} className="text-text-primary hover:bg-white/10">
						<X className="h-4 w-4" />
						<span className="sr-only">Close menu</span>
					</Button>
				</div>
				<nav className="flex-1 space-y-2 p-4">
					{navItems.map((item) => {
						const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/account');

						if ('subMenu' in item && item.subMenu) {
							return (
								<div key={item.href}>
									<button type="button" className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground text-sm" onClick={() => setOpenSubMenu(openSubMenu === item.label ? null : item.label)}>
										{isActive ? <span className="text-[oklch(0.69_0.21_145)]">{item.label}</span> : item.label}
										<span className={cn('ml-2 transition-transform', openSubMenu === item.label ? 'rotate-90' : '')}>▶</span>
									</button>

									<ul className={cn('pl-4 space-y-1', openSubMenu === item.label ? 'block' : 'hidden')}>
										{item.subMenu.map((sub) => (
											<li key={sub.href}>
												<CustomLink href={sub.href} className={cn(pathname === sub.href ? 'font-bold text-[oklch(0.69_0.21_145)] !py-4' : 'block rounded text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground', 'px-3 py-2')} onClick={onClose}>
													{sub.label}
												</CustomLink>
											</li>
										))}
									</ul>
								</div>
							);
						}

						if (currentUser?.roles.includes(item.for as Role) && !currentUser?.roles.includes(item.hideFor as Role))
							return (
								<CustomLink key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground" onClick={onClose}>
									{isActive ? <span className="text-[oklch(0.69_0.21_145)]">{item.label}</span> : item.label}
								</CustomLink>
							);
					})}
				</nav>
				<div className="mt-auto border-t border-border/40 p-4">
					<Button variant="outline" className="w-full border-muted-foreground/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground text-sm" disabled={isLogoutLoading} onClick={handleLogout} size={'sm'}>
						{isLogoutLoading && <Loader2 className="h-6 w-6 shrink-0 animate-spin" aria-hidden="true" />}
						Log Out
					</Button>
				</div>
			</div>
		</div>
	);
};

export default UserMobileSidebar;
