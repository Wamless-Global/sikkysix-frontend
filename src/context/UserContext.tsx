'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
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

// Define the shape of the API response
interface FetchUsersResponse {
	users: User[];
	totalCount: number; // Total number of users matching the filters
}

// Define the shape of the context value
interface UserContextType {
	users: User[];
	isLoading: boolean;
	totalCount: number; // Total count from the last API fetch
	activeFilters: UserFilters; // Store the filters used for the current user list
	getUserById: (id: string) => User | undefined;
	updateUserStatus: (id: string, status: UserStatus) => void; // Will need API call later
	updateUserRole: (id: string, role: Role) => void; // Will need API call later
	deleteUser: (id: string) => void; // Will need API call later
	updateUserProfile: (id: string, updatedData: Partial<User>) => Promise<void>; // Will need API call later
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
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [totalCount, setTotalCount] = useState<number>(0); // Initialize total count
	const [activeFilters, setActiveFilters] = useState<UserFilters>({}); // Store current filters

	// --- MOCK API CALL ---
	// Replace this with your actual API fetching logic
	const mockFetchUsersApi = async (filters: UserFilters, page: number, pageSize: number): Promise<FetchUsersResponse> => {
		console.log('Mock API Call: Fetching users with filters:', filters, 'Page:', page);
		await new Promise((resolve) => setTimeout(resolve, 750)); // Simulate network delay

		// --- Start Mock Data Generation (Replace with actual API data) ---
		// This is just placeholder logic. Your API will handle filtering and pagination.
		const allPossibleUsers: User[] = Array.from({ length: 55 }, (_, i) => {
			const email = `user${i + 1}@example.com`;
			return {
				id: `usr_${i + 1}`, // Use consistent ID format
				name: `User Name ${i + 1}`,
				email: email,
				roles: ALL_ROLES[i % ALL_ROLES.length], // Use valid roles cyclically
				registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date in last 30 days
				investmentCount: Math.floor(Math.random() * 10),
				totalInvested: Math.floor(Math.random() * 50000),
				status: ALL_STATUSES[i % ALL_STATUSES.length], // Use valid statuses cyclically
				country: ALL_COUNTRIES[i % ALL_COUNTRIES.length], // Use consistent countries
				profilePictureUrl: `https://avatar.vercel.sh/${email}.png?size=40`, // Consistent avatar URL
				// Optional fields from previous mock - keep if needed by User type, otherwise remove
				// lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
				// bio: `Bio for User ${i + 1}`,
				// phone: `+12345678${String(i).padStart(2, '0')}`,
			};
		});

		// Basic filtering simulation (replace with API logic)
		const filtered = allPossibleUsers.filter((user) => {
			const matchesSearch = !filters.searchTerm || user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) || user.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
			const matchesRole = !filters.role || filters.role === 'all' || user.roles === filters.role;
			const matchesStatus = !filters.status || filters.status === 'all' || user.status === filters.status;
			// Add country/date filtering simulation if needed
			return matchesSearch && matchesRole && matchesStatus;
		});

		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const paginatedUsers = filtered.slice(startIndex, endIndex);
		const totalFilteredCount = filtered.length; // Get total count matching filters
		// --- End Mock Data Generation ---

		return {
			users: paginatedUsers,
			totalCount: totalFilteredCount, // Return total count
		};
	};
	// --- END MOCK API CALL ---

	const fetchUsers = useCallback(async (filters: UserFilters, page: number = 1, pageSize: number = 10) => {
		setIsLoading(true);
		// Only update activeFilters if it's a new filter request (page 1)
		if (page === 1) {
			setActiveFilters(filters);
		}
		try {
			// Use the currently active filters for subsequent page loads
			const filtersToUse = page === 1 ? filters : activeFilters;
			const response = await mockFetchUsersApi(filtersToUse, page, pageSize);
			// Always replace the users state with the newly fetched page's data
			setUsers(response.users);
			setTotalCount(response.totalCount); // Set total count from response
		} catch (error) {
			console.error('Failed to fetch users:', error);
			setTotalCount(0); // Reset count on error
			// Handle error state if needed (e.g., show error message)
		} finally {
			setIsLoading(false);
		}
	}, []); // No dependencies needed for mock, add actual API client if used

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

	// --- Placeholder functions - Need API integration ---
	const updateUserStatus = useCallback(async (id: string, status: UserStatus) => {
		console.log(`TODO: API call to update status for ${id} to ${status}`);
		// Optimistic update (optional)
		setUsers((prevUsers) => prevUsers.map((user) => (user.id === id ? { ...user, status } : user)));
		// Simulate API call
		// try { await api.updateUser(id, { status }); } catch { // revert }
	}, []);

	const updateUserRole = useCallback(async (id: string, role: Role) => {
		console.log(`TODO: API call to update role for ${id} to ${role}`);
		setUsers((prevUsers) => prevUsers.map((user) => (user.id === id ? { ...user, role } : user)));
	}, []);

	const deleteUser = useCallback(async (id: string) => {
		console.log(`TODO: API call to delete user ${id}`);
		setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
	}, []);

	const updateUserProfile = useCallback(async (id: string, updatedData: Partial<User>) => {
		console.log(`TODO: API call to update profile for ${id}`, updatedData);
		setUsers((prevUsers) => prevUsers.map((user) => (user.id === id ? { ...user, ...updatedData } : user)));
	}, []);
	// --- End Placeholder functions ---

	// Value provided by the context
	const value = {
		users,
		isLoading,
		totalCount, // Expose totalCount
		activeFilters,
		getUserById,
		updateUserStatus,
		updateUserRole,
		deleteUser,
		updateUserProfile,
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
