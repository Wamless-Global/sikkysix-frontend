import { Metadata } from 'next';
import Content from '@/app/account/wallet/deposit/p2p/preview-order/content';

export const metadata: Metadata = {
	title: 'Preview P2P Withdrawal Order',
	description: 'Review the details of your peer-to-peer withdrawal order before confirming.',
};

export default function Page() {
	return (
		<>
			<Content page="withdraw" />
		</>
	);
}
