'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react'; // Import useEffect
import { AuthenticatedUser } from '@/lib/userUtils'; // Import the type

// Define the shape of the context value
interface AuthContextType {
	currentUser: AuthenticatedUser | null;
	setCurrentUser: (user: AuthenticatedUser | null) => void;
	isLoading: boolean; // To indicate if session check is in progress
	login: (email: string, password: string) => Promise<AuthenticatedUser>; // Function to handle login
	logout: () => Promise<void>;
	signup: (name: string, email: string, password: string, confirmPassword: string, roles: Array<string>) => Promise<void>; // Added signup function
	checkEmailVerificationStatus: (email: string) => Promise<{ status: 'verified' | 'not_verified' | 'error' | 'not_found'; message: string | null }>; // To check email verification status
	resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string | null }>; // To resend verification email
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
			let finalError = error;
			// Check for JSON parsing errors
			if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
				finalError = new Error('Server unavailable or returned an invalid response. Please try again later.');
			}
			// Re-throw the potentially modified error
			throw finalError;
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
				setCurrentUser(authenticatedUser);
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
			let finalError = error;
			// Check for JSON parsing errors
			if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
				finalError = new Error('Server unavailable or returned an invalid response. Please try again later.');
			}
			// Re-throw the potentially modified error
			throw finalError;
		} finally {
			// Optional: Clear specific login loading state
			// setIsLoading(false);
		}
	};

	// Function to handle signup
	const signup = async (name: string, email: string, password: string, confirmPassword: string, roles: Array<string>): Promise<void> => {
		// Optional: Set a specific loading state for signup if needed globally
		// setIsLoading(true); // Consider if signup should affect the global loading state

		// Basic client-side validation (can be enhanced)
		if (password !== confirmPassword) {
			throw new Error('Passwords do not match.');
		}
		if (!name || !email || !password) {
			throw new Error('All fields are required for signup.');
		}

		try {
			const response = await fetch(`/api/auth/register`, {
				// Use the specified route
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				// No credentials needed usually for signup, unless you need to track something pre-login
				body: JSON.stringify({ name, email, password, confirmPassword }), // Send all fields
			});

			const responseData = await response.json(); // Try to parse JSON regardless of status

			if (!response.ok) {
				// Use error message from backend if available
				const errorMessage = responseData.message || `Signup API failed: ${response.statusText || 'Unknown error'}`;
				console.error('AuthContext Signup Error:', errorMessage, responseData);
				throw new Error(errorMessage);
			}

			console.log('AuthContext: Signup request successful.', responseData);
		} catch (error) {
			console.error('AuthContext: Error during signup:', error);
			let finalError = error;
			// Check for JSON parsing errors
			if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
				finalError = new Error('Server unavailable or returned an invalid response. Please try again later.');
			}
			// Re-throw the potentially modified error
			throw finalError;
		}
	};

	// Function to check email verification status from URL
	const checkEmailVerificationStatus = async (email: string): Promise<{ status: 'verified' | 'not_verified' | 'error' | 'not_found'; message: string | null }> => {
		if (!email) {
			console.error('AuthContext: checkEmailVerificationStatus called with no email.');
			return { status: 'error', message: 'No email provided to check status.' };
		}
		try {
			const response = await fetch(`/api/auth/check-email-verification?email=${encodeURIComponent(email)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorMessage = responseData?.message || responseData?.data?.message || `Failed to check email status: ${response.statusText || 'Unknown HTTP error'}`;
				console.error('AuthContext: Check email status API HTTP error:', errorMessage, `Status: ${response.status}`);
				if (response.status === 404) return { status: 'not_found', message: responseData?.data?.message || responseData?.message || 'Email address not found.' };
				return { status: 'error', message: errorMessage };
			}

			if (responseData.status === 'success' && responseData.data && typeof responseData.data.isVerified === 'boolean') {
				const { isVerified, message } = responseData.data;
				if (isVerified) {
					return { status: 'verified', message: message || 'Email is verified.' };
				} else {
					return { status: 'not_verified', message: message || 'Email is not verified.' };
				}
			} else if (responseData.status === 'error' && responseData.message) {
				return { status: 'error', message: responseData.message };
			} else {
				return { status: 'error', message: 'Unexpected response from server.' };
			}
		} catch (error: any) {
			let errMessage = 'An unknown error occurred while checking email status.';
			if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
				errMessage = 'Server unavailable or returned an invalid response.';
				console.error(`AuthContext: ${errMessage}`);
			} else if (error.message) {
				errMessage = error.message;
			}
			return { status: 'error', message: errMessage };
		}
	};

	// Function to resend verification email
	const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string | null }> => {
		if (!email) {
			console.error('AuthContext: resendVerificationEmail called with no email.');
			return { success: false, message: 'No email provided for resending verification.' };
		}
		try {
			const response = await fetch('/api/auth/resend-email-verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
				credentials: 'include',
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorMessage = responseData?.message || `Failed to resend verification email: ${response.statusText || 'Unknown HTTP error'}`;
				console.error('AuthContext: Resend verification email API HTTP error:', errorMessage, `Status: ${response.status}`);
				return { success: false, message: errorMessage };
			}

			// Assuming a successful response indicates the email was resent
			// Backend might return { status: "success", message: "Verification email resent." }
			if (responseData.status === 'success') {
				console.log('AuthContext: Resend verification email request successful for', email);
				return { success: true, message: responseData.message || 'Verification email resent successfully.' };
			} else {
				// Handle cases where response is 2xx but backend indicates an issue
				const errorMessage = responseData?.message || 'Backend indicated an issue with resending the email.';
				console.warn('AuthContext: Resend verification email backend issue:', errorMessage);
				return { success: false, message: errorMessage };
			}
		} catch (error: any) {
			console.error('AuthContext: Exception during resendVerificationEmail:', error);
			let errMessage = 'An unknown error occurred while resending the verification email.';
			if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
				errMessage = 'Server unavailable or returned an invalid response for resend.';
				console.error(`AuthContext: ${errMessage}`);
			} else if (error.message) {
				errMessage = error.message;
			}
			return { success: false, message: errMessage };
		}
	};

	// Check for existing session on initial load by calling an API endpoint
	useEffect(() => {
		const checkUserSession = async () => {
			// No need to set isLoading(true) here, it's true by default
			try {
				const response = await fetch('/api/auth/verify-me', {
					credentials: 'include', // Send cookies to check session
				});
				if (!response.ok) {
					// Handle non-2xx responses (e.g., 401 Unauthorized means no active session)
					if (response.status === 401) {
						console.log('AuthContext: No active session found.');
					} else {
						// Log other unexpected errors
						console.error(`AuthContext: Session check API error - ${response.status} ${response.statusText}`);
					}
					setCurrentUser(null);
					return; // Exit early, no user session
				}

				const sessionData = await response.json();

				// Check if the response structure is as expected and contains user data
				if (sessionData.status === 'success' && sessionData.data?.user) {
					setCurrentUser(sessionData.data.user as AuthenticatedUser);
					console.log('AuthContext: Session restored.');
				} else {
					// Log if the success response format is wrong or user data is missing
					console.warn('AuthContext: Session data format unexpected or user missing.', sessionData);
					setCurrentUser(null);
				}
			} catch (error) {
				// Handle network errors or other exceptions during fetch
				console.error('AuthContext: Failed to check session:', error);
				setCurrentUser(null); // Ensure user is null on error
				// Check for JSON parsing errors (though less likely to need a user-facing message here)
				if (error instanceof SyntaxError && (error.message.includes('JSON') || error.message.includes('token'))) {
					console.error('AuthContext: Session check received invalid JSON (server likely down).');
					// No need to throw a user-facing error here, just log it. The user is already set to null.
				}
				// No throw here, session check failure shouldn't break the app, just means no user logged in.
			} finally {
				setIsLoading(false); // Stop loading once check is complete (success or error)
			}
		};

		checkUserSession();
	}, []);

	// Value provided by the context
	const value = {
		currentUser,
		setCurrentUser,
		isLoading, // Session loading state
		login, // Login function
		logout, // Logout function
		signup, // Added signup function
		checkEmailVerificationStatus,
		resendVerificationEmail, // Added resend function
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
