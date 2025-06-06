import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Change Password',
	description: 'Update your account password',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
