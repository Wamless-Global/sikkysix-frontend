'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function BankDetailsPage() {
	// Mock data - replace with actual user data and form state
	const bankDetails = {
		accountName: 'Denzel Washington',
		bank: 'UBA',
		accountNumber: '23481929201',
	};

	return (
		<div className="max-w-2xl space-y-8">
			<div className="space-y-2 mt-10">
				<h2 className="sub-page-heading">Update Bank Details</h2>
				<p className="text-sm text-muted-foreground text-center sm:text-left">Please note that the name used here must match your account name.</p>
			</div>
			<form className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="accountName" className="text-sm font-medium text-foreground">
						Account Name
					</Label>
					<Input id="accountName" type="text" defaultValue={bankDetails.accountName} className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" readOnly />
				</div>

				<div className="space-y-2">
					<Label htmlFor="bank" className="text-sm font-medium text-foreground">
						Bank
					</Label>
					<Input id="bank" type="text" defaultValue={bankDetails.bank} className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="space-y-2">
					<Label htmlFor="accountNumber" className="text-sm font-medium text-foreground">
						Account Number
					</Label>
					<Input id="accountNumber" type="text" defaultValue={bankDetails.accountNumber} className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
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
