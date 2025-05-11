'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme();
	const isMobile = useMediaQuery('(max-width: 768px)');
	const position = isMobile ? 'top-right' : 'bottom-right';

	return (
		<Sonner
			position={position}
			theme={theme as ToasterProps['theme']}
			className="toaster group"
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
