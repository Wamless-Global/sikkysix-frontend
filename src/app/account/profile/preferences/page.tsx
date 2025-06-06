import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Account Preferences',
	description: 'Manage your account preferences.',
};
import Content from './content';

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
