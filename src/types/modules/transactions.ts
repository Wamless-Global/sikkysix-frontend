// export type Transaction = {
// 	id: string;
// 	timestamp: string;
// 	maskedInvestorId: string;
// 	type: 'Deposit' | 'Withdrawal' | 'Profit Share' | string; // Allow for other types
// 	amount: number; // Amount in native currency
// 	currency: string; // Native currency symbol (e.g., sETH, sBTC)
// 	usdValue?: number; // Optional: Equivalent value in USD
// 	status: 'Completed' | 'Pending' | 'Failed' | string; // Allow for other statuses
// };

export interface TransactionHistoryTableProps {
	transactions: Transaction[];
	showMyTransactionsToggle?: boolean; // To show "View My Transactions Only"
	currentUserId?: string; // For filtering "My Transactions"
}

export type TransactionStatus = 'Completed' | 'Pending' | 'Rejected' | 'Processing';
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Fee' | 'Investment' | 'Referral Bonus';
export type TransactionMethod = 'Bank Transfer' | 'Crypto' | 'Platform';

export type Transaction = {
	id: string;
	userId: string;
	userName: string;
	type: TransactionType;
	method?: TransactionMethod;
	amount: number;
	currency: string;
	date: string;
	status: TransactionStatus;
	details?: string;
	maskedInvestorId: string;
	timestamp: string;
	usdValue?: number; // Optional: Equivalent value in USD
};

export type SortableTransactionKeys = 'date' | 'userName' | 'type' | 'amount' | 'status';

export interface TransactionHistoryTableProps {
	transactions: Transaction[];
	isLoading: boolean;
	currentPage: number;
	totalPages: number;
	totalCount: number;
	onPageChange: (page: number) => void;
	sortColumn: SortableTransactionKeys | null;
	sortDirection: 'asc' | 'desc';
	onSort: (column: SortableTransactionKeys) => void;
	loadingButton?: 'previous' | 'next' | null;
}
