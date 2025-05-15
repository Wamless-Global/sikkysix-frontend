'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/ui/CustomLink';
import appSettings from '@/config/app';

export default function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { checkEmailVerificationStatus, resendVerificationEmail } = useAuthContext();
	const [statusMessage, setStatusMessage] = useState('Checking email verification status, please wait...');
	const [isLoading, setIsLoading] = useState(true);
	const [isResending, setIsResending] = useState(false);
	const [errorOccurred, setErrorOccurred] = useState(false);
	const [allowResend, setAllowResend] = useState(false);

	useEffect(() => {
		const email = searchParams.get('email');

		if (!email) {
			const msg = 'No email provided to check status.';
			setStatusMessage(msg);
			toast.error(msg);
			setIsLoading(false);
			setErrorOccurred(true);
			setTimeout(() => router.push('/auth/login'), 3000);
			return;
		}

		const processCheck = async () => {
			setIsLoading(true);
			setErrorOccurred(false);
			setAllowResend(false);
			setStatusMessage(`Checking verification status for ${email}...`);

			try {
				const result = await checkEmailVerificationStatus(email);
				setStatusMessage(result.message || 'Status check complete.');

				if (result.status === 'verified') {
					toast.success(result.message || 'Email is verified.');
					setTimeout(() => router.push('/auth/login'), 2000);
				} else if (result.status === 'not_verified') {
					toast.info(result.message || 'Email is not verified.');
					setAllowResend(true);
					setErrorOccurred(false);
				} else if (result.status === 'not_found') {
					toast.error(result.message || 'Email address not found.');
					setErrorOccurred(true);
					setTimeout(() => router.push('/auth/login'), 3000);
				} else {
					toast.error(result.message || 'Failed to check email status. Please try again.');
					setErrorOccurred(true);
					setTimeout(() => router.push('/auth/login'), 3000);
				}
			} catch (e: unknown) {
				console.error('Email status check process error:', e);
				if (e instanceof SyntaxError && (e.message.includes('JSON') || e.message.includes('token'))) {
					const errMsg = e.message || 'A critical error occurred while checking email status.';
					setStatusMessage(errMsg);
					toast.error(errMsg);
				}
				setErrorOccurred(true);
				setTimeout(() => router.push('/auth/login'), 3000);
			} finally {
				setIsLoading(false);
			}
		};

		processCheck();
	}, [searchParams, router, checkEmailVerificationStatus]);

	const handleResendEmail = async () => {
		const emailToResend = searchParams.get('email');

		if (!emailToResend) {
			toast.error('Could not determine email for resending verification.');
			return;
		}

		setIsResending(true);
		setStatusMessage(`Resending verification email to ${emailToResend}...`);
		try {
			const result = await resendVerificationEmail(emailToResend);

			if (result.success) {
				toast.success(result.message || 'Verification email resent successfully!');
				setStatusMessage(result.message || 'Verification email resent. Please check your inbox.');
				setAllowResend(false);
			} else {
				toast.error(result.message || 'Failed to resend verification email.');
				setStatusMessage(result.message || 'Failed to resend. Please try again or contact support.');
			}
		} catch (error: unknown) {
			console.error('Error calling resendVerificationEmail from context:', error);
			if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
				const errMsg = error.message || 'An unexpected error occurred while trying to resend.';
				toast.error(errMsg);
				setStatusMessage(errMsg);
			}
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			<h1 className="mb-12 text-4xl font-bold">LOGO</h1>
			<div className="w-full max-w-md text-center">
				<h2 className="mb-2 text-2xl font-semibold">Check Email Verification</h2>
				<p className="mb-8 text-gray-300">{statusMessage}</p>

				{(isLoading || isResending) && (
					<div className="flex justify-center items-center mb-5">
						<p>{isResending ? 'Resending...' : 'Loading...'}</p>
					</div>
				)}

				{!isLoading && !isResending && (errorOccurred || allowResend) && (
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
			</div>
		</div>
	);
}
