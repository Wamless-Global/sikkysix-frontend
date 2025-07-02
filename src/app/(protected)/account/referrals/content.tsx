'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Copy, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import copyToClipboard from '@/components/ui/copy-to-clipboard';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { formatBaseurrency, formatDateNice } from '@/lib/helpers';
import { Referral } from '@/types';

export default function ReferralsPageContent() {
	const [isLoading, setIsLoading] = useState(true);
	const [referralCode, setReferralCode] = useState('');
	const [referrals, setReferrals] = useState<Referral[]>([]);
	const [allReferrals, setAllReferrals] = useState<Referral[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
	const { currentUser } = useAuthContext();

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300);
		return () => clearTimeout(handler);
	}, [searchTerm]);

	useEffect(() => {
		setReferralCode(`${process.env.NEXT_PUBLIC_URL}/auth/signup?ref=${currentUser?.username}`);
	}, [currentUser]);

	useEffect(() => {
		const fetchReferrals = async () => {
			setIsLoading(true);
			try {
				const params = new URLSearchParams();
				if (debouncedSearchTerm) params.append('searchTerm', debouncedSearchTerm);
				const res = await fetchWithAuth(`/api/referrals?${params.toString()}`);
				if (!res.ok) throw new Error('Failed to fetch referrals');
				const data = await res.json();
				logger.info('Fetched referrals:', data);
				setReferrals(data.referrals || []);
			} catch {
				setReferrals([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchReferrals();
	}, [debouncedSearchTerm]);

	// Fetch all referrals (without search) once for totals
	useEffect(() => {
		const fetchAllReferrals = async () => {
			try {
				const res = await fetchWithAuth('/api/referrals');
				if (!res.ok) throw new Error('Failed to fetch all referrals');
				const data = await res.json();
				setAllReferrals(data.referrals || []);
			} catch {
				setAllReferrals([]);
			}
		};
		fetchAllReferrals();
	}, []);

	const handleCopyReferralCode = () => {
		copyToClipboard(referralCode, 'Referral code copied!', 'Failed to copy referral code.');
	};

	// Calculate total earned and total count from all referrals, not just search results
	const totalEarned = allReferrals.reduce((sum, r) => {
		const num = parseFloat(String(r.amount ?? '0').replace(/[^\d.]/g, ''));
		return sum + (isNaN(num) ? 0 : num);
	}, 0);

	const totalReferrals = allReferrals.length;

	const ReferralSortableHeader = ({ label, className }: { label: string; className?: string }) => <TableHead className={`py-2 ${className || ''}`}>{label}</TableHead>;

	const isSearching = debouncedSearchTerm.length > 0;

	return (
		<div className="space-y-6 lg:space-y-8 text-foreground">
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2">
				<CardContent className="p-1 px-6 md:p-6 flex justify-between items-center">
					<div>
						<p className="subtext">Total Earned</p>
						<p className="amount-heading-extra-large">{formatBaseurrency(totalEarned)}</p>
					</div>
					<div className="text-right">
						<p className="subtext">Total</p>
						<p className="amount-heading">{totalReferrals}</p>
					</div>
				</CardContent>
			</Card>

			<div className="">
				<p className="text-sm text-muted-foreground">Referral Code</p>
				<div className="flex items-center justify-between bg-background rounded-lg">
					{currentUser?.username && (
						<div className="flex items-center gap-2 mb-2" onClick={handleCopyReferralCode}>
							<p className="text-xs md:text-base text-wrap font-medium text-foreground truncate">{referralCode}</p>
							<Button variant="ghost" size="icon" aria-label="Copy referral code" className="flex-shrink-0">
								<Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />
							</Button>
						</div>
					)}
				</div>
				<p className="text-sm text-muted-foreground">Share this code with friends. When they sign up and save, you earn!</p>
			</div>

			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
				<h2 className="text-lg font-semibold text-foreground">Your Referrals</h2>
				<div>
					{referrals.length > 0 && (
						<Input
							type="text"
							placeholder="Search by name..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="bg-muted/30 dark:bg-muted/10 border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)] rounded-lg h-10 md:h-12 account-input"
						/>
					)}
				</div>
			</div>

			{/* MOBILE LIST */}
			<div className="space-y-4 md:hidden">
				{isLoading ? (
					[...Array(5)].map((_, i) => (
						<div key={i} className="flex items-center justify-between px-1 py-3 rounded-lg border border-border/20">
							<div className="flex items-center space-x-3">
								<Skeleton className="h-8 w-8 rounded-full" />
								<div>
									<Skeleton className="h-4 w-24 mb-2" />
									<Skeleton className="h-3 w-16" />
								</div>
							</div>
							<Skeleton className="h-5 w-16" />
						</div>
					))
				) : referrals.length > 0 ? (
					referrals.map((referral) => (
						<div key={referral.id} className="flex items-center justify-between px-1 py-3 rounded-lg border border-border/20">
							<div className="flex items-center space-x-3">
								{referral.avatar && referral.avatar !== '/user-avatar-placeholder.png' ? <Image src={referral.avatar} alt={referral.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" /> : <UserCircle className="h-8 w-8 text-muted-foreground" />}
								<div>
									<p className="font-semibold text-foreground">{referral.name}</p>
									<p className="text-xs text-muted-foreground">Joined {formatDateNice(referral.joinedDate)}</p>
								</div>
							</div>
							<p className="font-semibold text-[var(--success)]">{formatBaseurrency(referral.amount)}</p>
						</div>
					))
				) : debouncedSearchTerm ? (
					<div className="text-center py-10 px-4 flex flex-col items-center">
						<Image src="/images/box.png" alt="No Record Found" width={80} height={80} className="mb-6" />
						<h3 className="text-xl font-semibold mb-2 text-foreground">No Record Found</h3>
						<p className="text-muted-foreground mb-6 leading-8">No referrals match your search.</p>
					</div>
				) : (
					<div className="text-center py-10 px-4 flex flex-col items-center">
						<Image src="/images/box.png" alt="Empty Box" width={80} height={80} className="mb-6" />
						<h3 className="text-xl font-semibold mb-2 text-foreground">No Referrals Yet</h3>
						<p className="text-muted-foreground mb-6 leading-8">Share your code to start earning!</p>
					</div>
				)}
			</div>

			{/* DESKTOP TABLE */}
			<div className="hidden md:block mt-4">
				<Table>
					<TableHeader className="bg-slate-50 dark:bg-slate-800">
						<TableRow>
							<ReferralSortableHeader label="Name" className="!bg-transparent p-5" />
							<ReferralSortableHeader label="Joined Date" className="!bg-transparent p-5" />
							<ReferralSortableHeader label="Amount Earned" className="text-right !bg-transparent p-5" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							[...Array(5)].map((_, i) => (
								<TableRow key={i} className="border-b border-border/20">
									<TableCell className="p-5">
										<Skeleton className="h-8 w-8 rounded-full" />
									</TableCell>
									<TableCell className="p-5">
										<Skeleton className="h-4 w-24 mb-2" />
									</TableCell>
									<TableCell className="p-5">
										<Skeleton className="h-3 w-16" />
									</TableCell>
								</TableRow>
							))
						) : referrals.length > 0 ? (
							referrals.map((referral) => (
								<TableRow key={referral.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border/20 transition-colors">
									<TableCell className="font-medium text-foreground p-5">
										<div className="flex items-center space-x-3 ">
											{referral.avatar && referral.avatar !== '/user-avatar-placeholder.png' ? <Image src={referral.avatar} alt={referral.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" /> : <UserCircle className="h-8 w-8 text-muted-foreground" />}
											<span>{referral.name}</span>
										</div>
									</TableCell>
									<TableCell className="text-muted-foreground p-5">{formatDateNice(referral.joinedDate)}</TableCell>
									<TableCell className="text-right text-base font-semibold text-[var(--success)] p-5">{formatBaseurrency(referral.amount)}</TableCell>
								</TableRow>
							))
						) : debouncedSearchTerm ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-10 px-4">
									<h3 className="text-xl font-semibold mb-2 text-foreground">No Record Found</h3>
									<p className="text-muted-foreground mb-6 leading-8">No referrals match your search.</p>
								</TableCell>
							</TableRow>
						) : (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-10 px-4">
									<Image src="/images/box.png" alt="Empty Box" width={80} height={80} className="mb-6 mx-auto" />
									<h3 className="text-xl font-semibold mb-2 text-foreground">No Referrals Yet</h3>
									<p className="text-muted-foreground mb-6 leading-8">Share your code to start earning!</p>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
