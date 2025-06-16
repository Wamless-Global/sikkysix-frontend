'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { z } from 'zod';
import { toast } from 'sonner';
import { updateUser } from '@/lib/userUtils';
import type { AuthenticatedUser } from '@/types';
import { handleFetchErrorMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function EditProfilePageContent() {
	const { currentUser, setCurrentUser } = useAuthContext();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [form, setForm] = useState({
		name: currentUser?.name ?? '',
		email: currentUser?.email ?? '',
		phone: '',
		dob: '',
	});
	const fileInputRef = useRef<HTMLInputElement>(null);

	const schema = z.object({
		name: z.string().min(2, 'Name is required'),
		email: z.string().email('Invalid email address'),
		phone: z.string().optional().or(z.literal('')),
		dob: z.string().optional().or(z.literal('')),
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setForm((prev) => ({ ...prev, [id]: value }));
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setAvatarFile(e.target.files[0]);
		}
	};

	const handleAvatarButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			schema.parse(form);
		} catch (err) {
			if (err instanceof z.ZodError) {
				toast.error(err.errors[0]?.message || 'Validation error');
			}
			return;
		}
		setIsSubmitting(true);
		try {
			let avatar_url = currentUser?.avatar_url ?? null;
			if (avatarFile) {
				const formData = new FormData();
				formData.append('image', avatarFile);
				const res = await fetchWithAuth('/api/profile', {
					method: 'PUT',
					body: formData,
				});
				if (!res.ok) {
					const error = await res.json().catch(() => ({}));
					throw new Error(error.message || 'Failed to upload avatar');
				}
				const data = await res.json();
				avatar_url = data.url || avatar_url;
			}

			const updatedUser = await updateUser(currentUser!.id, {
				name: form.name,
				email: form.email,
				avatar_url,
				phone_number: form.phone || undefined,
			});
			if (updatedUser) {
				// Patch avatar_url to always be string|null for AuthenticatedUser
				const patchedUser = {
					...updatedUser,
					avatar_url: updatedUser.avatar_url ?? null,
				} as AuthenticatedUser;
				setCurrentUser?.(patchedUser);
				toast.success('Profile updated successfully!');
			} else {
				toast.error('Failed to update profile.');
			}
		} catch (err) {
			const errorMessage = handleFetchErrorMessage(err, 'An error occurred while updating profile.');
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto space-y-8">
			<div className="relative w-24 h-24 mx-auto group">
				<Avatar className="w-full h-full border-2 border-[var(--dashboard-accent)]">
					<AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : currentUser?.avatar_url ?? undefined} alt={currentUser?.name ?? 'User Avatar'} />
					<AvatarFallback>{currentUser?.name?.charAt(0) ?? 'U'}</AvatarFallback>
				</Avatar>
				<button type="button" onClick={handleAvatarButtonClick} className="absolute bottom-0 right-0 bg-background rounded-full p-1 border-2 border-border group-hover:bg-muted transition-colors cursor-pointer">
					<Camera className="w-6 h-6 text-muted-foreground" />
					<span className="sr-only">Change photo</span>
				</button>
				<input ref={fileInputRef} type="file" id="avatarUpload" className="sr-only" accept="image/*" name="image" onChange={handleAvatarChange} />
			</div>

			<form className="space-y-6" onSubmit={handleSubmit}>
				<div className="space-y-2">
					<Label htmlFor="name" className="text-sm font-medium text-foreground">
						Name
					</Label>
					<Input id="name" type="text" value={form.name} onChange={handleInputChange} className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>
				<div className="space-y-2">
					<Label htmlFor="email" className="text-sm font-medium text-foreground">
						Email
					</Label>
					<Input disabled={true} id="email" type="email" value={form.email} onChange={handleInputChange} className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>
				<div className="space-y-2">
					<Label htmlFor="dob" className="text-sm font-medium text-foreground">
						Date Of Birth
					</Label>
					<Input id="dob" type="date" value={form.dob} onChange={handleInputChange} placeholder="DD-MM-YYYY" className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>
				<div className="space-y-2">
					<Label htmlFor="phone" className="text-sm font-medium text-foreground">
						Phone Number
					</Label>
					<Input id="phone" type="tel" value={form.phone} onChange={handleInputChange} placeholder="+1234567890" className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-14 account-input" />
				</div>
				<div className="pt-4">
					<Button type="submit" className="w-full bg-[var(--dashboard-accent)] hover:bg-[var(--dashboard-accent)]/90 text-[var(--dashboard-accent-foreground)] rounded-lg py-3" size="lg" disabled={isSubmitting}>
						{isSubmitting ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</form>
		</div>
	);
}
