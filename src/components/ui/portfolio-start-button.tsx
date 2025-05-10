'use client';

import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function PortfolioStartButton() {
	const router = useRouter();

	const handleClick = () => {
		nProgress.start();
		router.push('/account');
	};

	return (
		<Button variant="success" onClick={handleClick} size="lg">
			Start Now <ArrowRight className="ml-2 h-5 w-5" />
		</Button>
	);
}
