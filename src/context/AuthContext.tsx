// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'; // Import useEffect
import { AuthenticatedUser } from '@/lib/userUtils'; // Import the type

// Define the shape of the context value
interface AuthContextType {
	currentUser: AuthenticatedUser | null;
	setCurrentUser: (user: AuthenticatedUser | null) => void;
	isLoading: boolean; // To indicate if session check is in progress
	login: (email: string, password: string) => Promise<AuthenticatedUser>; // Function to handle login
	logout: () => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
	children: ReactNode;
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until session is checked

	// Function to handle logout
	const logout = async (): Promise<void> => {
		// No need for a separate loading state here unless logout is slow
		// setIsLoading(true); // Optional: if logout has its own loading indicator needed globally

		try {
			const response = await fetch(`/api/auth/logout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Important to send the HttpOnly cookie
			});

			// Clear client-side user state regardless of API success/failure?
			// Usually yes, as the intention is to log out.
			setCurrentUser(null);

			if (!response.ok) {
				// Try to parse error message from backend
				let errorMessage = `Logout API failed: ${response.statusText || 'Unknown error'}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorMessage;
				} catch (parseError) {
					// Ignore if parsing fails, use default message
				}
				console.error('AuthContext Logout Error:', errorMessage);
				// Throw error so the calling component knows logout failed server-side
				throw new Error(errorMessage);
			}

			console.log('AuthContext: Logout successful via API.');
			// Success: currentUser is already null. Promise resolves implicitly.
		} catch (error) {
			console.error('AuthContext: Error during logout:', error);
			setCurrentUser(null); // Ensure user is cleared even if API call fails entirely
			// Re-throw the error so the calling component can handle it (e.g., show toast)
			throw error;
		} finally {
			// setIsLoading(false); // Optional: if using separate logout loading state
		}
	};

	// Function to handle login
	const login = async (email: string, password: string): Promise<AuthenticatedUser> => {
		// Optional: Set a specific loading state for login if needed globally
		// setIsLoading(true);
		try {
			const response = await fetch(`/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Important for HttpOnly cookie handling by the browser
				body: JSON.stringify({ email, password }),
			});

			const responseData = await response.json(); // Always try to parse JSON

			if (!response.ok) {
				const errorMessage = responseData.message || `Login API failed: ${response.statusText || 'Unknown error'}`;
				console.error('AuthContext Login Error:', errorMessage, responseData);
				throw new Error(errorMessage);
			}

			if (responseData.status === 'success' && responseData.data?.user) {
				const authenticatedUser = responseData.data.user as AuthenticatedUser;
				setCurrentUser(authenticatedUser); // Update context state
				console.log('AuthContext: Login successful.');
				return authenticatedUser; // Return user data on success
			} else {
				// Handle cases where response is 2xx but data format is unexpected
				console.error('AuthContext Login Error: Unexpected success response format', responseData);
				throw new Error('Login failed: Unexpected response from server.');
			}
		} catch (error) {
			console.error('AuthContext: Error during login:', error);
			setCurrentUser(null); // Ensure user is cleared on login failure
			// Re-throw the error so the calling component can handle it (e.g., show toast)
			throw error;
		} finally {
			// Optional: Clear specific login loading state
			// setIsLoading(false);
		}
	};

	// Check for existing session on initial load by calling an API endpoint
	useEffect(() => {
		const checkUserSession = async () => {
			// No need to set isLoading(true) here, it's true by default
			try {
				// TODO: Replace with your actual API call to fetch user session
				// Example: const response = await fetch('/api/auth/me'); // Ensure credentials ('include') are sent if needed
				// if (!response.ok) {
				//     // Handle non-2xx responses (e.g., 401 Unauthorized)
				//     if (response.status === 401) {
				//         console.log("AuthContext: No active session found.");
				//     } else {
				//         console.error(`AuthContext: API error - ${response.status}`);
				//     }
				//     setCurrentUser(null);
				//     return; // Exit early
				// }
				// const sessionData = await response.json();
				// if (sessionData.status === 'success' && sessionData.data?.user) {
				//     setCurrentUser(sessionData.data.user);
				// } else {
				//     console.warn("AuthContext: Session data format unexpected.", sessionData);
				//     setCurrentUser(null);
				// }

				// --- Placeholder ---
				// Simulate API call delay and assume no user for now
				await new Promise((resolve) => setTimeout(resolve, 500));
				console.warn('AuthContext: Session check API call not implemented. Assuming logged out.');
				setCurrentUser(null); // Remove this line once API call is implemented
				// --- End Placeholder ---
			} catch (error) {
				// Handle network errors or other exceptions during fetch
				console.error('AuthContext: Failed to check session:', error);
				setCurrentUser(null); // Ensure user is null on error
			} finally {
				setIsLoading(false); // Stop loading once check is complete (success or error)
			}
		};

		checkUserSession();
	}, []); // Empty dependency array ensures this runs only once on mount

	// Value provided by the context
	const value = {
		currentUser,
		setCurrentUser,
		isLoading, // Session loading state
		login, // Login function
		logout, // Logout function
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuthContext = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuthContext must be used within an AuthProvider');
	}
	return context;
};
