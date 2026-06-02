import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Tasks',
	description: 'View and submit tasks.',
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
