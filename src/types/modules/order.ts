// Order type definition
export interface Order {
	id: string;
	agent_id?: string;
	order_type: 'BUY_PLATFORM_CURRENCY' | 'SELL_PLATFORM_CURRENCY';
	fiat_currency: string;
	asset_currency: string;
	total_asset_amount: string;
	order_fee: string;
	payment_window_minutes: string;
	order_terms: string;
	status: 'active' | 'paused';
	created_at: string;
}
