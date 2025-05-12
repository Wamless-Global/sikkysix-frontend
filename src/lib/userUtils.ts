import { toast } from 'sonner';
// Define Role type
export type Role = 'user' | 'figure-head' | 'agent' | 'admin';
export const ALL_ROLES: Role[] = ['user', 'figure-head', 'agent', 'admin'];

// Define User Status type and constants
export type UserStatus = 'Active' | 'Suspended' | 'Deleted';
export type EmailStatus = 'Active' | 'Inactive';
export const ALL_EMAIL_STATUSES: EmailStatus[] = ['Active', 'Inactive'];
export const ALL_STATUSES: UserStatus[] = ['Active', 'Suspended', 'Deleted'];

// Define Country constants
export const ALL_COUNTRIES = ['Nigeria', 'USA', 'UK', 'Ghana', 'Canada']; // Assuming these are all possible countries for now

// Define User Data Structure
export type User = {
	id: string;
	name: string;
	username: string;
	email: string;
	profilePictureUrl?: string | null; // Allow null explicitly
	roles: Role[];
	registrationDate: string; // Consider changing to Date object later if needed
	investmentCount: number;
	totalInvested: number;
	email_status: EmailStatus;
	status: UserStatus;
	country: string;
	// Added fields for User Detail Page
	phone_number?: string | null;
	is_active: boolean; // Assuming this is non-nullable based on requirement
	telegram_user_id?: string | null;
	last_login?: string | null; // Consider changing to Date object later
	referral_code?: string | null;
	referred_by_user_id?: string | null;
	wallet_balance?: number; // Added based on AuthenticatedUser and potential need
};
// Define the structure of the 'data' object in the user update API response
// Should mirror the User type for consistency when API returns the updated user
interface UserUpdateDataPayload {
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
	// Added fields
	phone_number?: string | null;
	is_active: boolean;
	telegram_user_id?: string | null;
	last_login?: string | null;
	referral_code?: string | null;
	referred_by_user_id?: string | null;
	wallet_balance?: number;
}

// Define the overall structure of the user update API response
interface UserUpdateApiResponse {
	status: string; // e.g., "success"
	message: string;
	data?: UserUpdateDataPayload; // The actual user data
}

// Helper function to determine badge variant based on status
export const getEmailStatusVariant = (status: EmailStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
	switch (status) {
		case 'Active':
			return 'default';
		case 'Inactive':
			return 'destructive';
		default:
			return 'outline';
	}
};

// Helper function to determine badge variant based on status
export const getStatusVariant = (status: UserStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
	switch (status) {
		case 'Active':
			return 'default';
		case 'Suspended':
			return 'destructive';
		default:
			return 'outline';
	}
};

// Define Authenticated User Data Structure (from login response)
// Matches the structure within the `data.user` field of the API response
export interface AuthenticatedUser {
	id: string;
	name: string;
	email: string;
	profilePictureUrl: string | null; // Allow null
	roles: Role[]; // Array of roles
	registrationDate: string; // Assuming string representation of date
	investmentCount: number;
	totalInvested: number;
	wallet_balance: number;
	status: UserStatus | null; // Allow null
	country: string | null; // Allow null
	accountBalance?: number; // Optional: User's current account balance
	isEmailVerified?: boolean; // Added for email verification status
}

// --- NEW Centralized Function ---
/**
 * Fetches a single user from the backend API by username.
 * @param username The username of the user to fetch.
 * @returns A Promise resolving to the User object if found, or null if not found or an error occurs.
 */
export const fetchUserByUsername = async (username: string): Promise<User | null> => {
	if (!username) {
		console.error('fetchUserByUsername called with no username.');
		return null;
	}

	// TODO: Confirm backend base URL if needed (e.g., from env var)
	const targetUrl = `/api/admin/users/username/${username}`;

	try {
		// console.log(`Fetching user ${username} directly from backend: ${targetUrl}`); // Debug log
		const response = await fetch(targetUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				// Add Authorization or other necessary headers if required by your backend
			},
			credentials: 'include', // Include if your backend uses cookies/sessions for auth
		});

		if (response.ok) {
			// Assuming the backend returns the User object directly
			const userData: User = await response.json();
			return userData;
		} else if (response.status === 404) {
			// console.log(`User ${username} not found via backend API.`); // Debug log
			return null; // User not found
		} else {
			// Handle other backend errors
			const errorBody = await response.text();
			console.error(`Backend API Error (${targetUrl}): ${response.status} ${response.statusText}`, errorBody);
			// Optionally show a toast here, or let the calling component handle UI feedback
			// toast.error(`Failed to fetch user data from backend (${response.status}).`);
			return null; // Error occurred
		}
	} catch (error) {
		// Check for JSON parsing errors
		if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
			toast.error('Server unavailable. Please try again later.');
		} else if (error instanceof Error) {
			// Handle other standard errors
			toast.error(`An error occurred while fetching user data: ${error.message}`);
		} else {
			toast.error('An unknown error occurred while fetching user data.');
		}
		return null; // Network or other fetch error
	}
};
// --- End NEW Function ---

// --- NEW Update User Function ---
/**
 * Updates a user's data via the backend API.
 * @param userId The ID of the user to update.
 * @param userData The partial user data containing the fields to update.
 * @returns A Promise resolving to the updated User object if successful, or null otherwise.
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User | null> => {
	if (!userId) {
		console.error('updateUser called with no userId.');
		toast.error('User ID is missing. Cannot update user.');
		return null;
	}

	const targetUrl = `/api/admin/users/${userId}`;

	try {
		const response = await fetch(targetUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userData),
			credentials: 'include',
		});

		if (response.ok) {
			const apiResponse: UserUpdateApiResponse = await response.json();

			if (apiResponse.status === 'success' && apiResponse.data) {
				const { ...userDataFromApi } = apiResponse.data;
				const updatedUser: User = {
					...userDataFromApi,
				};
				toast.success(apiResponse.message || 'User updated successfully!');
				return updatedUser;
			} else {
				// Handle cases where the API indicates success=false or data is missing
				const errorMessage = apiResponse.message || `Failed to update user: Server responded with status ${apiResponse.status}.`;
				console.error(`Backend API Error (PUT ${targetUrl}): ${errorMessage}`, apiResponse);
				toast.error(errorMessage);
				return null;
			}
		} else {
			// Handle HTTP errors (e.g., 400, 500)
			const errorBody = await response.text();
			let errorMessage = `Failed to update user: ${response.statusText || 'Unknown server error'}`;
			try {
				const parsedError = JSON.parse(errorBody);
				if (parsedError && parsedError.message) {
					errorMessage = parsedError.message;
				}
			} catch (e) {
				// If errorBody is not JSON or doesn't have a message, use the generic one
			}
			console.error(`Backend API Error (PUT ${targetUrl}): ${response.status} ${response.statusText}`, errorBody);
			toast.error(errorMessage);
			return null;
		}
	} catch (error) {
		// Check for JSON parsing errors
		if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
			toast.error('Server unavailable. Please try again later.');
		} else if (error instanceof Error) {
			// Handle other standard errors
			toast.error(`An error occurred while updating the user: ${error.message}`);
		} else {
			toast.error('An unknown error occurred while updating the user.');
		}
		return null;
	}
};
// --- End Update User Function ---

// --- NEW Delete User Function ---
/**
 * Deletes a user via the backend API.
 * @param userId The ID of the user to delete.
 * @returns A Promise resolving to true if successful, or false otherwise.
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
	if (!userId) {
		console.error('deleteUser called with no userId.');
		toast.error('User ID is missing. Cannot delete user.');
		return false;
	}

	const targetUrl = `/api/admin/users/${userId}`;

	try {
		const response = await fetch(targetUrl, {
			method: 'DELETE',
			credentials: 'include',
		});

		if (response.ok) {
			// Check if the response has content before trying to parse JSON
			// Some DELETE endpoints might return 204 No Content
			if (response.status === 204) {
				toast.success('User deleted successfully!');
				return true;
			}
			// If there's content (like a confirmation message)
			// const result = await response.json(); // Or response.text() if not JSON
			toast.success('User deleted successfully!');
			return true;
		} else {
			const errorBody = await response.text();
			console.error(`Backend API Error (DELETE ${targetUrl}): ${response.status} ${response.statusText}`, errorBody);
			toast.error(`Failed to delete user: ${response.statusText || 'Unknown error'}`);
			return false;
		}
	} catch (error) {
		// Check for JSON parsing errors
		if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
			toast.error('Server unavailable. Please try again later.');
		} else if (error instanceof Error) {
			// Handle other standard errors
			toast.error(`An error occurred while deleting the user: ${error.message}`);
		} else {
			toast.error('An unknown error occurred while deleting the user.');
		}
		return false;
	}
};
// --- End Delete User Function ---

// --- NEW Function to Fetch Current User's Balance ---
/**
 * Fetches the current authenticated user's account balance.
 * This is a placeholder and should be replaced with a real API call.
 * @returns A Promise resolving to the user's balance, or null if an error occurs.
 */
export const fetchCurrentUserBalance = async (): Promise<number | null> => {
	// Replace with your actual API endpoint for fetching the current user's balance
	const targetUrl = '/api/me/balance'; // Example endpoint

	try {
		console.log(`Fetching current user balance from: ${targetUrl}`); // Debug log
		// const response = await fetch(targetUrl, {
		// 	method: 'GET',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 		// Add Authorization header if needed (e.g., Bearer token)
		// 		// 'Authorization': `Bearer ${your_auth_token}`,
		// 	},
		// 	credentials: 'include', // Important if using session cookies
		// });

		// if (response.ok) {
		// 	const data = await response.json();
		// 	if (typeof data.balance === 'number') {
		// 		return data.balance;
		// 	} else {
		// 		console.error('Balance data is not in the expected format:', data);
		// 		toast.error('Received invalid balance data from server.');
		// 		return null;
		// 	}
		// } else {
		// 	const errorBody = await response.text();
		// 	console.error(`API Error (${targetUrl}): ${response.status} ${response.statusText}`, errorBody);
		// 	toast.error(`Failed to fetch balance: ${response.statusText || 'Server error'}`);
		// 	return null;
		// }

		// Placeholder simulation:
		await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate network delay
		const mockBalance = 2500.75; // Example balance
		console.log('Mock balance fetched:', mockBalance);
		return mockBalance;
	} catch (error) {
		if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
			toast.error('Server unavailable or returned an invalid response while fetching balance.');
		} else if (error instanceof Error) {
			toast.error(`An error occurred while fetching balance: ${error.message}`);
		} else {
			toast.error('An unknown error occurred while fetching balance.');
		}
		console.error('Error in fetchCurrentUserBalance:', error);
		return null;
	}
};
// --- End Fetch Current User's Balance Function ---
