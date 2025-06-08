import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Agent Portal Orders',
	description: 'View and manage your orders in the agent portal.',
};

export default function Page() {
	return <Content />;
}
