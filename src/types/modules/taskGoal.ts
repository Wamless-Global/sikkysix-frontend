import { Investment } from './investments';

export interface Goal {
	id: string;
	item_description: string;
	target_amount: number;
	target_date: string;
	is_completed?: boolean;
}

export interface Winner {
	id: string;
	name: string;
	photo_url: string;
	prize_description: string;
}

export interface Task {
	id: string;
	title: string;
	reward: string;
	instruction: string;
}

export interface InvestmentResponse {
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
