'use client'; // Keep only one

import { useState } from 'react'; // Import useState
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useRouter and useSearchParams
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // Import toast

const UnauthorizedPage: React.FC = () => {
	const { logout } = useAuthContext();
	const router = useRouter(); // Initialize router
	const searchParams = useSearchParams(); // Get search params
	const attemptedPath = searchParams.get('path'); // Get the attempted path
	const [isLoggingOut, setIsLoggingOut] = useState(false); // Add loading state
	// Remove error state: const [error, setError] = useState<string | null>(null);

	// Handle logout action
	const handleLogout = async () => {
		setIsLoggingOut(true);
		// Remove setError(null);
		try {
			await logout();
			toast.success('Logged out successfully!'); // Add success toast
			// Redirect to login page on successful logout
			router.push('/auth/login');
		} catch (err) {
			console.error('Logout failed:', err);
			// Use toast for error
			toast.error(err instanceof Error ? err.message : 'An unexpected error occurred during logout.');
			setIsLoggingOut(false); // Stop loading on error
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
			<h1 className="text-4xl font-bold mb-4 text-destructive">Unauthorized Access</h1>
			<p className="text-lg mb-6 text-center">You do not have the necessary permissions to access {attemptedPath ? <code className="bg-muted px-1 py-0.5 rounded">{attemptedPath}</code> : 'this page'}.</p>
			{/* Remove error display: {error && <p className="text-destructive mb-4">Error: {error}</p>} */}
			<div className="flex gap-4">
				<Link href="/" passHref>
					<Button variant="outline" className="cursor-pointer" disabled={isLoggingOut}>
						Go to Home Page
					</Button>
				</Link>
				<Button variant="destructive" onClick={handleLogout} className="cursor-pointer" disabled={isLoggingOut}>
					{isLoggingOut ? (
						<>
							<Loader2 className="mr-2 h-5 w-5 animate-spin" /> <span>Logging out...</span>
						</>
					) : (
						'Logout'
					)}
				</Button>
			</div>
		</div>
	);
};

export default UnauthorizedPage;
