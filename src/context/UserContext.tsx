'use client';

import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Role, UserStatus, ALL_ROLES, ALL_STATUSES, ALL_COUNTRIES } from '@/lib/userUtils';

export interface UserFilters {
	searchTerm?: string;
	role?: Role | 'all';
	status?: UserStatus | 'all';
	country?: string | 'all';
	startDate?: string;
	endDate?: string;
}

interface ApiUserData {
	users: User[];
	hasMore: boolean;
	nextPage: number | null;
	totalCount: number;
}

interface FetchUsersApiResponse {
	status: string;
	data: ApiUserData;
}

interface UserContextType {
	users: User[];
	isLoading: boolean;
	totalCount: number;
	activeFilters: UserFilters;
	getUserById: (id: string) => User | undefined;
	getUserByUsername: (username: string) => User | undefined;
	fetchUsers: (filters: UserFilters, page?: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [activeFilters, setActiveFilters] = useState<UserFilters>({});

	const fetchUsers = useCallback(async (filters: UserFilters, page: number = 1) => {
		setIsLoading(true);
		setActiveFilters(filters);

		try {
			const params = new URLSearchParams();
			params.append('page', page.toString());
			if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
			if (filters.role && filters.role !== 'all') params.append('role', filters.role);
			if (filters.status && filters.status !== 'all') params.append('status', filters.status);
			if (filters.country && filters.country !== 'all') params.append('country', filters.country);
			if (filters.startDate) params.append('startDate', filters.startDate);
			if (filters.endDate) params.append('endDate', filters.endDate);

			const apiUrl = `/api/admin/users/all?${params.toString()}`;

			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
				throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData?.message || 'Unknown error'}`);
			}

			const result: FetchUsersApiResponse = await response.json();

			if (result.status !== 'success') {
				throw new Error(`API returned non-success status: ${result.status}`);
			}

			setUsers(result.data.users);
			setTotalCount(result.data.totalCount);
		} catch (error) {
			setUsers([]);
			setTotalCount(0);

			if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
				const specificError = new Error('Server unavailable or returned an invalid response. Please try again later.');
				toast.error(specificError.message);
			} else if (error instanceof Error) {
				toast.error(`Error fetching users: ${error.message}`);
			} else {
				toast.error('An unknown error occurred while fetching users.');
			}
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUsers({}, 1);
	}, [fetchUsers]);

	const getUserById = useCallback(
		(id: string): User | undefined => {
			return users.find((user) => user.id === id);
		},
		[users]
	);

	const getUserByUsername = useCallback(
		(username: string): User | undefined => {
			return users.find((user) => user.username === username);
		},
		[users]
	);

	const value = {
		users,
		isLoading,
		totalCount,
		activeFilters,
		getUserById,
		getUserByUsername,
		fetchUsers,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextType => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUserContext must be used within a UserProvider');
	}
	return context;
};
