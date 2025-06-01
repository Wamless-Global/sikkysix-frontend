'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomLink } from '@/components/ui/CustomLink';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';
import { handleFetchErrorMessage } from '@/lib/helpers';
import appSettings from '@/config/app';
import { VerifyResetTokenResult } from '@/types';

const formSchema = z
	.object({
		newPassword: z.string().min(6, {
			message: 'Password must be at least 6 characters.',
		}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

type UpdatePasswordFormValues = z.infer<typeof formSchema>;

export default function UpdatePasswordPageContent() {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);
	const [pageStatus, setPageStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
	const [statusMessage, setStatusMessage] = useState('Checking password reset link...');
	const [title, setTitle] = useState('Update Password');

	useEffect(() => {
		const hash = window.location.hash;
		const params = new URLSearchParams(hash.substring(1));
		const error = params.get('error');
		const errorCode = params.get('error_code');
		const errorDesc = params.get('error_description');
		const tokenFromUrl = params.get('access_token');

		async function verifyToken(token: string) {
			try {
				const res = await fetch(`/api/auth/verify-reset-token`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const result: VerifyResetTokenResult = await res.json();
				if (result.valid) {
					setToken(token);
					setPageStatus('success');
					setStatusMessage('Please enter your new password.');
					setTitle('Update Password');
				} else {
					const message = result.error?.message || 'Password reset link is invalid or expired.';
					setStatusMessage(message);
					toast.error(message);
					setPageStatus(result.error?.name === 'TokenExpiredError' ? 'expired' : 'error');
					setTitle(result.error?.name === 'TokenExpiredError' ? 'Link Expired' : 'Invalid Link');
				}
			} catch (e) {
				setStatusMessage('Failed to verify reset link.');
				setPageStatus('error');
				setTitle('Error');
			}
		}

		if (error) {
			const detailedMessage = errorDesc || 'An unknown error occurred.';
			setStatusMessage(detailedMessage);
			toast.error(detailedMessage);
			if (errorCode === 'otp_expired' || error === 'access_denied') {
				setPageStatus('expired');
				setTitle('Link Expired');
			} else {
				setPageStatus('error');
				setTitle('Error');
			}
		} else if (tokenFromUrl) {
			verifyToken(tokenFromUrl);
		} else {
			const message = 'Password reset link is invalid or missing.';
			setStatusMessage(message);
			toast.error(message);
			setPageStatus('error');
			setTitle('Invalid Link');
		}
	}, []);

	const form = useForm<UpdatePasswordFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			newPassword: '',
			confirmPassword: '',
		},
	});

	async function onSubmit(values: UpdatePasswordFormValues) {
		if (!token) {
			toast.error('Password reset token is missing.');
			return;
		}

		setLoading(true);

		try {
			const response = await fetch('/api/auth/update-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					newPassword: values.newPassword,
					confirmPassword: values.confirmPassword,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(data.message || 'Your password has been updated successfully. Please login.');
				setTimeout(() => {
					nProgress.start();
					router.push('/auth/login');
				}, 2000);
				form.reset();
			} else {
				toast.error(data.message || 'Failed to update password.');
			}
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}

	if (pageStatus === 'loading') {
		return (
			<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="mb-12 text-4xl font-bold">LOGO</h1>
				<div className="w-full max-w-md text-center">
					<div className="flex items-center gap-4 justify-center mb-8">
						<Loader2 className="h-5 w-5 animate-spin" />
						<h2 className="text-lg">Loading...</h2>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			<h1 className="mb-12 text-4xl font-bold">LOGO</h1>
			<Card className="auth-card w-full max-w-md">
				<CardHeader className="space-y-1 text-left">
					<CardTitle className={`text-2xl font-semibold ${(pageStatus === 'error' || pageStatus === 'expired') && 'text-[var(--danger)]'}`}>{title}</CardTitle>
				</CardHeader>
				<CardContent>
					{pageStatus === 'error' || pageStatus === 'expired' ? (
						<div className="text-center text-[var(--danger)] space-y-4">
							<p>{statusMessage}</p>
							<Button
								size="lg"
								variant="success"
								onClick={() => {
									nProgress.start();
									router.push('/auth/login');
								}}
								className="w-full cursor-pointer"
							>
								Back to Login
							</Button>
						</div>
					) : (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel htmlFor="password">New Password</FormLabel>
											<FormControl>
												<div className="relative flex items-center">
													<Lock className="absolute left-3 h-5 w-5 text-gray-400" />
													<Input id="password" type="password" placeholder="Enter new password" {...field} disabled={loading} className="auth-input pl-10" />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
											<FormControl>
												<div className="relative flex items-center">
													<Lock className="absolute left-3 h-5 w-5 text-gray-400" />
													<Input id="confirmPassword" type="password" placeholder="Confirm new password" {...field} disabled={loading} className="auth-input pl-10" />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button size="lg" variant="success" type="submit" className="w-full cursor-pointer disabled:opacity-50" disabled={loading}>
									{loading ? 'Updating...' : 'Update Password'}
								</Button>
							</form>
						</Form>
					)}
					<div className="mt-6 text-center text-sm w-full space-y-2">
						<div>
							<CustomLink href={`mailto:${appSettings.supportemail}`} className="text-sm text-gray-400 hover:underline">
								Need help? Contact support.
							</CustomLink>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
