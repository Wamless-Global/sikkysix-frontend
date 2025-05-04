'use client';

import React from 'react';
import { CustomLink } from '@/components/ui/CustomLink';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react'; // Icon for separator

// Helper function to capitalize words
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper function to generate a display name from a path segment
const getDisplayName = (segment: string): string => {
	// Replace hyphens with spaces and capitalize each word
	return segment.split('-').map(capitalize).join(' ');
};

const Breadcrumbs = () => {
	const pathname = usePathname();
	const pathSegments = pathname.split('/').filter((segment) => segment); // Split and remove empty segments

	// Don't render breadcrumbs on the root admin page or if no path exists
	if (pathSegments.length <= 1 || !pathname.startsWith('/admin')) {
		// Optionally render a default title or nothing
		// For now, let's render the default dashboard title if on /admin
		if (pathname === '/admin') {
			return <h1 className="text-lg font-medium text-muted-foreground">Dashboard</h1>;
		}
		return null; // Or return a default element if needed elsewhere
	}

	// Build breadcrumb items
	const breadcrumbItems = pathSegments
		.map((segment, index) => {
			const href = '/' + pathSegments.slice(0, index + 1).join('/');
			const displayName = getDisplayName(segment);
			const isLast = index === pathSegments.length - 1;

			// Special case for 'admin' root
			if (segment.toLowerCase() === 'admin' && index === 0) {
				return { href: '/admin', displayName: 'Admin' };
			}

			return { href, displayName, isLast };
		})
		.filter((item) => item.displayName !== 'Admin' || item.href === '/admin'); // Keep 'Admin' only if it's the root link

	return (
		<nav aria-label="Breadcrumb" className="mb-4">
			{' '}
			{/* Added margin-bottom */}
			<ol className="flex items-center space-x-1 text-sm text-muted-foreground">
				{breadcrumbItems.map((item, index) => (
					<li key={item.href} className="flex items-center">
						{index > 0 && <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />}
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
