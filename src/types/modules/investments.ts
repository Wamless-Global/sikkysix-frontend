export type InvestmentType = 'active' | 'withdrawn' | 'penalized';

export interface Investment {
	id: string;
	user_id: string;
	category_id: string;
	amount_invested: number;
	units_purchased: number;
	price_per_unit_at_investment: number;
	status: 'active' | 'completed' | 'withdrawn' | 'cancelled';
	target_profit_multiplier_at_investment: number;
	is_reinvestment: boolean;
	original_investment_id: string | null;
	updated_at: string | null;
	created_at: string;
	current_value: number;
	profit: number;
	percentage_change: number;
	progress_percentage: number;
	target_total_value: number;
	target_profit_amount: number;
	cancelled: boolean;
	completed: boolean;
	ticker: string;
	current_price?: number;
	details: InvestmentDetails;
}

export interface InvestmentDetails {
	realized_value: number;
	sold_at: number;
	fees_paid: number;
	initial_units_purchased: number;
}

export interface InvestmentsResponse {
	status: string;
	data: {
		investments: Investment[];
		hasMore: boolean;
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

export interface SingleInvestmentResponse {
	status: string;
	data: {
		investment: Investment;
	};
}

export interface WithdrawalPreviewResponse {
	units_to_withdraw: number;
	raw_value_from_pool: number;
	value_after_profit_cap: number;
	is_early_withdrawal: boolean;
	target_reached_for_units: boolean;
	penalty: {
		type_applied: 'percentage_fee' | 'forfeit_profit' | null;
		description: string;
		amount_deducted: number;
	} | null;
	estimated_net_amount_to_user: number;
	current_market_price_per_unit: number;
	fee: number;
}

export interface WithdrawalConfirmResponse {
	message: string;
	credited_to_wallet: number;
	units_withdrawn: number;
	remaining_units: number;
	investment_status: 'active' | 'withdrawn';
	transaction_id: string;
	breakdown: {
		raw_amount_from_amm: number;
		amount_after_profit_cap: number;
		profit_capped_off_amount: number;
		is_early_withdrawal: boolean;
		penalty_type_applied: 'percentage_fee' | 'forfeit_profit' | null;
		penalty_amount_deducted: number;
	};
}
