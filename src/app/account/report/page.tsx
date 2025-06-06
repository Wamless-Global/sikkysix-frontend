import { Metadata } from 'next';
import _Content from './content';
import { ComingSoon } from '@/components/ui/coming-soon';

export const metadata: Metadata = {
	title: 'Account Report - Coming Soon',
	description: 'View your account reports. This feature is coming soon.',
};

export default function Page() {
	return (
		<>
			<ComingSoon />
		</>
	);
}
