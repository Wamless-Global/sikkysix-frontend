'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NProgress from 'nprogress';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form'; // Removed Controller, not used directly for file input like this
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch'; // Added for consistency if other fields need it, though not directly for image
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

// Constants from create page for image handling
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type AssetMetricDetails = {
	currentPriceUSD: number;
	priceChange24hPercent: number;
	priceChange7dPercent: number;
	priceChange30dPercent: number;
	volume24hUSD: number;
	liquidityUSD: number;
	marketCapUSD: number;
	totalSupply: number;
	circulatingSupply: number;
	holdersCount: number;
};

type AssetSimulatedParameters = {
	volatilityFactor: number;
	baseTransactionFee: number;
};

type AssetDefinition = {
	id: string;
	slug: string;
	name: string;
	symbol: string;
	description: string;
	logoUrl: string;
	status: 'Active' | 'Locked' | 'Delisted';
	statusReason?: string;
	metrics: AssetMetricDetails;
	simulatedParameters: AssetSimulatedParameters;
};

type AssetDetailsMock = {
	[key: string]: AssetDefinition;
};

const assetDetailsMock: AssetDetailsMock = {
	'eth-usd': {
		id: 'asset_eth_001',
		slug: 'eth-usd',
		name: 'Simulated Ethereum',
		symbol: 'sETH',
		description: 'A simulated version of Ethereum for testing and educational purposes.',
		logoUrl: '/crypto_logos/eth.png',
		status: 'Active',
		metrics: { currentPriceUSD: 2050.75, priceChange24hPercent: 2.5, priceChange7dPercent: -1.2, priceChange30dPercent: 15.8, volume24hUSD: 12500000, liquidityUSD: 50000000, marketCapUSD: 246000000000, totalSupply: 120000000, circulatingSupply: 120000000, holdersCount: 15203 },
		simulatedParameters: { volatilityFactor: 0.03, baseTransactionFee: 0.0005 },
	},
	'btc-usd': {
		id: 'asset_btc_002',
		slug: 'btc-usd',
		name: 'Simulated Bitcoin',
		symbol: 'sBTC',
		description: 'A simulated version of Bitcoin.',
		logoUrl: '/crypto_logos/btc.png',
		status: 'Active',
		metrics: { currentPriceUSD: 30100.2, priceChange24hPercent: -0.8, priceChange7dPercent: 3.1, priceChange30dPercent: 8.2, volume24hUSD: 25000000, liquidityUSD: 100000000, marketCapUSD: 580000000000, totalSupply: 21000000, circulatingSupply: 19500000, holdersCount: 8750 },
		simulatedParameters: { volatilityFactor: 0.02, baseTransactionFee: 0.0002 },
	},
	'sol-usd': {
		id: 'asset_sol_003',
		slug: 'sol-usd',
		name: 'Simulated Solana',
		symbol: 'sSOL',
		description: 'Experience Solana in a simulated setting.',
		logoUrl: '/crypto_logos/sol.png',
		status: 'Locked',
		statusReason: 'Network upgrade simulation',
		metrics: { currentPriceUSD: 22.5, priceChange24hPercent: 0.1, priceChange7dPercent: -5.5, priceChange30dPercent: 25.0, volume24hUSD: 8000000, liquidityUSD: 30000000, marketCapUSD: 9000000000, totalSupply: 500000000, circulatingSupply: 400000000, holdersCount: 6100 },
		simulatedParameters: { volatilityFactor: 0.05, baseTransactionFee: 0.00001 },
	},
};

const assetEditFormSchema = z.object({
	name: z.string().min(3, { message: 'Name must be at least 3 characters.' }).max(50, { message: 'Name must not exceed 50 characters.' }),
	symbol: z
		.string()
		.min(2, { message: 'Symbol must be at least 2 characters.' })
		.max(10, { message: 'Symbol must not exceed 10 characters.' })
		.regex(/^[a-zA-Z0-9]+$/, { message: 'Symbol must be alphanumeric.' }),
	description: z.string().max(500, { message: 'Description must not exceed 500 characters.' }).optional().nullable(),
	image: z // Changed from logoUrl to image
		.instanceof(File, { message: 'Image is required.' })
		.optional()
		.nullable()
		.refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
		.refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only .jpg, .jpeg, .png and .webp formats are supported.'),
	simulatedParameters: z.object({
		volatilityFactor: z.coerce.number().min(0).max(1, { message: 'Volatility must be between 0 and 1.' }),
		baseTransactionFee: z.coerce.number().min(0),
	}),
});

type AssetEditFormValues = z.infer<typeof assetEditFormSchema>;

export default function EditAssetPage() {
	const router = useRouter();
	const params = useParams<{ slug: string }>();
	const slug = params?.slug;

	const [assetData, setAssetData] = useState<AssetDefinition | null>(null);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const form = useForm<AssetEditFormValues>({
		resolver: zodResolver(assetEditFormSchema) as any,
		defaultValues: {
			name: '',
			symbol: '',
			description: null,
			image: undefined, // Changed from logoUrl
			simulatedParameters: {
				volatilityFactor: 0.05,
				baseTransactionFee: 0.001,
			},
		},
		mode: 'onChange',
	});

	const {
		formState: { isSubmitting },
		watch, // Added watch
		reset, // Added reset for easier access
	} = form;

	const imageFile = watch('image');

	useEffect(() => {
		if (imageFile && imageFile instanceof File) {
			const objectUrl = URL.createObjectURL(imageFile);
			setImagePreview(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		} else if (!imageFile && assetData?.logoUrl) {
			// If imageFile is cleared and there was an original logoUrl, show that
			setImagePreview(assetData.logoUrl);
		} else if (!imageFile) {
			setImagePreview(null);
		}
	}, [imageFile, assetData?.logoUrl]);

	useEffect(() => {
		if (slug) {
			setIsLoadingData(true);
			// Simulate API call
			setTimeout(() => {
				const currentAsset = assetDetailsMock[slug];
				if (currentAsset) {
					setAssetData(currentAsset);
					reset({
						// Use reset from form
						name: currentAsset.name,
						symbol: currentAsset.symbol,
						description: currentAsset.description || null,
						image: undefined, // Image file is not part of reset data from server directly
						simulatedParameters: {
							volatilityFactor: currentAsset.simulatedParameters.volatilityFactor || 0.05,
							baseTransactionFee: currentAsset.simulatedParameters.baseTransactionFee || 0.001,
						},
					});
					if (currentAsset.logoUrl) {
						setImagePreview(currentAsset.logoUrl); // Set initial preview from existing URL
					} else {
						setImagePreview(null);
					}
				} else {
					toast.error(`Category "${slug}" not found for editing.`); // Changed Asset to Category
					router.push('/admin/categories'); // Changed /admin/assets to /admin/categories
				}
				setIsLoadingData(false);
			}, 300);
		} else {
			toast.error('No category specified for editing.'); // Changed Asset to Category
			router.push('/admin/categories'); // Changed /admin/assets to /admin/categories
			setIsLoadingData(false);
		}
	}, [slug, router, reset]); // Added reset to dependency array

	async function onSubmit(data: AssetEditFormValues) {
		if (!assetData) {
			toast.error('Category data not loaded. Cannot save.'); // Changed Asset to Category
			return;
		}
		NProgress.start();

		const formData = new FormData();

		// Append all fields except image first
		Object.entries(data).forEach(([key, value]) => {
			if (key === 'image') {
				// Handle image separately
				if (value instanceof File) {
					formData.append(key, value);
				}
			} else if (key === 'simulatedParameters' && typeof value === 'object' && value !== null) {
				// Flatten simulatedParameters for FormData
				Object.entries(value).forEach(([simKey, simValue]) => {
					if (simValue !== null && simValue !== undefined) {
						formData.append(`simulatedParameters.${simKey}`, String(simValue));
					}
				});
			} else if (value !== null && value !== undefined) {
				formData.append(key, String(value));
			}
		});

		if (data.symbol) {
			formData.set('symbol', data.symbol.toUpperCase());
		}

		// If no new image is selected, and we need to inform the backend to keep the old one,
		// we might not need to append anything for 'image'.
		// If the backend expects 'logoUrl' to be sent if image is unchanged:
		// if (!(data.image instanceof File) && assetData.logoUrl) {
		// formData.append('logoUrl', assetData.logoUrl);
		// }

		console.log('Submitting FormData:', Object.fromEntries(formData.entries())); // For debugging

		// Mock API call (replace with actual fetch)
		await new Promise((resolve) => setTimeout(resolve, 1000));

		try {
			// This part is mock, actual implementation would involve a PUT/PATCH request with formData
			const updatedAssetInMock: AssetDefinition = {
				...assetData,
				name: data.name,
				symbol: data.symbol.toUpperCase(),
				description: data.description || '',
				// If a new image was uploaded, the backend would update logoUrl.
				// For mock, if imageFile exists, we'd ideally generate a fake new URL or skip updating logoUrl here.
				// For simplicity, we'll assume the backend handles it. If imageFile is present, logoUrl might change.
				// If not, assetData.logoUrl remains.
				logoUrl: data.image instanceof File ? `/uploads/${(data.image as File).name}` : assetData.logoUrl, // Mocking new URL path
				simulatedParameters: {
					volatilityFactor: Number(data.simulatedParameters.volatilityFactor),
					baseTransactionFee: Number(data.simulatedParameters.baseTransactionFee),
				},
			};
			assetDetailsMock[slug as string] = updatedAssetInMock;

			toast.success(`Category "${updatedAssetInMock.name}" updated successfully!`); // Changed Asset to Category
			NProgress.start();
			router.push(`/admin/categories/${slug}`); // Changed /admin/assets to /admin/categories
		} catch (error) {
			console.error('Error updating category:', error); // Changed Asset to Category
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			NProgress.done();
		}
	}

	if (isLoadingData) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-200px)]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="ml-4 text-lg text-muted-foreground">Loading asset data for editing...</p>
			</div>
		);
	}

	if (!assetData) {
		return <p className="text-center text-destructive p-8">Asset not found.</p>;
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader>
					<CardTitle>Edit Category: {assetData.name}</CardTitle> {/* Changed Asset to Category */}
					<CardDescription>
						Modify the details for the category. Fields marked with <span className="text-destructive">*</span> are required. {/* Changed simulated crypto asset to category */}
					</CardDescription>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Category Name <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Technology Stocks" {...field} disabled={isSubmitting} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="symbol"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Ticker <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input placeholder="e.g., TECH" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>2-10 alphanumeric characters (will be uppercased).</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea placeholder="A brief description of the category (max 500 characters)" {...field} value={field.value ?? ''} disabled={isSubmitting} rows={4} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="image" // Changed from logoUrl to image
								render={({ field: { onChange, value, ...restField } }) => (
									<FormItem>
										<FormLabel>Category Image</FormLabel>
										<FormControl>
											<Input
												type="file"
												accept={ACCEPTED_IMAGE_TYPES.join(',')}
												onChange={(event) => {
													onChange(event.target.files ? event.target.files[0] : null);
												}}
												{...restField}
												className="pt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormDescription>{imageFile instanceof File ? imageFile.name : 'Current image will be kept if no new file is chosen. Max 2MB. JPG, PNG, WEBP.'}</FormDescription>
										<FormMessage />
										{imagePreview && (
											<div className="mt-2">
												<img src={imagePreview} alt="Image preview" className="h-32 w-32 object-cover rounded-md border" />
											</div>
										)}
									</FormItem>
								)}
							/>

							<CardTitle className="text-lg pt-4 border-t">Simulated Parameters</CardTitle>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="simulatedParameters.volatilityFactor"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Volatility Factor</FormLabel>
											<FormControl>
												<Input type="number" min="0" max="1" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>A value between 0 and 1 influencing price fluctuations.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="simulatedParameters.baseTransactionFee"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Base Transaction Fee (Asset Units)</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Fee charged per simulated transaction in the asset's own units.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
						<CardFooter className="flex justify-end gap-2 mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									NProgress.start();
									router.push(slug ? `/admin/categories/${slug}` : '/admin/categories');
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isSubmitting ? 'Saving...' : 'Save Changes'}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	);
}
