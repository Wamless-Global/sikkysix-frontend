'use client';

import { CustomLink } from '@/components/ui/CustomLink';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, type LucideIcon } from 'lucide-react';

const capitalize = (s: string) => {
	if (!s) return '';
	if (s.length > 20 && s.includes('-')) return 'Details';
	return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
};

const basePaths: Record<string, { name: string; icon?: LucideIcon }> = {
	'/admin': { name: 'Admin', icon: Home },
	'/account': { name: 'Account', icon: Home },
};

const Breadcrumbs = () => {
	const pathname = usePathname();
	const pathSegments = pathname.split('/').filter((segment) => segment);

	let basePath = '';
	let baseName = 'Home';
	let BaseIcon: LucideIcon = Home;
	let startIndex = 0;

	for (const base in basePaths) {
		if (pathname.startsWith(base)) {
			basePath = base;
			baseName = basePaths[base].name;
			BaseIcon = basePaths[base].icon || Home;
			startIndex = base.split('/').filter(Boolean).length;
			break;
		}
	}

	if (pathSegments.length <= startIndex) {
		return null;
	}

	const breadcrumbItems = [
		{ href: basePath || '/', displayName: baseName, isLast: pathSegments.length === startIndex, icon: BaseIcon },
		...pathSegments.slice(startIndex).map((segment, index) => {
			const currentPath = '/' + pathSegments.slice(0, startIndex + index + 1).join('/');
			const displayName = capitalize(segment);
			const isLast = startIndex + index === pathSegments.length - 1;
			return { href: currentPath, displayName, isLast, icon: undefined };
		}),
	];

	return (
		<nav aria-label="Breadcrumb" className="mb-8">
			<ol className="flex items-center space-x-1 space-y-1 md:space-y-0 text-sm text-muted-foreground flex-wrap">
				{breadcrumbItems.map((item, index) => (
					<li key={item.href} className="flex items-center">
						{index > 0 && <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />}

						{index === 0 && item.icon && <item.icon className="h-4 w-4 mr-1.5 flex-shrink-0" />}

						{item.isLast ? (
							<span className="font-medium text-foreground">{item.displayName}</span>
						) : (
							<CustomLink href={item.href} className="hover:text-[var(--dashboard-accent)] transition-colors">
								{item.displayName}
							</CustomLink>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
};

export default Breadcrumbs;
