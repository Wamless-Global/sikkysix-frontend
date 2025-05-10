import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserHeaderProps {
	onMenuToggle: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onMenuToggle }) => {
	return (
		<header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border/40 bg-[var(--dashboard-secondary)] px-4 text-gray-900 md:px-6 lg:hidden mb-8">
			<Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/20" onClick={onMenuToggle} aria-label="Toggle Menu">
				<Menu className="h-6 w-6" />
			</Button>

			<div className="flex items-center">
				<span className="text-lg font-nico font-semibold text-[var(--dashboard-secondary-foreground)]">Sikky Six</span>
			</div>

			<div className="relative">
				<Button variant="ghost" size="icon" className="hover:bg-white/20">
					<Bell className="h-6 w-6" />
				</Button>
				<Badge variant="destructive" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
					0
				</Badge>
			</div>
		</header>
	);
};

export default UserHeader;
