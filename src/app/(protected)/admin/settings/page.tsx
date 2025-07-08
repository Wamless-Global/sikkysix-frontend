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
import { Info, Banknote, Percent, Users } from 'lucide-react';
import InfoTooltip from '@/components/ui/info-tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { handleFetchErrorMessage } from '@/lib/helpers';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';

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
	const [orderThreshold, setOrderThreshold] = useState('');

	const [agentMaxDepositFeePercent, setagentMaxDepositFeePercent] = useState(5);
	const [agentMaxWithdrawalFeePercent, setagentMaxWithdrawalFeePercent] = useState(5);

	const [globalMaxMultiplier, setGlobalMaxMultiplier] = useState(2);
	const [promoMaxMultiplier, setPromoMaxMultiplier] = useState(3);
	const [penaltyType, setPenaltyType] = useState<'forfeit_interest' | 'fixed_fee' | 'percentage_fee'>('forfeit_interest');
	const [penaltyFeeValue, setPenaltyFeeValue] = useState(0);

	const [referralBonusPercent, setReferralBonusPercent] = useState(2);
	const [bonusFromSavings, setBonusFromSavings] = useState(true);
	const [bonusFromLiquidatingSavings, setBonusFromLiquidatingSavings] = useState(true);
	const [referralThreshold, setReferralThreshold] = useState(10);
	const [higherEarningsMultiplier, setHigherEarningsMultiplier] = useState(4);

	const [enableProfitCapping, setEnableProfitCapping] = useState(false);
	const [enableAutoWithdrawal, setEnableAutoWithdrawal] = useState(false);
	const [enableFeesFromNetProfit, setEnableFeesFromNetProfit] = useState(false);
	const [platformRevenueModel, setPlatformRevenueModel] = useState<'' | 'MODEL_A_DIRECT_REVENUE' | 'MODEL_B_POOL_BENEFITS'>('');
	const [enableBuyingFeesWalletBalance, setEnableBuyingFeesWalletBalance] = useState(false);
	const [capSavings, setCapSavings] = useState(false);
	const [capSavingsFrequency, setCapSavingsFrequency] = useState('');
	const [weekMode, setWeekMode] = useState(false);
	const [currencies, setCurrencies] = useState<{ code: string; name: string; symbol: string }[]>([]);
	const [currencyRates, setCurrencyRates] = useState<Record<string, string>>({});

	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [categoriesTerm, setCategoriesTerm] = useState('units');

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

				if (settings.order_threshold !== undefined) setOrderThreshold(settings.order_threshold);

				if (settings.agent_max_deposit_fee_percent !== undefined) setagentMaxDepositFeePercent(Number(settings.agent_max_deposit_fee_percent));

				if (settings.agent_max_withdrawal_fee_percent !== undefined) setagentMaxWithdrawalFeePercent(Number(settings.agent_max_withdrawal_fee_percent));

				if (settings.global_max_multiplier !== undefined) setGlobalMaxMultiplier(Number(settings.global_max_multiplier));

				if (settings.promo_max_multiplier !== undefined) setPromoMaxMultiplier(Number(settings.promo_max_multiplier));

				if (settings.penalty_type) setPenaltyType(settings.penalty_type as 'forfeit_interest' | 'fixed_fee' | 'percentage_fee');

				if (settings.penalty_fee_value !== undefined) setPenaltyFeeValue(Number(settings.penalty_fee_value));

				if (settings.referral_bonus_percent !== undefined) setReferralBonusPercent(Number(settings.referral_bonus_percent));

				if (settings.bonus_from_savings !== undefined) setBonusFromSavings(settings.bonus_from_savings === 'true');

				if (settings.bonus_from_liquidating_savings !== undefined) setBonusFromLiquidatingSavings(settings.bonus_from_liquidating_savings === 'true');

				if (settings.referral_threshold !== undefined) setReferralThreshold(Number(settings.referral_threshold));

				if (settings.higher_earnings_multiplier !== undefined) setHigherEarningsMultiplier(Number(settings.higher_earnings_multiplier));

				if (settings.enable_profit_capping !== undefined) setEnableProfitCapping(settings.enable_profit_capping === 'true');

				if (settings.enable_auto_withdrawal_on_complete_investment !== undefined) setEnableAutoWithdrawal(settings.enable_auto_withdrawal_on_complete_investment === 'true');

				if (settings.enable_fees_from_net_profit !== undefined) setEnableFeesFromNetProfit(settings.enable_fees_from_net_profit === 'true');

				if (settings.platform_revenue_model) setPlatformRevenueModel(settings.platform_revenue_model as '' | 'MODEL_A_DIRECT_REVENUE' | 'MODEL_B_POOL_BENEFITS');

				if (settings.enable_buying_fees_wallet_balance !== undefined) setEnableBuyingFeesWalletBalance(settings.enable_buying_fees_wallet_balance === 'true');

				if (settings.cap_savings !== undefined) setCapSavings(settings.cap_savings === 'true');
				if (settings.cap_savings_frequency !== undefined) setCapSavingsFrequency(settings.cap_savings_frequency);
				if (settings.week_mode !== undefined) setWeekMode(settings.week_mode === 'true');
			} catch (e) {
				const errorMessage = handleFetchErrorMessage(e, 'Failed to load platform settings.');
				toast.error(errorMessage);
			} finally {
				setLoading(false);
			}
		}
		fetchSettings();
	}, []);

	useEffect(() => {
		async function fetchCurrenciesAndRates() {
			try {
				setLoading(true);
				const res = await fetchWithAuth('/api/currencies');
				if (!res.ok) throw new Error('Failed to fetch currencies');
				const api = await res.json();
				const currencyArr = api?.data || [];

				setCurrencies(currencyArr.map((c: any) => ({ code: c.fiat_code, name: c.fiat_name, symbol: c.fiat_symbol })));

				// Fetch platform settings for rates
				const settingsRes = await fetchWithAuth('/api/admin/settings');
				if (settingsRes.ok) {
					const settingsApi = await settingsRes.json();
					const settingsArr = settingsApi?.data?.settings || [];
					const settings: Record<string, string> = {};
					for (const s of settingsArr) {
						settings[s.setting_key] = s.setting_value;
					}
					if (settings.platform_fiat_rate) {
						try {
							const parsed = JSON.parse(settings.platform_fiat_rate);
							setCurrencyRates(parsed);
						} catch {}
					}
				}
			} catch (e) {
				const errorMessage = handleFetchErrorMessage(e, 'Failed to load platform settings.');
				toast.error(errorMessage);
			} finally {
				setLoading(false);
			}
		}
		fetchCurrenciesAndRates();
	}, []);

	// --- PATCH helpers ---
	async function patchSettings(updates: { key: string; setting_value: string }[], section: string) {
		setIsSubmitting(true);
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
		} finally {
			setIsSubmitting(false);
		}
	}

	// --- Save Handlers ---
	const handleSaveGeneralSettings = async () => {
		const updates = [
			{ key: 'platform_name', setting_value: platformName },
			{ key: 'platform_base_currency', setting_value: platformBaseCurrency },
			{ key: 'order_threshold', setting_value: orderThreshold },
		];
		await patchSettings(updates, 'General Settings');
	};
	const handleSaveFeeSettings = async () => {
		const updates = [
			{ key: 'agent_max_deposit_fee_percent', setting_value: agentMaxDepositFeePercent.toString() },
			{ key: 'agent_max_withdrawal_fee_percent', setting_value: agentMaxWithdrawalFeePercent.toString() },
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
			{ key: 'bonus_from_savings', setting_value: bonusFromSavings ? 'true' : 'false' },
			{ key: 'bonus_from_liquidating_savings', setting_value: bonusFromLiquidatingSavings ? 'true' : 'false' },
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
			{ key: 'cap_savings', setting_value: capSavings ? 'true' : 'false' },
		];
		if (capSavings) {
			updates.push({ key: 'cap_savings_frequency', setting_value: capSavingsFrequency });
			updates.push({ key: 'week_mode', setting_value: weekMode ? 'true' : 'false' });
		}
		await patchSettings(updates, 'Investment Settings');
	};
	const handleSaveRates = async () => {
		const ratesObj: Record<string, string> = {};
		currencies.forEach((c) => {
			if (currencyRates[c.code]) ratesObj[c.code] = currencyRates[c.code];
		});
		const updates = [{ key: 'platform_fiat_rate', setting_value: JSON.stringify(ratesObj) }];
		await patchSettings(updates, 'Currency Rates');
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
								<Label htmlFor="orderThreshold" className="font-medium flex items-center gap-1">
									Order Threshold
									<InfoTooltip content="The minimum balance at which agents will be notified that their balance is running low." />
								</Label>
								<Input disabled={isSubmitting} id="orderThreshold" type="number" value={orderThreshold} onChange={(e) => setOrderThreshold(e.target.value)} className="focus:ring-primary/60" placeholder="Amount to notify agents their balance is low" />
							</div>
						</CardContent>
						<CardFooter className="border-t px-6 py-4 flex justify-end">
							<Button onClick={handleSaveGeneralSettings} className="bg-primary hover:bg-primary/90 transition">
								Save General Settings
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
							<div className="flex items-center gap-3">
								<Switch disabled={isSubmitting} id="capSavings" checked={capSavings} onCheckedChange={setCapSavings} />
								<Label htmlFor="capSavings" className="font-medium cursor-pointer flex items-center gap-1">
									Cap Savings
									<InfoTooltip content="If enabled, savings will be capped according to the selected frequency." />
								</Label>
							</div>
							{capSavings && (
								<>
									<div className="space-y-2">
										<Label htmlFor="capSavingsFrequency" className="font-medium">
											Cap Savings Frequency
										</Label>
										<Input disabled={isSubmitting} id="capSavingsFrequency" value={capSavingsFrequency} onChange={(e) => setCapSavingsFrequency(e.target.value)} className="focus:ring-blue-500/60" placeholder="e.g., daily, weekly, monthly" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="weekMode" className="font-medium flex items-center gap-1">
											Week Mode
											<InfoTooltip content="Choose how the week is determined for capping: 'Monday' (week starts on Monday) or 'Rolling' (7 days from any day)." />
										</Label>
										<Select disabled={isSubmitting} value={weekMode ? 'monday' : 'rolling'} onValueChange={(value) => setWeekMode(value === 'monday')}>
											<SelectTrigger id="weekMode" className="focus:ring-blue-500/60">
												<SelectValue placeholder="Select week mode" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="monday">Monday (week starts on Monday)</SelectItem>
												<SelectItem value="rolling">Rolling (any 7-day period)</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</>
							)}
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

					{/* Fee Configuration */}
					<Card className="border">
						<CardHeader className="flex flex-row items-center gap-2 pb-2">
							<Percent className="w-5 h-5 text-yellow-500" />
							<CardTitle>Fee Configuration</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="depositFee" className="font-medium">
									Maximum Agent Deposit Fee (%)
								</Label>
								<Input disabled={isSubmitting} id="depositFee" type="number" min="0" max="100" step="0.1" value={agentMaxDepositFeePercent} onChange={(e) => setagentMaxDepositFeePercent(parseFloat(e.target.value) || 0)} className="focus:ring-yellow-400/60" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="withdrawalFee" className="font-medium">
									Maximum Agent Withdrawal Fee (%)
								</Label>
								<Input disabled={isSubmitting} id="withdrawalFee" type="number" min="0" max="100" step="0.1" value={agentMaxWithdrawalFeePercent} onChange={(e) => setagentMaxWithdrawalFeePercent(parseFloat(e.target.value) || 0)} className="focus:ring-yellow-400/60" />
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
										<Checkbox disabled={isSubmitting} id="bonusFromSavings" checked={bonusFromSavings} onCheckedChange={(checked) => setBonusFromSavings(Boolean(checked))} className="accent-green-500" />
										<label htmlFor="bonusFromSavings" className="text-sm font-medium leading-none">
											Take from Savings Fee
										</label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox disabled={isSubmitting} id="bonusFromLiquidatingSavings" checked={bonusFromLiquidatingSavings} onCheckedChange={(checked) => setBonusFromLiquidatingSavings(Boolean(checked))} className="accent-green-500" />
										<label htmlFor="bonusFromLiquidatingSavings" className="text-sm font-medium leading-none">
											Take from Savings Withdrawal Fee
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
				</div>

				{/* Currency Rates Section */}
				<Card className="border">
					<CardHeader className="flex flex-row items-center gap-2 pb-2">
						<Info className="w-5 h-5 text-primary" />
						<CardTitle>Currency Rates</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{currencies.length === 0 ? (
							<p className="text-muted-foreground">No currencies found.</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{currencies.map((c) => (
									<div key={c.code} className="space-y-2">
										<Label htmlFor={`rate-${c.code}`} className="font-medium">
											{c.name} ({c.code})
										</Label>
										<Input
											disabled={isSubmitting}
											id={`rate-${c.code}`}
											type="number"
											value={currencyRates[c.code] || ''}
											onChange={(e) => setCurrencyRates((prev: Record<string, string>) => ({ ...prev, [c.code]: e.target.value }))}
											className="focus:ring-primary/60"
											placeholder={`Enter rate for ${c.name}`}
										/>
									</div>
								))}
							</div>
						)}
					</CardContent>
					<CardFooter className="border-t px-6 py-4 flex justify-end">
						<Button onClick={handleSaveRates} className="bg-primary hover:bg-primary/90 transition">
							Save Currency Rates
						</Button>
					</CardFooter>
				</Card>
			</div>
		</TooltipProvider>
	);
}
