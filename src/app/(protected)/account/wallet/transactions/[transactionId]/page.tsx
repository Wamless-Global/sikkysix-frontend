import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Transactions Details',
	description: 'View your wallet transaction history',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
