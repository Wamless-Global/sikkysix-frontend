import { CustomLink } from '@/components/ui/CustomLink';
import Logo from '@/components/ui/logo';
import Link from 'next/link';

export default function PrivacyPage() {
	return (
		<div className="static-page flex min-h-screen flex-col items-center p-8">
			<Logo alt="Sikkysix Logo" size="xl" />

			<div className="static-card w-full max-w-4xl p-8">
				<h2 className="mb-6 text-3xl font-semibold">Privacy Policy</h2>
				<p className="mb-4">Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
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
		</div>
	);
}
