import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AccountStatus, ApiPaymentMethod, Category, EmailStatus, Investment, Transaction, UserStatus } from '@/types';
import { P2PTradeStatus, TradeResponse } from '@/types/modules/trade';
import nProgress from 'nprogress';
import { NextRequest } from 'next/server';
import { logger } from './logger';

export const generateSlug = (name: string) => (name ? name.toLowerCase().replace(/\s+/g, '-') : '');

export const formatNaira = (amount: number | null | undefined): string => {
	if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
	return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const formatNumber = (amount: number | undefined | null, options?: Intl.NumberFormatOptions): string => {
	if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
	return new Intl.NumberFormat('en-US', options).format(amount);
};

export const formatUSD = (amount: number | undefined | null, precision = 2): string => {
	if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: precision, maximumFractionDigits: precision }).format(amount);
};

export const currencyFormatter = (value: number | string, units = 2, currency = '₦') => {
	return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: units, maximumFractionDigits: units })}`;
};

/**
 * Formats a number as a US Dollar currency string (e.g., $1,234.56).
 * Handles null, undefined, or NaN by returning '$0.00'.
 * @param amount The number to format.
 * @returns The formatted currency string or '$0.00'.
 */
/**
 * Formats a number as a currency string for any currency.
 * Falls back to NGN if the currency is invalid.
 * Optionally returns the currency symbol or code.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'USD', 'NGN'). Defaults to 'USD'.
 * @param options Optional: { symbol?: boolean, code?: boolean }
 * @returns The formatted currency string, symbol, or code.
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = '', options?: { symbol?: boolean; code?: boolean; symbolPosition?: 'before' | 'after' }): string => {
	const fallbackCurrency = getCurrencyFromLocalStorage()?.code || 'NGN';

	const validCurrency = (() => {
		try {
			new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
			return currency;
		} catch {
			return fallbackCurrency;
		}
	})();

	if (options?.symbol && !options?.code) {
		// Get the currency symbol
		const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: validCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
		let symbolPart = parts.find((p) => p.type === 'currency')?.value;
		if (!symbolPart) {
			symbolPart = getCurrencySymbol();
		}
		return symbolPart || validCurrency;
	}

	if (options?.code && !options?.symbol) {
		return validCurrency;
	}

	if (amount === null || amount === undefined || isNaN(amount)) {
		amount = 0;
	}

	const formatted = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(amount);

	let symbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: validCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find((p) => p.type === 'currency')?.value;

	symbol = getCurrencySymbol() || validCurrency;

	// If both code and symbol are true, show both with amount
	if (options?.code && options?.symbol) {
		if (options?.symbolPosition === 'after') {
			return `${formatted} ${symbol} ${validCurrency}`;
		}
		return `${symbol}${formatted} ${validCurrency}`;
	}

	// Default: show amount with symbol or code
	if (options?.code) {
		if (options?.symbolPosition === 'after') {
			return `${formatted} ${validCurrency}`;
		}
		return `${validCurrency} ${formatted}`;
	}

	if (options?.symbolPosition === 'after') {
		return `${formatted} ${symbol}`;
	}
	// Default is 'before'
	return `${symbol}${formatted}`;
};

export const formatBaseurrency = (amount: number | null | string, units = 2, withTags: boolean = true): React.ReactElement | string => {
	const convertAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	const amountStr = convertAmount !== null && convertAmount !== undefined ? convertAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: units }) : 'N/A';

	if (withTags) {
		return <span className="money">{`${amountStr} ${getBaseCurrency()}`}</span>;
	}
	return `${amountStr} ${getBaseCurrency()}`;
};

// Helper function to determine badge variant based on status
export const getEmailStatusVariant = (status: EmailStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
	switch (status) {
		case 'Active':
			return 'default';
		case 'Inactive':
			return 'destructive';
		default:
			return 'outline';
	}
};

export const getStatusBadgeVariant = (status: Transaction['status'] | Investment['status']): 'secondary' | 'destructive' | 'outline' | 'default' | 'error' | 'active' | 'completed' | null | undefined => {
	switch (status.toLowerCase()) {
		case 'completed':
			return 'completed';
		case 'pending':
			return 'outline';
		case 'failed':
			return 'destructive';
		default:
			return 'secondary';
	}
};

// Helper function to determine badge variant based on status
export const getStatusVariant = (status: UserStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
	switch (status) {
		case 'Active':
			return 'default';
		case 'Suspended':
			return 'destructive';
		default:
			return 'outline';
	}
};

export const getAccountStatusBadgeVariant = (status: AccountStatus) => {
	switch (status) {
		case 'active':
			return 'completed';
		case 'inactive':
			return 'destructive';
		case 'pending':
			return 'secondary';
		default:
			return 'default';
	}
};

// Assuming this helper function exists or needs to be defined
export const getAgentStatusVariant = (status: string) => {
	switch (status) {
		case 'approved':
			return 'default';
		case 'pending':
			return 'warning';
		case 'rejected':
			return 'destructive';
		case 'needs_more_info':
			return 'secondary';
		default:
			return 'default';
	}
};

// Format timestamp to relative time
export const formatRelativeTime = (timestamp: string) => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const formatDate = (date: Date, showTime: boolean = true): string => {
	const month = date.toLocaleDateString('en-US', { month: 'short' });
	const day = date.getDate();
	const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
	return `${month} ${day} ${showTime ? ', ' + time : ''}`;
};

/**
 * Formats a birth date as "MMM dd, yyyy" (e.g., Jan 01, 2000).
 * Returns 'N/A' if input is invalid.
 * @param date Date object or date string
 */
export function formatDateNice(date: Date | string | null | undefined): string {
	if (!date) return 'N/A';
	const d = typeof date === 'string' ? new Date(date) : date;
	if (isNaN(d.getTime())) return 'N/A';
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
	});
}

// Utility to make transaction type readable
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
	deposit: 'Deposit',
	withdrawal: 'Withdrawal',
	investment: 'Savings',
	investment_profit_withdrawal: 'Savings Target',
	referral_bonus: 'Referral Bonus',
	fee: 'Fee',
	penalty: 'Penalty',
	promo_bonus: 'Promo Bonus',
	refund: 'Refund',
	payout: 'Payout',
	wallet_debit_admin: 'Debit (Admin)',
	wallet_credit_admin: 'Credit (Admin)',
	deposit_fee_revenue: 'Deposit Fee',
	withdrawal_fee_revenue: 'Withdrawal Fee',
	early_withdrawal_penalty_revenue: 'Early Withdrawal Penalty',
	profit_cap_retained_revenue: 'Profit Cap Retained',
	investment_fee_revenue: 'Savings Fee',
	selling_units_fee_revenue: 'Liquidating Savings Fee',
};

export function getTransactionTypeLabel(type: string) {
	return TRANSACTION_TYPE_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function handleFetchErrorMessage(err: { message?: string; detail?: unknown; errors?: any[] } | string | unknown, defaultMessage: string | null = '', JSONErr: string | null = '', redirect: boolean = true): string {
	let errorMessage = defaultMessage || 'An unexpected error occurred.';

	let message: string | undefined;
	let detail: unknown;
	let errors: any[] | undefined;

	if (typeof err === 'string') {
		message = err;
	} else if (typeof err === 'object' && err !== null) {
		if ('message' in err && typeof (err as any).message === 'string') {
			message = (err as any).message;
		}
		if ('detail' in err) {
			detail = (err as any).detail;
		}
		if ('errors' in err && Array.isArray((err as any).errors)) {
			errors = (err as any).errors;
		}
	}

	// If errors array exists, join all error messages
	if (errors && errors.length > 0) {
		const errorMsgs = errors.map((e) => e.message || '').filter(Boolean);
		if (errorMsgs.length > 0) {
			errorMessage = errorMsgs.join('; ');
		}
	}

	if (detail && typeof detail === 'string') message = detail;

	if (message) {
		const lowerMessage = message.toLowerCase();

		if (lowerMessage.includes('violates foreign key constraint')) {
			errorMessage = 'This action cannot be completed because it is linked to other records. Please resolve related data first or contact support.';
		} else if (lowerMessage.includes('failed to fetch')) {
			errorMessage = 'An error occurred. Please try again later.';
		} else if (lowerMessage.includes('resource not found for')) {
			errorMessage = 'An internal error occurred, please contact support.';
		} else if (err instanceof SyntaxError || lowerMessage.includes('json') || lowerMessage.includes('token')) {
			errorMessage = JSONErr || 'Server unavailable. Please try again later.';
		} else if (!errors || errors.length === 0) {
			errorMessage = message;
		}
	}

	if (errorMessage == 'Not authorized, no authentication cookie found' || errorMessage.includes('no authentication cookie') || errorMessage.includes('No active session found')) {
		errorMessage = 'You session has expired. Please log in again.';
		if (redirect) {
			nProgress.start();
			window.location.reload();
			clearLoggedInAsUser();
		}
	}

	return errorMessage;
}

//truncate function
export function truncateString(str: string, maxLength: number = 20): string {
	if (str.length <= maxLength) return str;
	return str.slice(0, maxLength - 3) + '...';
}

// Helper to map trade status to Badge variant
export function getAgentStatusBadgeVariant(status: P2PTradeStatus): React.ComponentProps<typeof Badge>['variant'] {
	switch (status) {
		case 'completed':
			return 'success';
		case 'awaiting_fiat_payment':
			return 'warning';
		case 'fiat_payment_confirmed_by_buyer':
		case 'fiat_received_confirmed_by_seller':
		case 'platform_ngn_released':
		case 'dispute_resolved_buyer':
		case 'dispute_resolved_seller':
			return 'info';
		case 'expired':
			return 'secondary';
		case 'cancelled_by_buyer':
		case 'cancelled_by_seller':
		case 'dispute_opened':
			return 'destructive';
		default:
			return 'outline';
	}
}

// Helper: determine the current view and actions based on trade status
export const getTradeViewState = (trade: TradeResponse, isUserFlow: boolean, isExpired: boolean, isAgentFlow: boolean) => {
	if (!trade) return { title: '', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
	switch (trade.status) {
		case 'awaiting_fiat_payment':
			return { title: isUserFlow ? 'Make Payment' : 'Wait for Payment', showTimer: !isExpired, showPayment: isUserFlow && !isExpired, showCancel: isUserFlow && !isExpired, showDispute: false, showConfirm: false };
		case 'fiat_payment_confirmed_by_buyer':
			return { title: 'Awaiting Confirmation', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		case 'fiat_received_confirmed_by_seller':
			return { title: 'Payment Confirmed', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		case 'platform_ngn_released':
			return { title: 'NGN Released', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		case 'completed':
			return { title: 'Trade Completed', showTimer: false, showPayment: false, showCancel: false, showDispute: true, showConfirm: false };
		case 'expired':
			return { title: 'Expired', showTimer: false, showPayment: false, showCancel: false, showDispute: true, showConfirm: false };
		case 'cancelled_by_buyer':
			return { title: isUserFlow ? 'Cancelled by You' : 'Cancelled by Buyer', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		case 'cancelled_by_seller':
			return { title: isAgentFlow ? 'Cancelled by Seller' : 'Cancelled by You', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		case 'dispute_opened':
			return { title: 'Dispute Opened', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		case 'dispute_resolved_buyer':
		case 'dispute_resolved_seller':
			return { title: 'Dispute Resolved', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
		default:
			return { title: 'Trade Details', showTimer: false, showPayment: false, showCancel: false, showDispute: false, showConfirm: false };
	}
};

export const getTradeDescription = (trade: TradeResponse, isBuyer: boolean, _isAnAgent?: boolean): string =>
	isBuyer
		? trade?.status === 'awaiting_fiat_payment'
			? `Send the exact amount to the agent's account to receive your ${getBaseCurrency()} tokens. \n
			Before sending, confirm that the account name matches the agent's name. For your safety, only chat with the agent through the platform so we can help resolve any issues if needed.`
			: trade?.status === 'fiat_payment_confirmed_by_buyer'
			? "You've marked payment as sent. Please wait for the agent to confirm receipt. If there are issues, use the chat or raise a dispute after the timer expires."
			: trade?.status === 'completed'
			? 'Trade completed. Your assets have been delivered. If you have any issues, you may raise a dispute.'
			: trade?.status === 'expired'
			? 'This trade has expired. If you made payment, please contact support or raise a dispute.'
			: trade?.status?.startsWith('cancelled')
			? 'This trade was cancelled. If this was a mistake, please contact support.'
			: trade?.status?.startsWith('dispute')
			? 'A dispute is open for this trade. Our team will review and contact you.'
			: 'Check the trade status and follow the instructions above.'
		: trade?.status === 'awaiting_fiat_payment'
		? 'Please monitor payment status and confirm receipt as needed. You may also raise a dispute if there is an issue.'
		: trade?.status === 'fiat_payment_confirmed_by_buyer'
		? 'The buyer has marked payment as sent. Please confirm receipt before releasing assets. If you have not received payment, use the chat or raise a dispute.'
		: trade?.status === 'completed'
		? 'Trade completed. Assets have been released. If there are any issues, you may raise a dispute.'
		: trade?.status === 'expired'
		? 'This trade has expired. If you have not received payment, no further action is needed. If you did, please contact support or raise a dispute.'
		: trade?.status?.startsWith('cancelled')
		? 'This trade was cancelled. No further action is required.'
		: trade?.status?.startsWith('dispute')
		? 'A dispute is open for this trade. Our team will review and contact you.'
		: 'Check the trade status and follow the instructions above.';

export function getTradeStatusToast(updatedTrade: { status: string }) {
	const status = updatedTrade.status;
	const statusMap: Record<string, { type: 'success' | 'error'; message: string }> = {
		completed: { type: 'success', message: 'Trade completed successfully.' },
		fiat_payment_confirmed_by_buyer: { type: 'success', message: 'Buyer has confirmed payment.' },
		fiat_received_confirmed_by_seller: { type: 'success', message: 'Seller has confirmed receipt of payment.' },
		platform_ngn_released: { type: 'success', message: 'Funds have been released.' },
		dispute_resolved_buyer: { type: 'success', message: 'Dispute resolved in favor of buyer.' },
		dispute_resolved_seller: { type: 'success', message: 'Dispute resolved in favor of seller.' },
		cancelled_by_buyer: { type: 'error', message: 'Trade was cancelled by the buyer.' },
		cancelled_by_seller: { type: 'error', message: 'Trade was cancelled by the seller.' },
		cancelled: { type: 'error', message: 'Trade was cancelled.' },
		expired: { type: 'error', message: 'Trade has expired.' },
		dispute_opened: { type: 'error', message: 'A dispute has been opened for this trade.' },
	};
	return { status, statusMap };
}

export const positiveTransactionTypes: string[] = ['deposit', 'credit', 'investment_profit_withdrawal', 'unlocked_funds_from_order', 'bonus'];

export function getFieldLabel(paymentMethodId: string, fieldName: string, availableMethods: ApiPaymentMethod[]): string {
	const method = availableMethods.find((m) => m.id === paymentMethodId);
	if (!method) return fieldName;
	try {
		const fields = JSON.parse(method.fields_required) as { name: string; label: string }[];
		return fields.find((f) => f.name === fieldName)?.label || fieldName;
	} catch {
		return fieldName;
	}
}

export function getClientIp(req: NextRequest): string {
	const xff = req.headers.get('x-forwarded-for');
	if (xff) {
		return xff.split(',')[0].trim();
	}

	return req.headers.get('x-real-ip') ?? req.headers.get('cf-connecting-ip') ?? '';
}

export function sanitizeUrl(url: string, base: string): string {
	const cleanBase = base.replace(/\/+$/, '');

	const regex = new RegExp(`(${cleanBase})+`, 'g');

	if (url.startsWith(cleanBase)) {
		return cleanBase + url.slice(cleanBase.length).replace(regex, '');
	}
	return url;
}

export function normalizeUrl(url: string): string {
	return url.replace(/([^:]\/)\/+/g, '$1');
}

export function getCurrencyFromLocalStorage(): { symbol: string; name: string; code: string } | null {
	if (typeof window === 'undefined') return null;
	try {
		const currencyStr = localStorage.getItem('currency');

		if (!currencyStr) return null;
		const currency = JSON.parse(currencyStr);
		if (currency && currency.symbol && currency.name && currency.code) {
			return currency;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Get the base currency from localStorage or fallback to env variable.
 * @returns {string} The base currency code (e.g. 'SKY').
 */
export function getBaseCurrency(): string {
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem('settings');
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.baseCurrency === 'string') {
					return parsed.baseCurrency;
				}
			}
		} catch (e) {
			// ignore JSON parse errors
		}
	}
	return process.env.NEXT_PUBLIC_BASE_CURRENCY || '';
}

/**
 * Get the application name from localStorage or fallback to empty string.
 * @returns {string} The application name (e.g. 'SikkySix').
 */
export function getPlatformName(): string {
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem('settings');
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.name === 'string') {
					return parsed.name;
				}
			}
		} catch (e) {
			// ignore JSON parse errors
		}
	}
	return process.env.NEXT_PUBLIC_NAME || '';
}

/**
 * Get the base currency rate from localStorage or fallback to 1.
 * @returns {number} The base currency rate (e.g. 1.1).
 */
export function getBaseCurrencyRate(): number {
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem('settings');
			if (raw) {
				const parsed = JSON.parse(raw);
				const rate = typeof parsed?.rate === 'string' ? parseFloat(parsed.rate) : parsed?.rate;
				if (!isNaN(rate) && typeof rate === 'number') {
					return rate;
				}
			}
		} catch (e) {
			// ignore JSON parse errors
		}
	}
	return 1;
}

export function getCategoryDisplayStatus(cat: Category): 'Active' | 'Locked' | 'Not Launched' {
	if (cat.is_locked) return 'Locked';
	if (cat.is_launched === false) return 'Not Launched';
	return 'Active';
}
export function getCategoryButtonText(status: string): string {
	switch (status) {
		case 'Locked':
			return 'Club Locked';
		case 'Not Launched':
			return 'Coming Soon';
		case 'Active':
		default:
			return 'View Club';
	}
}

/**
 * Get the currency symbol from localStorage or fallback to empty string.
 * @returns {string} The currency symbol (e.g. '₦', '₵').
 */
export function getCurrencySymbol(): string {
	if (typeof window !== 'undefined') {
		try {
			const currencyStr = localStorage.getItem('currency');
			if (!currencyStr) return '';
			const currency = JSON.parse(currencyStr);
			if (currency && typeof currency.symbol === 'string') {
				return currency.symbol;
			}
		} catch {
			// ignore JSON parse errors
		}
	}
	return '';
}

export function getLoggedInAsUser() {
	if (typeof window !== 'undefined') {
		try {
			const isLoggedInAsUserStr = localStorage.getItem('sb-api-auth-token');
			if (!isLoggedInAsUserStr) return false;
			const isLoggedInAsUser = JSON.parse(isLoggedInAsUserStr);
			return isLoggedInAsUser;
		} catch {
			// ignore JSON parse errors
		}
	}
	return false;
}

export function getSetCookie() {
	if (typeof window !== 'undefined') {
		try {
			const isCookieSet = localStorage.getItem('sb-auth-cookie-set');
			if (!isCookieSet) return false;
			return JSON.parse(isCookieSet);
		} catch {}
	}
	return false;
}

export function clearLoggedInAsUser(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('sb-api-auth-token');
		localStorage.removeItem('sb-auth-cookie-set');
	}
}

export function setLoggedInAsUser(): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem('sb-auth-cookie-set', JSON.stringify(false));
		localStorage.setItem('sb-api-auth-token', JSON.stringify({}));
	}
}

export const convertCurrency = (amount: number): string => formatCurrency(amount * getBaseCurrencyRate());
