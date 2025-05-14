export type AmmModelType = 'adjusted_l_s' | 'constant_product' | 'linear_bonding_curve' | 'exponential_bonding_curve';

export interface AdjustedLSParams {
	deposit_impact_factor: number;
	withdrawal_impact_factor: number;
	base_starting_price: number;
}

export interface ConstantProductParams {
	initial_virtual_currency: number;
	initial_virtual_unit: number;
}

export interface LinearBondingCurveParams {
	slope_m: number;
	intercept_b: number;
}

export interface ExponentialBondingCurveParams {
	coefficient_a: number;
	exponent_n: number;
	base_price_b: number;
}

export type AmmParameters = AdjustedLSParams | ConstantProductParams | LinearBondingCurveParams | ExponentialBondingCurveParams;

export interface Category {
	id: string;
	name: string;
	description?: string | null;
	ticker: string;
	is_locked: boolean;
	is_launched?: boolean;
	current_price_per_unit: number;
	quantity: number;
	total_liquidity: number;
	admin_target_multiplier?: number | null;
	created_by_admin_id: string;
	updated_at?: string | null;
	created_at: string;
	image?: string | null;
	fee?: number | null;
	volatility_factor?: number | null;
	circulating_supply?: number;
	market_cap?: number;
	holders?: number;
	price_change_24h?: number;
	price_change_7d?: number;
	price_change_30d?: number;
	volume_24h?: number;
	minimum_investable: number;
	maximum_investable: number;
	amm_model_type: AmmModelType;
	amm_parameters: AmmParameters;
}

export interface AMSParams {
	deposit_impact_factor?: number;
	withdrawal_impact_factor?: number;
	base_starting_price?: number;
	initial_virtual_currency?: number;
	initial_virtual_unit?: number;
	slope_m?: number;
	intercept_b?: number;
	coefficient_a?: number;
	exponent_n?: number;
	base_price_b?: number;
}

export interface SingleCategoryResponse {
	status: string;
	data: Category;
}

// API response structure for paginated data
export interface ApiCategoriesData {
	categories: Category[];
	hasMore: boolean;
	currentPage: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

export interface PaginatedCategoriesResponse {
	status: string;
	data: ApiCategoriesData;
}

// Define API response structure
export interface UserSingleCategoryResponse {
	status: 'success' | 'error';
	data: Category | null | string;
	message?: string;
}

// Interface for the API response structure
export interface ApiCategoriesResponse {
	status: string;
	data: {
		categories: Category[];
		hasMore: boolean;
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
}

// Interface for the category data transformed for display by DashboardCard
export interface UserDisplayCategory {
	id: string;
	slug: string;
	title: string;
	image?: string | null;
	minimum: string;
	buttonText: string;
	buttonEnabled: boolean;
	description?: string | null;
}
