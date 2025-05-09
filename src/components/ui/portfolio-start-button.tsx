'use client';

import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function PortfolioStartButton() {
	const router = useRouter();

	const handleClick = () => {
		nProgress.start();
		router.push('/account'); // Or any other desired path
	};

	return (
		<Button
			variant="success" // Assuming "success" is a defined variant, otherwise use "cta" or a suitable one
			onClick={handleClick}
			size="lg"
		>
			Start Now <ArrowRight className="ml-2 h-5 w-5" />
		</Button>
	);
}
