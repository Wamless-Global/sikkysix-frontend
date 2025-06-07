// Placeholder SVG for Logo - Using CSS Vars
// Add size variant support
const sizeMap = {
	xs: 16,
	sm: 24,
	md: 32,
	lg: 40,
	xl: 56,
};

export default function LogoPlaceholder({ size = 'lg' }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
	const dimension = sizeMap[size] || sizeMap.lg;
	const padding = Math.round(dimension * 0.25); // 25% padding
	const fontSize = Math.round(dimension * 0.75);
	const borderRadius = Math.round((dimension + padding * 2) * 0.2);
	const boxSize = dimension + padding * 2;
	return (
		<svg width={boxSize} height={boxSize} viewBox={`0 0 ${boxSize} ${boxSize}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ minWidth: boxSize, minHeight: boxSize }}>
			<rect width={boxSize} height={boxSize} rx={borderRadius} fill="var(--lp-green-primary)" />
			<text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="var(--primary-foreground)" fontSize={fontSize} fontWeight="bold">
				SS
			</text>
		</svg>
	);
}
