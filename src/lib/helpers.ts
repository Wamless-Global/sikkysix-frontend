import { AccountStatus, EmailStatus, Transaction, UserStatus } from '@/types';

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
export const formatCurrency = (amount: number | null | undefined): string => {
	if (amount === null || amount === undefined || isNaN(amount)) {
		// Return $0.00 for invalid inputs in a currency context
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(0);
	}
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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

export const getStatusBadgeVariant = (status: Transaction['status']): 'secondary' | 'destructive' | 'outline' | 'default' | 'error' | 'active' | 'completed' | null | undefined => {
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
export function formatFullDate(date: Date | string | null | undefined): string {
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
	investment: 'Investment',
	investment_profit_withdrawal: 'Investment Profit',
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
	investment_fee_revenue: 'Investment Fee',
	selling_units_fee_revenue: 'Selling Shares Fee',
};

export function getTransactionTypeLabel(type: string) {
	return TRANSACTION_TYPE_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function handleFetchErrorMessage(err: { message?: string; detail?: unknown } | string | unknown, defaultMessage: string | null = '', JSONErr: string | null = ''): string {
	let errorMessage = defaultMessage || 'An unexpected error occurred.';
	console.log(err);

	let message: string | undefined;
	let detail: unknown;

	if (typeof err === 'string') {
		message = err;
	} else if (typeof err === 'object' && err !== null) {
		if ('message' in err && typeof (err as any).message === 'string') {
			message = (err as any).message;
		}
		if ('detail' in err) {
			detail = (err as any).detail;
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
		} else {
			errorMessage = message;
		}
	}

	return errorMessage;
}
