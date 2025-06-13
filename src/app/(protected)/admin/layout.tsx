'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { OnlineProvider } from '@/context/OnlineContext';
import { UserProvider } from '@/context/UserContext';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
	return (
		<UserProvider>
			<OnlineProvider>
				<AdminLayout>{children}</AdminLayout>
			</OnlineProvider>
		</UserProvider>
	);
}
