import { Home, Briefcase, Wallet, Gamepad2, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CustomLink } from '../ui/CustomLink';

const UserFooter: React.FC = () => {
	const pathname = usePathname();

	const navItems = [
		{ href: '/account', label: 'Home', icon: Home },
		{ href: '/account/portfolio', label: 'Portfolio', icon: Briefcase },
		{ href: '/account/wallet', label: 'Wallet', icon: Wallet },
		{ href: '/account/games', label: 'Games', icon: Gamepad2 },
		{ href: '/account/profile', label: 'Profile', icon: User },
	];

	return (
		<footer className="fixed -bottom-1 left-0 right-0 z-40 border-t border-border/40 bg-background px-4 py-2 lg:hidden">
			<nav className="flex justify-around">
				{navItems.map((item) => {
					const isActive = pathname === item.href;
					return (
						<CustomLink key={item.href} href={item.href} className={cn('flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors')}>
							<item.icon className={cn('h-5 w-5', isActive ? 'text-[var(--dashboard-accent)]' : 'text-muted-foreground hover:text-foreground')} />
							<span className={cn('text-xs font-medium', isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground')}>{item.label}</span>
						</CustomLink>
					);
				})}
			</nav>
		</footer>
	);
};

export default UserFooter;
