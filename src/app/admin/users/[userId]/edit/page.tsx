'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';
import NProgress from 'nprogress'; // Import NProgress
import { Loader2 } from 'lucide-react'; // Import Loader2 icon
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { User, Role, ALL_ROLES } from '@/lib/userUtils'; // Import User type, Role, and ALL_ROLES
import { toast } from 'sonner'; // Import toast
import { COUNTRIES, Country } from '@/lib/countries'; // Import COUNTRIES and Country type

export default function EditUserPage() {
	const params = useParams();
	const router = useRouter();
	const { getUserById, updateUserProfile } = useUserContext(); // Assume updateUserProfile exists
	const userId = params?.userId as string;

	const [user, setUser] = useState<User | null>(null);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [country, setCountry] = useState('');
	const [role, setRole] = useState<Role>('user'); // Corrected initial state to match Role type
	// Add other editable fields as needed (e.g., profilePictureUrl)
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (userId) {
			const fetchedUser = getUserById(userId);
			if (fetchedUser) {
				setUser(fetchedUser);
				setName(fetchedUser.name);
				setEmail(fetchedUser.email);
				setCountry(fetchedUser.country);
				setRole(fetchedUser.role); // Set initial role
				// Set other fields if needed
			} else {
				notFound(); // User not found
			}
			setIsLoading(false);
		} else {
			notFound(); // No userId provided
		}
	}, [userId, getUserById]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user) return;
		setIsSaving(true);

		try {
			// Construct the updated user data object
			const updatedData: Partial<User> = {
				name,
				email,
				country,
				role, // Include role in updated data
				// Add other updated fields here (e.g., profilePictureUrl)
			};

			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Call the context function to update the user
			// This function needs to be implemented in UserContext.tsx
			await updateUserProfile(user.id, updatedData);

			toast.success('Profile updated successfully!'); // Add success toast

			NProgress.start(); // Start progress bar
			router.push(`/admin/users/${user.id}`); // Navigate back to user detail page
		} catch (error) {
			console.error('Failed to update profile:', error);
			toast.error('Failed to update profile. Please try again.'); // Add error toast
			setIsSaving(false);
		}
		// No need to setIsSaving(false) here if navigating away on success
	};

	if (isLoading) {
		// Display a centered spinner while loading
		return (
			<div className="flex justify-center items-center h-32">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!user) {
		// This case should be handled by notFound() in useEffect, but added for safety
		return <div>User not found.</div>;
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader>
					<CardTitle>Edit Profile: {user.name}</CardTitle>
					<CardDescription>Update the user's profile information.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4 flex flex-col gap-5">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSaving} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSaving} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="country">Country</Label>
							<Select value={country} onValueChange={(value) => setCountry(value)} disabled={isSaving} required>
								<SelectTrigger id="country">
									<SelectValue placeholder="Select country" />
								</SelectTrigger>
								<SelectContent>
									{COUNTRIES.map((countryOption: Country) => (
										<SelectItem key={countryOption.code} value={countryOption.name}>
											{countryOption.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{/* Role Select Dropdown */}
						<div className="grid gap-2">
							<Label htmlFor="role">Role</Label>
							<Select value={role} onValueChange={(value) => setRole(value as Role)} disabled={isSaving}>
								<SelectTrigger id="role">
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									{ALL_ROLES.map((roleOption) => (
										<SelectItem key={roleOption} value={roleOption} className="capitalize">
											{roleOption}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end gap-2 mt-6">
						{' '}
						{/* Added mt-6 for spacing */}
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()} // Go back to previous page
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSaving}>
							{isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
							{isSaving ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
