import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Wallet',
	description: 'Manage your wallet and view transactions.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
