'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { logger } from '@/lib/logger';

// Mock initial preferences - in a real app, this would come from user data/context
const initialPreferences = {
	theme: 'system',
	emailNotifications: {
		updates: true,
		newsletter: false,
		marketing: false,
	},
	language: 'en',
	timezone: 'local',
	dateFormat: '24h',
	showProfilePublic: false,
	enable2FA: false,
	reduceMotion: false,
};

export default function PreferencesPageContent() {
	const { theme, setTheme } = useTheme();
	const [preferences, setPreferences] = useState({
		...initialPreferences,
		theme: theme || 'system',
	});

	const handleThemeChange = (value: string) => {
		setTheme(value);
		setPreferences((prev) => ({ ...prev, theme: value }));
	};

	useEffect(() => {
		setPreferences((prev) => ({ ...prev, theme: theme || 'system' }));
	}, [theme]);

	const handleNotificationChange = (type: keyof typeof initialPreferences.emailNotifications, checked: boolean) => {
		setPreferences((prev) => ({
			...prev,
			emailNotifications: {
				...prev.emailNotifications,
				[type]: checked,
			},
		}));
	};

	const handleLanguageChange = (value: string) => {
		setPreferences((prev) => ({ ...prev, language: value }));
		logger.log('Language changed to:', value);
	};

	const handleTimezoneChange = (value: string) => {
		setPreferences((prev) => ({ ...prev, timezone: value }));
	};

	const handleDateFormatChange = (value: string) => {
		setPreferences((prev) => ({ ...prev, dateFormat: value }));
	};

	const handleShowProfilePublicChange = (checked: boolean) => {
		setPreferences((prev) => ({ ...prev, showProfilePublic: checked }));
	};

	const handle2FAChange = (checked: boolean) => {
		setPreferences((prev) => ({ ...prev, enable2FA: checked }));
	};

	const handleReduceMotionChange = (checked: boolean) => {
		setPreferences((prev) => ({ ...prev, reduceMotion: checked }));
	};

	const handleSaveChanges = () => {
		logger.log('Saving preferences:', preferences);
	};

	return (
		<div className="max-w-2xl space-y-8">
			<h1 className="sub-page-heading">My Preferences</h1>

			{/* <Card className="bg-muted/30 dark:bg-muted/10 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg text-foreground">Theme Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="theme-system" className="flex flex-col items-start space-y-1">
							<span>System Default</span>
							<span className="font-normal leading-snug text-muted-foreground">Automatically switch between light and dark themes.</span>
						</Label>
						<Switch id="theme-system" checked={preferences.theme === 'system'} onCheckedChange={() => handleThemeChange('system')} />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor="theme-light" className="text-foreground">
							Light Mode
						</Label>
						<Switch id="theme-light" checked={preferences.theme === 'light'} onCheckedChange={() => handleThemeChange('light')} />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor="theme-dark" className="text-foreground">
							Dark Mode
						</Label>
						<Switch id="theme-dark" checked={preferences.theme === 'dark'} onCheckedChange={() => handleThemeChange('dark')} />
					</div>
				</CardContent>
			</Card> */}

			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg text-foreground">Email Notifications</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label htmlFor="email-updates" className="text-foreground">
							Product Updates
						</Label>
						<Switch id="email-updates" checked={preferences.emailNotifications.updates} onCheckedChange={(checked) => handleNotificationChange('updates', checked)} disabled={true} />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor="email-newsletter" className="text-foreground">
							Newsletter
						</Label>
						<Switch id="email-newsletter" checked={preferences.emailNotifications.newsletter} onCheckedChange={(checked) => handleNotificationChange('newsletter', checked)} disabled={true} />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor="email-marketing" className="text-foreground">
							Marketing & Promotional
						</Label>
						<Switch id="email-marketing" checked={preferences.emailNotifications.marketing} onCheckedChange={(checked) => handleNotificationChange('marketing', checked)} disabled={true} />
					</div>
				</CardContent>
			</Card>

			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg text-foreground">Language</CardTitle>
				</CardHeader>
				<CardContent>
					<Select value={preferences.language} onValueChange={handleLanguageChange}>
						<SelectTrigger className="w-full bg-background border-border focus:border-[var(--dashboard-accent)] focus:ring-[var(--dashboard-accent)]">
							<SelectValue placeholder="Select language" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="en">English</SelectItem>
							{/* <SelectItem value="es">Español (Spanish)</SelectItem>
							<SelectItem value="fr">Français (French)</SelectItem> */}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			<div className="pt-4">
				<Button onClick={handleSaveChanges} className="w-full bg-[var(--dashboard-accent)] hover:bg-[var(--dashboard-accent)]/90 text-[var(--dashboard-accent-foreground)] rounded-lg py-3" size="lg">
					Save Preferences
				</Button>
			</div>
		</div>
	);
}
