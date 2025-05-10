'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

const data = [
	{ name: 'Jan', volume: 4000 },
	{ name: 'Feb', volume: 3000 },
	{ name: 'Mar', volume: 2000 },
	{ name: 'Apr', volume: 2780 },
	{ name: 'May', volume: 1890 },
	{ name: 'Jun', volume: 2390 },
	{ name: 'Jul', volume: 3490 },
];

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

const InvestmentTrendChart = () => {
	const { resolvedTheme } = useTheme();
	const [chartColors, setChartColors] = useState({
		strokeColor: '',
		gridColor: '',
		textColor: '',
		tooltipBg: '',
		tooltipBorder: '',
	});
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (!isClient) return;

		const primaryColor = getResolvedCssVariable('--primary');
		const borderColor = getResolvedCssVariable('--border');
		const mutedFgColor = getResolvedCssVariable('--muted-foreground');
		const bgColor = getResolvedCssVariable('--background');

		const gridAlpha = resolvedTheme === 'dark' ? 0.2 : 0.5;
		const gridColorValue = borderColor.startsWith('oklch') ? `${borderColor} / ${gridAlpha}` : borderColor;

		setChartColors({
			strokeColor: primaryColor,
			gridColor: gridColorValue,
			textColor: mutedFgColor,
			tooltipBg: bgColor,
			tooltipBorder: borderColor,
		});
	}, [resolvedTheme, isClient]);

	if (!isClient || !chartColors.strokeColor) {
		return <div className="h-full w-full flex items-center justify-center text-muted-foreground">Loading chart...</div>;
	}

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
