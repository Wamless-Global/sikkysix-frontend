'use client';

import { CustomLink } from '@/components/ui/CustomLink';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, LogOut, LayoutDashboard, Users, FolderKanban, ArrowLeftRight, Settings, MessageSquare, BarChart } from 'lucide-react';

const navItems = [
	{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/admin/users', label: 'User Management', icon: Users },
	{
		href: '/admin/categories',
		label: 'Investment Categories',
		icon: FolderKanban,
	},
	{ href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
	{ href: '/admin/settings', label: 'Platform Settings', icon: Settings },
	{
		href: '/admin/communication',
		label: 'Communication',
		icon: MessageSquare,
	},
	{ href: '/admin/reports', label: 'Reporting', icon: BarChart },
];

const Sidebar = () => {
	const pathname = usePathname();

	return (
		<aside className="w-72 bg-muted/40 border-r border-border p-4 flex flex-col">
			<div className="mb-6 flex items-center gap-2">
				<h2 className="text-sm font-medium text-muted-foreground">Menu</h2>
			</div>
			<nav className="flex-1 space-y-1">
				{navItems.map((item) => {
					const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
					const Icon = item.icon;

					return (
						<CustomLink key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary border-l-4 border-transparent', isActive && 'bg-muted text-primary border-primary')}>
							<Icon className="h-4 w-4" />
							{item.label}
						</CustomLink>
					);
				})}
			</nav>
		</aside>
	);
};

export default Sidebar;
