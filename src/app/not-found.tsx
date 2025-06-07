'use client';

import { CustomLink } from '@/components/ui/CustomLink';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import nProgress from 'nprogress';

const DUMMY_RESULTS = [
	{ title: 'Home', href: '/' },
	{ title: 'Dashboard', href: '/account' },
	{ title: 'Profile', href: '/account/profile' },
	{ title: 'Wallet', href: '/account/wallet' },
	{ title: 'My Savings', href: '/account/my-savings' },
	{ title: 'Games', href: '/account/games' },
	{ title: 'Referrals', href: '/account/referrals' },
	{ title: 'reports', href: '/account/report' },
	{ title: 'Terms of Service', href: '/terms' },
	{ title: 'Privacy Policy', href: '/privacy' },
];

export default function NotFound() {
	const router = useRouter();
	const [search, setSearch] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);

	const filteredResults = search.trim() ? DUMMY_RESULTS.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())) : [];

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
		setShowDropdown(!!e.target.value);
	};

	const handleResultClick = (href: string) => {
		nProgress.start();
		setShowDropdown(false);
		setSearch('');
		router.push(href);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-[100vh] px-4 py-12 text-center bg-background">
			<div className="mb-6">
				<Image src="/globe.svg" alt="Not found illustration" width={80} height={80} className="mx-auto opacity-80" />
			</div>
			<h1 className="text-6xl font-extrabold text-[var(--dashboard-accent)] mb-2 tracking-tight">404</h1>
			<h2 className="text-2xl font-semibold mb-2 text-foreground">Page Not Found</h2>
			<p className="mb-6 text-muted-foreground max-w-md mx-auto">Sorry, we couldn’t find the page you’re looking for. It may have been moved or deleted.</p>
			<div className="relative w-full max-w-md mx-auto mb-6">
				<Input placeholder="Search the site..." value={search} onChange={handleSearchChange} className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-base focus:ring-2 focus:ring-[var(--dashboard-accent)]" aria-label="Search" autoComplete="off" />
				{showDropdown && filteredResults.length > 0 && (
					<ul className="absolute left-0 right-0 z-10 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
						{filteredResults.map((item) => (
							<li key={item.href}>
								<button type="button" className="w-full text-left px-5 py-3 hover:bg-[var(--dashboard-accent)] hover:text-white transition rounded-lg cursor-pointer" onClick={() => handleResultClick(item.href)}>
									{item.title}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
			<div className="flex flex-wrap justify-center gap-3 mb-2">
				<CustomLink href="/" className="px-5 py-2 rounded-lg bg-[var(--dashboard-accent)] text-white font-semibold hover:opacity-90 transition shadow">
					Go Home
				</CustomLink>
			</div>
		</div>
	);
}
