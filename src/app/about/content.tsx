'use client';

import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/ui/CustomLink';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import Image from 'next/image';
import { getPlatformName } from '@/lib/helpers';

export default function AboutPage() {
	return (
		<div className="bg-background text-foreground min-h-screen font-sans flex flex-col">
			<AppHeader />
			<main className="flex-1">
				<section className="relative">
					<div className="container mx-auto px-4 sm:px-10 py-20 md:py-32 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
						<div className="flex-1 text-center md:text-left z-10">
							<h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground">Save Smarter with Dynamic Clubs</h1>
							<p className="sm:text-lg text-muted-foreground mb-8 max-w-xl">Join diverse savings clubs, enjoy early saver rewards, and grow your wealth transparently.</p>
							<CustomLink href="/auth/signup" passHref>
								<Button variant={'success'} size={'lg'} className="rounded-full px-8 py-6 text-md shadow-lg">
									Get Started
								</Button>
							</CustomLink>
							<p className="mt-6 text-muted-foreground sm:text-lg">Already 1,000+ savers joined</p>
						</div>
						<div className="flex-1 flex justify-center md:justify-end z-10 relative h-96">
							<Image src="/images/credit-card-cuate.svg" alt="People collaborating illustration" fill />
						</div>
					</div>
					<div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[var(--lp-green-primary)]/10 to-transparent" />
				</section>

				{/* Key Features */}
				<section className="container mx-auto px-4 py-16 md:py-24">
					<h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Why choose {getPlatformName()}?</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{[
							{
								icon: '🏦',
								title: 'The Clubs',
								desc: 'Each club is designed to help members support one another and reach personal milestones together.',
							},
							{
								icon: '🎁',
								title: 'Clubber Benefits',
								desc: 'Every contribution earns you club points, giving you the chance to be rewarded by other members with potential rewards of up to twice your contribution.',
							},
							{
								icon: '🤝',
								title: 'Invitation Rewards',
								desc: 'When you invite friends or family to join any club, you earn a continual 2% of their future contribution withdrawals for life.',
							},
						].map((item, idx) => (
							<div key={idx} className="bg-white/5 rounded-2xl p-8 shadow-md border border-[var(--lp-border)] text-center transition-transform hover:-translate-y-2 hover:shadow-xl cursor-pointer">
								<div className="text-5xl mb-4">{item.icon}</div>
								<h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
								<p className="text-muted-foreground text-base">{item.desc}</p>
							</div>
						))}
					</div>
				</section>

				<section className="container mx-auto px-4 py-16 md:py-24">
					<div className="mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">{getPlatformName()} Benefits</h2>
						<p className="sm:text-lg text-muted-foreground text-center max-w-2xl mx-auto">Enjoy a Seamless, Secure and Rewarding Contribution Experience.</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{[
							{ icon: '💸', title: 'Zero Commission', desc: 'No hidden fees' },
							{ icon: '📊', title: 'Real-Time Insights', desc: 'Track your club’s performance live.' },
							{ icon: '🔒', title: 'Secure & Encrypted', desc: 'Your data and funds are protected.' },
							{ icon: '✨', title: 'User-Friendly Interface', desc: 'Simple, intuitive, and modern.' },
							{ icon: '🕑', title: '24/7 Support', desc: 'We’re here whenever you need help.' },
							{ icon: '💰', title: 'Start from ₦500', desc: 'Accessible to everyone.' },
						].map((item, idx) => (
							<div key={idx} className={`rounded-2xl p-6 border border-[var(--lp-border)] text-center shadow-sm ${idx % 2 === 0 ? 'bg-white/10' : 'bg-white/5'} transition-transform hover:-translate-y-1 hover:shadow-lg`}>
								<div className="text-4xl mb-3">{item.icon}</div>
								<h4 className="text-lg font-semibold mb-1 text-foreground">{item.title}</h4>
								<p className="text-muted-foreground text-sm">{item.desc}</p>
							</div>
						))}
					</div>
				</section>

				<section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
					<div className="flex-1">
						<h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">3 Reasons savers Choose Us</h2>
						<div className="grid grid-cols-1 gap-6">
							{[
								{ icon: '📈', title: 'Dynamic Contribution Clubs', desc: 'See how your club points increase in value.' },
								{ icon: '🔍', title: 'Transparent Profit System', desc: 'See exactly how your money grows.' },
								{ icon: '🌍', title: 'Global Access, Local Support', desc: 'Start small, save from anywhere, get help anytime.' },
							].map((item, idx) => (
								<div key={idx} className="flex items-center gap-4 bg-white/5 rounded-xl p-6 border border-[var(--lp-border)] shadow-sm">
									<span className="text-3xl">{item.icon}</span>
									<div>
										<h4 className="text-lg font-semibold text-foreground mb-1">{item.title}</h4>
										<p className="text-muted-foreground text-sm">{item.desc}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="flex-1 flex justify-center">
						<div className="w-full max-w-xs aspect-[4/3] rounded-2xl flex items-center justify-center shadow-xl overflow-hidden relative">
							<Image src="/images/credit-card-bro.svg" alt="Growth chart illustration" fill className="object-contain" />
						</div>
					</div>
				</section>

				{/* Call to Action Section */}
				{/* <section className="w-full py-20 bg-gradient-to-r from-[var(--lp-green-primary)]/20 to-[var(--lp-green-primary)]/10 mt-16">
					<div className="container mx-auto px-4 flex flex-col items-center justify-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-foreground">Ready to start growing your wealth?</h2>
						<p className="text-lg text-muted-foreground mb-8 text-center">Join over 10,000 savers and experience the {getPlatformName()} advantage.</p>
						<form className="flex flex-col sm:flex-row gap-4 w-full max-w-xl justify-center">
							<input type="email" placeholder="Enter your email" className="flex-1 px-5 py-3 rounded-full border border-[var(--lp-border)] bg-white/80 text-base focus:outline-none focus:ring-2 focus:ring-[var(--lp-green-primary)]" required />
							<Button type="submit" variant={'success'} size={'lg'} className="rounded-full px-8 py-3 text-lg shadow-md">
								Get Started
							</Button>
						</form>
					</div>
				</section> */}
			</main>
			<AppFooter />
		</div>
	);
}
