'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext'; // Import AuthContext hook
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react'; // Import icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomLink } from '@/components/ui/CustomLink';
import nProgress from 'nprogress';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false); // Loading state for the form button
	const router = useRouter();
	const searchParams = useSearchParams(); // Hook to access search params
	const { login } = useAuthContext(); // Get login function from context

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true); // Start loading

		try {
			const loggedInUser = await login(email, password);

			toast.success(`Login successful! Welcome, ${loggedInUser.name}`);

			nProgress.start();
			setTimeout(() => {
				const redirectTo = searchParams.get('redirect_to');
				let destination = '/account'; // Default destination

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
				router.push(destination);
			}, 1000); // 1000 milliseconds = 1 second
		} catch (err) {
			let errorMessage = 'An unexpected error occurred during login.'; // Default message
			// Check for JSON parsing errors, often caused by server returning HTML/text instead of JSON
			if (err instanceof SyntaxError && (err.message.includes('JSON') || err.message.includes('token'))) {
				errorMessage = 'Server unavailable. Please try again later.';
			} else if (err instanceof Error) {
				errorMessage = err.message;
				if (errorMessage.includes('Please verify your email address before logging in')) {
					nProgress.start();
					router.push('/auth/verify-email?email=' + email); // Redirect to verify email page
				}
			}
			toast.error(errorMessage);
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			{/* Applied auth-page */}
			<h1 className="mb-8 text-4xl font-bold">LOGO</h1>
			<Card className="auth-card w-full max-w-md">
				{/* Applied auth-card */}
				<CardHeader className="space-y-1 text-left">
					<CardTitle className="text-2xl font-semibold">Login in to your account</CardTitle>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							{/* Added icon and updated input style */}
							<div className="relative flex items-center">
								<Mail className="absolute left-3 h-5 w-5 text-gray-400" />
								<Input id="email" type="email" placeholder="Enter your email address" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="auth-input pl-10" /> {/* Applied auth-input */}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							{/* Added icon and updated input style */}
							<div className="relative flex items-center">
								<Lock className="absolute left-3 h-5 w-5 text-gray-400" />
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading}
									className="auth-input pl-10" // Applied auth-input
								/>
							</div>
						</div>
						<Button size="lg" variant="success" type="submit" className="w-full cursor-pointer disabled:opacity-50" disabled={isLoading}>
							{/* Use success variant */}
							{isLoading ? 'Logging in...' : 'Login'}
						</Button>
						{/* Rearranged links */}
						<div className="mt-6 text-center text-sm w-full space-y-2">
							<div>
								Don't have an account?
								<CustomLink href="/auth/signup" className="link-success font-medium">
									{/* Applied link-success */}
									Sign up
								</CustomLink>
							</div>
							<div>
								<CustomLink
									href="/auth/forgot-password" // TODO: Create this page later
									className="link-success font-medium" // Applied link-success
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
