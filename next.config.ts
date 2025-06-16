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

	async rewrites() {
		return [
			{
				// Proxy requests from /api/... on the frontend to http://localhost:5002/api/... on the backend
				source: '/api/:path*',

				destination: `${process.env.API_BASE_URL}/:path*`,
			},
		];
	},
};

export default nextConfig;
