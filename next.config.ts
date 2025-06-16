import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatar.vercel.sh',
			},
			{
				protocol: 'https',
				hostname: 'loremflickr.com',
			},
			{
				protocol: 'https',
				hostname: 'dhzqzevtqhqrttzurgor.supabase.co',
			},
			{
				protocol: 'https',
				hostname: 'api.supabase.local',
			},
		],
	},

	allowedDevOrigins: ['sikkysix.local', '*.sikkysix.local'],
};

export default nextConfig;
