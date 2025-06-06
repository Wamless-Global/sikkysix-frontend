import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Preview P2P Deposit Order',
	description: 'Review the details of your peer-to-peer deposit order before confirming.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
