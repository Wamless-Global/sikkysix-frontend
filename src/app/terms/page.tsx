import { CustomLink } from '@/components/ui/CustomLink';

export default function TermsPage() {
	return (
		<div className="static-page flex min-h-screen flex-col items-center p-8">
			<h1 className="mb-8 text-4xl font-bold">LOGO</h1>
			<div className="static-card w-full max-w-4xl p-8">
				<h2 className="mb-6 text-3xl font-semibold">Terms & Conditions</h2>
				<p className="mb-4">Welcome to our service. Please read these terms and conditions carefully before using our application.</p>
				<h3 className="mb-2 mt-6 text-xl font-semibold">1. Acceptance of Terms</h3>
				<p className="mb-4">By accessing or using our service, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to all the terms and conditions, then you may not access the service.</p>
				<h3 className="mb-2 mt-6 text-xl font-semibold">2. Changes to Terms</h3>
				<p className="mb-4">
					We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
				</p>
				<h3 className="mb-2 mt-6 text-xl font-semibold">3. User Accounts</h3>
				<p className="mb-4">When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.</p>
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
