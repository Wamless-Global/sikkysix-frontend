import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Deposit Funds',
	description: 'Deposit funds into your wallet.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
