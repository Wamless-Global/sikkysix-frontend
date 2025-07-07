import { Bell, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/ui/logo';
import { getLoggedInAsUser, getPlatformName } from '@/lib/helpers';
import { CustomLink } from '@/components/ui/CustomLink';

interface UserHeaderProps {
	notifications: string[];
	unreadNotifications: number;
	onMenuToggle: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onMenuToggle, notifications, unreadNotifications }) => {
	const isAdmin = getLoggedInAsUser();

	return (
		<header className={`z-40 flex h-20 items-center justify-between border-b border-border/40 bg-[var(--dashboard-secondary)] px-4 text-gray-900 md:px-6 lg:hidden w-full`}>
			<Menu className="h-7 w-7 lg:hidden hover:bg-white/20 cursor-pointer" onClick={onMenuToggle} aria-label="Toggle Menu" />

			<CustomLink href="/" className="flex items-center">
				<Logo alt={`${getPlatformName()} Logo`} size="md" variant="text" />
			</CustomLink>

			<div className="relative">
				<button
					type="button"
					className="p-0 m-0 bg-transparent border-none outline-none cursor-pointer"
					aria-label="Open notifications"
					onClick={() => {
						const event = new CustomEvent('open-notification-center');
						window.dispatchEvent(event);
					}}
				>
					<Bell className="h-7 w-7 hover:bg-white/20" />
					{unreadNotifications > 0 && (
						<Badge variant="destructive" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs z-50 opacity-100">
							{unreadNotifications}
						</Badge>
					)}
				</button>
			</div>
		</header>
	);
};

export default UserHeader;
