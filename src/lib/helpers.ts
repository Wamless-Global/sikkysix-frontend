export const generateSlug = (name: string) => (name ? name.toLowerCase().replace(/\s+/g, '-') : '');

export const formatNaira = (amount: number | null | undefined): string => {
	if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
	return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const formatNumber = (amount: number | undefined | null, options?: Intl.NumberFormatOptions): string => {
	if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
	return new Intl.NumberFormat('en-US', options).format(amount);
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
