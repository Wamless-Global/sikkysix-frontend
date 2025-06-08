import { Metadata } from 'next';
import Content from '../content';

export const metadata: Metadata = {
	title: 'Account Clubs',
	description: 'Manage your account categories.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
