import { Metadata } from 'next';
import _Content from './content';
import { ComingSoon } from '@/components/ui/coming-soon';

export const metadata: Metadata = {
	title: 'Account Referrals',
	description: 'Manage your referrals and earn rewards.',
};

export default function Page() {
	return (
		<>
			<ComingSoon />
		</>
	);
}
