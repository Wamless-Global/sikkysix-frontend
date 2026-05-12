import { Metadata } from 'next';
import SubmitTaskContent from './content';

export const metadata: Metadata = {
	title: 'Submit Task Entry',
	description: 'Submit your entry for the weekly task.',
};

export default function Page() {
	return (
		<>
			<SubmitTaskContent />
		</>
	);
}
