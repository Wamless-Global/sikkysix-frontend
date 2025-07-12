'use client';

import { getLoggedInAsUser, getTGData } from '@/lib/helpers';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function VerifyPage() {
	const router = useRouter();
	const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
	const hashParams = Object.fromEntries(new URLSearchParams(hash).entries());

	useEffect(() => {
		let timer: NodeJS.Timeout;
		async function trySetSession() {
			if (typeof window === 'undefined') return;
			const tg = (window as any).Telegram?.WebApp;
			const initData = tg?.initData || sessionStorage.getItem('tg-init-data') || getTGData();

			if (tg) {
				tg.ready();
				const { access_token, refresh_token, expires_at, expires_in } = getLoggedInAsUser();

				if (access_token || hashParams.access_token) {
					fetch('/api/auth/login', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							tg_credentials: {
								access_token: access_token || hashParams.access_token,
								refresh_token: refresh_token || hashParams.refresh_token,
								expires_at: expires_at || hashParams.expires_at,
								expires_in: expires_in || hashParams.expires_in,
								isTG: true,
								initData,
							},
						}),
					})
						.then(async (res) => {
							if (!res.ok) {
								const data = await res.json().catch(() => ({}));
								throw new Error(data.message || 'Failed to set session.');
							}

							if (typeof window !== 'undefined') {
								localStorage.setItem(`logged-in-via-tg`, JSON.stringify(true));
							}
							router.replace('/account');
						})
						.catch((err) => {
							toast.error(err.message || 'Failed to set session.');
						});
					router.refresh();
				} else {
					toast.error('No access token found. Please try again.');
					timer = setTimeout(trySetSession, 10000);
				}
			}
		}
		timer = setTimeout(trySetSession, 2000);
		return () => clearTimeout(timer);
	}, []);
	return (
		<div className="bg-background text-foreground min-h-screen font-sans flex flex-col">
			<main className="flex-1">
				<section className="container mx-auto py-14 text-center relative overflow-hidden">
					<div className="absolute top-10 left-10 w-16 h-16 border-2 border-[var(--lp-border)] rounded-full opacity-30 animate-pulse"></div>
					<div className="absolute bottom-20 right-10 w-10 h-10 border border-[var(--lp-green-primary)] opacity-30 transform rotate-45"></div>

					<h1 className="text-2xl md:text-5xl font-bold mb-2 leading-tight text-foreground capitalize px-4">the community savings club.</h1>

					<div className="w-full max-w-2xl mx-auto overflow-hidden mb-4 relative h-72 sm:h-96">
						<Image
							src="/images/group.png"
							alt="Community Group"
							fill
							className="w-full object-cover object-center"
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).src = '/images/Variety-fruits-vegetables.png';
							}}
						/>
					</div>

					<div className="px-6">
						<p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">The social contribution clubs built around real life struggles where members help each other to reach personal goals with ease and transparency.</p>

						<span className="loader"></span>
					</div>
				</section>
			</main>
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[var(--lp-green-primary)]/12 to-transparent min-h-svh" />
		</div>
	);
}
