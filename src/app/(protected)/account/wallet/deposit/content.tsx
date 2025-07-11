'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import nProgress from 'nprogress';
import { convertToBaseCurrency, getBaseCurrencyRate, getCurrencySymbol } from '@/lib/helpers';

export default function DepositPageContent() {
	const router = useRouter();
	const [amount, setAmount] = useState('');
	const [depositMethod, setDepositMethod] = useState('p2p');
	const [isRedirecting, setIsRedirecting] = useState(false);

	const handleProceed = () => {
		nProgress.start();
		setIsRedirecting(true);
		if (depositMethod === 'p2p') {
			router.push(`/account/wallet/deposit/p2p?amount=${+amount / getBaseCurrencyRate()}`);
		} else if (depositMethod === 'onchain') {
			router.push(`/account/wallet/deposit/on-chain?amount=${+amount / getBaseCurrencyRate()}`);
		}
	};

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0">
					<CardTitle className="sub-page-heading">Deposit Details</CardTitle>
					<p className="sub-page-heading-sub-text">Easily fund your account using our P2P agents or directly on chain.</p>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 px-0">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="amount" className="text-sm font-medium">
								Enter Amount ({getCurrencySymbol()})
							</Label>

							<span className="font-bold">~ {convertToBaseCurrency(+amount)}</span>
						</div>
						<Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 10000" className="bg-background border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)]" />
					</div>

					<div className="space-y-3">
						<Label className="text-sm font-medium">Select Deposit Method</Label>
						<RadioGroup defaultValue="p2p" value={depositMethod} onValueChange={setDepositMethod} className="space-y-2">
							<Label htmlFor="p2p" className="flex items-center space-x-2 p-3 bg-background rounded-md border border-border has-[[data-state=checked]]:border-[var(--dashboard-accent)] has-[[data-state=checked]]:bg-muted/50 transition-all cursor-pointer">
								<RadioGroupItem value="p2p" id="p2p" className="border-border data-[state=checked]:border-[var(--dashboard-accent)] data-[state=checked]:bg-[var(--dashboard-accent)] data-[state=checked]:text-accent-foreground" />
								<span className="font-medium flex-1">P2P (Buy from Agent)</span>
							</Label>
							<Label htmlFor="onchain" className="flex items-center space-x-2 p-3 bg-background rounded-md border border-border has-[[data-state=checked]]:border-[var(--dashboard-accent)] has-[[data-state=checked]]:bg-muted/50 transition-all cursor-pointer">
								<RadioGroupItem value="onchain" id="onchain" className="border-border data-[state=checked]:border-[var(--dashboard-accent)] data-[state=checked]:bg-[var(--dashboard-accent)] data-[state=checked]:text-accent-foreground" disabled />
								<span className="font-medium flex-1">On Chain (Crypto Address)</span>
							</Label>
						</RadioGroup>
					</div>

					<Button onClick={handleProceed} size="lg" variant="success" className={`w-full flex items-center justify-center group ${isRedirecting ? 'opacity-60 cursor-not-allowed' : ''}`} disabled={!amount || parseFloat(amount) <= 0 || isRedirecting}>
						{isRedirecting ? (
							<span className="flex items-center">
								<svg className="animate-spin mr-2 h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
								</svg>
								Processing...
							</span>
						) : (
							<>
								Proceed
								<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
							</>
						)}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
