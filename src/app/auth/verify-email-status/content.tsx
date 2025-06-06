'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/AuthContext';
import appSettings from '@/config/app';
import { CustomLink } from '@/components/ui/CustomLink';
import nProgress from 'nprogress';
import { handleFetchErrorMessage } from '@/lib/helpers';

export default function VerifyEmailStatusPageContent({ initialStatus }: { initialStatus: { status: string; message: string } }) {
	const router = useRouter();
	const { resendVerificationEmail } = useAuthContext();

	const pageStatus = initialStatus.status === 'success' ? 'success' : initialStatus.status === 'expired' ? 'expired' : initialStatus.status === 'error' ? 'error' : 'loading';
	const [statusMessage, setStatusMessage] = useState(initialStatus.message || '');
	const title = initialStatus.status === 'success' ? 'Email Verified Successfully!' : initialStatus.status === 'expired' ? 'Verification Link Expired' : initialStatus.status === 'error' ? 'Email Verification Failed' : 'Email Verification Status';

	const [emailForResend, setEmailForResend] = useState('');
	const [isResending, setIsResending] = useState(false);

	useEffect(() => {
		if (initialStatus.status === 'success') {
			toast.success(initialStatus.message || 'Email verified successfully!');
			setTimeout(() => router.push('/auth/login'), 3000);
		} else if (initialStatus.status === 'expired') {
			toast.error(initialStatus.message || 'Verification link expired.');
		} else if (initialStatus.status === 'error') {
			toast.error(initialStatus.message || 'Email verification failed.');
		}
	}, [initialStatus, router]);

	const handleResendSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!emailForResend) {
			toast.error('Please enter your email address.');
			return;
		}
		setIsResending(true);
		setStatusMessage(`Attempting to resend verification email to ${emailForResend}...`);

		try {
			const result = await resendVerificationEmail(emailForResend);
			if (result.success) {
				toast.success(result.message || `Verification email resent to ${emailForResend}.`);
				setStatusMessage(result.message || `Verification email resent to ${emailForResend}. Please check your inbox.`);
			} else {
				toast.error(result.message || 'Failed to resend verification email.');
				setStatusMessage(result.message || 'Failed to resend verification email. Please try again or contact support.');
			}
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err);
			toast.error(errorMessage);
			setStatusMessage(errorMessage);
		} finally {
			setIsResending(false);
		}
	};

	if (pageStatus === 'loading') {
		return (
			<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="mb-12 text-4xl font-bold">LOGO</h1>
				<div className="w-full max-w-md text-center">
					<h2 className="mb-2 text-2xl font-semibold">Verifying...</h2>
					<p className="mb-8 text-gray-300">{statusMessage}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			<h1 className="mb-12 text-4xl font-bold">LOGO</h1>
			<div className="w-full max-w-md text-center">
				<h2 className={`mb-2 text-2xl font-semibold ${(pageStatus === 'error' || pageStatus === 'expired') && 'text-[var(--danger)]'}`}>{title}</h2>
				<p className="mb-8 text-gray-300">{statusMessage}</p>

				{(pageStatus === 'error' || pageStatus === 'expired') && (
					<form onSubmit={handleResendSubmit} className="space-y-4 mb-6">
						<div>
							<Label htmlFor="emailForResend" className="sr-only">
								Your Email Address
							</Label>
							<Input id="emailForResend" type="email" placeholder="Enter your email to resend link" value={emailForResend} onChange={(e) => setEmailForResend(e.target.value)} required disabled={isResending} />
						</div>
						<Button type="submit" size="lg" variant="success" className="w-full" disabled={isResending}>
							{isResending ? 'Resending...' : 'Resend Verification Link'}
						</Button>
					</form>
				)}

				{pageStatus === 'success' && (
					<Button
						size="lg"
						variant="success"
						onClick={() => {
							nProgress.start();
							router.push('/auth/login');
						}}
						className="w-full cursor-pointer mb-5"
					>
						Proceed to Login
					</Button>
				)}

				{pageStatus !== 'success' && (
					<Button
						size="lg"
						variant="outline"
						onClick={() => {
							nProgress.start();
							router.push('/auth/login');
						}}
						className="w-full cursor-pointer mb-5"
					>
						Back to Login
					</Button>
				)}

				<CustomLink href={`mailto:${appSettings.supportemail}`} className="text-sm text-gray-400 hover:underline">
					Need help? Contact support.
				</CustomLink>
			</div>
		</div>
	);
}
