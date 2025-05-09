'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'; // Component not found
import nProgress from 'nprogress';
import { toast } from 'sonner';

// Minimal mock data needed for this page, primarily for context display
interface Asset {
	id: string;
	symbol: string;
}
const mockAssets: Asset[] = [
	// Simplified for this page
	{ id: 'btc', symbol: 'BTC' },
	{ id: 'eth', symbol: 'ETH' },
	{ id: 'usdt', symbol: 'USDT' },
];

function VerifyWithdrawalContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const assetId = searchParams.get('assetId');
	const amountStr = searchParams.get('amount');
	const networkId = searchParams.get('networkId'); // Though not directly displayed, pass it on
	const address = searchParams.get('address');

	const [otp, setOtp] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [otpError, setOtpError] = useState<string | null>(null);

	const selectedAsset = mockAssets.find((asset) => asset.id === assetId);

	useEffect(() => {
		if (!assetId || !amountStr || !networkId || !address || !selectedAsset) {
			toast.error('Verification details missing or invalid. Redirecting...');
			router.replace('/account/wallet/withdraw');
		}
	}, [assetId, amountStr, networkId, address, selectedAsset, router]);

	const handleVerifyAndSubmit = async () => {
		if (otp.length !== 6) {
			setOtpError('Please enter a valid 6-digit OTP.');
			return;
		}
		setOtpError(null);
		setIsLoading(true);
		nProgress.start();
		toast.loading('Verifying and submitting withdrawal...');

		// Simulate API call for 2FA verification and withdrawal submission
		await new Promise((resolve) => setTimeout(resolve, 2000));

		setIsLoading(false);
		nProgress.done();

		// Mocked outcome: randomly success, pending, or failure for demonstration
		const outcome = Math.random();
		const mockTxId = `mock_tx_${Date.now()}`;

		if (outcome < 0.7) {
			// 70% chance of success
			toast.success('Withdrawal submitted successfully!');
			router.push(`/account/wallet/withdraw/status/success?txId=${mockTxId}&asset=${assetId}&amount=${amountStr}&address=${address}`);
		} else if (outcome < 0.9) {
			// 20% chance of pending
			toast.info('Withdrawal is pending confirmation.');
			router.push(`/account/wallet/withdraw/status/pending?txId=${mockTxId}&asset=${assetId}&amount=${amountStr}&address=${address}`);
		} else {
			// 10% chance of failure
			toast.error('Withdrawal failed. Please try again.');
			router.push(`/account/wallet/withdraw/status/failure?error=mock_simulation_error&asset=${assetId}&amount=${amountStr}&address=${address}`);
		}
	};

	if (!selectedAsset || !amountStr || !address) {
		// Fallback for missing critical data, should be caught by useEffect
		return (
			<div className="max-w-md mx-auto space-y-8 flex flex-col items-center justify-center py-10">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>Cannot proceed with verification. Critical information is missing.</AlertDescription>
				</Alert>
				<Button onClick={() => router.push('/account/wallet/withdraw')}>Start Over</Button>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto space-y-8">
			<Card className="bg-background border-0 shadow-none -mt-5">
				<CardHeader className="px-0 text-center">
					<div className="flex justify-center mb-3">
						<ShieldAlert className="h-12 w-12 text-[var(--dashboard-accent)]" />
					</div>
					<CardTitle className="sub-page-heading">Two-Factor Authentication</CardTitle>
					<CardDescription className="sub-page-heading-sub-text pt-1">
						Enter the 6-digit code from your authenticator app to confirm your withdrawal of {amountStr} {selectedAsset?.symbol || ''}.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 pt-6 px-0">
					<div className="space-y-2 flex flex-col items-center">
						<Label htmlFor="otp-input" className="text-sm font-medium">
							Enter 6-Digit OTP Code
						</Label>
						<Input
							id="otp-input"
							type="text" // Using text to allow for easier input and potential pasting
							value={otp}
							onChange={(e) => {
								const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
								if (val.length <= 6) {
									setOtp(val);
								}
							}}
							maxLength={6}
							placeholder="------"
							className="w-48 text-center text-2xl tracking-[0.3em] bg-background border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] placeholder:tracking-normal"
							autoComplete="one-time-code"
						/>
						{otpError && <p className="text-sm text-red-500 mt-1">{otpError}</p>}
					</div>

					<Alert variant="default" className="mt-4">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Security Tip</AlertTitle>
						<AlertDescription>Ensure you are on the official Sikky Six website before entering your code. Never share your OTP with anyone.</AlertDescription>
					</Alert>

					<Button onClick={handleVerifyAndSubmit} size="lg" variant="success" className="w-full flex items-center justify-center group mt-6" disabled={isLoading || otp.length !== 6}>
						{isLoading ? 'Processing...' : 'Submit Withdrawal'}
						{!isLoading && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

export default function VerifyWithdrawalPage() {
	return (
		<Suspense fallback={<div className="flex justify-center items-center h-screen">Loading verification...</div>}>
			<VerifyWithdrawalContent />
		</Suspense>
	);
}
