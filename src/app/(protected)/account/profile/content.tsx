'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomLink } from '@/components/ui/CustomLink';
import { ChevronRight } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';

export default function ProfilePageContent() {
	const { currentUser } = useAuthContext();

	const profileActions = [
		{ label: 'Payment Options', href: '/account/profile/payment-options' },
		{ label: 'Change Password', href: '/account/profile/change-password' },
		{ label: 'Preferences', href: '/account/profile/preferences' },
	];

	return (
		<div className="space-y-12">
			<div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
				<Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-[var(--dashboard-accent)]">
					<AvatarImage src={currentUser?.avatar_url ?? undefined} alt={currentUser?.name ?? 'User Avatar'} />
					<AvatarFallback>{currentUser?.name?.charAt(0) ?? 'U'}</AvatarFallback>
				</Avatar>
				<div className="flex-grow space-y-1">
					<h2 className="text-2xl font-semibold text-foreground">{currentUser?.name ?? 'User Name'}</h2>
					<p className="text-muted-foreground">{currentUser?.email ?? 'user@example.com'}</p>
					<CustomLink href="/account/profile/edit" className="text-sm text-[var(--dashboard-accent)] hover:underline">
						Edit personal information
					</CustomLink>
				</div>
			</div>

			<div className="space-y-4">
				{profileActions.map((action) => (
					<CustomLink key={action.label} href={action.href} className="block group">
						<Card className="bg-muted/30 dark:bg-muted/10 hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors rounded-lg shadow-sm py-1 md:py-3">
							<div className="p-4 flex justify-between items-center">
								<span className="font-medium text-foreground">{action.label}</span>
								<ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
							</div>
						</Card>
					</CustomLink>
				))}
			</div>
		</div>
	);
}
