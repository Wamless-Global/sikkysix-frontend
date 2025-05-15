import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ComingSoonProps {
	title?: string;
	description?: string;
}

export function ComingSoon({ title = 'Coming Soon', description = 'This feature is currently under development.' }: ComingSoonProps) {
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-center">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center">
					<Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
				</div>
				<p className="text-center text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
}
