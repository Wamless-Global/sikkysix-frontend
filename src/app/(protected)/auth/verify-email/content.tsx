'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/ui/CustomLink';
import appSettings from '@/config/app';
import { getPlatformName, handleFetchErrorMessage } from '@/lib/helpers';
import nProgress from 'nprogress';
import Logo from '@/components/ui/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppFooter from '@/components/layout/AppFooter';

export default function VerifyEmailContent({ email, initialStatus }: { email?: string; initialStatus: { status: string; message: string } }) {
	const router = useRouter();
	const { resendVerificationEmail } = useAuthContext();
	const [statusMessage, setStatusMessage] = useState(initialStatus.message || '');
	const [isResending, setIsResending] = useState(false);
	const [allowResend, setAllowResend] = useState(initialStatus.status === 'not_verified');

	useEffect(() => {
		if (initialStatus.status === 'verified') {
			nProgress.start();
			toast.success(initialStatus.message || 'Email is verified.');
			setTimeout(() => router.push('/auth/login'), 2000);
		} else if (initialStatus.status === 'not_found' || initialStatus.status === 'error') {
			nProgress.start();
			toast.error(initialStatus.message || 'Email address not found.');
			setTimeout(() => router.push('/auth/login'), 2000);
		}
	}, [initialStatus, router]);

	const handleResendEmail = async () => {
		if (!email) {
			toast.error('Could not determine email for resending verification.');
			return;
		}
		setIsResending(true);
		setStatusMessage(`Resending verification email to ${email}...`);
		try {
			const result = await resendVerificationEmail(email);
			if (result.success) {
				toast.success(result.message || 'Verification email resent successfully!');
				setStatusMessage(result.message || 'Verification email resent. Please check your inbox.');
				setAllowResend(false);
			} else {
				toast.error(result.message || 'Failed to resend verification email.');
				setStatusMessage(result.message || 'Failed to resend. Please try again or contact support.');
			}
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err);
			toast.error(errorMessage);
			setStatusMessage(errorMessage);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="flex flex-col items-center justify-center py-20">
				<CustomLink href={'/'}>
					<Logo alt={`${getPlatformName()} Logo`} size="lg" variant="dark" />
				</CustomLink>

				<Card className="auth-card w-full max-w-md">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-semibold">Check Email Verification</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<p className="mb-8 text-gray-300">{statusMessage}</p>

						{isResending && (
							<div className="flex justify-center items-center mb-5">
								<p>Resending...</p>
							</div>
						)}

						{!isResending && allowResend && (
							<>
								<Button size="lg" variant="success" onClick={() => router.push('/auth/login')} className="w-full cursor-pointer mb-5">
									Go to Login
								</Button>

								{allowResend && (
									<Button size="lg" variant="outline" onClick={handleResendEmail} className="w-full cursor-pointer disabled:opacity-50 mb-5" disabled={isResending}>
										{isResending ? 'Resending...' : 'Resend Verification Email'}
									</Button>
								)}
								<CustomLink href={`mailto:${appSettings.supportemail}`} className="mb-6 text-sm text-gray-400">
									Need help? Contact support.
								</CustomLink>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			<AppFooter />
		</div>
	);
}
