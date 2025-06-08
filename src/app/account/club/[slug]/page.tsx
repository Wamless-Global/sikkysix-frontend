import Content from './content';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: { params: Params; searchParams: SearchParams }) {
	const params = await props.params;
	const slug = params.slug;

	return {
		title: `Club : ${slug.toLocaleUpperCase()}`,
		description: `Details for the club: ${slug.toLocaleUpperCase()}`,
	};
}

export default async function Page() {
	return (
		<>
			<Content />
		</>
	);
}
