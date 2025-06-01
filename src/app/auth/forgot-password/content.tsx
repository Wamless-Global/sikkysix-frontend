'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail } from 'lucide-react'; // Import Mail icon
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomLink } from '@/components/ui/CustomLink'; // Import CustomLink
import { toast } from 'sonner';
import { handleFetchErrorMessage } from '@/lib/helpers';

const formSchema = z.object({
	email: z.string().email({
		message: 'Please enter a valid email address.',
	}),
});

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPageContent() {
	const [loading, setLoading] = useState(false);

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
		},
	});

	async function onSubmit(values: ForgotPasswordFormValues) {
		setLoading(true);

		try {
			const response = await fetch('/api/auth/request-password-reset', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(data.message || 'Password reset link sent to your email.');
			} else {
				toast.error(data.message || 'Failed to send password reset link.');
			}
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			<h1 className="mb-8 text-4xl font-bold">LOGO</h1>
			<Card className="auth-card w-full max-w-md">
				<CardHeader className="space-y-1 text-left">
					<CardTitle className="text-2xl font-semibold">Forgot Password?</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel htmlFor="email">Email</FormLabel>
										<FormControl>
											<div className="relative flex items-center">
												<Mail className="absolute left-3 h-5 w-5 text-gray-400" />
												<Input id="email" type="email" placeholder="Enter your email address" {...field} disabled={loading} className="auth-input pl-10" />
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button size="lg" variant="success" type="submit" className="w-full cursor-pointer disabled:opacity-50" disabled={loading}>
								{loading ? 'Sending...' : 'Send Reset Link'}
							</Button>
						</form>
					</Form>
					<div className="mt-6 text-center text-sm w-full space-y-2">
						<div>
							Remember your password?
							<CustomLink href="/auth/login" className="link-success font-medium">
								Login
							</CustomLink>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
