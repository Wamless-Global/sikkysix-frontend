import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout'; // Assuming default alias '@' points to src
import { UserProvider } from '@/context/UserContext'; // Import the UserProvider

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
	return (
		<UserProvider>
			{' '}
			{/* Wrap the layout with the provider */}
			<AdminLayout>{children}</AdminLayout>
		</UserProvider>
	);
}
