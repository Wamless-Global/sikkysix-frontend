import type { Config } from 'tailwindcss';
import fontFamily from 'tailwindcss/defaultTheme'; // Corrected default import
import plugin from 'tailwindcss/plugin';

const config: Config = {
	darkMode: 'class', // Enable class-based dark mode
	content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				// Cast fontFamily to any to bypass strict index signature checks
				sans: ['var(--font-montserrat)', ...((fontFamily as any)['sans'] || [])],
				mono: ['var(--font-geist-mono)', ...((fontFamily as any)['mono'] || [])],
				nico: ['"Nico Moji"', ...((fontFamily as any)['sans'] || [])], // Added Nico Moji, fallback to sans
			},
			colors: {
				border: 'oklch(var(--border))',
				input: 'oklch(var(--input))',
				ring: 'oklch(var(--ring))',
				background: 'oklch(var(--background))',
				foreground: 'oklch(var(--foreground))',
				primary: {
					DEFAULT: 'oklch(var(--primary))',
					foreground: 'oklch(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'oklch(var(--secondary))',
					foreground: 'oklch(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'oklch(var(--destructive))',
					// foreground: 'oklch(var(--destructive-foreground))', // Assuming you might add this variable
				},
				muted: {
					DEFAULT: 'oklch(var(--muted))',
					foreground: 'oklch(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'oklch(var(--accent))',
					foreground: 'oklch(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'oklch(var(--popover))',
					foreground: 'oklch(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'oklch(var(--card))',
					foreground: 'oklch(var(--card-foreground))',
				},
				// Add sidebar colors if needed for utility classes
				sidebar: {
					DEFAULT: 'oklch(var(--sidebar))',
					foreground: 'oklch(var(--sidebar-foreground))',
					primary: 'oklch(var(--sidebar-primary))',
					'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
					accent: 'oklch(var(--sidebar-accent))',
					'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
					border: 'oklch(var(--sidebar-border))',
					ring: 'oklch(var(--sidebar-ring))',
				},
				active: {
					DEFAULT: 'red',
					foreground: 'oklch(var(--active-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)', // Added xl based on globals.css
				'2xl': 'calc(var(--radius) + 8px)', // Added 2xl based on globals.css
				'3xl': 'calc(var(--radius) + 16px)', // Added 3xl based on globals.css
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in-up': {
					// Added from globals.css
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out forwards', // Added from globals.css
			},
		},
	},
	plugins: [
		require('tailwindcss-animate'),
		// Add custom variant plugin from globals.css if still needed,
		// though standard dark mode should handle most cases.
		plugin(function ({ addVariant }) {
			addVariant('dark', '&:is(.dark *)'); // Keep custom variant if specific selectors rely on it
		}),
	],
};

export default config;
