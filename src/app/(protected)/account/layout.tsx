import React from 'react';
import { cookies } from 'next/headers';
import { OnlineProvider } from '@/context/OnlineContext';
import UserLayout from '@/components/layout/UserLayout';
import LoggedInAs from '@/components/ui/logged-in-as-user';
import GoalSetter from '@/components/dashboard/GoalSetter';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export const dynamic = 'force-dynamic';

export default async function UserRootLayout({ children }: { children: React.ReactNode }) {
	const baseUrl = process.env.API_BASE_URL;
	const cookieStore = await cookies();

	let initialGoal = undefined;
	let initialRequireNewGoal = undefined;

	try {
		const res = await fetchWithAuth(`${baseUrl}/goals`, {
			headers: { Cookie: cookieStore.toString() },
			cache: 'no-store',
		});
		if (res.ok) {
			const data = await res.json();
			if (data.status === 'success' && data.data) {
				initialGoal = data.data.goal ?? null;
				initialRequireNewGoal = data.data.require_new_goal_after_completion ?? true;
			}
		}
	} catch (e) {
		// Let GoalSetter client-fetch on failure
	}

	return (
		<OnlineProvider>
			<LoggedInAs />
			<UserLayout>{children}</UserLayout>
			<GoalSetter initialGoal={initialGoal} initialRequireNewGoal={initialRequireNewGoal} />
		</OnlineProvider>
	);
}
