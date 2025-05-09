'use client'; // Required for form state management

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import Breadcrumbs from '@/components/layout/Breadcrumbs'; // Import Breadcrumbs

// TODO: Fetch initial settings values from API
// TODO: Define a proper type for all settings

// Placeholder country list - In a real app, this might come from an API or config
const availableCountries = [
	{ code: 'NG', name: 'Nigeria' },
	{ code: 'GH', name: 'Ghana' },
	{ code: 'KE', name: 'Kenya' },
	{ code: 'ZA', name: 'South Africa' },
	{ code: 'US', name: 'United States' },
	{ code: 'GB', name: 'United Kingdom' },
	{ code: 'CA', name: 'Canada' },
	// Add more countries as needed
];

// Placeholder category list for Crypto settings - fetch dynamically
const availableCategories = [
	{ id: 'cat_1', name: 'Foodstuffs' },
	{ id: 'cat_2', name: 'Accessories' },
	{ id: 'cat_3', name: 'Accommodation' },
	{ id: 'cat_4', name: 'Lifestyle' },
	{ id: 'cat_5', name: 'Vacation Packages' },
];

export default function PlatformSettingsPage() {
	// State for General Settings (Example)
	const [platformName, setPlatformName] = useState('SikkySix Invest');
	const [baseCurrency, setBaseCurrency] = useState('NGN');

	// State for Fee Configuration (Example)
	const [depositFeePercent, setDepositFeePercent] = useState(5);
	const [withdrawalFeePercent, setWithdrawalFeePercent] = useState(5);

	// State for Withdrawal Rules (Example)
	const [globalMaxMultiplier, setGlobalMaxMultiplier] = useState(2);
	const [promoMaxMultiplier, setPromoMaxMultiplier] = useState(3);
	const [penaltyType, setPenaltyType] = useState<'forfeit_interest' | 'fixed_fee' | 'percentage_fee'>('forfeit_interest');
	const [penaltyFeeValue, setPenaltyFeeValue] = useState(0);

	// State for Referral Program (Example)
	const [referralBonusPercent, setReferralBonusPercent] = useState(2);
	const [bonusFromDeposit, setBonusFromDeposit] = useState(true);
	const [bonusFromWithdrawal, setBonusFromWithdrawal] = useState(true);
	const [referralThreshold, setReferralThreshold] = useState(10);
	const [higherEarningsMultiplier, setHigherEarningsMultiplier] = useState(4);

	// State for Banking Availability (Example)
	const [enabledBankCountries, setEnabledBankCountries] = useState<Set<string>>(new Set(['NG']));

	// State for Crypto Settings (Example)
	const [cryptoMinDeposit, setCryptoMinDeposit] = useState(100); // Example: $100 USD equivalent? Define unit clearly.
	const [cryptoAllowedCategories, setCryptoAllowedCategories] = useState<Set<string>>(new Set(['cat_1', 'cat_4'])); // Example: Foodstuffs, Lifestyle

	// Placeholder Save Handlers
	const handleSaveGeneralSettings = () => {
		console.log('Saving General Settings:', { platformName, baseCurrency });
		alert('General Settings Saved (Placeholder)!');
	};
	const handleSaveFeeSettings = () => {
		console.log('Saving Fee Settings:', { depositFeePercent, withdrawalFeePercent });
		alert('Fee Settings Saved (Placeholder)!');
	};
	const handleSaveWithdrawalSettings = () => {
		console.log('Saving Withdrawal Settings:', { globalMaxMultiplier, promoMaxMultiplier, penaltyType, penaltyFeeValue });
		alert('Withdrawal Settings Saved (Placeholder)!');
	};
	const handleSaveReferralSettings = () => {
		console.log('Saving Referral Settings:', { referralBonusPercent, bonusFromDeposit, bonusFromWithdrawal, referralThreshold, higherEarningsMultiplier });
		alert('Referral Settings Saved (Placeholder)!');
	};
	const handleSaveBankingSettings = () => {
		console.log('Saving Banking Settings:', { enabledBankCountries: Array.from(enabledBankCountries) });
		alert('Banking Availability Saved (Placeholder)!');
	};
	const handleSaveCryptoSettings = () => {
		console.log('Saving Crypto Settings:', { cryptoMinDeposit, cryptoAllowedCategories: Array.from(cryptoAllowedCategories) });
		alert('Crypto Settings Saved (Placeholder)!');
	};

	// Handler for banking availability switch
	const handleBankingToggle = (countryCode: string, checked: boolean) => {
		setEnabledBankCountries((prev) => {
			const newSet = new Set(prev);
			if (checked) {
				newSet.add(countryCode);
			} else {
				newSet.delete(countryCode);
			}
			return newSet;
		});
	};

	// Handler for crypto category checkbox
	const handleCryptoCategoryToggle = (categoryId: string, checked: boolean) => {
		setCryptoAllowedCategories((prev) => {
			const newSet = new Set(prev);
			if (checked) {
				newSet.add(categoryId);
			} else {
				newSet.delete(categoryId);
			}
			return newSet;
		});
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs /> {/* Add Breadcrumbs component */}
			<h1 className="text-2xl font-semibold mt-2">Platform Settings</h1> {/* Restore Title */}
			<p className="text-muted-foreground">Configure general settings, fees, withdrawal rules, referrals, and more.</p>
			{/* General Settings Card */}
			<Card>
				<CardHeader>
					<CardTitle>General Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="platformName">Platform Name</Label>
						<Input id="platformName" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="col-span-2" />
					</div>
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="baseCurrency">Base Currency</Label>
						<Input id="baseCurrency" value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="col-span-2" placeholder="e.g., NGN, USD" />
					</div>
				</CardContent>
				<CardFooter className="border-t px-6 py-4">
					<Button onClick={handleSaveGeneralSettings}>Save General Settings</Button>
				</CardFooter>
			</Card>
			{/* Fee Configuration Card */}
			<Card>
				<CardHeader>
					<CardTitle>Fee Configuration</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="depositFee">Deposit Fee (%)</Label>
						<Input id="depositFee" type="number" min="0" max="100" step="0.1" value={depositFeePercent} onChange={(e) => setDepositFeePercent(parseFloat(e.target.value) || 0)} className="col-span-2" />
					</div>
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="withdrawalFee">Withdrawal Fee (%)</Label>
						<Input id="withdrawalFee" type="number" min="0" max="100" step="0.1" value={withdrawalFeePercent} onChange={(e) => setWithdrawalFeePercent(parseFloat(e.target.value) || 0)} className="col-span-2" />
					</div>
				</CardContent>
				<CardFooter className="border-t px-6 py-4">
					<Button onClick={handleSaveFeeSettings}>Save Fee Settings</Button>
				</CardFooter>
			</Card>
			{/* Withdrawal Rules Card */}
			<Card>
				<CardHeader>
					<CardTitle>Withdrawal Rules</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="globalMaxMultiplier">Global Max Multiplier (x)</Label>
						<Input id="globalMaxMultiplier" type="number" min="1" step="0.1" value={globalMaxMultiplier} onChange={(e) => setGlobalMaxMultiplier(parseFloat(e.target.value) || 1)} className="col-span-2" placeholder="e.g., 2" />
					</div>
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="promoMaxMultiplier">Promo Max Multiplier (x)</Label>
						<Input id="promoMaxMultiplier" type="number" min="1" step="0.1" value={promoMaxMultiplier} onChange={(e) => setPromoMaxMultiplier(parseFloat(e.target.value) || 1)} className="col-span-2" placeholder="e.g., 3" />
					</div>
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="penaltyType">Early Withdrawal Penalty</Label>
						<div className="col-span-2 flex items-center gap-4">
							<Select value={penaltyType} onValueChange={(value: 'forfeit_interest' | 'fixed_fee' | 'percentage_fee') => setPenaltyType(value)}>
								<SelectTrigger className="flex-1">
									<SelectValue placeholder="Select penalty type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="forfeit_interest">Forfeit Accrued Interest</SelectItem>
									<SelectItem value="fixed_fee">Apply Fixed Fee</SelectItem>
									<SelectItem value="percentage_fee">Apply Percentage Fee</SelectItem>
								</SelectContent>
							</Select>
							{(penaltyType === 'fixed_fee' || penaltyType === 'percentage_fee') && (
								<Input type="number" min="0" step={penaltyType === 'percentage_fee' ? '0.1' : '1'} value={penaltyFeeValue} onChange={(e) => setPenaltyFeeValue(parseFloat(e.target.value) || 0)} placeholder={penaltyType === 'fixed_fee' ? 'Fee Amount' : 'Fee %'} className="w-[120px]" />
							)}
						</div>
					</div>
				</CardContent>
				<CardFooter className="border-t px-6 py-4">
					<Button onClick={handleSaveWithdrawalSettings}>Save Withdrawal Rules</Button>
				</CardFooter>
			</Card>
			{/* Referral Program Card */}
			<Card>
				<CardHeader>
					<CardTitle>Referral Program</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="referralBonus">Referral Bonus Payout (%)</Label>
						<Input id="referralBonus" type="number" min="0" max="100" step="0.1" value={referralBonusPercent} onChange={(e) => setReferralBonusPercent(parseFloat(e.target.value) || 0)} className="col-span-2" placeholder="e.g., 2" />
					</div>
					<div className="grid sm:grid-cols-3 items-start gap-4 pt-2">
						<Label>Bonus Source</Label>
						<div className="col-span-2 space-y-2">
							<div className="flex items-center space-x-2">
								<Checkbox id="bonusFromDeposit" checked={bonusFromDeposit} onCheckedChange={(checked) => setBonusFromDeposit(Boolean(checked))} />
								<label htmlFor="bonusFromDeposit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									Take from Deposit Fee
								</label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox id="bonusFromWithdrawal" checked={bonusFromWithdrawal} onCheckedChange={(checked) => setBonusFromWithdrawal(Boolean(checked))} />
								<label htmlFor="bonusFromWithdrawal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									Take from Withdrawal Fee
								</label>
							</div>
						</div>
					</div>
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="referralThreshold">Monthly Referral Threshold</Label>
						<Input id="referralThreshold" type="number" min="1" step="1" value={referralThreshold} onChange={(e) => setReferralThreshold(parseInt(e.target.value) || 1)} className="col-span-2" placeholder="e.g., 10" />
						<p className="col-span-3 text-xs text-muted-foreground pl-[calc(33.33%+1rem)]">Number of referrals needed in a month within the same category to unlock higher earnings multiplier.</p>
					</div>
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="higherMultiplier">Higher Earnings Multiplier (Max)</Label>
						<Input id="higherMultiplier" type="number" min="1" step="0.1" value={higherEarningsMultiplier} onChange={(e) => setHigherEarningsMultiplier(parseFloat(e.target.value) || 1)} className="col-span-2" placeholder="e.g., 4" />
						<p className="col-span-3 text-xs text-muted-foreground pl-[calc(33.33%+1rem)]">Maximum multiplier (e.g., 4x) achievable via referrals.</p>
					</div>
				</CardContent>
				<CardFooter className="border-t px-6 py-4">
					<Button onClick={handleSaveReferralSettings}>Save Referral Settings</Button>
				</CardFooter>
			</Card>
			{/* Banking Availability Card */}
			<Card>
				<CardHeader>
					<CardTitle>Banking Availability</CardTitle>
					<CardDescription>Enable/disable direct bank deposits/withdrawals per country.</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-48 rounded-md border p-4">
						{/* Using ScrollArea now */}
						<div className="space-y-3">
							{availableCountries.map((country) => (
								<div key={country.code} className="flex items-center justify-between">
									<Label htmlFor={`bank-${country.code}`} className="flex flex-col gap-1">
										<span>{country.name}</span>
										{country.code === 'NG' && <span className="font-normal leading-snug text-muted-foreground text-xs">Initially enabled</span>}
									</Label>
									<Switch id={`bank-${country.code}`} checked={enabledBankCountries.has(country.code)} onCheckedChange={(checked) => handleBankingToggle(country.code, checked)} />
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
				<CardFooter className="border-t px-6 py-4">
					<Button onClick={handleSaveBankingSettings}>Save Banking Availability</Button>
				</CardFooter>
			</Card>
			{/* Crypto Settings Card */}
			<Card>
				<CardHeader>
					<CardTitle>Cryptocurrency Settings</CardTitle>
					<CardDescription>Configure minimum deposits and category access for crypto users.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid sm:grid-cols-3 items-center gap-4">
						<Label htmlFor="cryptoMinDeposit">Minimum Crypto Deposit (USD Equiv.)</Label>
						<Input id="cryptoMinDeposit" type="number" min="0" step="1" value={cryptoMinDeposit} onChange={(e) => setCryptoMinDeposit(parseInt(e.target.value) || 0)} className="col-span-2" placeholder="e.g., 100" />
						<p className="col-span-3 text-xs text-muted-foreground pl-[calc(33.33%+1rem)]">Minimum deposit amount required for crypto transactions, specified in USD equivalent.</p>
					</div>
					<div className="grid sm:grid-cols-3 items-start gap-4 pt-2">
						<Label>Allowed Categories for Crypto</Label>
						<div className="col-span-2">
							<ScrollArea className="h-32 rounded-md border p-3">
								<div className="space-y-2">
									{availableCategories.map((category) => (
										<div key={category.id} className="flex items-center space-x-2">
											<Checkbox id={`crypto-cat-${category.id}`} checked={cryptoAllowedCategories.has(category.id)} onCheckedChange={(checked) => handleCryptoCategoryToggle(category.id, Boolean(checked))} />
											<label htmlFor={`crypto-cat-${category.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
												{category.name}
											</label>
										</div>
									))}
								</div>
							</ScrollArea>
							<p className="text-xs text-muted-foreground mt-1">Select which investment categories are accessible via crypto deposits.</p>
						</div>
					</div>
				</CardContent>
				<CardFooter className="border-t px-6 py-4">
					<Button onClick={handleSaveCryptoSettings}>Save Crypto Settings</Button>
				</CardFooter>
			</Card>
			{/* TODO: Add Card for Task Management */}
		</div>
	);
}
