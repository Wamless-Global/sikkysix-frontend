import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface NewRequest extends NextRequest {
	// Add export here
	request?: {
		cookies?: {
			auth_token?: string;
		};
	};
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NewRequest) {
	// Marked async
	const authToken = request.cookies?.get('auth_token')?.value;

	const { pathname } = request.nextUrl;

	const isAdminPath = pathname.startsWith('/admin');
	const isAuthPath = pathname === '/auth/login';
	const isUnauthorizedPath = pathname === '/unauthorized'; // Added check

	const loginUrl = new URL('/auth/login', request.url);
	const adminUrl = new URL('/admin', request.url);
	const unauthorizedUrl = new URL('/unauthorized', request.url); // Define unauthorizedUrl

	// --- New Check for /unauthorized ---
	// If accessing /unauthorized without a token, redirect to login
	if (isUnauthorizedPath && !authToken) {
		console.log('Middleware: Accessing /unauthorized without token. Redirecting to login.');
		return NextResponse.redirect(loginUrl);
	}
	// If accessing /unauthorized *with* a token, allow it (they were likely redirected here)
	// No explicit 'else' needed here, it will fall through to NextResponse.next() if not admin/auth path

	// Redirect to login if trying to access admin pages without a token OR with an invalid token
	if (isAdminPath) {
		// Always attempt to verify the token with the backend if accessing an admin path.
		// The backend endpoint will handle missing/invalid cookies when called with credentials: 'include'.
		try {
			// Verify token by calling the backend endpoint.
			// Use the API base URL from environment variables since the API is on a different origin.
			const apiUrl = process.env.API_BASE_URL; // Use server-side env var
			if (!apiUrl) throw new Error('Server-side API base URL (API_BASE_URL) is not configured.'); // Updated error message

			// Manually forward the cookie in the headers for the verification request
			const headers = new Headers();
			if (authToken) {
				headers.append('Cookie', `auth_token=${authToken}`);
			} else {
				// If no token, definitely redirect to login
				console.log('Middleware: No token found for admin path. Redirecting to login.');
				return NextResponse.redirect(loginUrl);
			}

			const response = await fetch(`${apiUrl}/auth/verify-token`, {
				headers: headers,
				// credentials: 'include', // Keep or remove? Explicit header might be sufficient. Let's keep for now.
				credentials: 'include',
			});

			if (!response.ok) {
				// Token is invalid, redirect to login and clear cookie
				// Avoid reading response.text() here if status indicates failure, as it might consume the body needed later if logic changes
				console.error('Token verification failed (status):', response.status);
				const redirectResponse = NextResponse.redirect(loginUrl);
				redirectResponse.cookies.delete('auth_token');
				return redirectResponse;
			}

			// Token is valid, now check authorization (role)
			try {
				const verificationData = await response.json();
				// Check if the user has the 'admin' role in the roles array
				const isAdmin = verificationData?.data?.user?.roles?.includes('admin');

				if (!isAdmin) {
					// User is authenticated but not authorized for admin routes
					console.log('User is not authorized for admin routes. Redirecting to /unauthorized.');
					// Redirect to unauthorized page, keep the auth token
					// Add the original path as a query parameter
					unauthorizedUrl.searchParams.set('path', pathname);
					return NextResponse.redirect(unauthorizedUrl);
				}
				// User is authenticated and authorized, allow access
				return NextResponse.next(); // Allow access to the admin route
			} catch (jsonError) {
				// Handle cases where response.ok is true, but body is not valid JSON or structure is wrong
				console.error('Error parsing verification response JSON:', jsonError);
				const redirectResponse = NextResponse.redirect(loginUrl);
				redirectResponse.cookies.delete('auth_token'); // Clear token as we can't confirm authorization
				return redirectResponse;
			}
		} catch (error) {
			// Network error or backend issue, redirect to login and clear cookie
			console.error('Error verifying token:', error);
			const redirectResponse = NextResponse.redirect(loginUrl);
			redirectResponse.cookies.delete('auth_token');
			return redirectResponse;
		}
	}

	// Redirect to admin dashboard if trying to access login page with a valid token
	// Note: We don't strictly need to re-verify here if the goal is just redirection,
	// but if you wanted to ensure only valid tokens redirect *from* login, verification could be added.
	if (isAuthPath && authToken) {
		// Simple redirect based on token presence. Verification happens when accessing /admin.
		return NextResponse.redirect(adminUrl);
	}

	// Allow the request to proceed if none of the above conditions caused a redirect
	return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (like svgs, etc.)
		 * We want the middleware to run on admin and auth routes.
		 */
		'/admin/:path*',
		'/auth/login',
		'/unauthorized', // Add unauthorized path to matcher
		// Add other paths that need protection or auth-related redirects
	],
};
