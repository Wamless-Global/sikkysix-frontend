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

// Types based on API response
export interface ApiTransaction {
	id: string;
	user_id: string;
	category_id: string;
	type: string;
	amount: number;
	status: 'completed' | 'pending' | string;
	created_at: string;
	updated_at: string;
}

export interface TransactionApiResponse {
	status: string;
	data: {
		transactions: ApiTransaction[];
		hasMore: boolean;
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

// For UI display
export interface AccountTransaction {
	id: string;
	type: string;
	date: Date;
	amount: number;
	status: 'Completed' | 'Pending' | string;
	originalType: string;
}
