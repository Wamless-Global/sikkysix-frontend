import { Metadata } from 'next';
import AgentPortalContent from './content';

export const metadata: Metadata = {
	title: 'Agent Portal',
	description: 'Access and manage your agent account.',
};

export default function Page() {
	return <AgentPortalContent />;
}
