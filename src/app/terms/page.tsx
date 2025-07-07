import { Metadata } from 'next';
import TermsContent from './content';

export const metadata: Metadata = {
	title: 'Terms',
	description: 'Terms Page.',
};

export default function Page() {
	return <TermsContent />;
}
