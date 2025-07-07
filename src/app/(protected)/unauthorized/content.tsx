'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CustomLink } from '@/components/ui/CustomLink';
import nProgress from 'nprogress';
import { handleFetchErrorMessage } from '@/lib/helpers';
import AppFooter from '@/components/layout/AppFooter';

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
			nProgress.start();
			toast.success('Logged out successfully!');
			router.push('/auth/login');
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'An unexpected error occurred during logout.');
			toast.error(errorMessage);
		} finally {
			nProgress.done();
			setIsLoggingOut(false);
		}
	};

	return (
		<div className="bg-background min-h-screen flex flex-col justify-between">
			<div className="flex flex-col items-center justify-center text-foreground p-4 min-h-96">
				<h1 className="text-4xl font-bold mb-4 text-destructive">Unauthorized Access</h1>
				<p className="text-lg mb-6 text-center">You do not have the necessary permissions to access {attemptedPath ? <code className="bg-muted px-1 py-0.5 rounded">{attemptedPath}</code> : 'this page'}.</p>
				<div className="flex gap-4">
					<CustomLink href="/account" passHref>
						<Button variant="outline" className="cursor-pointer" disabled={isLoggingOut}>
							My Account
						</Button>
					</CustomLink>
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
			<AppFooter />
		</div>
	);
};

export default UnauthorizedPageContent;
