import { getPlatformName } from '@/lib/helpers';

export interface AppSettings {
	appName: string;
	metaDescription: string;
	baseFontSize: string;
	supportemail: string;
	itemsPerPage: number;
}

export const appSettings: AppSettings = {
	appName: getPlatformName(),
	metaDescription: 'Admin dashboard for SikkySix platform.',
	baseFontSize: '15px',
	supportemail: 'support@mm.com',
	itemsPerPage: 10,
};

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const logMessages = true;

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default appSettings;
