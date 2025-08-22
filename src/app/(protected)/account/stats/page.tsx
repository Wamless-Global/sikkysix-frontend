import { Metadata } from 'next';
import StatsPageContent from './content';

export const metadata: Metadata = {
	title: 'Special User Referral Stats',
	description: 'View stats for special users with referral deals.',
};

export default function Page() {
	return <StatsPageContent />;
}
