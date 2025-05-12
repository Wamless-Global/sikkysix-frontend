export interface AppSettings {
	appName: string;
	metaDescription: string;
	baseFontSize: string;
	supportemail: string;
	itemsPerPage: number;
}

export const appSettings: AppSettings = {
	appName: 'SikkySix',
	metaDescription: 'Admin dashboard for SikkySix platform.',
	baseFontSize: '15px',
	supportemail: 'support@mm.com',
	itemsPerPage: 10,
};

export const logMessages = true;

export default appSettings;
