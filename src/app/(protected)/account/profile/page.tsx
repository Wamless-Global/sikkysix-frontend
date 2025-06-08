import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Profile',
	description: 'Manage your account profile settings',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
