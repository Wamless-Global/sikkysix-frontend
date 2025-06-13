'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps, toast as sonnerToast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { X } from 'lucide-react';
import React from 'react';

type ToastOptions = Parameters<typeof sonnerToast>[1];

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

// Add close button to a toast
const withClose = (typeFn: typeof sonnerToast.success) => {
	return (message: Parameters<typeof typeFn>[0], options: ToastOptions = {}) => {
		const toastId = typeFn(message, {
			...options,
			action: (
				<button className="p-1 ml-auto" onClick={() => sonnerToast.dismiss(toastId)} title="Close">
					<X className="w-4 h-4 cursor-pointer" />
				</button>
			),
		});

		return toastId;
	};
};

// Patch toast methods directly (safely)
sonnerToast.success = withClose(sonnerToast.success);
sonnerToast.error = withClose(sonnerToast.error);
sonnerToast.info = withClose(sonnerToast.info);
sonnerToast.warning = withClose(sonnerToast.warning);

// Export patched toast
const toast = sonnerToast;

export { Toaster, toast };
