import { normalizeUrl, sanitizeUrl } from './helpers';
import { logger } from './logger';

/**
 * Fetch utility that adds Authorization header if token is present.
 * Falls back to cookies if no token is provided.
 *
 * @param input - Request URL or Request object
 * @param init - Fetch options
 * @param token - Optional access token (if not provided, uses cookies only)
 */
export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, token?: string | null) {
	const authToken = token;
	const headers = new Headers(init.headers || {});

	if (authToken) {
		headers.set('Authorization', `Bearer ${authToken}`);
	}

	const cleanedInput = typeof input === 'string' ? input.replace(/^\/?api\/proxy\/?/i, '') : input;
	const formattedURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cleanedInput}`;

	const url = normalizeUrl(sanitizeUrl(formattedURL, process.env.NEXT_PUBLIC_API_BASE_URL!));

	const method = init.method ? init.method.toUpperCase() : 'GET';
	return fetch(url, {
		...init,
		headers,
		method,
		credentials: 'include',
	});
}
