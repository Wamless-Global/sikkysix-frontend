import Logo from '@/components/ui/logo';
import { CustomLink } from '@/components/ui/CustomLink';
import { getPlatformName } from '@/lib/helpers';

export default function AppFooter() {
	return (
		<footer className="text-muted-foreground pt-16 pb-6 bg-gradient-to-r from-[var(--lp-green-primary)]/20 to-[var(--lp-green-primary)]/5">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
					<div className="md:col-span-2">
						<div className="flex items-center space-x-2 mb-4">
							<Logo alt={`${getPlatformName()} Logo`} variant="dark" size="md" />
						</div>
					</div>
					<div>
						<h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
						<ul className="space-y-3 text-sm">
							<li>
								<CustomLink href="/" className="hover:text-foreground">
									Home
								</CustomLink>
							</li>
							<li>
								<CustomLink href="/about" className="hover:text-foreground">
									About Us
								</CustomLink>
							</li>
							<li>
								<CustomLink href="/account/club" className="hover:text-foreground">
									Savings Clubs
								</CustomLink>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold text-foreground mb-4">Support</h4>
						<ul className="space-y-3 text-sm">
							<li>
								<CustomLink href="/faq" className="hover:text-foreground">
									FAQs
								</CustomLink>
							</li>
							<li>
								<CustomLink href="mailto:support@sikkysix.com" className="hover:text-foreground">
									Contact Us
								</CustomLink>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold text-foreground mb-4">Legal</h4>
						<ul className="space-y-3 text-sm">
							<li>
								<CustomLink href="/privacy" className="hover:text-foreground">
									Privacy Policy
								</CustomLink>
							</li>
							<li>
								<CustomLink href="/terms" className="hover:text-foreground">
									Terms of Service
								</CustomLink>
							</li>
						</ul>
					</div>
				</div>
				<div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
					<p>
						&copy; {new Date().getFullYear()} {getPlatformName()}. All rights reserved.
					</p>
					<div className="flex space-x-6 mt-4 md:mt-0">
						<a href="https://www.tiktok.com/@sikkysix" className="hover:text-foreground" aria-label="TikTok">
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M21 8.306a5.985 5.985 0 01-3.29-1.002V15.5c0 3.033-2.467 5.5-5.5 5.5S6.71 18.533 6.71 15.5c0-2.93 2.36-5.32 5.29-5.32.18 0 .36.01.54.027v2.13a3.19 3.19 0 00-.54-.047c-1.8 0-3.26 1.47-3.26 3.21 0 1.77 1.46 3.21 3.26 3.21s3.26-1.44 3.26-3.21V2.5h2.01c.09 1.47 1.25 2.64 2.71 2.73v3.076z" />
							</svg>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
