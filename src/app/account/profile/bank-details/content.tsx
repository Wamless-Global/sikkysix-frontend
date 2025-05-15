'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/context/AuthContext'; // Import the hook

export default function BankDetailsPageContent() {
	// Removed async
	const { currentUser } = useAuthContext(); // Use the hook

	// TODO: Add form state management for bank and accountNumber
	// TODO: Implement form submission logic

	// Optional: Add loading state
	// if (isLoading) return <div>Loading...</div>;

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
					<Input id="accountName" type="text" defaultValue={currentUser?.name ?? ''} className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" readOnly />
				</div>

				<div className="space-y-2">
					<Label htmlFor="bank" className="text-sm font-medium text-foreground">
						Bank
					</Label>
					{/* Bank not in AuthContext, remove defaultValue */}
					<Input id="bank" type="text" placeholder="Enter bank name" className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="space-y-2">
					<Label htmlFor="accountNumber" className="text-sm font-medium text-foreground">
						Account Number
					</Label>
					{/* Account number not in AuthContext, remove defaultValue */}
					<Input id="accountNumber" type="text" placeholder="Enter account number" className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
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
