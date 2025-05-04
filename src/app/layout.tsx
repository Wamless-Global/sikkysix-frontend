import type { Metadata } from 'next';
import { Geist, Geist_Mono, Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import appSettings from '@/config/app'; // Import app settings
import { ProgressBar } from '@/components/layout/ProgressBar'; // Import ProgressBar
import { Toaster } from '@/components/ui/sonner'; // Import Toaster
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: appSettings.appName,
	description: appSettings.metaDescription,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning style={{ fontSize: appSettings.baseFontSize }}>
			<body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system" // Use system preference as default
					enableSystem
					disableTransitionOnChange
				>
					<ProgressBar /> {/* Add ProgressBar here */}
					{children}
					<Toaster richColors /> {/* Add Toaster here */}
				</ThemeProvider>
			</body>
		</html>
	);
}
