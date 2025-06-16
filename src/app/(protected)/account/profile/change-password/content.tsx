'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';

import { handleFetchErrorMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

const formSchema = z
	.object({
		currentPassword: z.string().min(1, { message: 'Current password is required.' }),
		newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

type ChangePasswordFormValues = z.infer<typeof formSchema>;

export default function ChangePasswordPageContent() {
	const [loading, setLoading] = useState(false);
	const form = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	async function onSubmit(values: ChangePasswordFormValues) {
		setLoading(true);
		try {
			const response = await fetchWithAuth('/api/proxy/users/me/update-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					currentPassword: values.currentPassword,
					newPassword: values.newPassword,
					confirmPassword: values.confirmPassword,
				}),
			});
			const data = await response.json();
			if (response.ok) {
				toast.success(data.message || 'Password updated successfully.');
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

	return (
		<div className="max-w-2xl space-y-8">
			<div className="space-y-2 mt-10">
				<h2 className="sub-page-heading">Change Your Password</h2>
				<p className="text-sm text-muted-foreground text-center sm:text-left">Please enter your old password and the new password you want to set.</p>
			</div>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<div className="space-y-2">
					<Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
						Current Password
					</Label>
					<Input id="currentPassword" type="password" required className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" {...form.register('currentPassword')} disabled={loading} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
						New Password
					</Label>
					<Input id="newPassword" type="password" required className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" {...form.register('newPassword')} disabled={loading} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
						Confirm Password
					</Label>
					<Input id="confirmPassword" type="password" required className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" {...form.register('confirmPassword')} disabled={loading} />
				</div>

				<div className="pt-4">
					<Button type="submit" className="w-full bg-[var(--dashboard-accent)] hover:bg-[var(--dashboard-accent)]/90 text-[var(--dashboard-accent-foreground)] rounded-lg py-3" size="lg" disabled={loading}>
						{loading ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</form>
		</div>
	);
}
