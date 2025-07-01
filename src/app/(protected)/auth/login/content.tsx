'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomLink } from '@/components/ui/CustomLink';
import nProgress from 'nprogress';
import { handleFetchErrorMessage } from '@/lib/helpers';
import Logo from '@/components/ui/logo';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuthContext();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);

		const toastId = toast.loading('Logging you in...');
		try {
			const loggedInUser = await login(email, password);

			toast.success(`Login successful! Welcome, ${loggedInUser.name}`, { id: toastId });

			nProgress.start();
			setTimeout(() => {
				const redirectTo = searchParams.get('redirect_to');
				let destination = '/account';

				if (redirectTo && redirectTo.startsWith('/')) {
					destination = redirectTo;
					toast.success(`Redirecting you shortly...`);
				} else {
					if (loggedInUser.roles && loggedInUser.roles.includes('admin')) {
						destination = '/admin';
					} else if (loggedInUser.roles && loggedInUser.roles.includes('user')) {
						destination = '/account';
					}
					toast.success(`Redirecting to your dashboard...`);
				}
				router.replace(destination);
			}, 1000);
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err);

			if (errorMessage.includes('Please verify your email address before logging in')) {
				nProgress.start();
				router.push('/auth/verify-email?email=' + email);
			}

			toast.error(errorMessage, { id: toastId });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			<CustomLink href={'/'}>
				<Logo alt="Sikkysix Logo" size="xl" />
			</CustomLink>
			<Card className="auth-card w-full max-w-md">
				<CardHeader className="space-y-1 text-left">
					<CardTitle className="text-2xl font-semibold">Login in to your account</CardTitle>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="relative flex items-center">
								<Mail className="absolute left-3 h-5 w-5 text-gray-400" />
								<Input id="email" type="email" placeholder="Enter your email address" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="auth-input pl-10" />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative flex items-center">
								<Lock className="absolute left-3 h-5 w-5 text-gray-400" />
								<Input id="password" type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="auth-input pl-10" />
							</div>
						</div>
						<Button size="lg" variant="success" type="submit" className="w-full cursor-pointer disabled:opacity-50" disabled={isLoading}>
							{isLoading ? 'Logging in...' : 'Login'}
						</Button>
						<div className="mt-6 text-center text-sm w-full space-y-2">
							<div>
								Don&apos;`t have an account?&nbsp;
								<CustomLink href="/auth/signup" className="link-success font-medium">
									Sign up
								</CustomLink>
							</div>
							<div>
								<CustomLink
									href="/auth/forgot-password" // TODO: Create this page later
									className="link-success font-medium"
								>
									Forgot password?
								</CustomLink>
							</div>
						</div>
					</CardContent>
				</form>
			</Card>
		</div>
	);
}
