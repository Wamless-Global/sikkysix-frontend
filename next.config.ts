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
			{
				protocol: 'https',
				hostname: 'auth.sikkysix.com',
			},
		],
	},

	allowedDevOrigins: ['sikkysix.local', '*.sikkysix.local', '0a4275e217b2.ngrok-free.app'],

	async rewrites() {
		return [
			{
				// Proxy requests from /api/... on the frontend to the backend
				source: '/api/:path*',

				destination: `${process.env.API_BASE_URL}/:path*`,
			},
		];
	},
};

export default nextConfig;
