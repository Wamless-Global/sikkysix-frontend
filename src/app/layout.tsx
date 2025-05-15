import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import appSettings from '@/config/app';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { Toaster } from '@/components/ui/sonner';
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
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<AuthProvider>
						<Suspense>
							<ProgressBar />
							{children}
							<Toaster richColors />
						</Suspense>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
