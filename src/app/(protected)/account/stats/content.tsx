'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/context/AuthContext';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { formatCurrency, formatDateNice } from '@/lib/helpers';
import { logger } from '@/lib/logger';
import copyToClipboard from '@/components/ui/copy-to-clipboard';

interface SpecialReferralStats {
	totalReferred: number;
	totalFees: number;
	totalCollected: number;
	remainingAmount: number;
	users: Array<{
		username: string;
		referred: number;
		fees: number;
		collected: number;
		remaining: number;
		status: string;
		registrationDate: string;
	}>;
}

export default function StatsPageContent() {
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState<SpecialReferralStats | null>(null);
	const { currentUser } = useAuthContext();

	useEffect(() => {
		async function fetchStats() {
			setIsLoading(true);
			try {
				// Replace with your actual API endpoint
				const res = await fetchWithAuth('/api/referrals/special-stats');
				if (!res.ok) throw new Error('Failed to fetch stats');
				const data = await res.json();
				logger.info('Fetched special referral stats:', data);
				setStats(data.data);
			} catch {
				setStats(null);
			} finally {
				setIsLoading(false);
			}
		}
		fetchStats();
	}, []);

	const referralLink = `${process.env.NEXT_PUBLIC_URL}/auth/signup?ref=${currentUser?.username}`;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Special User Referral Stats</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{isLoading
					? Array.from({ length: 4 }).map((_, i) => (
							<Card key={i} className="border border-border shadow-sm rounded-xl">
								<CardContent className="p-4">
									<Skeleton className="h-6 w-32 mb-2" />
									<Skeleton className="h-8 w-20" />
								</CardContent>
							</Card>
					  ))
					: stats && (
							<>
								<Card className="bg-gradient-to-br from-blue-600/80 to-blue-400/80 text-white border-none shadow-md">
									<CardContent className="p-4">
										<div className="text-sm">Total Referred</div>
										<div className="text-xl font-semibold">{stats.totalReferred}</div>
									</CardContent>
								</Card>
								<Card className="bg-gradient-to-br from-green-600/80 to-green-400/80 text-white border-none shadow-md">
									<CardContent className="p-4">
										<div className="text-sm">Total Fees Gotten</div>
										<div className="text-xl font-semibold">{formatCurrency(stats.totalFees)}</div>
									</CardContent>
								</Card>
								<Card className="bg-gradient-to-br from-yellow-500/80 to-yellow-300/80 text-white border-none shadow-md">
									<CardContent className="p-4">
										<div className="text-sm">Total Amount Collected</div>
										<div className="text-xl font-semibold">{formatCurrency(stats.totalCollected)}</div>
									</CardContent>
								</Card>
								<Card className="bg-gradient-to-br from-purple-600/80 to-purple-400/80 text-white border-none shadow-md">
									<CardContent className="p-4">
										<div className="text-sm">Remaining Amount</div>
										<div className="text-xl font-semibold">{formatCurrency(stats.remainingAmount)}</div>
									</CardContent>
								</Card>
							</>
					  )}
			</div>

			{/* Referral Link Section */}
			<div className="mt-8">
				<h2 className="text-lg font-semibold mb-2">Your Referral Link</h2>
				<div className="flex items-center gap-2 mb-6">
					<input className="border rounded px-2 py-1 w-full max-w-md text-sm" value={referralLink} readOnly />
					<button onClick={() => copyToClipboard(referralLink, 'Referral code copied!', 'Failed to copy referral code.')} className="bg-primary text-white px-3 py-1 rounded text-sm cursor-pointer">
						Copy
					</button>
				</div>

				<h2 className="text-lg font-semibold mb-4">User Referral Details</h2>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Fees Gotten</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date Joined</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 4 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<Skeleton className="h-6 w-24" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16" />
										</TableCell>
										<TableCell>
											<Skeleton className="h-6 w-16" />
										</TableCell>
									</TableRow>
								))
							) : stats?.users?.length ? (
								stats.users.map((user) => (
									<TableRow key={user.username}>
										<TableCell>{user.username}</TableCell>
										<TableCell>{formatCurrency(user.fees)}</TableCell>
										<TableCell>{user.status}</TableCell>
										<TableCell>{formatDateNice(user.registrationDate)}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={4} className="text-center text-muted-foreground">
										No data available.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
