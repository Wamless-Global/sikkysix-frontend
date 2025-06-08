import { ComingSoon } from '@/components/ui/coming-soon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Account Games',
	description: 'Explore the games available in your account.',
};

export default function Page() {
	return (
		<>
			<ComingSoon />
		</>
	);
}
