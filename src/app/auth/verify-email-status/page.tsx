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

export default function VerifyEmailStatusPage() {
	const router = useRouter();
	const { resendVerificationEmail } = useAuthContext();

	const [pageStatus, setPageStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
	const [statusMessage, setStatusMessage] = useState('Checking verification outcome...');
	const [title, setTitle] = useState('Email Verification Status');

	const [emailForResend, setEmailForResend] = useState('');
	const [isResending, setIsResending] = useState(false);

	useEffect(() => {
		const hash = window.location.hash;
		if (hash) {
			const params = new URLSearchParams(hash.substring(1));
			const error = params.get('error');
			const errorDesc = params.get('error_description');

			if (error) {
				const detailedMessage = errorDesc || 'An unknown error occurred during verification.';
				setStatusMessage(detailedMessage);
				toast.error(detailedMessage);
				if (errorDesc?.toLowerCase().includes('expired') || error === 'access_denied') {
					setPageStatus('expired');
					setTitle('Verification Link Expired');
				} else {
					setPageStatus('error');
					setTitle('Email Verification Failed');
				}
			} else {
				setPageStatus('success');
				setTitle('Email Verified Successfully!');
				setStatusMessage('Your email address has been successfully verified.');
				toast.success('Email verified successfully!');
				setTimeout(() => router.push('/auth/login'), 3000);
			}
		} else {
			setPageStatus('success');
			setTitle('Email Verified Successfully!');
			setStatusMessage('Your email address has been successfully verified. You can now log in.');
			toast.success('Email verified successfully! Redirecting to login...');
			setTimeout(() => router.push('/auth/login'), 3000);
		}
	}, [router]);

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
		} catch (error: unknown) {
			console.error('Error calling resendVerificationEmail from context:', error);
			const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred.';
			toast.error(errMsg);
			setStatusMessage(errMsg);
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
				<h2 className="mb-2 text-2xl font-semibold">{title}</h2>
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
