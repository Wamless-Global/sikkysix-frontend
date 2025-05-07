'use client';

import Link, { LinkProps } from 'next/link';
import NProgress from 'nprogress';

type CustomLinkProps = LinkProps & {
	children: React.ReactNode;
	className?: string;
	onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
	// Add any other props you might pass to Link
	[key: string]: any;
};

export function CustomLink({ children, onClick, ...props }: CustomLinkProps) {
	const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		// Check if it's a normal navigation click (not modified, not opening in new tab)
		// and if the href is internal (starts with '/' or current origin)
		const href = props.href?.toString();
		const isInternal = href && (href.startsWith('/') || href.startsWith(window.location.origin));
		const isModifiedClick = event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0;

		if (isInternal && !isModifiedClick) {
			NProgress.start();
		}

		// Call original onClick if it exists
		if (onClick) {
			onClick(event);
		}
	};

	return (
		<Link {...props} onClick={handleClick}>
			{children}
		</Link>
	);
}
