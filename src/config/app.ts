export interface AppSettings {
	appName: string;
	metaDescription: string;
	baseFontSize: string; // e.g., '16px', '1rem', '100%',
	supportemail: string;
}

export const appSettings: AppSettings = {
	appName: 'SikkySix',
	metaDescription: 'Admin dashboard for SikkySix platform.',
	baseFontSize: '15px', // Default base font size
	supportemail: 'support@mm.com',
};

export const logMessages = true;

export default appSettings;
