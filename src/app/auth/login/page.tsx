'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext'; // Import AuthContext hook
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false); // Loading state for the form button
	const router = useRouter();
	const { login } = useAuthContext(); // Get login function from context

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true); // Start loading

		try {
			// Call the login function from the context
			const loggedInUser = await login(email, password);

			// On successful login, context has updated currentUser.
			// Backend should have set HttpOnly cookie.
			toast.success(`Login successful! Welcome, ${loggedInUser.name}`);
			router.push('/admin'); // Redirect to dashboard
		} catch (err) {
			console.error('Login page error:', err);
			// Show error toast using the error message thrown by the context login function
			toast.error(err instanceof Error ? err.message : 'An unexpected error occurred during login.');
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>Enter your email below to login to your account.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="grid gap-4">
						{/* Remove Alert component, using toast notifications instead */}
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
						</div>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? 'Signing in...' : 'Sign in'} {/* Show loading text */}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
