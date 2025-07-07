import { Metadata } from 'next';
import AboutContent from './content';

export const metadata: Metadata = {
	title: 'About',
	description: 'About Page.',
};

export default function Page() {
	return <AboutContent />;
}
