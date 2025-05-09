'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

// Placeholder data
const data = [
	{ name: 'Wk 1', users: 50 },
	{ name: 'Wk 2', users: 75 },
	{ name: 'Wk 3', users: 60 },
	{ name: 'Wk 4', users: 90 },
	{ name: 'Wk 5', users: 110 },
	{ name: 'Wk 6', users: 100 },
];

// Helper to get computed style - returns the full computed value
const getResolvedCssVariable = (variableName: string): string => {
	if (typeof window === 'undefined') return '';
	const cssVar = variableName.startsWith('--') ? variableName : `--${variableName}`;
	try {
		if (!document.documentElement) return '';
		return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
	} catch (error) {
		console.error(`Error getting CSS variable ${cssVar}:`, error);
		return '';
	}
};

const UserGrowthChart = () => {
	const { resolvedTheme } = useTheme(); // Use resolvedTheme
	const [chartColors, setChartColors] = useState({
		fillColor: '',
		gridColor: '',
		textColor: '',
		tooltipBg: '',
		tooltipBorder: '',
		cursorFill: '',
	});
	const [isClient, setIsClient] = useState(false); // State for client mount

	// Track client mount
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Update colors when theme changes or on mount
	useEffect(() => {
		if (!isClient) return;

		const primaryColor = getResolvedCssVariable('--primary');
		const borderColor = getResolvedCssVariable('--border');
		const mutedFgColor = getResolvedCssVariable('--muted-foreground');
		const bgColor = getResolvedCssVariable('--background');
		const mutedColor = getResolvedCssVariable('--muted'); // Get muted color for cursor

		// Construct grid color with alpha
		const gridAlpha = resolvedTheme === 'dark' ? 0.2 : 0.5;
		const gridColorValue = borderColor.startsWith('oklch') ? `${borderColor} / ${gridAlpha}` : borderColor;

		// Construct cursor fill color with alpha - Use different base for light/dark
		let cursorFillValue = '';
		if (resolvedTheme === 'dark') {
			const cursorAlpha = 0.3;
			cursorFillValue = mutedColor.startsWith('oklch') ? `${mutedColor} / ${cursorAlpha}` : mutedColor;
		} else {
			// Use a fixed light gray with alpha for light mode hover
			cursorFillValue = 'rgba(203, 213, 225, 0.3)'; // Example: slate-300 with 30% opacity
		}

		setChartColors({
			fillColor: primaryColor,
			gridColor: gridColorValue,
			textColor: mutedFgColor,
			tooltipBg: bgColor,
			tooltipBorder: borderColor,
			cursorFill: cursorFillValue,
		});
	}, [resolvedTheme, isClient]);

	// Loading state
	if (!isClient || !chartColors.fillColor) {
		return <div className="h-full w-full flex items-center justify-center text-muted-foreground">Loading chart...</div>;
	}

	// Render chart
	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={6}>
				<CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} vertical={false} />
				<XAxis dataKey="name" stroke={chartColors.textColor} fontSize={12} tickLine={false} axisLine={false} />
				<YAxis stroke={chartColors.textColor} fontSize={12} tickLine={false} axisLine={false} />
				<Tooltip
					cursor={{ fill: chartColors.cursorFill }}
					contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 'var(--radius-md)' }}
					labelStyle={{ color: chartColors.textColor }}
					itemStyle={{ color: chartColors.fillColor }}
				/>
				<Bar dataKey="users" fill={chartColors.fillColor} radius={[4, 4, 0, 0]} name="New Users" />
			</BarChart>
		</ResponsiveContainer>
	);
};

export default UserGrowthChart;
