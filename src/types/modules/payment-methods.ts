export interface P2PMethod {
	id: string | number;
	name: string;
	description?: string;
	country_code: string;
	logo_url?: string;
	fields_required?: string;
	is_active: boolean;
}

export interface PaymentMethod {
	id: string;
	type: string;
	details: string;
}

export interface ApiPaymentMethod {
	id: string;
	name: string;
	description: string;
	country_code: string;
	logo_url: string;
	fields_required: string;
	is_active: boolean;
	updated_at: string | null;
	created_at: string;
}
