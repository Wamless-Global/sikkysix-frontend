'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Import nprogress CSS

// Optional: Configure NProgress
NProgress.configure({ showSpinner: false });

export function ProgressBar() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		NProgress.done(); // Ensure progress bar is finished on initial load or component mount
	}, [pathname, searchParams]);

	// Note: Next.js App Router doesn't have direct router events like the Pages Router.
	// NProgress integration often relies on detecting navigation start/end.
	// A common pattern is to start on link clicks or form submissions and end when the pathname/searchParams change.
	// However, a simpler approach for App Router is often to use a layout effect or Suspense boundary,
	// but for a direct NProgress implementation mimicking router events, we listen to pathname/searchParams changes.
	// A more robust solution might involve a custom hook or context that tracks navigation state.

	// This basic implementation finishes the progress bar when the route changes.
	// Starting the progress bar needs to be triggered manually before navigation,
	// which is less automatic than with Pages Router events.

	// For a more automatic approach, consider libraries like `nextjs-toploader`.
	// If you want the classic NProgress behavior tied to router events,
	// you might need a more complex setup or stick to the Pages Router pattern if applicable.

	// For now, this component primarily ensures the CSS is loaded and NProgress is available.
	// We'll need to integrate the start logic elsewhere, typically in the layout.

	return null; // This component doesn't render anything itself
}
