'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const UnauthorizedPageContent: React.FC = () => {
	const { logout } = useAuthContext();
	const router = useRouter();
	const searchParams = useSearchParams();
	const attemptedPath = searchParams.get('path');
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			toast.success('Logged out successfully!');
			router.push('/auth/login');
		} catch (err) {
			console.error('Logout failed:', err);
			toast.error(err instanceof Error ? err.message : 'An unexpected error occurred during logout.');
			setIsLoggingOut(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
			<h1 className="text-4xl font-bold mb-4 text-destructive">Unauthorized Access</h1>
			<p className="text-lg mb-6 text-center">You do not have the necessary permissions to access {attemptedPath ? <code className="bg-muted px-1 py-0.5 rounded">{attemptedPath}</code> : 'this page'}.</p>
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

export default UnauthorizedPageContent;
