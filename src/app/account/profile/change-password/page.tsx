'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChangePasswordPage() {
	// Add form handling logic (useState, onSubmit) later
	// Include state for oldPassword, newPassword, confirmPassword

	return (
		<div className="max-w-2xl space-y-8">
			<div className="space-y-2 mt-10">
				<h2 className="sub-page-heading">Change Your Password</h2>
				<p className="text-sm text-muted-foreground text-center sm:text-left">Please enter your old password and the new password you want to set.</p>
			</div>
			<form className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="oldPassword" className="text-sm font-medium text-foreground">
						Old Password
					</Label>
					<Input id="oldPassword" type="password" required className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="space-y-2">
					<Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
						New Password
					</Label>
					<Input id="newPassword" type="password" required className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="space-y-2">
					<Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
						Confirm Password
					</Label>
					<Input id="confirmPassword" type="password" required className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="pt-4">
					<Button type="submit" className="w-full bg-[var(--dashboard-accent)] hover:bg-[var(--dashboard-accent)]/90 text-[var(--dashboard-accent-foreground)] rounded-lg py-3" size="lg">
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}
