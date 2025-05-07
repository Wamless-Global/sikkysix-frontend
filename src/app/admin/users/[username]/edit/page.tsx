'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';
import NProgress from 'nprogress'; // Import NProgress
import { Loader2, Trash2 } from 'lucide-react'; // Import Loader2 and Trash2 icons
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import Breadcrumbs from '@/components/layout/Breadcrumbs';
// Import fetchUserByUsername, updateUser, and deleteUser along with other utils
import { User, Role, ALL_ROLES, fetchUserByUsername, updateUser, deleteUser } from '@/lib/userUtils';
import { toast } from 'sonner'; // Import toast - used by multiple functions
import { COUNTRIES, Country } from '@/lib/countries'; // Import COUNTRIES and Country type

export default function EditUserPage() {
	const params = useParams();
	const router = useRouter();
	// Remove updateUserProfile from context, we'll use the direct API call
	const { getUserByUsername } = useUserContext();
	const username = params?.username as string;

	const [user, setUser] = useState<User | null>(null);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [country, setCountry] = useState('');
	const [roles, setRoles] = useState<Role>('user'); // Corrected initial state to match Role type
	// Add other editable fields as needed (e.g., profilePictureUrl)
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false); // State for delete operation

	// Function to populate form fields from user data
	const populateForm = (userData: User) => {
		setUser(userData);
		setName(userData.name);
		setEmail(userData.email);
		setCountry(userData.country);
		setRoles(userData.roles);
		// Set other fields if needed
	};

	useEffect(() => {
		if (!username) {
			setIsLoading(false);
			notFound();
			return;
		}

		setIsLoading(true);

		// 1. Try getting user from context
		const userFromContext = getUserByUsername(username);

		if (userFromContext) {
			populateForm(userFromContext);
			setIsLoading(false);
		} else {
			// 2. If not in context, use the centralized fetch function
			const loadUser = async () => {
				const fetchedUser = await fetchUserByUsername(username);
				if (fetchedUser) {
					populateForm(fetchedUser);
				} else {
					// Handle case where user is not found by the backend or fetch failed
					setUser(null); // Ensure user state is null
					toast.error(`User '${username}' not found or failed to load.`);
					notFound(); // Trigger 404 if user cannot be loaded for editing
				}
				setIsLoading(false);
			};

			loadUser();
		}
	}, [username, getUserByUsername]); // Rerun effect if username or context function changes

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
				roles, // Include role in updated data
				// Add other updated fields here (e.g., profilePictureUrl)
			};

			// Call the updateUser function from userUtils
			const updatedUser = await updateUser(user.id, updatedData);

			if (updatedUser) {
				// Success is handled by updateUser's toast
				NProgress.start(); // Start progress bar
				router.push(`/admin/users/${updatedUser.username}`); // Navigate back to user detail page
				// No need to setIsSaving(false) here as we are navigating away
			} else {
				// Error toast is handled by updateUser
				setIsSaving(false); // Keep the form active if update failed
			}
		} catch (error) {
			// Catch unexpected errors during the fetch/update process itself
			console.error('Error during profile update process:', error);
			toast.error('An unexpected error occurred. Please try again.');
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!user) return;
		setIsDeleting(true);

		try {
			const success = await deleteUser(user.id);

			if (success) {
				// Success toast is handled by deleteUser
				NProgress.start();
				router.push('/admin/users'); // Redirect to users list after deletion
				// No need to setIsDeleting(false) as we are navigating away
			} else {
				// Error toast is handled by deleteUser
				setIsDeleting(false);
			}
		} catch (error) {
			console.error('Error during user deletion process:', error);
			toast.error('An unexpected error occurred while deleting the user.');
			setIsDeleting(false);
		}
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
							<Select value={roles} onValueChange={(value) => setRoles(value as Role)} disabled={isSaving}>
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
					<CardFooter className="flex justify-between items-center gap-2 mt-6">
						{/* Use justify-between */}
						{/* Delete Button and Confirmation Dialog */}
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" type="button" disabled={isSaving || isDeleting}>
									<Trash2 className="mr-2 h-4 w-4" /> Delete User
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete the user account for <strong>{user.name}</strong> ({user.username}) and remove their data from the servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
										{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										{isDeleting ? 'Deleting...' : 'Yes, delete user'}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						{/* Cancel and Save Buttons */}
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()} // Go back to previous page
								disabled={isSaving || isDeleting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving || isDeleting}>
								{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {/* Added mr-2 */}
								{isSaving ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
