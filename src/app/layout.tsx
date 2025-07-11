import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import appSettings from '@/config/app';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { Toaster } from '@/components/ui/sonner';
import { DynamicAppNameTitle } from '@/components/others/DynamicAppNameTitle';
import { TelegramProvider } from '@/context/TelegramContext';

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
	title: {
		default: appSettings.appName,
		template: `%s | ${appSettings.appName}`,
	},
	description: appSettings.metaDescription,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning style={{ fontSize: appSettings.baseFontSize }}>
			<head>
				<script defer src="https://telegram.org/js/telegram-web-app.js"></script>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange enableColorScheme={false}>
					<Suspense>
						<ProgressBar />
						<DynamicAppNameTitle fallback={appSettings.appName} />
						<TelegramProvider>
							{children}
							<Toaster richColors />
						</TelegramProvider>
					</Suspense>
				</ThemeProvider>
			</body>
		</html>
	);
}
