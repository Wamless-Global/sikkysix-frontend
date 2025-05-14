import { ReactNode } from 'react';

export type Role = 'user' | 'figure-head' | 'agent' | 'admin';

// Define User Status type and constants
export type UserStatus = 'Active' | 'Suspended' | 'Deleted';
export type EmailStatus = 'Active' | 'Inactive';

// Define User Data Structure
export type User = {
	id: string;
	name: string;
	username: string;
	email: string;
	profilePictureUrl?: string | null;
	roles: Role[];
	registrationDate: string;
	investmentCount: number;
	totalInvested: number;
	email_status: EmailStatus;
	status: UserStatus;
	country: string;
	phone_number?: string | null;
	is_active: boolean;
	telegram_user_id?: string | null;
	last_login?: string | null; // Consider changing to Date object later
	referral_code?: string | null;
	referred_by_user_id?: string | null;
	wallet_balance?: number;
};

export interface UserUpdateDataPayload {
	id: string;
	name: string;
	username: string;
	email: string;
	profilePictureUrl?: string | null;
	roles: Role[];
	registrationDate: string;
	investmentCount: number;
	totalInvested: number;
	email_status: EmailStatus;
	status: UserStatus;
	country: string;
	phone_number?: string | null;
	is_active: boolean;
	telegram_user_id?: string | null;
	last_login?: string | null;
	referral_code?: string | null;
	referred_by_user_id?: string | null;
	wallet_balance?: number;
}

// Define the overall structure of the user update API response
export interface UserUpdateApiResponse {
	status: string;
	message: string;
	data?: UserUpdateDataPayload;
}

// Define Authenticated User Data Structure (from login response)
export interface AuthenticatedUser {
	id: string;
	name: string;
	email: string;
	profilePictureUrl: string | null;
	roles: Role[]; // Array of roles
	registrationDate: string;
	investmentCount: number;
	totalInvested: number;
	wallet_balance: number;
	status: UserStatus | null;
	country: string | null;
	accountBalance?: number;
	isEmailVerified?: boolean;
}

export interface UserFilters {
	searchTerm?: string;
	role?: Role | 'all';
	status?: UserStatus | 'all';
	country?: string | 'all';
	startDate?: string;
	endDate?: string;
}

export interface ApiUserData {
	users: User[];
	hasMore: boolean;
	nextPage: number | null;
	totalCount: number;
}

export interface FetchUsersApiResponse {
	status: string;
	data: ApiUserData;
}

export interface UserContextType {
	users: User[];
	isLoading: boolean;
	totalCount: number;
	activeFilters: UserFilters;
	getUserById: (id: string) => User | undefined;
	getUserByUsername: (username: string) => User | undefined;
	fetchUsers: (filters: UserFilters, page?: number) => Promise<void>;
}

export interface UserProviderProps {
	children: ReactNode;
}
