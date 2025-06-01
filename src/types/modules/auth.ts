import { ReactNode } from 'react';
import { AuthenticatedUser } from './users';

export interface AuthContextType {
	currentUser: AuthenticatedUser | null;
	setCurrentUser: (user: AuthenticatedUser | null) => void;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<AuthenticatedUser>;
	logout: () => Promise<void>;
	signup: (name: string, email: string, password: string, confirmPassword: string, roles?: Array<string>) => Promise<void>;
	checkEmailVerificationStatus: (email: string) => Promise<{ status: 'verified' | 'not_verified' | 'error' | 'not_found'; message: string | null }>;
	resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string | null }>;
}

export interface AuthProviderProps {
	children: ReactNode;
}

export interface VerifyResetTokenResult {
	valid: boolean;
	user?: {};
	error?: { name: string; message: string; status?: number };
}
