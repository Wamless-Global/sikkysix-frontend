import { Metadata } from 'next';
import Content from '../content';

export const metadata: Metadata = {
	title: 'Account Categories',
	description: 'Manage your account categories.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
