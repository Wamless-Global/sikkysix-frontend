import { Metadata } from 'next';
import MiniApp from './content';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
	title: 'Telegram Mini App',
	description: 'Telegram Mini App',
};

export default async function Page() {
	const baseUrl = process.env.API_BASE_URL;
	const cookieStore = await cookies();

	let countries = [];

	try {
		const countriesRes = await fetchWithAuth(`${baseUrl}/auth/all-countries`, {
			headers: {
				Cookie: cookieStore.toString(),
			},
			cache: 'no-store',
		});
		if (countriesRes.ok) {
			countries = await countriesRes.json();
		}
	} catch (e) {}
	return <MiniApp countries={countries} />;
}
