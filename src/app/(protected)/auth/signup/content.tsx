'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { User, Mail, Lock, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CustomLink } from '@/components/ui/CustomLink';
import nprogress from 'nprogress';
import { getPlatformName, handleFetchErrorMessage } from '@/lib/helpers';
import Logo from '@/components/ui/logo';
import { SignupPageContentProps } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Country } from '@/types/modules/countries';
import AppFooter from '@/components/layout/AppFooter';

export default function SignupPageContent({ referralData, countries }: SignupPageContentProps & { countries: { status: string; countries: Country[] } }) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [country, setCountry] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [referralActive, setReferralActive] = useState(!!(referralData && referralData.status === 'success' && referralData.data?.name));
	const [referralId, setReferralId] = useState<string | null>(referralActive ? referralData?.data?.referral_id || null : null);
	const [referralName, setReferralName] = useState(referralActive && referralData?.data?.name ? referralData.data.name : '');
	const router = useRouter();
	const { signup } = useAuthContext();

	useEffect(() => {
		if (referralData && referralData.status === 'success' && referralData.data?.name) {
			setReferralActive(true);
			setReferralId(referralData.data.referral_id || null);
			setReferralName(referralData.data.name);
		} else {
			setReferralActive(false);
			setReferralId(null);
			setReferralName('');
		}
	}, [referralData]);

	const handleRemoveReferral = () => {
		setReferralActive(false);
		setReferralId(null);
		setReferralName('');
	};

	const handleRestoreReferral = () => {
		if (referralData && referralData.status === 'success' && referralData.data?.name) {
			setReferralActive(true);
			setReferralId(referralData.data.referral_id || null);
			setReferralName(referralData.data.name);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			setIsLoading(false);
			return;
		}
		if (!name || !email || !password || !country) {
			setError('All fields are required.');
			setIsLoading(false);
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError('Please enter a valid email address.');
			setIsLoading(false);
			return;
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters long.');
			setIsLoading(false);
			return;
		}

		const toastId = toast.loading('Creating your account...');
		try {
			await signup(name, email, password, confirmPassword, country, referralActive && referralId ? referralId : undefined);

			nprogress.start();
			toast.success('Signup successful! Please check your email for confirmation.', { id: toastId });
			router.push(`/auth/verify-email?email=${email}`);
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err);
			setError(errorMessage);
			toast.error(errorMessage, { id: toastId });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="flex flex-col items-center justify-center py-20">
				<CustomLink href={'/'}>
					<Logo alt={`${getPlatformName()} Logo`} size="lg" variant="dark" />
				</CustomLink>
				<Card className="auth-card w-full max-w-md">
					<CardHeader className="space-y-1 text-left">
						<CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
					</CardHeader>
					<CardContent>
						{referralData && referralData.status === 'success' && (
							<div className="space-y-2 mb-4">
								<Label htmlFor="referral-name">Referred by</Label>
								<div className="relative flex items-center">
									<User className="absolute left-3 h-5 w-5 text-gray-700" />
									<Input id="referral-name" type="text" value={referralName} disabled readOnly className="auth-input pl-10 cursor-not-allowed text-gray-500" />
									{/* {referralActive ? (
										<button type="button" className="absolute right-3 text-red-500 hover:text-red-700 cursor-pointer" onClick={handleRemoveReferral} disabled={isLoading} aria-label="Remove referral">
											<Trash2 className="h-5 w-5" />
										</button>
									) : (
										<button type="button" className="absolute right-3 text-green-600 hover:text-green-800 cursor-pointer" onClick={handleRestoreReferral} disabled={isLoading} aria-label="Restore referral">
											<RefreshCw className="h-5 w-5" />
										</button>
									)} */}
								</div>
							</div>
						)}
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="name">Full name</Label>
								<div className="relative flex items-center">
									<User className="absolute left-3 h-5 w-5 text-gray-400" />
									<Input id="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} className="auth-input pl-10" />
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<div className="relative flex items-center">
									<Mail className="absolute left-3 h-5 w-5 text-gray-400" />
									<Input id="email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="auth-input pl-10" />
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="country">Country</Label>
								<Select value={country} onValueChange={setCountry} disabled={isLoading}>
									<SelectTrigger className="w-full auth-input">
										<SelectValue placeholder="Select your country" />
									</SelectTrigger>
									<SelectContent>
										{countries?.countries?.map((c) => (
											<SelectItem key={c.code} value={c.id}>
												{c.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative flex items-center">
									<Lock className="absolute left-3 h-5 w-5 text-gray-400" />
									<Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="auth-input pl-10" />
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirm-password">Confirm password</Label>
								<div className="relative flex items-center">
									<Lock className="absolute left-3 h-5 w-5 text-gray-400" />
									<Input id="confirm-password" type="password" placeholder="Enter your password again" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} className="auth-input pl-10" />
								</div>
							</div>
							{error && <p className="text-sm text-red-500 text-center">{error}</p>}
							<Button size="lg" variant="success" type="submit" className="w-full cursor-pointer disabled:opacity-50" disabled={isLoading}>
								{isLoading ? 'Joining Community...' : 'Join Community'}
							</Button>
						</form>
						<div className="mt-6 text-center text-sm w-full space-y-2">
							<div>
								Already have an account?&nbsp;
								<CustomLink href="/auth/login" className="link-success font-medium">
									Login
								</CustomLink>
							</div>
							<div className="text-xs text-gray-400">
								By signing in, you agree to our &nbsp;
								<CustomLink href="/terms" className="link-success underline">
									Terms & Conditions
								</CustomLink>
								&nbsp; and &nbsp;
								<CustomLink href="/privacy" className="link-success underline">
									Privacy Policy
								</CustomLink>
								&nbsp;
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<AppFooter />
		</div>
	);
}
