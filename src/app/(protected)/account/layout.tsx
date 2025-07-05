import React from 'react';
import { OnlineProvider } from '@/context/OnlineContext';
import UserLayout from '@/components/layout/UserLayout';
import LoggedInAs from '@/components/ui/logged-in-as-user';

export default function UserRootLayout({ children }: { children: React.ReactNode }) {
	return (
		<OnlineProvider>
			<LoggedInAs />
			<UserLayout>{children}</UserLayout>
		</OnlineProvider>
	);
}
