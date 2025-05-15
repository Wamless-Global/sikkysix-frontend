'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext'; // Import the hook

export default function EditProfilePageContent() {
	const { currentUser } = useAuthContext(); // Use the hook

	// TODO: Add form state management (e.g., useState) to handle input changes and submission
	// TODO: Implement avatar upload logic

	// Optional: Add loading state
	// if (isLoading) return <div>Loading...</div>;

	return (
		<div className="max-w-2xl mx-auto space-y-8">
			<div className="relative w-24 h-24 mx-auto group  cursor-pointer">
				<Avatar className="w-full h-full border-2 border-[var(--dashboard-accent)]">
					<AvatarImage src={currentUser?.profilePictureUrl ?? undefined} alt={currentUser?.name ?? 'User Avatar'} />
					<AvatarFallback>{currentUser?.name?.charAt(0) ?? 'U'}</AvatarFallback>
				</Avatar>
				<button className="absolute bottom-0 right-0 bg-background rounded-full p-1 border-2 border-border group-hover:bg-muted transition-colors">
					<Camera className="w-6 h-6 text-muted-foreground" />
					<span className="sr-only">Change photo</span>
				</button>
				<input type="file" id="avatarUpload" className="sr-only" accept="image/*" />
			</div>

			<form className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="name" className="text-sm font-medium text-foreground">
						Name
					</Label>
					{/* Use defaultValue from context, but ideally manage with useState */}
					<Input id="name" type="text" defaultValue={currentUser?.name ?? ''} className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="space-y-2">
					<Label htmlFor="email" className="text-sm font-medium text-foreground">
						Email
					</Label>
					{/* Use defaultValue from context, but ideally manage with useState */}
					<Input id="email" type="email" defaultValue={currentUser?.email ?? ''} className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="space-y-2">
					<Label htmlFor="dob" className="text-sm font-medium text-foreground">
						Date Of Birth
					</Label>
					{/* DOB not in AuthContext, remove defaultValue */}
					<Input id="dob" type="date" placeholder="DD-MM-YYYY" className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="space-y-2">
					<Label htmlFor="phone" className="text-sm font-medium text-foreground">
						Phone Number
					</Label>
					{/* Phone not in AuthContext, remove defaultValue */}
					<Input id="phone" type="tel" placeholder="+1234567890" className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>

				<div className="pt-4">
					<Button type="submit" className="w-full bg-[var(--dashboard-accent)] hover:bg-[var(--dashboard-accent)]/90 text-[var(--dashboard-accent-foreground)] rounded-lg py-3" size="lg">
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}
