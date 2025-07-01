'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/AuthContext';
import appSettings from '@/config/app';
import { CustomLink } from '@/components/ui/CustomLink';
import nProgress from 'nprogress';
import { getPlatformName, handleFetchErrorMessage } from '@/lib/helpers';
import Logo from '@/components/ui/logo';
import { Skeleton } from '@/components/ui/skeleton';

function parseFragmentParams() {
	if (typeof window === 'undefined') return {};
	const hash = window.location.hash.substring(1); // Remove '#'
	return Object.fromEntries(new URLSearchParams(hash));
}

function ProjectSkeletonLoader() {
	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4 space-y-4">
			<Logo alt={`${getPlatformName()} Logo`} size="lg" variant="dark" />
			<div className="w-full max-w-md text-center space-y-2 mt-5">
				<Skeleton className="mb-2 h-8 w-full md:w-96 mx-auto" />
				<Skeleton className="mb-2 h-8 w-full md:w-98 mx-auto" />
				<Skeleton className="mb-8 h-4 w-64 mx-auto" />
			</div>
		</div>
	);
}

export default function VerifyEmailStatusPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { resendVerificationEmail } = useAuthContext();

	const [pageStatus, setPageStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading');
	const [statusMessage, setStatusMessage] = useState('');
	const [emailForResend, setEmailForResend] = useState('');
	const [isResending, setIsResending] = useState(false);
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		const params = Object.fromEntries(searchParams.entries());
		let error = params.error;
		let errorDesc = params.error_description;
		let errorCode = params.error_code;

		if (!error && typeof window !== 'undefined' && window.location.hash) {
			const fragParams = parseFragmentParams();
			error = fragParams.error;
			errorDesc = fragParams.error_description;
			errorCode = fragParams.error_code;
			if (error || errorDesc || errorCode) {
				const query = new URLSearchParams(fragParams).toString();
				router.replace(`${window.location.pathname}?${query}`);
			}
		}

		if (error) {
			const desc = errorDesc || 'An unknown error occurred during verification.';
			if (desc.toLowerCase().includes('expired') || error === 'access_denied' || errorCode === 'otp_expired' || desc.toLowerCase().includes('invalid')) {
				setPageStatus('expired');
				setStatusMessage(desc);
				toast.error(desc);
			} else {
				setPageStatus('error');
				setStatusMessage(desc);
				toast.error(desc);
			}
		} else {
			setPageStatus('success');
			setStatusMessage('Your email address has been successfully verified. You can now log in.');
			toast.success('Email verified successfully!');
			setTimeout(() => router.replace('/auth/login'), 3000);
		}
		// Prevent content flash
		setTimeout(() => setShowContent(true), 400);
		// eslint-disable-next-line
	}, [searchParams, router]);

	const title = pageStatus === 'success' ? 'Email Verified Successfully!' : pageStatus === 'expired' ? 'Verification Link Expired' : pageStatus === 'error' ? 'Email Verification Failed' : 'Email Verification Status';

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

	if (!showContent) {
		return <ProjectSkeletonLoader />;
	}

	if (pageStatus === 'loading') {
		return <ProjectSkeletonLoader />;
	}

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			<CustomLink href={'/'}>
				<Logo alt={`${getPlatformName()} Logo`} size="lg" variant="dark" />
			</CustomLink>
			<div className="w-full max-w-md text-center mt-5">
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
					<>
						<CustomLink href={'/auth/login'} className="w-full cursor-pointer mb-5">
							Back to Login
						</CustomLink>
						<br />
						<br />
					</>
				)}

				<CustomLink href={`mailto:${appSettings.supportemail}`} className="text-sm text-gray-400 hover:underline">
					Need help? Contact support.
				</CustomLink>
			</div>
		</div>
	);
}
