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
				// Ensure destination includes the /v1 path consistent with API_BASE_URL
				destination: 'https://api.sikkysix.local/api/v1/:path*',
				// destination: 'https://sikkysix-backend-production.up.railway.app/api/v1/:path*',
			},
		];
	},
};

export default nextConfig;
