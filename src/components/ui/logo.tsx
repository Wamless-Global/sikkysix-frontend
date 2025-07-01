import Image from 'next/image';

const sizeMap = {
	xs: 30,
	sm: 60,
	md: 90,
	lg: 120,
	xl: 150,
};

const logoVariants = {
	default: '/logo.png',
	full: '/logo.png',
	text: '/logo-name.png',
	dice: '/logo-icon.png',
	'dark-with-text': '/dark-logo-text.png',
	dark: '/dark-full-logo.png',
};

export default function Logo({
	size = 'lg',
	variant = 'default',
	alt = 'SikkiSix Logo',
	style,
	className,
	...props
}: {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	variant?: keyof typeof logoVariants;
	alt?: string;
	style?: React.CSSProperties;
	className?: string;
} & Omit<React.ComponentProps<typeof Image>, 'src'>) {
	const dimension = sizeMap[size] || sizeMap.lg;
	const logoImg = logoVariants[variant] || logoVariants.default;

	return <Image src={logoImg} width={dimension} height={dimension / 2} alt={alt} style={{ minWidth: dimension, minHeight: dimension, objectFit: 'contain', ...style }} className={className} priority {...props} />;
}
