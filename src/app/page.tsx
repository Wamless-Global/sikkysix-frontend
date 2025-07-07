'use client'; // This is a client component

import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/ui/CustomLink';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';

export default function LandingPage() {
	return (
		<div className="bg-background text-foreground min-h-screen font-sans flex flex-col">
			<AppHeader />
			<main className="flex-1">
				<section className="container mx-auto px-6 py-24 text-center relative overflow-hidden">
					<div className="absolute top-10 left-10 w-16 h-16 border-2 border-[var(--lp-border)] rounded-full opacity-30 animate-pulse"></div>
					<div className="absolute bottom-20 right-10 w-10 h-10 border border-[var(--lp-green-primary)] opacity-30 transform rotate-45"></div>

					<h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-foreground capitalize">
						Join other smart <br className="hidden md:block" /> contributors.
					</h1>
					<p className="sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">The social contribution clubs built around real life struggles where members help each other to reach personal goals with ease and transparency.</p>
					<div className="flex justify-center space-x-4">
						<CustomLink href="/auth/login" passHref>
							<Button variant={'success'} size={'lg'} className="rounded-full px-8 py-6 text-md shadow-lg">
								Get Started
							</Button>
						</CustomLink>
					</div>
					<div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[var(--lp-green-primary)]/12 to-transparent" />
				</section>
			</main>
			<AppFooter />
		</div>
	);
}
