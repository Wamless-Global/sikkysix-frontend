import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { type NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:5002/api';

/** Core proxy helper */
async function proxy(req: NextRequest, path: string[]) {
	const targetUrl = `${API_BASE_URL}/${path.join('/')}`;

	const headers = new Headers(req.headers);
	headers.set('x-forwarded-for', req.headers.get('x-forwarded-for') ?? '');

	const backendRes = await fetchWithAuth(targetUrl, {
		method: req.method,
		headers,
		body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
		redirect: 'manual',
	});

	return new NextResponse(backendRes.body, {
		status: backendRes.status,
		statusText: backendRes.statusText,
		headers: backendRes.headers,
	});
}

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
	const { path } = await ctx.params;
	return proxy(req, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD = handle;
