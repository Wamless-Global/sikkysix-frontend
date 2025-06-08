import { Metadata } from 'next';
import Content from './content';

export const metadata: Metadata = {
	title: 'Sign Up',
	description: 'Create a new account to start using our services.',
	keywords: ['sign up', 'register', 'create account', 'new user'],
};

export default function Page() {
	return (
		<>
			<Content />
		</>
	);
}
