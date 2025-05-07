'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

// Placeholder data
const data = [
	{ name: 'Jan', volume: 4000 },
	{ name: 'Feb', volume: 3000 },
	{ name: 'Mar', volume: 2000 },
	{ name: 'Apr', volume: 2780 },
	{ name: 'May', volume: 1890 },
	{ name: 'Jun', volume: 2390 },
	{ name: 'Jul', volume: 3490 },
];

// Helper to get computed style - returns the full computed value (e.g., "oklch(0.627 0.265 303.9)")
const getResolvedCssVariable = (variableName: string): string => {
	if (typeof window === 'undefined') return ''; // Avoid errors during SSR
	// Ensure the variable name starts with --
	const cssVar = variableName.startsWith('--') ? variableName : `--${variableName}`;
	try {
		// Ensure documentElement exists (it should client-side)
		if (!document.documentElement) return '';
		return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
	} catch (error) {
		logger.error(`Error getting CSS variable ${cssVar}:`, error);
		return ''; // Return empty string on error
	}
};

const InvestmentTrendChart = () => {
	const { resolvedTheme } = useTheme(); // Use resolvedTheme to ensure we know if it's light or dark
	const [chartColors, setChartColors] = useState({
		strokeColor: '',
		gridColor: '',
		textColor: '',
		tooltipBg: '',
		tooltipBorder: '',
	});
	const [isClient, setIsClient] = useState(false); // State to track client-side mount

	// Ensure this runs only on the client
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Update colors when theme changes (and on initial client mount)
	useEffect(() => {
		if (!isClient) return; // Don't run on server or before mount

		const primaryColor = getResolvedCssVariable('--primary');
		const borderColor = getResolvedCssVariable('--border');
		const mutedFgColor = getResolvedCssVariable('--muted-foreground');
		const bgColor = getResolvedCssVariable('--background');

		// Construct grid color with appropriate alpha based on theme
		const gridAlpha = resolvedTheme === 'dark' ? 0.2 : 0.5;
		// Basic check if borderColor is oklch to apply alpha correctly
		const gridColorValue = borderColor.startsWith('oklch') ? `${borderColor} / ${gridAlpha}` : borderColor; // Fallback if not oklch (though it should be)

		setChartColors({
			strokeColor: primaryColor, // Use the resolved value directly
			gridColor: gridColorValue,
			textColor: mutedFgColor,
			tooltipBg: bgColor,
			tooltipBorder: borderColor,
		});
	}, [resolvedTheme, isClient]); // Rerun effect when theme or client status changes

	// Prevent rendering chart until colors are resolved client-side
	if (!isClient || !chartColors.strokeColor) {
		// Return loading state or null, ensuring valid JSX
		return <div className="h-full w-full flex items-center justify-center text-muted-foreground">Loading chart...</div>;
	}

	// Render the chart only when client-side and colors are ready
	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
				<defs>
					<linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={chartColors.strokeColor} stopOpacity={0.8} />
						<stop offset="95%" stopColor={chartColors.strokeColor} stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} />
				<XAxis dataKey="name" stroke={chartColors.textColor} fontSize={12} tickLine={false} axisLine={false} />
				<YAxis stroke={chartColors.textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
				<Tooltip
					cursor={{ stroke: chartColors.strokeColor, strokeWidth: 1, strokeDasharray: '3 3' }}
					contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 'var(--radius-md)' }}
					labelStyle={{ color: chartColors.textColor }}
					itemStyle={{ color: chartColors.strokeColor }}
				/>
				<Area type="monotone" dataKey="volume" stroke={chartColors.strokeColor} strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" activeDot={{ r: 6, strokeWidth: 1, fill: chartColors.tooltipBg, stroke: chartColors.strokeColor }} name="Investment Volume" />
			</AreaChart>
		</ResponsiveContainer>
	);
};

export default InvestmentTrendChart;
