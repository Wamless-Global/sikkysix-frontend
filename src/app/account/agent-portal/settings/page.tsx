import type { Metadata } from 'next';
import AgentPortalSettingsContent from './content';

export const metadata: Metadata = {
	title: 'Agent Portal Settings',
	description: 'Manage your agent portal settings',
};

export default function Page() {
	return <AgentPortalSettingsContent />;
}
