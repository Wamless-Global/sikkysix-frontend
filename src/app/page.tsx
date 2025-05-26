'use client'; // This is a client component

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CustomLink } from '@/components/ui/CustomLink';

// Placeholder SVG for Logo - Using CSS Vars
const LogoPlaceholder = () => (
	<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="40" height="40" rx="8" fill="var(--lp-green-primary)" />
		<text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="var(--primary-foreground)" fontSize="14" fontWeight="bold">
			SS
		</text>
	</svg>
);

// Placeholder SVG for Icons/Images - Using muted color
const IconPlaceholder = ({ className = 'w-10 h-10' }: { className?: string }) => (
	<svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="40" height="40" rx="4" fill="var(--muted)" />
	</svg>
);

// Image Placeholder - Using card/muted colors
const ImagePlaceholder = ({ className = 'w-full h-48' }: { className?: string }) => (
	<div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
		<span className="text-muted-foreground text-sm">Placeholder Image</span>
	</div>
);

export default function LandingPage() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		// Use CSS variables for background and default text color
		<div className="bg-background text-foreground min-h-screen font-sans">
			<header className="container mx-auto px-4 py-4 flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<LogoPlaceholder />
					<span className="text-xl font-bold">Sikky Six</span>
				</div>
				<nav className="hidden md:flex items-center space-x-6">
					<a href="#" className="hover:text-[var(--lp-green-primary)]">
						Categories
					</a>
					<a href="#" className="hover:text-[var(--lp-green-primary)]">
						Investments
					</a>
					<a href="#" className="hover:text-[var(--lp-green-primary)]">
						Referrals
					</a>
					<a href="#" className="hover:text-[var(--lp-green-primary)]">
						Tasks
					</a>
				</nav>
				<CustomLink href="/auth/login" passHref>
					<Button className="bg-[var(--lp-green-primary)] hover:opacity-90 text-primary-foreground rounded-full px-6 hidden md:block">Login / Signup</Button>
				</CustomLink>
				<button className="md:hidden text-foreground z-50" onClick={toggleMobileMenu}>
					{/* Use foreground color */}
					{isMobileMenuOpen ? (
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> {/* Close Icon */}
						</svg>
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /> {/* Hamburger Icon */}
						</svg>
					)}
				</button>
			</header>
			{isMobileMenuOpen && (
				// Use CSS variable for background
				<div className="md:hidden fixed inset-0 w-full h-screen bg-[var(--lp-dark-bg)] z-40 flex flex-col items-center justify-center space-y-6">
					<a href="#" className="text-2xl hover:text-[var(--lp-green-primary)]" onClick={toggleMobileMenu}>
						Categories
					</a>
					<a href="#" className="text-2xl hover:text-[var(--lp-green-primary)]" onClick={toggleMobileMenu}>
						Investments
					</a>
					<a href="#" className="text-2xl hover:text-[var(--lp-green-primary)]" onClick={toggleMobileMenu}>
						Referrals
					</a>
					<a href="#" className="text-2xl hover:text-[var(--lp-green-primary)]" onClick={toggleMobileMenu}>
						Tasks
					</a>
					<CustomLink href="/auth/login" passHref>
						<Button className="bg-[var(--lp-green-primary)] hover:opacity-90 text-primary-foreground rounded-full px-8 py-3 text-lg mt-8" onClick={toggleMobileMenu}>
							Login / Signup
						</Button>
					</CustomLink>
				</div>
			)}
			<section className="container mx-auto px-4 py-16 md:py-24 text-center relative overflow-hidden">
				{/* Background decorative elements (simplified) - Use CSS vars */}
				<div className="absolute top-10 left-10 w-16 h-16 border-2 border-[var(--lp-border)] rounded-full opacity-30 animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-10 h-10 border border-[var(--lp-green-primary)] opacity-30 transform rotate-45"></div>
				<h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-foreground">
					{/* Use foreground */}
					Invest Smarter with <br className="hidden md:block" /> Dynamic Categories
				</h1>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">Join our revolutionary investment platform that rewards early investors. Choose from various categories, earn up to 2x your investment, and benefit from our transparent, fee-based system.</p>
				<div className="flex justify-center space-x-4 mb-16">
					<CustomLink href="/auth/login" passHref>
						<Button className="bg-[var(--lp-green-primary)] hover:opacity-90 text-primary-foreground rounded-full px-8 py-3 text-lg">Get Started</Button>
					</CustomLink>
					{/* Commented out Watch Demo Button */}
					{/*
					<Button variant="outline" className="border-muted-foreground hover:bg-muted text-foreground rounded-full px-8 py-3 text-lg flex items-center space-x-2">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--lp-green-primary)]" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
						</svg>
						<span>Watch Demo</span>
					</Button>
          */}
				</div>
				{/* Placeholder Dashboard Cards - Use CSS Vars */}
				<div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
					<div className="bg-[var(--lp-dark-card)] p-6 rounded-lg shadow-lg border border-[var(--lp-border)] transform md:-translate-y-8 md:-translate-x-4 md:rotate-[-3deg]">
						<div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
							<span>April 2022 - Week 1</span>
							<div className="flex space-x-1">
								<button>&lt;</button>
								<button>&gt;</button>
							</div>
						</div>
						<div className="flex items-center justify-center space-x-4 mb-4">
							{/* Placeholder Donut Chart */}
							<div className="relative w-24 h-24">
								<svg viewBox="0 0 36 36" className="w-full h-full">
									<path className="text-muted" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
									<path className="text-[var(--lp-green-primary)]" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeLinecap="round"></path>
								</svg>
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<span className="text-xs text-muted-foreground">Your Spending</span>
									<span className="text-xl font-bold text-foreground">$238,098</span>
								</div>
							</div>
						</div>
						<div className="text-sm text-muted-foreground">Currency</div>
						<div className="text-lg font-semibold text-foreground">USD/US Dollar</div>
					</div>
					<div className="bg-[var(--lp-dark-card)] p-6 rounded-lg shadow-lg border border-[var(--lp-border)] z-10 col-span-1 md:col-span-2">
						<div className="text-sm text-muted-foreground mb-2">Category Statistics</div>
						<div className="flex justify-between items-center mb-4">
							<span className="font-semibold text-foreground">Active Investments</span>
							<span className="text-2xl font-bold text-foreground">
								₦12,498,098<span className="text-base">.00</span>
							</span>
						</div>
						<div className="flex justify-between items-center mb-4">
							<span className="font-semibold text-foreground">Total Saving</span>
							<span className="text-2xl font-bold text-foreground">
								$498,098<span className="text-base">.00</span>
							</span>
							<button className="text-[var(--lp-green-primary)]">→</button>
						</div>
						<div className="text-sm text-muted-foreground mb-2">Statistics</div>
						{/* Placeholder Line Chart */}
						<ImagePlaceholder className="w-full h-32" />
					</div>
					<div className="bg-[var(--lp-dark-card)] p-4 rounded-lg shadow-lg border border-[var(--lp-border)] md:absolute md:bottom-[-40px] md:left-[20%] z-20 flex items-center space-x-3">
						<IconPlaceholder className="w-8 h-8" />
						<div>
							<span className="text-sm text-muted-foreground">12.8%</span>
							{/* Placeholder small graph */}
							<div className="w-16 h-4 bg-[var(--lp-green-secondary)] rounded"></div>
						</div>
					</div>
					<div className="bg-[var(--lp-dark-card)] p-4 rounded-lg shadow-lg border border-[var(--lp-border)] md:absolute md:bottom-[-60px] md:left-[45%] z-20 flex items-center space-x-3">
						<IconPlaceholder className="w-8 h-8" />
						<div>
							<span className="text-sm text-muted-foreground">Your Balance</span>
							<span className="text-lg font-semibold text-foreground">$298,098</span>
						</div>
					</div>
				</div>
			</section>
			<section className="container mx-auto px-4 py-16 md:py-24">
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Key Platform Features</h2>
				<p className="text-lg text-muted-foreground text-center max-w-xl mx-auto mb-12">Discover our innovative investment categories and transparent profit-sharing system</p>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="text-center">
						<div className="inline-block p-3 bg-[var(--lp-green-primary)]/20 rounded-full mb-4">
							<IconPlaceholder className="w-8 h-8 text-[var(--lp-green-primary)]" />
						</div>
						<h3 className="text-xl font-semibold mb-2 text-foreground">Dynamic Categories</h3>
						<p className="text-muted-foreground">Invest in various preset categories like foodstuffs, accessories, accommodation, and lifestyle. Categories can be dynamically managed by admin for optimal performance.</p>
					</div>
					<div className="text-center">
						<div className="inline-block p-3 bg-[var(--lp-green-primary)]/20 rounded-full mb-4">
							<IconPlaceholder className="w-8 h-8 text-[var(--lp-green-primary)]" />
						</div>
						<h3 className="text-xl font-semibold mb-2 text-foreground">Early Investor Benefits</h3>
						<p className="text-muted-foreground">Early investors enjoy increased profits as more users join specific categories. Earn up to 2x your investment, with special promos offering up to 3x returns.</p>
					</div>
					<div className="text-center">
						<div className="inline-block p-3 bg-[var(--lp-green-primary)]/20 rounded-full mb-4">
							<IconPlaceholder className="w-8 h-8 text-[var(--lp-green-primary)]" />
						</div>
						<h3 className="text-xl font-semibold mb-2 text-foreground">Referral System</h3>
						<p className="text-muted-foreground">Earn 2% referral bonuses when you invite others. Unlock higher earning potential up to 4x by referring more users in your investment category.</p>
					</div>
				</div>
			</section>
			<section className="py-16 px-4 md:px-20">
				<div className="max-w-7xl mx-auto">
					{/* Use foreground and lp-green-primary */}
					<h2 className="text-foreground text-3xl md:text-4xl font-bold mb-12 text-center">
						These are why you should use <span className="text-[var(--lp-green-primary)]">Sikky Six</span>
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								title: 'Zero Commission',
								desc: 'Enjoy full returns on your investments without any hidden fees or commissions.',
								icon: '💸',
							},
							{
								title: 'Real-Time Insights',
								desc: 'Get up-to-date market data and AI-powered predictions to guide your choices.',
								icon: '📊',
							},
							{
								title: 'Secure & Encrypted',
								desc: 'Your data and transactions are protected with top-tier encryption.',
								icon: '🔒',
							},
							{
								title: 'User-Friendly Interface',
								desc: 'Simple, intuitive design built for both beginners and pros.',
								icon: '🖥️',
							},
							{
								title: '24/7 Customer Support',
								desc: 'Get help whenever you need it, day or night.',
								icon: '📞',
							},
							{
								title: 'Start With As Low As ₦500',
								desc: 'Begin your investment journey with a small, manageable amount.',
								icon: '💼',
							},
						].map((item, index) => (
							// Use CSS variables for card background and text colors
							<div key={index} className="bg-[var(--lp-dark-card)] rounded-2xl p-6 hover:shadow-lg transition-shadow border border-[var(--lp-border)]">
								<div className="text-4xl mb-4">{item.icon}</div>
								<h3 className="text-foreground text-xl font-semibold mb-2">{item.title}</h3>
								<p className="text-muted-foreground">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="container mx-auto px-4 py-16 md:py-24">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
					<div>
						{/* Use CSS variables */}
						<p className="text-[var(--lp-green-primary)] uppercase text-sm font-semibold mb-2">Get Started in Minutes</p>
						<h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">3 Main Reasons to Choose us.</h2>
						<div className="w-16 h-1 bg-[var(--lp-green-primary)] mb-8"></div>

						{/* Reason Accordion/List - Use CSS variables */}
						<div className="space-y-6">
							<div className="pb-4 border-b border-[var(--lp-border)]">
								<h3 className="text-xl font-semibold mb-2 flex justify-between items-center text-foreground">
									Dynamic Investment Categories
									<span className="text-[var(--lp-green-primary)]">^</span>
								</h3>
								<p className="text-muted-foreground">Choose from various preset categories like foodstuffs, accessories, accommodation, and lifestyle. Categories are actively managed to ensure optimal returns.</p>
							</div>
							<div className="pb-4 border-b border-[var(--lp-border)]">
								<h3 className="text-xl font-semibold text-muted-foreground flex justify-between items-center">
									Transparent Profit System
									<span className="text-muted-foreground">v</span>
								</h3>
							</div>
							<div className="pb-4 border-b border-[var(--lp-border)]">
								<h3 className="text-xl font-semibold text-muted-foreground flex justify-between items-center">
									Global Access with Local Support
									<span className="text-muted-foreground">v</span>
								</h3>
							</div>
						</div>
					</div>
					{/* Image/Preview Side - Use CSS variables */}
					<div className="relative">
						<ImagePlaceholder className="w-full h-80 rounded-lg shadow-xl border border-[var(--lp-border)]" />
						<div className="absolute -bottom-8 -left-8 bg-[var(--lp-dark-card)] p-4 rounded-lg shadow-lg border border-[var(--lp-border)] w-48">
							<span className="text-sm text-muted-foreground">Small Graph 1</span>
							<ImagePlaceholder className="w-full h-16" />
						</div>
						<div className="absolute -top-8 -right-8 bg-[var(--lp-dark-card)] p-4 rounded-lg shadow-lg border border-[var(--lp-border)] w-48">
							<span className="text-sm text-muted-foreground">Small Graph 2</span>
							<ImagePlaceholder className="w-full h-16" />
						</div>
					</div>
				</div>
			</section>
			<section className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
				{/* Use CSS variables */}
				<h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Frequently Asked Question</h2>
				<div className="w-16 h-1 bg-[var(--lp-green-primary)] mb-12 mx-auto"></div>
				<Accordion type="single" collapsible className="w-full">
					{/* Use CSS variables for border and text */}
					<AccordionItem value="item-1" className="border-b border-[var(--lp-border)]">
						<AccordionTrigger className="text-xl hover:no-underline py-6 text-left text-foreground">How does the profit mechanism work?</AccordionTrigger>
						<AccordionContent className="text-muted-foreground text-base pb-6">
							Our platform rewards early investors as more users join specific categories. You can earn up to 2x your investment under normal conditions, and during special promotions, you can earn up to 3x. The admin sets target limits and maximum withdrawal amounts for each category.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2" className="border-b border-[var(--lp-border)]">
						<AccordionTrigger className="text-xl hover:no-underline py-6 text-left text-foreground">What are the fees involved?</AccordionTrigger>
						<AccordionContent className="text-muted-foreground text-base pb-6">We charge a 5% fee on deposits and withdrawals. These fees are adjustable by the admin. All fees are clearly displayed before any transaction to ensure transparency.</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3" className="border-b border-[var(--lp-border)]">
						<AccordionTrigger className="text-xl hover:no-underline py-6 text-left text-foreground">How does the referral system work?</AccordionTrigger>
						<AccordionContent className="text-muted-foreground text-base pb-6">
							When you refer new users, you earn 2% of the 10% platform fees charged on their transactions. Additionally, referring more users in your investment category can unlock higher earning potential up to 4x your investment.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-4" className="border-b-0 border-[var(--lp-border)]">
						<AccordionTrigger className="text-xl hover:no-underline py-6 text-left text-foreground">What payment methods are available?</AccordionTrigger>
						<AccordionContent className="text-muted-foreground text-base pb-6">We support direct bank transfers for Nigerian users and cryptocurrency transactions for international users. All transactions are manually verified to ensure security.</AccordionContent>
					</AccordionItem>
				</Accordion>
			</section>
			{/* Use CSS variables for gradient */}
			{/* <section className="bg-gradient-to-b from-[var(--lp-dark-bg)] to-[var(--lp-green-secondary)] py-16 md:py-24 relative overflow-hidden">
				<div className="absolute top-1/4 left-[5%] w-20 h-1 border-t-2 border-dashed border-foreground opacity-20 transform -rotate-45"></div>
				<div className="absolute bottom-1/4 right-[5%] w-3 h-3 bg-foreground rounded-full opacity-20"></div>
				<div className="absolute top-1/3 right-[10%] w-2 h-2 bg-[var(--lp-green-primary)] rounded-full opacity-30"></div>
				<div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
					<div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto md:ml-auto md:mr-0">
						<div className="absolute inset-0 rounded-full bg-[var(--lp-green-primary)]/10 blur-3xl"></div>
						<Image src="/placeholder-person.jpg" alt="Testimonial Person" width={288} height={288} className="rounded-full object-cover relative z-10 border-4 border-[var(--lp-dark-bg)]" />
					</div>
					<div className="text-center md:text-left md:mr-auto md:ml-0">
						<span className="text-7xl font-serif text-[var(--lp-green-primary)] block mb-[-1rem] ml-[-0.5rem]">“</span>
						<blockquote className="text-2xl md:text-3xl italic mb-6 text-foreground">Deski combines excellent live chat, ticketing and automation that allow us provide quality.</blockquote>
						<p className="font-semibold text-xl text-foreground mb-1">Mike Lucas.</p>
						<p className="text-[var(--lp-green-primary)] text-base mb-6">CEO & Founder</p>
						<Button variant="outline" className="border-foreground hover:bg-foreground hover:text-[var(--lp-dark-bg)] text-foreground rounded-full px-8 py-2">
							Learn More
						</Button>
					</div>
				</div>
			</section> */}
			{/* Use CSS variables for background */}
			<section className="bg-[var(--lp-green-muted)] py-16 md:py-20 relative">
				<div className="absolute top-4 left-1/4 w-16 h-1 border-t border-dashed border-foreground opacity-30"></div>
				<div className="absolute bottom-4 right-1/4 w-8 h-8 border border-foreground rounded-full opacity-30"></div>
				<div className="container mx-auto px-4 text-center md:flex md:justify-between md:items-center bg-[var(--lp-green-secondary)] p-8 md:p-12 rounded-lg shadow-xl relative z-10">
					<div>
						<p className="text-[var(--lp-green-primary)] uppercase text-sm font-semibold mb-1">Start Investing Today</p>
						<h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-0 text-foreground">Ready to grow your wealth?</h2>
					</div>
					<div className="mt-6 md:mt-0 flex flex-col items-center md:items-end">
						<form className="flex w-full max-w-sm bg-background rounded-full p-1 focus-within:ring-2 focus-within:ring-[var(--lp-green-primary)] mb-2">
							<input type="email" placeholder="Enter your email" className="flex-grow px-4 py-2 rounded-full text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground" />
							<Button type="submit" className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-6 py-2 flex-shrink-0">
								Get Started
							</Button>
						</form>
						<p className="text-sm text-muted-foreground">
							Already investing with us?{' '}
							<a href="/auth/login" className="text-foreground underline hover:text-[var(--lp-green-primary)]">
								Sign in
							</a>
						</p>
					</div>
				</div>
			</section>
			<footer className="text-muted-foreground py-16">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
						<div className="md:col-span-2">
							<div className="flex items-center space-x-2 mb-4">
								<LogoPlaceholder />
								<span className="text-xl font-bold text-foreground">Sikky Six</span>
							</div>
							<p className="text-sm max-w-xs">Your trusted platform for diverse investment opportunities. Join our community of successful investors and grow your wealth together.</p>
						</div>
						<div>
							<h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
							<ul className="space-y-3 text-sm">
								<li>
									<a href="#" className="hover:text-foreground">
										About Us
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground">
										Investment Categories
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground">
										How It Works
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground">
										Referral Program
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-foreground mb-4">Support</h4>
							<ul className="space-y-3 text-sm">
								<li>
									<a href="#" className="hover:text-foreground">
										Help Center
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground">
										FAQs
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground">
										Contact Us
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground">
										Security
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-foreground mb-4">Legal</h4>
							<ul className="space-y-3 text-sm">
								<li>
									<a href="/privacy" className="hover:text-foreground">
										Privacy Policy
									</a>
								</li>
								<li>
									<a href="/terms" className="hover:text-foreground">
										Terms of Service
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground">
										Risk Disclosure
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-foreground">
										KYC Policy
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t border-[var(--lp-border)] pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
						<p>© 2025 Sikky Six. All rights reserved.</p>
						<div className="flex space-x-6 mt-4 md:mt-0">
							<a href="#" className="hover:text-foreground">
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
								</svg>
							</a>
							<a href="#" className="hover:text-foreground">
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path
										fillRule="evenodd"
										d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
										clipRule="evenodd"
									></path>
								</svg>
							</a>
							<a href="#" className="hover:text-foreground">
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<path
										fillRule="evenodd"
										d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
										clipRule="evenodd"
									></path>
								</svg>
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
