import { CustomLink } from '@/components/ui/CustomLink';

export default function NotFound() {
	return (
		<div style={{ textAlign: 'center', marginTop: '50px' }}>
			<h1>404 - Page Not Found</h1>
			<p>Sorry, the page you are looking for does not exist.</p>
			<CustomLink href="/">Go back home</CustomLink>
		</div>
	);
}
