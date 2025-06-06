import Content from './content';

// Update to support async searchParams for Next.js 15+
export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
	const params = await searchParams;
	let initialStatus = { status: 'success', message: 'Your email address has been successfully verified. You can now log in.' };

	if (params?.error) {
		const errorDesc = params.error_description || 'An unknown error occurred during verification.';
		if (errorDesc.toLowerCase().includes('expired') || params.error === 'access_denied') {
			initialStatus = {
				status: 'expired',
				message: errorDesc,
			};
		} else {
			initialStatus = {
				status: 'error',
				message: errorDesc,
			};
		}
	}

	return <Content initialStatus={initialStatus} />;
}
