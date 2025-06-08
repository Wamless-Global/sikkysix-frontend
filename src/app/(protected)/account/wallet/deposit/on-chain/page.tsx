import type { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'On-Chain Deposit',
	description: 'Deposit funds into your wallet using on-chain transactions.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
