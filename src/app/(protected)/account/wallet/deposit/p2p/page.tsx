import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Account Wallet Deposit P2P',
	description: 'Deposit funds into your wallet using peer-to-peer methods.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
