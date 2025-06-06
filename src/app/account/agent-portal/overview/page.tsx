import { Metadata } from 'next';

import AgentPortalContent from '../content';

export const metadata: Metadata = {
	title: 'Agent Portal Overview',
	description: 'Overview of the agent portal',
};

export default function Page() {
	return <AgentPortalContent />;
}
