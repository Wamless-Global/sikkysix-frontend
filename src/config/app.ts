export interface AppSettings {
	appName: string;
	metaDescription: string;
	baseFontSize: string; // e.g., '16px', '1rem', '100%'
}

export const appSettings: AppSettings = {
	appName: 'SikkySix Admin',
	metaDescription: 'Admin dashboard for SikkySix platform.',
	baseFontSize: '15px', // Default base font size
};

export default appSettings;
