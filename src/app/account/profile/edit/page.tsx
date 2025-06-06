import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Edit Profile',
	description: 'Edit your account profile details.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
