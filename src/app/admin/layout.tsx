'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { UserProvider } from '@/context/UserContext';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
	return (
		<UserProvider>
			<AdminLayout>{children}</AdminLayout>
		</UserProvider>
	);
}
