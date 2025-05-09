'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { User, Mail, Lock } from 'lucide-react'; // Import icons
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CustomLink } from '@/components/ui/CustomLink';
import nprogress from 'nprogress'; // Import nprogress for loading bar

export default function SignupPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false); // Add loading state
	const router = useRouter();
	const { signup } = useAuthContext(); // Get signup function from context

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true); // Start loading

		// Client-side validation
		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			setIsLoading(false); // Stop loading on validation error
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

		try {
			// Call the signup function from the context
			await signup(name, email, password, confirmPassword);

			nprogress.start(); // Start progress bar
			toast.success('Signup successful! Please check your email for confirmation.');
			router.push(`/auth/verify-email?email=${email}`); // Redirect to verify email page
		} catch (err) {
			// console.error('Signup page error:', err); // Assuming logger might not be defined globally
			console.error('Signup page error:', err); // Use console.error instead
			// Show error toast using the error message thrown by the context signup function
			const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
			setError(errorMessage); // Keep inline error for feedback
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="auth-page flex min-h-screen flex-col items-center justify-center p-4">
			{/* Applied auth-page */}
			<h1 className="mb-8 text-4xl font-bold">LOGO</h1>
			<Card className="auth-card w-full max-w-md">
				{/* Applied auth-card */}
				<CardHeader className="space-y-1 text-left">
					<CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">Full name</Label> {/* Changed label */}
							{/* Added icon and updated input style */}
							<div className="relative flex items-center">
								<User className="absolute left-3 h-5 w-5 text-gray-400" />
								<Input
									id="name"
									type="text"
									placeholder="Enter your full name" /* Changed placeholder */
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									disabled={isLoading}
									className="auth-input pl-10" // Applied auth-input
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							{/* Added icon and updated input style */}
							<div className="relative flex items-center">
								<Mail className="absolute left-3 h-5 w-5 text-gray-400" />
								<Input
									id="email"
									type="email"
									placeholder="Enter your email address" /* Changed placeholder */
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isLoading}
									className="auth-input pl-10" // Applied auth-input
								/>
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
									placeholder="Enter your password" /* Changed placeholder */
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
									className="auth-input pl-10" // Applied auth-input
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm password</Label> {/* Changed label */}
							{/* Added icon and updated input style */}
							<div className="relative flex items-center">
								<Lock className="absolute left-3 h-5 w-5 text-gray-400" />
								<Input
									id="confirm-password"
									type="password"
									placeholder="Enter your password again" /* Changed placeholder */
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									disabled={isLoading}
									className="auth-input pl-10" // Applied auth-input
								/>
							</div>
						</div>
						{error && <p className="text-sm text-red-500 text-center">{error}</p>} {/* Centered error */}
						<Button size="lg" variant="success" type="submit" className="w-full cursor-pointer disabled:opacity-50" disabled={isLoading}>
							{/* Use success variant */}
							{isLoading ? 'Signing up...' : 'Sign up'}
						</Button>
					</form>
					{/* Updated links and added Terms/Privacy */}
					<div className="mt-6 text-center text-sm w-full space-y-2">
						<div>
							Already have an account?
							<CustomLink href="/auth/login" className="link-success font-medium">
								{/* Applied link-success */}
								Login
							</CustomLink>
						</div>
						<div className="text-xs text-gray-400">
							By signing in, you agree to our
							<CustomLink href="/terms" className="link-success underline">
								{/* Applied link-success */}
								Terms & Conditions
							</CustomLink>
							and
							<CustomLink href="/privacy" className="link-success underline">
								{/* Applied link-success */}
								Privacy Policy
							</CustomLink>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
