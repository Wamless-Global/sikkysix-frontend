'use client';

import React from 'react';
import { Copy, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Import table components
import { Card, CardContent } from '@/components/ui/card';
import copyToClipboard from '@/components/ui/copy-to-clipboard';
import Image from 'next/image';

// Define interface for referral data structure
interface Referral {
	id: string;
	name: string;
	avatar?: string;
	joinedDate: string;
	amount: string;
}

// Mock data for referrals - replace with actual data fetching
const referralsData: Referral[] = [
	{
		id: '1',
		name: 'David Beckham',
		joinedDate: '11/03/25',
		amount: '1,500.00 NGN',
		avatar: '/user-avatar-placeholder.png', // Placeholder, assuming an image in /public
	},
	{
		id: '2',
		name: 'Scarlett Johanson',
		joinedDate: '11/03/25',
		amount: '2,100.00 NGN',
		avatar: '/user-avatar-placeholder.png',
	},
	{
		id: '3',
		name: 'Bruce Banner',
		joinedDate: '11/03/25',
		amount: '800.00 NGN',
		avatar: '/user-avatar-placeholder.png',
	},
	{
		id: '4',
		name: 'Jean Grey',
		joinedDate: '11/03/25',
		amount: '2,550.00 NGN',
		avatar: '/user-avatar-placeholder.png',
	},
	{
		id: '5',
		name: 'Steve Rodgers',
		joinedDate: '11/03/25',
		amount: '7,100.00 NGN',
		avatar: '/user-avatar-placeholder.png',
	},
];

const REFERRAL_CODE = '198202820182';

export default function ReferralsPage() {
	const handleCopyReferralCode = () => {
		copyToClipboard(REFERRAL_CODE, 'Referral code copied!', 'Failed to copy referral code.');
	};

	return (
		<div className="space-y-6 lg:space-y-8 text-foreground">
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2">
				<CardContent className="p-1 px-6 md:p-6 flex justify-between items-center">
					<div>
						<p className="subtext">Total Earned</p>
						<p className="amount-heading-extra-large">₦3,455.00</p>
					</div>
					<div className="text-right">
						<p className="subtext">Total</p>
						<p className="amount-heading">{referralsData.length}</p>
					</div>
				</CardContent>
			</Card>

			<div className="">
				<p className="text-sm text-muted-foreground">Referral Code</p>
				<div className="flex items-center justify-between bg-background rounded-lg">
					<p className="text-lg font-medium text-foreground truncate">{REFERRAL_CODE}</p>
					<Button variant="ghost" size="icon" onClick={handleCopyReferralCode} aria-label="Copy referral code" className="flex-shrink-0">
						<Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />
					</Button>
				</div>
				<p className="text-sm text-muted-foreground">Share this code with friends. When they sign up and invest, you earn!</p>
			</div>

			{/* Referrals List Title */}
			{referralsData.length > 0 && <h2 className="text-lg font-semibold text-foreground pt-4">Your Referrals</h2>}

			{/* Referrals List - Mobile (List View without individual card backgrounds) */}
			<div className="space-y-4 md:hidden">
				{referralsData.map((referral) => (
					<div key={referral.id} className="flex items-center justify-between px-1 py-3 rounded-lg border border-border/20">
						<div className="flex items-center space-x-3">
							{referral.avatar && referral.avatar !== '/user-avatar-placeholder.png' ? <img src={referral.avatar} alt={referral.name} className="h-8 w-8 rounded-full object-cover" /> : <UserCircle className="h-8 w-8 text-muted-foreground" />}
							<div>
								<p className="font-semibold text-foreground">{referral.name}</p>
								<p className="text-xs text-muted-foreground">Joined {referral.joinedDate}</p>
							</div>
						</div>
						<p className="font-semibold text-[var(--success)]">{referral.amount}</p>
					</div>
				))}
				{referralsData.length === 0 && (
					<div className="text-center py-10 px-4 flex flex-col items-center">
						<Image src="/box.png" alt="Empty Box" width={80} height={80} className="mb-6" />
						<h3 className="text-xl font-semibold mb-2 text-foreground">No Referrals Yet</h3>
						<p className="text-muted-foreground mb-6 leading-8">Share your code to start earning!</p>
					</div>
				)}
			</div>

			{/* Referrals Table - Desktop (Table View without card background) */}
			<div className="hidden md:block mt-4">
				{referralsData.length > 0 ? (
					<Table>
						<TableHeader>
							{/* Removed background from TableRow, relying on page background */}
							<TableRow className="border-b border-border/20">
								<TableHead className="w-[80px] !bg-transparent p-5"></TableHead>
								<TableHead className="!bg-transparent p-5">Name</TableHead>
								<TableHead className="!bg-transparent p-5">Joined Date</TableHead>
								<TableHead className="text-right !bg-transparent p-5">Amount Earned</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{referralsData.map((referral) => (
								// Ensuring row styling is consistent with mobile list items if possible, or clean table rows
								<TableRow key={referral.id} className="border-b border-border/20 hover:bg-muted/10 dark:hover:bg-muted/5">
									<TableCell className="p-5">
										{referral.avatar && referral.avatar !== '/user-avatar-placeholder.png' ? <img src={referral.avatar} alt={referral.name} className="h-8 w-8 rounded-full object-cover" /> : <UserCircle className="h-8 w-8 text-muted-foreground" />}
									</TableCell>
									<TableCell className="font-medium text-foreground p-5">{referral.name}</TableCell>
									<TableCell className="text-muted-foreground p-5">{referral.joinedDate}</TableCell>
									<TableCell className="text-right text-base font-semibold text-[var(--success)] p-5">{referral.amount}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className="text-center py-10 px-4 flex flex-col items-center mt-20">
						<Image src="/box.png" alt="Empty Box" width={80} height={80} className="mb-6" />
						<h3 className="text-xl font-semibold mb-2 text-foreground">No Referrals Yet</h3>
						<p className="text-muted-foreground mb-6 leading-8">Share your code to start earning!</p>
					</div>
				)}
			</div>
		</div>
	);
}
