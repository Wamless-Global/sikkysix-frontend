export type P2PTradeStatus = 'awaiting_fiat_payment' | 'fiat_payment_confirmed_by_buyer' | 'fiat_received_confirmed_by_seller' | 'platform_ngn_released' | 'completed' | 'cancelled_by_buyer' | 'cancelled_by_seller' | 'dispute_opened' | 'dispute_resolved_buyer' | 'dispute_resolved_seller' | 'expired';

export interface TradeUser {
	id: string;
	name: string;
	email: string;
	phone?: string | null;
}

export interface TradeInitiatorUser {
	id: string;
	name: string;
	email: string;
}

export interface TradeAgentDetails {
	id: string;
	name: string;
	email: string;
}

export interface TradePaymentMethod {
	id: string;
	name: string;
	description: string;
	details: string;
}

export interface TradeAgentPaymentOption {
	agent_id: string;
	payment_method_id: string;
	account_details: Record<string, string>;
	is_active: boolean;
	updated_at: string | null;
	created_at: string;
	id: string;
	payment_method: TradePaymentMethod;
}

export interface TradeResponse {
	id: string;
	order_id: string;
	order_creator_id: string;
	trade_initiator_id: string;
	platform_currency_amount: string;
	fiat_amount: string;
	price_per_unit: string;
	selected_agent_payment_option_id: string;
	buyer_id: string;
	seller_id: string;
	status: P2PTradeStatus;
	payment_proof_url: string | null;
	fiat_paid_at: string | null;
	fiat_confirmed_received_at: string | null;
	platform_currency_released_at: string | null;
	expires_at: string;
	updated_at: string | null;
	created_at: string;
	escrow_transaction_id: string;
	selected_agent_payment_option: TradeAgentPaymentOption;
	buyer_user: TradeUser;
	seller_user: TradeUser;
	initiator_user: TradeInitiatorUser;
	agent_details: TradeAgentDetails;
	fee: string | null;
	asset_currency: string;
	fiat_currency?: string;
}

export interface TradeApiResponse {
	status: string;
	data: TradeResponse;
}
