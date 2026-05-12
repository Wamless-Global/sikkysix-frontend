import { Metadata } from 'next';
import ClubsContent from './content';

export const metadata: Metadata = {
	title: 'Account Clubs',
	description: 'Manage your account categories.',
};

export default function Page() {
	return (
		<>
			<ClubsContent />
		</>
	);
}
