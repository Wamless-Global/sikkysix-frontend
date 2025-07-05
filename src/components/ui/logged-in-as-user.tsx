'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { clearLoggedInAsUser, getLoggedInAsUser } from '@/lib/helpers';
import nProgress from 'nprogress';
import { toast } from 'sonner';

export default function LoggedInAs() {
	const isAdmin = getLoggedInAsUser();
	const router = useRouter();

	const endSession = async () => {
		if (typeof window !== 'undefined') {
			const toastId = toast.loading('Logging you out of this account...');

			fetch('/api/auth/clear-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			})
				.then(async (res) => {
					if (!res.ok) {
						const data = await res.json().catch(() => ({}));
						throw new Error(data.message || 'Failed to log out');
					}
					toast.success('Log out was successful!', { id: toastId });

					clearLoggedInAsUser();
					nProgress.start();
					router.replace('/admin');
				})
				.catch((err) => {
					toast.error(err.message || 'Failed to log out', { id: toastId });
				});
		}
	};

	return (
		isAdmin &&
		isAdmin?.user &&
		isAdmin?.user.user_metadata && (
			<div className={cn('bg-blue-100 border border-blue-400 flex items-center z-100 justify-center w-full sticky top-0 left-0 right-0')} role="alert" style={{ zIndex: 100 }}>
				<div className={cn('text-blue-700 px-4 py-2 rounded flex items-center justify-between gap-2')}>
					<div className="flex items-center">
						<AlertCircle className="h-5 w-5 mr-2" />
						<span className="block sm:inline ml-2">
							You are currently logged in as <b>{`${isAdmin?.user?.user_metadata.name}`}</b>
						</span>
					</div>
					<Button onClick={endSession} variant="destructive" size="sm">
						Log Out
					</Button>
				</div>
			</div>
		)
	);
}
