'use client';

import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/ui/CustomLink';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { getPlatformName } from '@/lib/helpers';

export default function AppHeader() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="container mx-auto px-4 py-0 sm-py-2 flex justify-between items-center relative">
			<div className="flex items-center space-x-2">
				<Logo alt={`${getPlatformName()} Logo`} variant="dark" size="md" />
			</div>

			<nav className="hidden md:flex items-center space-x-6">
				<CustomLink href="/" passHref>
					<span className="hover:text-[var(--lp-green-primary)] cursor-pointer">Home</span>
				</CustomLink>
				<CustomLink href="/about" passHref>
					<span className="hover:text-[var(--lp-green-primary)] cursor-pointer">About</span>
				</CustomLink>
				<CustomLink href="/faq" passHref>
					<span className="hover:text-[var(--lp-green-primary)] cursor-pointer">FAQs</span>
				</CustomLink>
			</nav>
			<div className="hidden md:block">
				<CustomLink href="/auth/login" passHref>
					<Button variant={'success'} size={'lg'}>
						My Account
					</Button>
				</CustomLink>
			</div>

			<button className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--lp-green-primary)]" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
				<Menu className="h-7 w-7 text-foreground cursor-pointer" />
			</button>

			{mobileMenuOpen && (
				<div className="fixed inset-0 z-50 flex md:hidden">
					<div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
					<div className="relative flex flex-col w-64 h-full bg-background shadow-xl z-10">
						<div className="flex items-center justify-between p-4 border-b border-border/40">
							<span className="text-lg font-semibold">Menu</span>
							<button className="text-foreground hover:bg-white/10 rounded p-2" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
								<X className="h-6 w-6" />
							</button>
						</div>
						<nav className="flex flex-col space-y-2 p-4">
							<CustomLink href="/" passHref>
								<span className="block py-2 px-3 rounded hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
									Home
								</span>
							</CustomLink>
							<CustomLink href="/about" passHref>
								<span className="block py-2 px-3 rounded hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
									About
								</span>
							</CustomLink>
							<CustomLink href="/faq" passHref>
								<span className="block py-2 px-3 rounded hover:bg-accent hover:text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
									FAQ
								</span>
							</CustomLink>
						</nav>
						<div className="p-4 mt-auto">
							<CustomLink href="/auth/login" passHref>
								<Button variant={'success'} size={'lg'} className="w-full" onClick={() => setMobileMenuOpen(false)}>
									My Account
								</Button>
							</CustomLink>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
