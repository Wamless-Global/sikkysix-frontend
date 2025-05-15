import { Suspense } from 'react';
import WithdrawDetailsContent from './content';

export default function WithdrawDetailsPage() {
	return (
		<Suspense>
			<WithdrawDetailsContent />
		</Suspense>
	);
}
