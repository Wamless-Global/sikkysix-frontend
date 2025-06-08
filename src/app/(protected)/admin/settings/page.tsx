'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Columns, Info, Banknote, Bitcoin, Percent, Users } from 'lucide-react';
import InfoTooltip from '@/components/ui/info-tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { handleFetchErrorMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

function SettingsSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-1/3" />
			<Skeleton className="h-4 w-1/2" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="border rounded p-6 space-y-4">
						<Skeleton className="h-6 w-1/2" />
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
			</div>
		</div>
	);
}

export default function PlatformSettingsPage() {
	const [platformName, setPlatformName] = useState('SikkySix Invest');
	const [platformBaseCurrency, setPlatformBaseCurrency] = useState('NGN');
	const [platformFiatCurrency, setPlatformFiatCurrency] = useState('NGN');

	const [depositFeePercent, setDepositFeePercent] = useState(5);
	const [withdrawalFeePercent, setWithdrawalFeePercent] = useState(5);

	const [globalMaxMultiplier, setGlobalMaxMultiplier] = useState(2);
	const [promoMaxMultiplier, setPromoMaxMultiplier] = useState(3);
	const [penaltyType, setPenaltyType] = useState<'forfeit_interest' | 'fixed_fee' | 'percentage_fee'>('forfeit_interest');
	const [penaltyFeeValue, setPenaltyFeeValue] = useState(0);

	const [referralBonusPercent, setReferralBonusPercent] = useState(2);
	const [bonusFromDeposit, setBonusFromDeposit] = useState(true);
	const [bonusFromWithdrawal, setBonusFromWithdrawal] = useState(true);
	const [referralThreshold, setReferralThreshold] = useState(10);
	const [higherEarningsMultiplier, setHigherEarningsMultiplier] = useState(4);

	const [enabledBankCountries, setEnabledBankCountries] = useState<Set<string>>(new Set(['NG']));

	const [cryptoMinDeposit, setCryptoMinDeposit] = useState(100);
	const [cryptoAllowedCategories, setCryptoAllowedCategories] = useState<Set<string>>(new Set(['cat_1', 'cat_4']));

	const [enableProfitCapping, setEnableProfitCapping] = useState(false);
	const [enableAutoWithdrawal, setEnableAutoWithdrawal] = useState(false);
	const [enableFeesFromNetProfit, setEnableFeesFromNetProfit] = useState(false);
	const [platformRevenueModel, setPlatformRevenueModel] = useState<'' | 'MODEL_A_DIRECT_REVENUE' | 'MODEL_B_POOL_BENEFITS'>('');
	const [enableBuyingFeesWalletBalance, setEnableBuyingFeesWalletBalance] = useState(false);
	const [categoriesTerm, setCategoriesTerm] = useState('units');

	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		async function fetchSettings() {
			try {
				setLoading(true);
				const res = await fetchWithAuth('/api/admin/settings');
				if (!res.ok) throw new Error('Failed to fetch settings');
				const api = await res.json();

				const settingsArr = api?.data?.settings || [];
				const settings: Record<string, string> = {};
				for (const s of settingsArr) {
					settings[s.setting_key] = s.setting_value;
				}

				if (settings.platform_name) setPlatformName(settings.platform_name);

				if (settings.platform_base_currency) setPlatformBaseCurrency(settings.platform_base_currency);

				if (settings.platform_fiat_currency) setPlatformFiatCurrency(settings.platform_fiat_currency);

				if (settings.deposit_fee_percent !== undefined) setDepositFeePercent(Number(settings.deposit_fee_percent));

				if (settings.withdrawal_fee_percent !== undefined) setWithdrawalFeePercent(Number(settings.withdrawal_fee_percent));

				if (settings.global_max_multiplier !== undefined) setGlobalMaxMultiplier(Number(settings.global_max_multiplier));

				if (settings.promo_max_multiplier !== undefined) setPromoMaxMultiplier(Number(settings.promo_max_multiplier));

				if (settings.penalty_type) setPenaltyType(settings.penalty_type as 'forfeit_interest' | 'fixed_fee' | 'percentage_fee');

				if (settings.penalty_fee_value !== undefined) setPenaltyFeeValue(Number(settings.penalty_fee_value));

				if (settings.referral_bonus_percent !== undefined) setReferralBonusPercent(Number(settings.referral_bonus_percent));

				if (settings.bonus_from_deposit !== undefined) setBonusFromDeposit(settings.bonus_from_deposit === 'true');

				if (settings.bonus_from_withdrawal !== undefined) setBonusFromWithdrawal(settings.bonus_from_withdrawal === 'true');

				if (settings.referral_threshold !== undefined) setReferralThreshold(Number(settings.referral_threshold));

				if (settings.higher_earnings_multiplier !== undefined) setHigherEarningsMultiplier(Number(settings.higher_earnings_multiplier));

				if (settings.enabled_bank_countries !== undefined) {
					try {
						const arr = JSON.parse(settings.enabled_bank_countries.replace(/'/g, '"'));
						setEnabledBankCountries(new Set(arr));
					} catch {}
				}

				if (settings.crypto_min_deposit !== undefined) setCryptoMinDeposit(Number(settings.crypto_min_deposit));

				if (settings.crypto_allowed_categories !== undefined) {
					try {
						const arr = JSON.parse(settings.crypto_allowed_categories.replace(/'/g, '"'));
						setCryptoAllowedCategories(new Set(arr));
					} catch {}
				}

				if (settings.enable_profit_capping !== undefined) setEnableProfitCapping(settings.enable_profit_capping === 'true');

				if (settings.enable_auto_withdrawal_on_complete_investment !== undefined) setEnableAutoWithdrawal(settings.enable_auto_withdrawal_on_complete_investment === 'true');

				if (settings.enable_fees_from_net_profit !== undefined) setEnableFeesFromNetProfit(settings.enable_fees_from_net_profit === 'true');

				if (settings.platform_revenue_model) setPlatformRevenueModel(settings.platform_revenue_model as '' | 'MODEL_A_DIRECT_REVENUE' | 'MODEL_B_POOL_BENEFITS');

				if (settings.enable_buying_fees_wallet_balance !== undefined) setEnableBuyingFeesWalletBalance(settings.enable_buying_fees_wallet_balance === 'true');

				if (settings.categories_term) setCategoriesTerm(settings.categories_term);
			} catch (e) {
				const errorMessage = handleFetchErrorMessage(e, 'Failed to load platform settings.');
				toast.error(errorMessage);
			} finally {
				setLoading(false);
			}
		}
		fetchSettings();
	}, []);

	// --- PATCH helpers ---
	async function patchSettings(updates: { key: string; setting_value: string }[], section: string) {
		const toastId = toast.loading(`Saving ${section}...`);
		try {
			const res = await fetchWithAuth('/api/admin/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ updates }),
			});
			const data = await res.json();
			if (res.ok && data.status === 'success') {
				toast.success(`${section} saved successfully!`, { id: toastId });
				return true;
			} else {
				const errorMessage = handleFetchErrorMessage(data, `Failed to save ${section}.`);

				toast.error(errorMessage, { id: toastId });
				return false;
			}
		} catch (e: unknown) {
			const errorMessage = handleFetchErrorMessage(e, `Failed to save ${section}.`);

			toast.error(errorMessage, { id: toastId });
			return false;
		}
	}

	// --- Save Handlers ---
	const handleSaveGeneralSettings = async () => {
		const updates = [
			{ key: 'platform_name', setting_value: platformName },
			{ key: 'platform_base_currency', setting_value: platformBaseCurrency },
			{ key: 'platform_fiat_currency', setting_value: platformFiatCurrency },
		];
		await patchSettings(updates, 'General Settings');
	};
	const handleSaveFeeSettings = async () => {
		const updates = [
			{ key: 'deposit_fee_percent', setting_value: depositFeePercent.toString() },
			{ key: 'withdrawal_fee_percent', setting_value: withdrawalFeePercent.toString() },
		];
		await patchSettings(updates, 'Fee Settings');
	};
	const handleSaveWithdrawalSettings = async () => {
		const updates = [
			{ key: 'global_max_multiplier', setting_value: globalMaxMultiplier.toString() },
			{ key: 'promo_max_multiplier', setting_value: promoMaxMultiplier.toString() },
			{ key: 'penalty_type', setting_value: penaltyType },
			{ key: 'penalty_fee_value', setting_value: penaltyFeeValue.toString() },
		];
		await patchSettings(updates, 'Withdrawal Settings');
	};
	const handleSaveReferralSettings = async () => {
		const updates = [
			{ key: 'referral_bonus_percent', setting_value: referralBonusPercent.toString() },
			{ key: 'bonus_from_deposit', setting_value: bonusFromDeposit ? 'true' : 'false' },
			{ key: 'bonus_from_withdrawal', setting_value: bonusFromWithdrawal ? 'true' : 'false' },
			{ key: 'referral_threshold', setting_value: referralThreshold.toString() },
			{ key: 'higher_earnings_multiplier', setting_value: higherEarningsMultiplier.toString() },
		];
		await patchSettings(updates, 'Referral Settings');
	};
	const handleSaveInvestmentSettings = async () => {
		const updates = [
			{ key: 'enable_profit_capping', setting_value: enableProfitCapping ? 'true' : 'false' },
			{ key: 'enable_auto_withdrawal_on_complete_investment', setting_value: enableAutoWithdrawal ? 'true' : 'false' },
			{ key: 'enable_fees_from_net_profit', setting_value: enableFeesFromNetProfit ? 'true' : 'false' },
			{ key: 'platform_revenue_model', setting_value: platformRevenueModel },
			{ key: 'enable_buying_fees_wallet_balance', setting_value: enableBuyingFeesWalletBalance ? 'true' : 'false' },
			{ key: 'categories_term', setting_value: categoriesTerm },
		];
		await patchSettings(updates, 'Investment Settings');
	};

	if (loading) {
		return <SettingsSkeleton />;
	}

	return (
		<TooltipProvider>
			<div className="space-y-6">
				<Breadcrumbs />
				<h1 className="text-2xl font-semibold mt-2">Platform Settings</h1>
				<p className="text-muted-foreground">Configure general settings, fees, withdrawal rules, referrals, and more.</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* General Settings */}
					<Card className="border">
						<CardHeader className="flex flex-row items-center gap-2 pb-2">
							<Info className="w-5 h-5 text-primary" />
							<CardTitle>General Settings</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="platformName" className="font-medium">
									Platform Name
								</Label>
								<Input disabled={isSubmitting} id="platformName" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="focus:ring-primary/60" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="platformBaseCurrency" className="font-medium">
									Platform Base Currency
								</Label>
								<Input disabled={isSubmitting} id="platformBaseCurrency" value={platformBaseCurrency} onChange={(e) => setPlatformBaseCurrency(e.target.value)} className="focus:ring-primary/60" placeholder="e.g., NGN, USD" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="platformFiatCurrency" className="font-medium">
									Platform Fiat Currency
								</Label>
								<Input disabled={isSubmitting} id="platformFiatCurrency" value={platformFiatCurrency} onChange={(e) => setPlatformFiatCurrency(e.target.value)} className="focus:ring-primary/60" placeholder="e.g., NGN, USD, EUR (comma separated)" />
							</div>
						</CardContent>
						<CardFooter className="border-t px-6 py-4 flex justify-end">
							<Button onClick={handleSaveGeneralSettings} className="bg-primary hover:bg-primary/90 transition">
								Save General Settings
							</Button>
						</CardFooter>
					</Card>

					{/* Fee Configuration */}
					<Card className="border">
						<CardHeader className="flex flex-row items-center gap-2 pb-2">
							<Percent className="w-5 h-5 text-yellow-500" />
							<CardTitle>Fee Configuration</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="depositFee" className="font-medium">
									Deposit Fee (%)
								</Label>
								<Input disabled={isSubmitting} id="depositFee" type="number" min="0" max="100" step="0.1" value={depositFeePercent} onChange={(e) => setDepositFeePercent(parseFloat(e.target.value) || 0)} className="focus:ring-yellow-400/60" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="withdrawalFee" className="font-medium">
									Withdrawal Fee (%)
								</Label>
								<Input disabled={isSubmitting} id="withdrawalFee" type="number" min="0" max="100" step="0.1" value={withdrawalFeePercent} onChange={(e) => setWithdrawalFeePercent(parseFloat(e.target.value) || 0)} className="focus:ring-yellow-400/60" />
							</div>
						</CardContent>
						<CardFooter className="border-t px-6 py-4 flex justify-end">
							<Button disabled={isSubmitting} onClick={handleSaveFeeSettings} className="bg-yellow-500 hover:bg-yellow-600 transition">
								Save Fee Settings
							</Button>
						</CardFooter>
					</Card>

					{/* Referral Program */}
					<Card className="border">
						<CardHeader className="flex flex-row items-center gap-2 pb-2">
							<Users className="w-5 h-5 text-green-500" />
							<CardTitle>Referral Program</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="referralBonus" className="font-medium">
									Referral Bonus Payout (%)
								</Label>
								<Input disabled={isSubmitting} id="referralBonus" type="number" min="0" max="100" step="0.1" value={referralBonusPercent} onChange={(e) => setReferralBonusPercent(parseFloat(e.target.value) || 0)} className="focus:ring-green-400/60" placeholder="e.g., 2" />
							</div>
							<div className="space-y-2">
								<Label className="font-medium">Bonus Source</Label>
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<Checkbox disabled={isSubmitting} id="bonusFromDeposit" checked={bonusFromDeposit} onCheckedChange={(checked) => setBonusFromDeposit(Boolean(checked))} className="accent-green-500" />
										<label htmlFor="bonusFromDeposit" className="text-sm font-medium leading-none">
											Take from Deposit Fee
										</label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox disabled={isSubmitting} id="bonusFromWithdrawal" checked={bonusFromWithdrawal} onCheckedChange={(checked) => setBonusFromWithdrawal(Boolean(checked))} className="accent-green-500" />
										<label htmlFor="bonusFromWithdrawal" className="text-sm font-medium leading-none">
											Take from Withdrawal Fee
										</label>
									</div>
								</div>
							</div>
						</CardContent>
						<CardFooter className="border-t px-6 py-4 flex justify-end">
							<Button disabled={isSubmitting} onClick={handleSaveReferralSettings} className="bg-green-500 hover:bg-green-600 transition">
								Save Referral Settings
							</Button>
						</CardFooter>
					</Card>

					{/* Savings Settings */}
					<Card className="border">
						<CardHeader className="flex flex-row items-center gap-2 pb-2">
							<Banknote className="w-5 h-5 text-blue-500" />
							<CardTitle>Investment Settings</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center gap-3">
								<Switch disabled={isSubmitting} id="profitCapping" checked={enableProfitCapping} onCheckedChange={setEnableProfitCapping} />
								<Label htmlFor="profitCapping" className="font-medium cursor-pointer flex items-center gap-1">
									Enable Profit Capping
									<InfoTooltip content="If enabled, profits on investments will be capped as per platform policy." />
								</Label>
							</div>
							<div className="flex items-center gap-3">
								<Switch disabled={isSubmitting} id="autoWithdrawal" checked={enableAutoWithdrawal} onCheckedChange={setEnableAutoWithdrawal} />
								<Label htmlFor="autoWithdrawal" className="font-medium cursor-pointer flex items-center gap-1">
									Auto Profit Withdrawal
									<InfoTooltip content="If enabled, completed investments will trigger automatic withdrawals." />
								</Label>
							</div>
							<div className="flex items-center gap-3">
								<Switch disabled={isSubmitting} id="feesFromNetProfit" checked={enableFeesFromNetProfit} onCheckedChange={setEnableFeesFromNetProfit} />
								<Label htmlFor="feesFromNetProfit" className="font-medium cursor-pointer flex items-center gap-1">
									Fees from Net Profit
									<InfoTooltip content="If enabled, platform fees will be taken from net profit only (not from capital)." />
								</Label>
							</div>
							<div className="flex items-center gap-3">
								<Switch disabled={isSubmitting} id="buyingFeesWalletBalance" checked={enableBuyingFeesWalletBalance} onCheckedChange={setEnableBuyingFeesWalletBalance} />
								<Label htmlFor="buyingFeesWalletBalance" className="font-medium cursor-pointer flex items-center gap-1">
									Buying Fees from Wallet Balance
									<InfoTooltip content="If enabled, buying fees will be deducted from the user's wallet balance instead of invested amount." />
								</Label>
							</div>
							<div className="space-y-2">
								<Label htmlFor="revenueModel" className="font-medium">
									Platform Revenue Model
								</Label>
								<Select disabled={isSubmitting} value={platformRevenueModel} onValueChange={(value) => setPlatformRevenueModel(value as 'MODEL_A_DIRECT_REVENUE' | 'MODEL_B_POOL_BENEFITS')}>
									<SelectTrigger id="revenueModel" className="focus:ring-blue-500/60">
										<SelectValue placeholder="Select revenue model" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="MODEL_A_DIRECT_REVENUE">Model A: Direct Revenue</SelectItem>
										<SelectItem value="MODEL_B_POOL_BENEFITS">Model B: Pool Benefits</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="categoriesTerm" className="font-medium">
									Clubs Term
								</Label>
								<Input disabled={isSubmitting} id="categoriesTerm" value={categoriesTerm} onChange={(e) => setCategoriesTerm(e.target.value)} className="focus:ring-blue-500/60" placeholder="e.g., units, shares, tokens" />
							</div>
						</CardContent>
						<CardFooter className="border-t px-6 py-4 flex justify-end">
							<Button disabled={isSubmitting} onClick={handleSaveInvestmentSettings} className="bg-blue-500 hover:bg-blue-600 transition">
								Save Savings Settings
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</TooltipProvider>
	);
}
