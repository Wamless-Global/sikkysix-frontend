'use client';

import { handleFetchErrorMessage } from '@/lib/helpers';
import { AuthContextType, AuthenticatedUser, AuthProviderProps } from '@/types';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { usePathname } from 'next/navigation';
import { createContext, useState, useContext, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const AuthProvider: React.FC<AuthProviderProps & { is404?: boolean }> = ({ children }) => {
	const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
	const [is404, setIs404] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const pathname = usePathname();

	const logout = async (): Promise<void> => {
		try {
			const response = await fetchWithAuth(`/api/auth/logout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			setCurrentUser(null);

			if (!response.ok) {
				let errorMessage = `Logout API failed: ${response.statusText || 'Unknown error'}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorMessage;
				} catch (_parseError) {}
				// console.error('AuthContext Logout Error:', errorMessage);
				throw new Error(errorMessage);
			}

			await supabase.auth.signOut();

			logger.log('AuthContext: Logout successful via API.');
		} catch (err) {
			// console.error('AuthContext: Error during logout:', err);
			setCurrentUser(null);
			throw err;
		} finally {
		}
	};

	const login = async (email: string, password: string): Promise<AuthenticatedUser> => {
		try {
			const response = await fetchWithAuth(`/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},

				body: JSON.stringify({ email, password }),
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorMessage = responseData.message || `Login API failed: ${response.statusText || 'Unknown error'}`;
				console.error('AuthContext Login Error:', errorMessage, responseData);
				throw new Error(errorMessage);
			}

			if (responseData.status === 'success' && responseData.data?.user) {
				const authenticatedUser = responseData.data.user as AuthenticatedUser;
				setCurrentUser(authenticatedUser);
				logger.log('AuthContext: Login successful.');
				return authenticatedUser;
			} else {
				console.error('AuthContext Login Error: Unexpected success response format', responseData);
				throw new Error('Login failed: Unexpected response from server.');
			}
		} catch (err) {
			// console.error('AuthContext: Error during login:', err);
			setCurrentUser(null);
			throw err;
		} finally {
		}
	};

	const signup = async (name: string, email: string, password: string, confirmPassword: string, country: string, referralId?: string | undefined, roles: Array<string> = ['user']): Promise<void> => {
		logger.log('AuthContext: Starting signup process with', { name, email, referralId, roles });
		if (password !== confirmPassword) {
			throw new Error('Passwords do not match.');
		}
		if (!name || !email || !password) {
			throw new Error('All fields are required for signup.');
		}

		try {
			const response = await fetchWithAuth(`/api/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, email, password, confirmPassword, roles, country, referralId }),
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorMessage = handleFetchErrorMessage(responseData || `Signup API failed: ${response.statusText || 'Unknown error'}`);
				console.error('AuthContext Signup Error:', errorMessage, responseData);
				throw new Error(errorMessage);
			}

			logger.log('AuthContext: Signup request successful.', responseData);
		} catch (err) {
			// console.error('AuthContext: Error during signup:', err);
			throw err;
		}
	};

	const checkEmailVerificationStatus = async (email: string): Promise<{ status: 'verified' | 'not_verified' | 'error' | 'not_found'; message: string | null }> => {
		if (!email) {
			console.error('AuthContext: checkEmailVerificationStatus called with no email.');
			return { status: 'error', message: 'No email provided to check status.' };
		}
		try {
			const response = await fetchWithAuth(`/api/auth/check-email-verification?email=${encodeURIComponent(email)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
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
		} catch (err: unknown) {
			let message = 'An unknown error occurred while checking email status.';
			if (typeof err === 'object' && err !== null) {
				if ('message' in err && typeof err.message === 'string') {
					message = err.message;
				}
			}
			return { status: 'error', message };
		}
	};

	const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string | null }> => {
		if (!email) {
			console.error('AuthContext: resendVerificationEmail called with no email.');
			return { success: false, message: 'No email provided for resending verification.' };
		}
		try {
			const response = await fetchWithAuth('/api/auth/resend-email-verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorMessage = responseData?.message || `Failed to resend verification email: ${response.statusText || 'Unknown HTTP error'}`;
				console.error('AuthContext: Resend verification email API HTTP error:', errorMessage, `Status: ${response.status}`);
				return { success: false, message: errorMessage };
			}

			if (responseData.status === 'success') {
				logger.log('AuthContext: Resend verification email request successful for', email);
				return { success: true, message: responseData.message || 'Verification email resent successfully.' };
			} else {
				const errorMessage = responseData?.message || 'Backend indicated an issue with resending the email.';
				console.warn('AuthContext: Resend verification email backend issue:', errorMessage);
				return { success: false, message: errorMessage };
			}
		} catch (err: unknown) {
			const errorMessage = handleFetchErrorMessage(err, 'An unknown error occurred while checking email status.', null, false);
			return { success: false, message: errorMessage };
		}
	};

	useEffect(() => {
		// Only run checkUserSession if not on 404 page (using is404 prop)
		if (is404) {
			setIsLoading(false);
			return;
		}

		const checkUserSession = async () => {
			try {
				const response = await fetchWithAuth('/api/auth/verify-me');
				if (!response.ok) {
					console.error(`AuthContext: Session check API error - ${response.status} ${response.statusText}`);
					setCurrentUser(null);
					return;
				}

				const sessionData = await response.json();

				if (sessionData.status === 'success' && sessionData.data?.user) {
					setCurrentUser(sessionData.data.user as AuthenticatedUser);
				} else {
					setCurrentUser(null);
				}
			} catch {
				setCurrentUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		checkUserSession();
	}, [pathname, is404]);

	const value = {
		currentUser,
		isLoading,
		setCurrentUser,
		setIs404,
		login,
		logout,
		signup,
		checkEmailVerificationStatus,
		resendVerificationEmail,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuthContext must be used within an AuthProvider');
	}
	return context;
};
