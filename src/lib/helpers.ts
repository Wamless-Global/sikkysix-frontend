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
