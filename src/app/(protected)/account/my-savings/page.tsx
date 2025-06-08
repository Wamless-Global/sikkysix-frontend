import Content from './content';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'My Savings',
	description: 'View and manage your investment portfolio.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
