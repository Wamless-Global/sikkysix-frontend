import Content from './content';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Payment Options',
	description: 'Manage your bank details for your account profile.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
