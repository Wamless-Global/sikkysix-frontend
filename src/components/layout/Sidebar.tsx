'use client';

import { CustomLink } from '@/components/ui/CustomLink';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FolderKanban, ArrowLeftRight, Settings, MessageSquare, BarChart, UserCheck, FileText, WalletIcon } from 'lucide-react';

const navItems = [
	{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/admin/users', label: 'User Management', icon: Users },
	{
		href: '/admin/agents',
		label: 'Agents',
		icon: UserCheck,
	},
	{
		href: '/admin/applications',
		label: 'Agent Applications',
		icon: FileText,
	},
	{
		href: '/admin/clubs',
		label: 'Clubs',
		icon: FolderKanban,
	},
	{ href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
	{ href: '/admin/settings', label: 'Platform Settings', icon: Settings },
	{ href: '/admin/payment-methods', label: 'Payment Methods', icon: WalletIcon },
	{
		href: '/admin/communication',
		label: 'Communication',
		icon: MessageSquare,
	},
	// { href: '/admin/reports', label: 'Reporting', icon: BarChart },
];

interface SidebarProps {
	setIsMobileSidebarOpen: (IsMobileSidebarOpen: boolean) => void;
}

const Sidebar = ({ setIsMobileSidebarOpen }: SidebarProps) => {
	const pathname = usePathname();

	return (
		<aside className="w-72 bg-muted/40 border-r border-border p-4 flex flex-col">
			<div className="mb-6 flex items-center gap-2"></div>
			<nav className="flex-1 space-y-1">
				{navItems.map((item) => {
					const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
					const Icon = item.icon;

					return (
						<CustomLink
							key={item.href}
							href={item.href}
							className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary border-l-4 border-transparent', isActive && 'bg-muted text-primary border-primary')}
							onClick={() => setIsMobileSidebarOpen(false)}
						>
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
