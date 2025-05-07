import AdminLayout from '@/components/layout/AdminLayout'; // Assuming default alias '@' points to src
import { UserProvider } from '@/context/UserContext'; // Import the UserProvider

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
	return (
		<UserProvider>
			<AdminLayout>{children}</AdminLayout>
		</UserProvider>
	);
}
