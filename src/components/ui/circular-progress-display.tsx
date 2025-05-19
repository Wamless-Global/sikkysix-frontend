const CircularProgressDisplay = ({ value, percentage, size = 200, active }: { value: string; percentage?: number; size?: number; active: boolean }) => {
	const strokeWidth = 15;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = percentage ? circumference - (percentage / 100) * circumference : circumference;

	return (
		<div className={`relative flex flex-col items-center justify-center`} style={{ width: size, height: size }}>
			<svg width={size} height={size} className="transform -rotate-90">
				<circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="currentColor" className="text-gray-700" fill="transparent" />
				{percentage !== undefined && (
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						strokeWidth={strokeWidth}
						stroke="currentColor"
						className={active ? `text-[var(--dashboard-accent)]` : `text-[var(--dashboard-accent)]/30`}
						fill="transparent"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
					/>
				)}
			</svg>
			<div className="absolute flex flex-col items-center justify-center text-white">
				<span className="text-xl md:text-3xl font-bold">{value}</span>
				{percentage !== undefined && (
					<span className={`text-sm ${percentage > 0 ? 'text-[var(--dashboard-accent)]/90' : 'text-red-400'}`}>
						{percentage > 0 ? '+' : ''}
						{percentage.toFixed(2)}%
					</span>
				)}
			</div>
		</div>
	);
};

export default CircularProgressDisplay;
