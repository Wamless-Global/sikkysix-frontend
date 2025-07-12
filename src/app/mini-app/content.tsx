'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Input } from '@/components/ui/input';
import { Country } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { handleFetchMessage } from '@/lib/helpers';

export default function MiniAppPage({ countries }: { countries: { status: string; countries: Country[] } }) {
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showEmailInput, setShowEmailInput] = useState(false);
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [country, setCountry] = useState('');
	const [formError, setFormError] = useState<string | null>(null);

	const router = useRouter();

	useEffect(() => {
		let retryTimer: NodeJS.Timeout;
		let retryCount = 0;
		const maxRetries = 10;
		function checkAndHandleTG() {
			if (typeof window === 'undefined') return;
			const tg = (window as any).Telegram?.WebApp;

			if (tg && tg.initData && tg.initData.length > 0) {
				tg.ready();
				try {
					sessionStorage.setItem('tg-init-data', tg.initData);
					localStorage.setItem('tg-init-data', tg.initData);
					toast.info(`Saved initData: ${sessionStorage.getItem('tg-init-data')}`);
				} catch (error: unknown) {
					setError('Failed to save tg-init-data');
					toast.error('Failed to save tg-init-data');
				}

				fetchWithAuth('/api/auth/telegram-verification', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ initData: tg.initData }),
				})
					.then(async (res) => {
						if (res.ok) {
							const data = await res.json();
							const msg = handleFetchMessage(data);

							if (!data.exists) {
								setShowEmailInput(true);
							} else if (data.exists && !data.loggedIn) {
								toast.error('There was an error logging you in.');
								setError('There was an error logging you in.');
							} else if (data.exists && data.loggedIn && data.link) {
								try {
									sessionStorage.setItem('tg-init-data', tg.initData);
									localStorage.setItem('tg-init-data', tg.initData);
								} catch (_e) {
									sessionStorage.setItem('tg-init-data', tg.initData);
									localStorage.setItem('tg-init-data', tg.initData);
								}
								router.push(data.link);
							} else {
								toast.success(msg);
							}
						} else {
							setError('Failed to save tg-init-data before navigating');
							toast.error('Failed to launch the app. Please try again.');
						}
					})
					.catch((err) => {
						setIsLoading(false);
						const error = handleFetchMessage(err, 'Network error when launching');
						setError(error);
						toast.error(error);
					});
			} else {
				retryCount++;
				if (retryCount < maxRetries) {
					retryTimer = setTimeout(checkAndHandleTG, 1000);
				}
			}
		}
		checkAndHandleTG();
		return () => {
			if (retryTimer) clearTimeout(retryTimer);
		};
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const tg = (window as any).Telegram?.WebApp;

		if (tg) {
			tg.ready();

			setTimeout(() => {
				const startParam = tg.initDataUnsafe?.start_param;
				let message = '';
				if (startParam) {
					switch (startParam) {
						case 'status-invalid_token':
							message = 'Invalid token. Please try again.';
							toast.error(message);
							break;
						case 'status-invalid_or_expired_token':
							message = 'Invalid or expired token. Please try again.';
							toast.error(message);
							break;
						case 'status-success':
							message = 'Your action was successful!';
							toast.success(message);
							break;
						case 'status-update_failed':
							message = 'Update failed. Please try again.';
							toast.error(message);
							break;
						default:
							message = 'Unknown status.';
							toast.error(message);
					}
				}
			}, 500);
		}
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormError(null);

		if (!country) {
			setFormError('Please select your country.');
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailRegex.test(email)) {
			setFormError('Please enter a valid email address.');
			return;
		}

		setIsSubmitting(true);

		try {
			const tg = (window as any).Telegram?.WebApp;
			const res = await fetchWithAuth('/api/auth/telegram-signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, country, initData: tg.initData }),
			});
			const data = await res.json();

			if (res.ok) {
				toast.success('Email sent successfully! Please check your inbox.');

				const tg = (window as any).Telegram?.WebApp;
				if (tg && typeof tg.close === 'function') {
					setTimeout(() => {
						tg.close();
					}, 5000);
				}
			} else {
				toast.error(handleFetchMessage(data, 'Failed to register email. Please try again.'));
			}
		} catch (err) {
			toast.error(handleFetchMessage(err, 'Network error. Please try again.'));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="bg-background text-foreground min-h-screen font-sans flex flex-col">
			<main className="flex-1">
				<section className="container mx-auto py-14 text-center relative overflow-hidden">
					<div className="absolute top-10 left-10 w-16 h-16 border-2 border-[var(--lp-border)] rounded-full opacity-30 animate-pulse"></div>
					<div className="absolute bottom-20 right-10 w-10 h-10 border border-[var(--lp-green-primary)] opacity-30 transform rotate-45"></div>

					<h1 className="text-2xl md:text-5xl font-bold mb-2 leading-tight text-foreground capitalize px-4">the community savings club.</h1>

					<div className="w-full max-w-2xl mx-auto overflow-hidden mb-4 relative h-72 sm:h-96">
						<Image src="/images/dark-full-logo.png" alt="Community Group" fill className="w-full h-64 object-cover object-center hidden" />
						<Image src="/images/Variety-fruits-vegetables.png" alt="Community Group" fill className="w-full h-64 object-cover object-center hidden" />
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

						{isLoading && !showEmailInput && <span className="loader"></span>}

						{error && <p className="text-destructive">{error}</p>}

						{showEmailInput && (
							<form className="max-w-sm mx-auto flex flex-col gap-4 items-center" onSubmit={handleSubmit}>
								<Select value={country} onValueChange={setCountry} disabled={isSubmitting}>
									<SelectTrigger className="w-full auth-input">
										<SelectValue placeholder="Select your country" />
									</SelectTrigger>
									<SelectContent>
										{countries?.countries?.map((c) => (
											<SelectItem key={c.code} value={c.id}>
												{c.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<div className="relative flex items-center w-full">
									<Mail className="absolute left-3 h-5 w-5 text-gray-400" />
									<Input id="email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} className="auth-input border rounded px-4 py-2 w-full text-sm sm:text-base pl-10" />
								</div>
								{formError && <p className="text-red-500 text-sm mt-2 w-full text-left">{formError}</p>}
								<Button type="submit" variant="success" size="lg" className="w-full" disabled={isSubmitting}>
									{isSubmitting ? 'Submitting...' : 'Submit'}
								</Button>
							</form>
						)}
					</div>
				</section>
			</main>
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[var(--lp-green-primary)]/12 to-transparent" />
		</div>
	);
}
