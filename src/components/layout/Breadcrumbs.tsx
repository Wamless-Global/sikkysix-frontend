'use client';

import { CustomLink } from '@/components/ui/CustomLink';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, type LucideIcon } from 'lucide-react'; // Added Home icon and LucideIcon type

// Helper function to capitalize words
const capitalize = (s: string) => {
	if (!s) return '';
	// Handle potential UUIDs or other non-standard segments gracefully
	if (s.length > 20 && s.includes('-')) return 'Details'; // Or some generic placeholder for long IDs
	return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '); // Replace hyphens and capitalize
};

// Define base paths and their display names
const basePaths: Record<string, { name: string; icon?: LucideIcon }> = {
	'/admin': { name: 'Admin', icon: Home }, // Example: Use Home icon for Admin root
	'/account': { name: 'Account', icon: Home }, // Example: Use Home icon for Account root
	// Add other base paths here if needed
};

const Breadcrumbs = () => {
	const pathname = usePathname();
	const pathSegments = pathname.split('/').filter((segment) => segment); // Split and remove empty segments

	// Determine the base path and name
	let basePath = '';
	let baseName = 'Home'; // Default base name
	let BaseIcon: LucideIcon = Home; // Default base icon - Use LucideIcon type
	let startIndex = 0; // Index in pathSegments where actual page segments start

	for (const base in basePaths) {
		if (pathname.startsWith(base)) {
			basePath = base;
			baseName = basePaths[base].name;
			BaseIcon = basePaths[base].icon || Home;
			// Adjust startIndex based on how many segments the basePath has
			startIndex = base.split('/').filter(Boolean).length;
			break; // Found the matching base path
		}
	}

	// Don't render if we are exactly on the base path or if no path exists
	if (pathSegments.length <= startIndex) {
		// Optionally render just the base name as a title if needed, or nothing
		// Example: return <h1 className="text-lg font-medium text-muted-foreground">{baseName}</h1>;
		return null; // Render nothing on the base page itself
	}

	// Build breadcrumb items starting from the base
	const breadcrumbItems = [
		// Add the base item first
		{ href: basePath || '/', displayName: baseName, isLast: pathSegments.length === startIndex, icon: BaseIcon },
		// Add subsequent segments
		...pathSegments.slice(startIndex).map((segment, index) => {
			const currentPath = '/' + pathSegments.slice(0, startIndex + index + 1).join('/');
			const displayName = capitalize(segment);
			const isLast = startIndex + index === pathSegments.length - 1;
			return { href: currentPath, displayName, isLast, icon: undefined }; // No icon for sub-pages by default
		}),
	];

	return (
		<nav aria-label="Breadcrumb" className="mb-8">
			<ol className="flex items-center space-x-1 space-y-1 md:space-y-0 text-sm text-muted-foreground flex-wrap">
				{breadcrumbItems.map((item, index) => (
					<li key={item.href} className="flex items-center">
						{/* Separator */}
						{index > 0 && <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />}

						{/* Icon for the first item (base) */}
						{index === 0 && item.icon && <item.icon className="h-4 w-4 mr-1.5 flex-shrink-0" />}

						{/* Link or Text */}
						{item.isLast ? (
							<span className="font-medium text-foreground">{item.displayName}</span>
						) : (
							<CustomLink href={item.href} className="hover:text-primary transition-colors">
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
