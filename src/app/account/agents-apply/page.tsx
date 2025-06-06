import { Metadata } from 'next';
import AgentApplicationContent from './content';

export const metadata: Metadata = {
	title: 'Apply to be an Agent',
	description: 'Apply to become an agent and join our network.',
};

export default function Page() {
	return <AgentApplicationContent />;
}
