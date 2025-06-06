'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import nProgress from 'nprogress';
import { fetchCurrentUserBalance } from '@/lib/userUtils';
import { handleFetchErrorMessage } from '@/lib/helpers';

export default function WithdrawPageContent() {
	const router = useRouter();
	const [withdrawalMethod, setWithdrawalMethod] = useState('p2p');
	const [amount, setAmount] = useState('');
	const [amountError, setAmountError] = useState<string | null>(null);
	const [currentBalance, setCurrentBalance] = useState<number>(0);

	useEffect(() => {
		const fetchBalance = async () => {
			try {
				const balance = await fetchCurrentUserBalance();
				if (typeof balance === 'number') setCurrentBalance(balance);
			} catch (error) {
				handleFetchErrorMessage(error, 'An unknown error occurred while fetching balance.');
			}
		};
		fetchBalance();
	}, []);

	const validateAmount = useCallback(() => {
		const numAmount = parseFloat(amount);
		if (currentBalance <= 0) {
			setAmountError('Your wallet balance is empty.');
			return false;
		}
		if (isNaN(numAmount) || numAmount <= 0) {
			setAmountError('Please enter a valid amount.');
			return false;
		}
		if (numAmount > currentBalance) {
			setAmountError('You cannot withdraw more than your available balance.');
			return false;
		}
		setAmountError(null);
		return true;
	}, [amount, currentBalance]);

	useEffect(() => {
		if (amount) {
			validateAmount();
		}
	}, [amount, validateAmount]);

	const handleProceed = () => {
		nProgress.start();
		if (withdrawalMethod === 'onchain') {
			router.push(`/account/wallet/withdraw/on-chain?amount=${amount}`);
		} else if (withdrawalMethod === 'p2p') {
			router.push(`/account/wallet/withdraw/p2p?amount=${amount}`);
		}
	};

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Withdraw Funds</CardTitle>
					<p className="sub-page-heading-sub-text">Easily withdraw your funds by selling to our P2P agents.</p>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 px-0">
					<div className="space-y-2">
						<Label htmlFor="amount" className="text-sm font-medium">
							Enter Amount ({process.env.NEXT_PUBLIC_BASE_CURRENCY})
						</Label>
						<Input
							id="amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="e.g., 0.1"
							className={`bg-background border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] ${amountError ? 'border-red-500 focus:border-red-500' : ''}`}
						/>
						{amountError && (
							<Alert variant="destructive" className="mt-2">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Validation Error</AlertTitle>
								<AlertDescription>{amountError}</AlertDescription>
							</Alert>
						)}
					</div>

					<div className="space-y-3">
						<Label className="text-sm font-medium">Select Withdrawal Method</Label>
						<RadioGroup defaultValue="p2p" value={withdrawalMethod} onValueChange={setWithdrawalMethod} className="space-y-2">
							<Label htmlFor="p2p_withdraw" className="flex items-center space-x-2 p-3 bg-background rounded-md border border-border has-[[data-state=checked]]:border-[var(--dashboard-accent)] has-[[data-state=checked]]:bg-muted/50 transition-all cursor-pointer">
								<RadioGroupItem value="p2p" id="p2p_withdraw" className="border-border data-[state=checked]:border-[var(--dashboard-accent)] data-[state=checked]:bg-[var(--dashboard-accent)] data-[state=checked]:text-accent-foreground" />
								<span className="font-medium flex-1">P2P (Sell to Merchant)</span>
							</Label>
							<Label htmlFor="onchain_withdraw" className="flex items-center space-x-2 p-3 bg-background rounded-md border border-border has-[[data-state=checked]]:border-[var(--dashboard-accent)] has-[[data-state=checked]]:bg-muted/50 transition-all cursor-pointer">
								<RadioGroupItem value="onchain" id="onchain_withdraw" className="border-border data-[state=checked]:border-[var(--dashboard-accent)] data-[state=checked]:bg-[var(--dashboard-accent)] data-[state=checked]:text-accent-foreground" disabled />
								<span className="font-medium flex-1">On-Chain (Crypto Address)</span>
							</Label>
						</RadioGroup>
					</div>

					<Button onClick={handleProceed} size="lg" variant="success" className="w-full flex items-center justify-center group" disabled={!amount || parseFloat(amount) <= 0 || !!amountError}>
						Proceed
						<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
