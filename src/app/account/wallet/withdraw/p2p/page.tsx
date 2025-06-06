import { Metadata } from 'next';
import Content from '@/app/account/wallet/deposit/p2p/content';

export const metadata: Metadata = {
	title: 'P2P Withdraw | Wallet | Account',
	description: 'Withdraw funds from your wallet using P2P.',
};

export default function Page() {
	return (
		<>
			<Content page="withdraw" />
		</>
	);
}
