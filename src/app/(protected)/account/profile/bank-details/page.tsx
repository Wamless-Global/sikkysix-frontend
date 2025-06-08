import Content from './content';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Account Bank Details',
	description: 'Manage your bank details for your account profile.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
