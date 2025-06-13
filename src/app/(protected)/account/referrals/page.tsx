import { Metadata } from 'next';
import _Content from './content';

export const metadata: Metadata = {
	title: 'Account Referrals',
	description: 'Manage your referrals and earn rewards.',
};

export default function Page() {
	return (
		<>
			<_Content />
		</>
	);
}
