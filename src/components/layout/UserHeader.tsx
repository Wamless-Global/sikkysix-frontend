import { Bell, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserHeaderProps {
	onMenuToggle: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onMenuToggle }) => {
	return (
		<header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border/40 bg-[var(--dashboard-secondary)] px-4 text-gray-900 md:px-6 lg:hidden mb-8">
			<Menu className="h-7 w-7 lg:hidden hover:bg-white/20" onClick={onMenuToggle} aria-label="Toggle Menu" />

			<div className="flex items-center">
				<span className="text-lg font-nico font-semibold text-[var(--dashboard-secondary-foreground)]">Sikky Six</span>
			</div>

			<div className="relative">
				<Bell className="h-7 w-7 hover:bg-white/20" />
				<Badge variant="destructive" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
					0
				</Badge>
			</div>
		</header>
	);
};

export default UserHeader;
