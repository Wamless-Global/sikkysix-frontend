'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming Select is available

// Mock data for chart - replace with actual data fetching and processing
const _mockChartData = {
	'Total Investment Value': [
		{ date: '2025-01-01', value: 10000 },
		{ date: '2025-02-01', value: 12000 },
		{ date: '2025-03-01', value: 11500 },
		{ date: '2025-04-01', value: 13000 },
		{ date: '2025-05-01', value: 15000 },
	],
	'Number of Investors': [
		{ date: '2025-01-01', value: 50 },
		{ date: '2025-02-01', value: 65 },
		{ date: '2025-03-01', value: 70 },
		{ date: '2025-04-01', value: 80 },
		{ date: '2025-05-01', value: 95 },
	],
	'Cumulative Profit Distributed': [
		{ date: '2025-01-01', value: 500 },
		{ date: '2025-02-01', value: 700 },
		{ date: '2025-03-01', value: 900 },
		{ date: '2025-04-01', value: 1200 },
		{ date: '2025-05-01', value: 1500 },
	],
};

interface _ChartDataType {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		backgroundColor: string[];
		borderColor: string[];
		borderWidth: number;
	}[];
}

type DataSeries = keyof typeof _mockChartData;

const InvestmentPerformanceChart: React.FC = () => {
	const [selectedSeries, setSelectedSeries] = useState<DataSeries>('Total Investment Value');
	const [chartType, setChartType] = useState<'line' | 'bar'>('line');
	const [timePeriod, setTimePeriod] = useState<string>('All Time');
	// const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({}); // For custom date range

	// In a real implementation, you'd use a charting library like Recharts, Chart.js, or Nivo
	// For now, this is a placeholder.

	return (
		<Card className="shadow-lg">
			<CardHeader>
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<CardTitle>Investment Performance</CardTitle>
					<div className="flex flex-wrap gap-2">
						<Select value={selectedSeries} onValueChange={(value) => setSelectedSeries(value as DataSeries)}>
							<SelectTrigger className="w-full sm:w-[200px]">
								<SelectValue placeholder="Select Data Series" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Total Investment Value">Total Investment Value</SelectItem>
								<SelectItem value="Number of Investors">Number of Investors</SelectItem>
								<SelectItem value="Cumulative Profit Distributed">Cumulative Profit Distributed</SelectItem>
							</SelectContent>
						</Select>
						<Select value={chartType} onValueChange={(value) => setChartType(value as 'line' | 'bar')}>
							<SelectTrigger className="w-full sm:w-[120px]">
								<SelectValue placeholder="Chart Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="line">Line Chart</SelectItem>
								<SelectItem value="bar">Bar Chart</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-80 bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground mb-4">
					{/* Chart will be rendered here by a library */}
					<p>
						Interactive {chartType === 'line' ? 'Line' : 'Bar'} Chart for &quot;{selectedSeries}&quot; ({timePeriod}) - Placeholder
					</p>
					<p>&quot;Nothing here yet&quot; &quot;Start investing to see your performance!&quot;</p>
				</div>
				<div className="flex flex-wrap justify-center gap-2">
					{['24H', '7D', '30D', '90D', 'YTD', 'All Time'].map((period) => (
						<Button key={period} variant={timePeriod === period ? 'default' : 'ghost'} size="sm" onClick={() => setTimePeriod(period)} className="px-3 h-8 text-xs">
							{period}
						</Button>
					))}
					{/* TODO: Add Custom Date Range Selector Component */}
					<Button variant="outline" size="sm" className="px-3 h-8 text-xs">
						Custom Range
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default InvestmentPerformanceChart;
