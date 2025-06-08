import Content from './content';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Withdraw Funds | Account | Wallet',
	description: 'Withdraw funds from your wallet.',
};

export default async function Page() {
	return (
		<>
			<Content />
		</>
	);
}
