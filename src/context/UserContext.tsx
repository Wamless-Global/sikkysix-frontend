'use client';

import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Role, UserStatus, ALL_ROLES, ALL_STATUSES, ALL_COUNTRIES } from '@/lib/userUtils'; // Import ALL_ROLES, ALL_STATUSES, ALL_COUNTRIES

// Define the shape of filters for the API
export interface UserFilters {
	searchTerm?: string;
	role?: Role | 'all';
	status?: UserStatus | 'all';
	country?: string | 'all';
	startDate?: string;
	endDate?: string;
}

// Define the shape of the actual API response data
interface ApiUserData {
	users: User[];
	hasMore: boolean; // Indicates if there are more pages
	nextPage: number | null; // Next page number, or null if none
	totalCount: number; // Total number of users matching the filters
}

// Define the shape of the full API response envelope
interface FetchUsersApiResponse {
	status: string; // e.g., "success"
	data: ApiUserData;
}

// Define the shape of the context value
interface UserContextType {
	users: User[];
	isLoading: boolean;
	totalCount: number; // Total count from the last API fetch
	activeFilters: UserFilters; // Store the filters used for the current user list
	getUserById: (id: string) => User | undefined;
	getUserByUsername: (username: string) => User | undefined; // Add function to get user by username
	fetchUsers: (filters: UserFilters, page?: number) => Promise<void>; // Function to fetch/refetch users
}

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the props for the provider component
interface UserProviderProps {
	children: ReactNode;
}

// Create the provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [totalCount, setTotalCount] = useState<number>(0); // Initialize total count
	const [activeFilters, setActiveFilters] = useState<UserFilters>({}); // Store current filters

	// --- Live API Call ---
	const fetchUsers = useCallback(async (filters: UserFilters, page: number = 1) => {
		setIsLoading(true);
		// Update activeFilters whenever filters change (primarily for display/debugging)
		// This happens *before* the fetch, so it doesn't cause re-renders during fetch
		setActiveFilters(filters);

		try {
			// Construct the API URL with query parameters directly from the passed 'filters'
			const params = new URLSearchParams();
			params.append('page', page.toString());
			// Add other filters if they are set and not 'all' or empty
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
				// Handle non-successful responses (e.g., 4xx, 5xx)
				const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
				throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData?.message || 'Unknown error'}`);
			}

			const result: FetchUsersApiResponse = await response.json();

			if (result.status !== 'success') {
				throw new Error(`API returned non-success status: ${result.status}`);
			}

			// Update state with data from the API response
			setUsers(result.data.users);
			setTotalCount(result.data.totalCount);
		} catch (error) {
			setUsers([]); // Clear users on error
			setTotalCount(0); // Reset count on error

			// Check for JSON parsing errors specifically
			if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
				const specificError = new Error('Server unavailable or returned an invalid response. Please try again later.');
				toast.error(specificError.message); // Use toast
				// Optionally re-throw if needed: throw specificError;
			} else if (error instanceof Error) {
				// Handle other standard errors
				toast.error(`Error fetching users: ${error.message}`); // Use toast
				// Optionally re-throw if needed: throw error;
			} else {
				// Handle non-Error objects caught
				toast.error('An unknown error occurred while fetching users.'); // Use toast
				// Optionally re-throw a generic error: throw new Error('An unknown error occurred');
			}
			// No throw here by default, as the page might just show "No users found" which could be acceptable.
		} finally {
			setIsLoading(false);
		}
	}, []); // No dependencies needed now, relies only on passed arguments

	// Fetch initial users on mount
	useEffect(() => {
		fetchUsers({}, 1); // Fetch page 1 with no filters initially
	}, [fetchUsers]);

	const getUserById = useCallback(
		(id: string): User | undefined => {
			// This still works on the currently loaded users.
			// For a full solution, might need a separate API call if user isn't loaded.
			return users.find((user) => user.id === id);
		},
		[users]
	);

	const getUserByUsername = useCallback(
		(username: string): User | undefined => {
			// Finds user by username in the currently loaded list
			return users.find((user) => user.username === username);
		},
		[users]
	);

	// Value provided by the context
	const value = {
		users,
		isLoading,
		totalCount, // Expose totalCount
		activeFilters,
		getUserById,
		getUserByUsername, // Add the new function to the context value
		fetchUsers,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the UserContext
export const useUserContext = (): UserContextType => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUserContext must be used within a UserProvider');
	}
	return context;
};
