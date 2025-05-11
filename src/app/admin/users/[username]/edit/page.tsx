'use client';

'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';
import NProgress from 'nprogress';
import { Loader2, Trash2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { User, Role, ALL_ROLES, fetchUserByUsername, updateUser, deleteUser } from '@/lib/userUtils';
import { toast } from 'sonner';
import { COUNTRIES, Country } from '@/lib/countries';

export default function EditUserPage() {
	const params = useParams();
	const router = useRouter();
	const { getUserByUsername } = useUserContext();
	const username = params?.username as string;

	const [user, setUser] = useState<User | null>(null);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [country, setCountry] = useState('');
	const [roles, setRoles] = useState<Role[]>(['user']); // Changed to Role[] and initialized
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const populateForm = (userData: User) => {
		setUser(userData);
		setName(userData.name);
		setEmail(userData.email);
		setCountry(userData.country);
		setRoles(userData.roles && userData.roles.length > 0 ? userData.roles : ['user']); // Ensure roles is an array
	};

	useEffect(() => {
		if (!username) {
			setIsLoading(false);
			notFound();
			return;
		}

		setIsLoading(true);

		const userFromContext = getUserByUsername(username);

		if (userFromContext) {
			populateForm(userFromContext);
			setIsLoading(false);
		} else {
			const loadUser = async () => {
				const fetchedUser = await fetchUserByUsername(username);
				if (fetchedUser) {
					populateForm(fetchedUser);
				} else {
					setUser(null);
					toast.error(`User '${username}' not found or failed to load.`);
					notFound();
				}
				setIsLoading(false);
			};

			loadUser();
		}
	}, [username, getUserByUsername]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user) return;
		setIsSaving(true);

		try {
			const updatedData: Partial<User> = {
				name,
				email,
				country,
				roles: roles, // roles is now Role[]
			};

			const updatedUser = await updateUser(user.id, updatedData);

			if (updatedUser) {
				NProgress.start();
				router.push(`/admin/users/${updatedUser.username}`);
			}
			setIsSaving(false);
		} catch (error) {
			console.error('Error during profile update process:', error);
			toast.error('An unexpected error occurred. Please try again.');
			setIsSaving(false);
		}
	};

	const handleRoleChange = (role: Role) => {
		setRoles((prevRoles) => {
			if (prevRoles.includes(role)) {
				// If role exists, remove it. Ensure at least one role remains.
				if (prevRoles.length === 1) return prevRoles; // Don't allow removing the last role
				return prevRoles.filter((r) => r !== role);
			} else {
				// If role doesn't exist, add it.
				return [...prevRoles, role];
			}
		});
	};

	const handleDelete = async () => {
		if (!user) return;
		setIsDeleting(true);

		try {
			const success = await deleteUser(user.id);

			if (success) {
				NProgress.start();
				router.push('/admin/users');
			} else {
				setIsDeleting(false);
			}
		} catch (error) {
			console.error('Error during user deletion process:', error);
			toast.error('An unexpected error occurred while deleting the user.');
			setIsDeleting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-32">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!user) {
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
						<div className="grid gap-2">
							<Label htmlFor="roles">Roles</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-full justify-between" disabled={isSaving}>
										<span>{roles.length > 0 ? `Selected (${roles.length})` : 'Select roles'}</span>
										<ChevronDown className="h-4 w-4 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-full">
									{ALL_ROLES.map((roleOption) => (
										<DropdownMenuCheckboxItem
											key={roleOption}
											checked={roles.includes(roleOption)}
											onCheckedChange={() => handleRoleChange(roleOption)}
											disabled={isSaving || (roles.includes(roleOption) && roles.length === 1)} // Prevent unchecking the last role
											className="capitalize"
										>
											{roleOption}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
							<div className="mt-2 flex flex-wrap gap-2">
								{roles.map((role) => (
									<Badge key={role} variant="secondary" className="capitalize">
										{role}
									</Badge>
								))}
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between items-center gap-2 mt-6">
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
						<div className="flex gap-2">
							<Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving || isDeleting}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving || isDeleting}>
								{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isSaving ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
