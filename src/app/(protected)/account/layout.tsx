import React from 'react';
import { OnlineProvider } from '@/context/OnlineContext';
import UserLayout from '@/components/layout/UserLayout';

export default function UserRootLayout({ children }: { children: React.ReactNode }) {
	return (
		<OnlineProvider>
			<UserLayout>{children}</UserLayout>
		</OnlineProvider>
	);
}
