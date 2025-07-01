'use client';
import { getPlatformName } from '@/lib/helpers';
import { useEffect } from 'react';

export function DynamicAppNameTitle({ fallback }: { fallback: string }) {
	useEffect(() => {
		const appName = getPlatformName();
		document.title = document.title.replace(fallback, appName);
	}, [fallback]);
	return null;
}
