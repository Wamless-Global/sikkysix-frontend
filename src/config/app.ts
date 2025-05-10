export interface AppSettings {
	appName: string;
	metaDescription: string;
	baseFontSize: string;
	supportemail: string;
}

export const appSettings: AppSettings = {
	appName: 'SikkySix',
	metaDescription: 'Admin dashboard for SikkySix platform.',
	baseFontSize: '15px',
	supportemail: 'support@mm.com',
};

export const logMessages = true;

export default appSettings;
