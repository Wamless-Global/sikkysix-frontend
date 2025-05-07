'use client'; // Needed for form handling state later

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BankDetailsPage() {
	// Mock data - replace with actual user data and form state
	const bankDetails = {
		accountName: 'Denzel Washington',
		bank: 'UBA',
		accountNumber: '23481929201', // Example - adjust type if needed
	};

	// Add form handling logic (useState, onSubmit) later

	return (
		<div className="max-w-2xl space-y-8">
			<div className="space-y-2 mt-10">
				<h2 className="sub-page-heading">Update Bank Details</h2>
				{/* Informational Note */}
				<p className="text-sm text-muted-foreground text-center sm:text-left">Please note that the name used here must match your account name.</p>
			</div>
			{/* Form Section */}
			<form className="space-y-6">
				{/* Account Name */}
				<div className="space-y-2">
					<Label htmlFor="accountName" className="text-sm font-medium text-foreground">
						Account Name
					</Label>
					<Input
						id="accountName"
						type="text"
						defaultValue={bankDetails.accountName}
						className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" // Apply new input style
						// Add onChange handler
						readOnly // Assuming this might be read-only based on the note
					/>
				</div>

				{/* Bank */}
				<div className="space-y-2">
					<Label htmlFor="bank" className="text-sm font-medium text-foreground">
						Bank
					</Label>
					{/* Consider using a Select component here if banks are predefined */}
					<Input
						id="bank"
						type="text"
						defaultValue={bankDetails.bank}
						className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" // Apply new input style
						// Add onChange handler
					/>
				</div>

				{/* Account Number */}
				<div className="space-y-2">
					<Label htmlFor="accountNumber" className="text-sm font-medium text-foreground">
						Account Number
					</Label>
					<Input
						id="accountNumber"
						type="text" // Use text for potential leading zeros, or number if appropriate
						defaultValue={bankDetails.accountNumber}
						className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" // Apply new input style
						// Add onChange handler
					/>
				</div>

				{/* Save Button */}
				<div className="pt-4">
					<Button type="submit" className="w-full bg-[var(--dashboard-accent)] hover:bg-[var(--dashboard-accent)]/90 text-[var(--dashboard-accent-foreground)] rounded-lg py-3" size="lg">
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}
