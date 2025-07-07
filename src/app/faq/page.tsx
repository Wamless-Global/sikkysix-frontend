import { Metadata } from 'next';
import FAQContent from './content';

export const metadata: Metadata = {
	title: 'FAQ',
	description: 'FAQ Page.',
};

export default function Page() {
	return <FAQContent />;
}
