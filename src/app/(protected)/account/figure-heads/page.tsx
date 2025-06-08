import { Metadata } from 'next';
import { ComingSoon } from '@/components/ui/coming-soon';

export const metadata: Metadata = {
	title: 'Account Figure Heads',
	description: 'Manage your figure heads in your account.',
};

export default function Page() {
	return (
		<>
			<ComingSoon />
		</>
	);
}
