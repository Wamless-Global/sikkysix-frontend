import { Metadata } from 'next';
import P2PContent from '@/app/(protected)/account/wallet/transactions/[transactionId]/p2p-content';

export const metadata: Metadata = {
	title: 'Agent Portal - Trade Details',
	description: 'View details for a specific trade in the agent portal.',
};

export default function Page() {
	return (
		<>
			<P2PContent isAnAgent={true} />
		</>
	);
}
