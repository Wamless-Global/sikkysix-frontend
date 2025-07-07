import { CustomLink } from '@/components/ui/CustomLink';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';

export default function PrivacyPage() {
	return (
		<div className="bg-background text-foreground font-sans flex flex-col min-h-screen">
			<AppHeader />
			<section className="container mx-auto px-4 py-16 md:py-24 max-w-4xl flex-1">
				<h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Privacy Policy</h1>
				<p className="mb-4 text-lg text-muted-foreground text-center">Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
				<div className="bg-[var(--lp-dark-card)] rounded-2xl p-8 border border-[var(--lp-border)]">
					<h3 className="mb-2 mt-6 text-xl font-semibold">1. Information Collection</h3>
					<p className="mb-4">We may collect personal identification information (such as name, email address) when you register on our application. We collect this information only if you voluntarily submit it to us.</p>
					<h3 className="mb-2 mt-6 text-xl font-semibold">2. Information Use</h3>
					<p className="mb-4">We may use the information we collect from you to personalize your experience, improve our application, process transactions, and send periodic emails regarding your account or other products and services.</p>
					<h3 className="mb-2 mt-6 text-xl font-semibold">3. Information Protection</h3>
					<p className="mb-4">We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.</p>
					<p className="mt-8 text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
					<div className="mt-8 text-center">
						<CustomLink href="/auth/signup" className="link-success font-medium">
							Back to Sign Up
						</CustomLink>
					</div>
				</div>
			</section>
			<AppFooter />
		</div>
	);
}
