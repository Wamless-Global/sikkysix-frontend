import { Metadata, ResolvingMetadata } from 'next';
import Content from './content';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: { params: Params; searchParams: SearchParams }) {
	const params = await props.params;
	const slug = params.slug;

	return {
		title: `Category: ${slug}`,
		description: `Details for the category: ${slug}`,
	};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	return (
		<>
			<Content />
		</>
	);
}
