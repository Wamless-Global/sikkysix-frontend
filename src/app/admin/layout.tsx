'use client';
import { useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { UserProvider } from '@/context/UserContext';
import nProgress from 'nprogress';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const handleBeforeUnload = () => {
			nProgress.start();
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	return (
		<UserProvider>
			<AdminLayout>{children}</AdminLayout>
		</UserProvider>
	);
}
