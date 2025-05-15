import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] text-center px-4">
			<div className="flex flex-col items-center justify-center mb-4">
				<h1 className="text-6xl font-extrabold text-primary mr-4">404</h1>
				<p className="text-2xl font-medium">Page Not Found</p>
			</div>
			<p className="text-muted-foreground mb-8">Sorry, the page you are looking for does not exist within the admin section.</p>
			<Button asChild>
				<CustomLink href="/admin">Go back to Admin Dashboard</CustomLink>
			</Button>
		</div>
	);
}
