import { Metadata } from 'next';
import VerifyContent from './content';

export const metadata: Metadata = {
	title: 'Telegram Mini App',
	description: 'Telegram Mini App',
};

export default async function Page() {
	return <VerifyContent />;
}
