import { Metadata } from 'next';
import PrivacyContent from './content';

export const metadata: Metadata = {
	title: 'Privacy',
	description: 'Privacy Page.',
};

export default function Page() {
	return <PrivacyContent />;
}
