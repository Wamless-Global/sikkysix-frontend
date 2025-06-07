// filepath: src/lib/logger.ts
/**
 * Custom logger utility for consistent logging across client and server.
 * Usage: import { logger } from '@/lib/logger';
 * logger.log('message', ...args);
 * logger.error('error', ...args);
 * logger.warn('warning', ...args);
 * logger.info('info', ...args);
 */

const ENABLE_LOGS = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true') || (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_ENABLE_LOGS === 'true');

export const logger = {
	log: (...args: any[]) => {
		if (!ENABLE_LOGS) return;
		if (typeof window !== 'undefined') {
			// Client-side: styled log
			console.log('%c[LOG]', 'color: #4F8A10; font-weight: bold;', ...args);
		} else {
			// Server-side: plain log
			// eslint-disable-next-line no-console
			console.log('[LOG]', ...args);
		}
	},
	info: (...args: any[]) => {
		if (!ENABLE_LOGS) return;
		if (typeof window !== 'undefined') {
			console.info('%c[INFO]', 'color: #00529B; font-weight: bold;', ...args);
		} else {
			// eslint-disable-next-line no-console
			console.info('[INFO]', ...args);
		}
	},
	warn: (...args: any[]) => {
		if (!ENABLE_LOGS) return;
		if (typeof window !== 'undefined') {
			console.warn('%c[WARN]', 'color: #9F6000; font-weight: bold;', ...args);
		} else {
			// eslint-disable-next-line no-console
			console.warn('[WARN]', ...args);
		}
	},
	error: (...args: any[]) => {
		if (!ENABLE_LOGS) return;
		if (typeof window !== 'undefined') {
			console.error('%c[ERROR]', 'color: #D8000C; font-weight: bold;', ...args);
		} else {
			// eslint-disable-next-line no-console
			console.error('[ERROR]', ...args);
		}
	},
};
