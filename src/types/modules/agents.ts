export interface Agent {
	id: string; // agent uuid
	user_id: string; // user uuid
	application_id: string; // application uuid
	is_active: boolean;
	availability_status: 'available' | 'offline' | 'busy';
	total_trades_completed: string; // API returns text, convert to number for display
	total_volume_traded_ngn: string; // API returns text, convert to number for display
	positive_feedback_count: string; // API returns text
	negative_feedback_count: string; // API returns text
	avg_payment_time_minutes: string | null; // API returns text
	avg_release_time_minutes: string | null; // API returns text
	last_seen_online: string | null; // timestamp with time zone
	updated_at: string | null; // timestamp with time zone
	account_details: any; // jsonb
	created_at: string; // timestamp with time zone
	user: {
		id: string; // user uuid
		name: string;
		email: string;
		avatar_url?: string;
	};
	rating: number; // Added rating property
}

// Define AgentFilters type based on API endpoint parameters
export interface AgentFilters {
	searchTerm?: string;
	availability_status?: 'available' | 'offline' | 'busy';
	is_active?: boolean;
	minTrades?: number;
	maxTrades?: number;
	minVolume?: number;
	maxVolume?: number;
}

// AgentType interface for component usage
export interface AgentType {
	id: string;
	name: string;
	avatar_url?: string;
	transactions: number;
	completionRate: number;
	rateNGN: number;
	rating: number; // Now typed as number, not placeholder
}
