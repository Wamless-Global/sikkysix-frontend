import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Portfolio Details',
	description: 'View details of a specific share in your portfolio.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
