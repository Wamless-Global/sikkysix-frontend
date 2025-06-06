'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Using Textarea for reason
import { Loader2 } from 'lucide-react';
import { formatBaseurrency } from '@/lib/helpers';

interface AdjustBalanceModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (amount: number, reason: string) => Promise<void>; // Make async
	currentBalance: number;
	isSubmitting: boolean;
}

export function AdjustBalanceModal({ isOpen, onClose, onSubmit, currentBalance, isSubmitting }: AdjustBalanceModalProps) {
	const [amount, setAmount] = useState<string>('');
	const [reason, setReason] = useState<string>('');
	const [error, setError] = useState<string | null>(null);

	// Reset state when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setAmount('');
			setReason('');
			setError(null);
		}
	}, [isOpen]);

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// Allow only numbers, negative sign at the start, and one decimal point
		if (/^-?\d*\.?\d*$/.test(value)) {
			setAmount(value);
			setError(null); // Clear error on valid input change
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const numericAmount = parseFloat(amount);

		if (isNaN(numericAmount)) {
			setError('Please enter a valid numeric amount.');
			return;
		}

		if (!reason.trim()) {
			setError('Please provide a reason for the adjustment.');
			return;
		}

		// Prevent submitting 0
		if (numericAmount === 0) {
			setError('Adjustment amount cannot be zero.');
			return;
		}

		await onSubmit(numericAmount, reason.trim());
		// onClose will be called by the parent component on successful submission
	};

	const newBalance = currentBalance + (parseFloat(amount) || 0);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Manually Adjust Wallet Balance</DialogTitle>
					<DialogDescription>Enter the amount to add (positive) or subtract (negative) and provide a reason for the audit log.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="flex flex-col gap-4 py-4">
						<div className="mb-2">
							<Label>Current Balance:</Label>
							<p className="text-lg font-semibold">{formatBaseurrency(currentBalance)}</p>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="amount" className="text-right">
								Amount
							</Label>
							<Input
								id="amount"
								type="text" // Use text to allow negative sign and decimal easily
								value={amount}
								onChange={handleAmountChange}
								placeholder="e.g., 50.00 or -25.50"
								className="col-span-3"
								disabled={isSubmitting}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="reason" className="text-right pt-2 self-start">
								Reason
							</Label>
							<Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for manual adjustment (required)" className="col-span-3 min-h-[80px]" disabled={isSubmitting} />
						</div>
						<div className="mt-2 text-right col-span-4 flex justify-between items-end">
							<Label>New Balance After Adjustment:</Label>
							<p className={`font-semibold ${isNaN(newBalance) ? 'text-muted-foreground' : ''}`}>{isNaN(newBalance) ? 'N/A' : formatBaseurrency(newBalance)}</p>
						</div>
						{error && <p className="text-sm text-red-600 col-span-4 text-center">{error}</p>}
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || !amount || !reason.trim()}>
							{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							{isSubmitting ? 'Adjusting...' : 'Adjust Balance'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
