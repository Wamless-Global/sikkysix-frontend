'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CustomLink } from '@/components/ui/CustomLink';
import nprogress from 'nprogress';

export default function SignupPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { signup } = useAuthContext();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			setIsLoading(false);
			return;
		}
		if (!name || !email || !password) {
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
			await signup(name, email, password, confirmPassword);

			nprogress.start();
			toast.success('Signup successful! Please check your email for confirmation.', { id: toastId });
			router.push(`/auth/verify-email?email=${email}`);
		} catch (err) {
			console.error('Signup page error:', err);
			const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
			setError(errorMessage);
			toast.error(errorMessage, { id: toastId });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			<h1 className="mb-8 text-4xl font-bold">LOGO</h1>
			<Card className="auth-card w-full max-w-md">
				<CardHeader className="space-y-1 text-left">
					<CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
				</CardHeader>
				<CardContent>
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
							{isLoading ? 'Signing up...' : 'Sign up'}
						</Button>
					</form>
					<div className="mt-6 text-center text-sm w-full space-y-2">
						<div>
							Already have an account?
							<CustomLink href="/auth/login" className="link-success font-medium">
								Login
							</CustomLink>
						</div>
						<div className="text-xs text-gray-400">
							By signing in, you agree to our
							<CustomLink href="/terms" className="link-success underline">
								Terms & Conditions
							</CustomLink>
							and
							<CustomLink href="/privacy" className="link-success underline">
								Privacy Policy
							</CustomLink>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
