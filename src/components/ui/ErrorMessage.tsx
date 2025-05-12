import { AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
	message: string | null;
	onRetry?: () => void;
	retryButtonText?: string;
	className?: string;
}

export default function ErrorMessage({ message, onRetry, retryButtonText = 'Retry', className }: ErrorMessageProps) {
	if (!message) {
		return null;
	}

	return (
		<div className={cn('bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between', className)} role="alert">
			<div className="flex items-center">
				<AlertCircle className="h-5 w-5 mr-2" />
				<strong className="font-bold">Error:</strong>
				<span className="block sm:inline ml-2">{message}</span>
			</div>
			{onRetry && (
				<Button onClick={onRetry} variant="outline" size="sm">
					{retryButtonText}
				</Button>
			)}
		</div>
	);
}
