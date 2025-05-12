'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NProgress from 'nprogress';
import { Loader2, ImageOff as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import Image from 'next/image';
import { generateSlug } from '@/lib/helpers';
import { Category, SingleCategoryResponse } from '../../page';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const categoryEditFormSchema = z
	.object({
		name: z.string().min(3, { message: 'Name must be at least 3 characters.' }).max(50, { message: 'Name must not exceed 50 characters.' }),
		ticker: z
			.string()
			.min(2, { message: 'Ticker must be at least 2 characters.' })
			.max(10, { message: 'Ticker must not exceed 10 characters.' })
			.regex(/^[A-Z0-9]+$/, { message: 'Ticker must be uppercase alphanumeric.' }),
		description: z.string().max(255, { message: 'Description must not exceed 255 characters.' }).optional().nullable(),
		imageFile: z // New field for the uploaded file
			.instanceof(File)
			.optional()
			.nullable()
			.refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
			.refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only .jpg, .jpeg, .png and .webp formats are supported.'),
		is_locked: z.boolean().default(false),
		is_launched: z.boolean().default(true),
		current_price_per_unit: z.coerce.number({ invalid_type_error: 'Price must be a number.' }).nonnegative({ message: 'Price must be non-negative.' }),
		quantity: z.coerce.number({ invalid_type_error: 'Quantity must be a number.' }).int({ message: 'Quantity must be an integer.' }).nonnegative({ message: 'Quantity must be non-negative.' }),
		total_liquidity: z.coerce.number({ invalid_type_error: 'Total liquidity must be a number.' }).nonnegative({ message: 'Total liquidity must be non-negative.' }),
		admin_target_multiplier: z.coerce.number({ invalid_type_error: 'Multiplier must be a number.' }).nonnegative({ message: 'Multiplier must be non-negative.' }).optional().nullable(),
		fee: z.coerce.number({ invalid_type_error: 'Fee must be a number.' }).nonnegative({ message: 'Fee must be non-negative.' }).optional().nullable(),
		volatility_factor: z.coerce.number({ invalid_type_error: 'Volatility factor must be a number.' }).nonnegative({ message: 'Volatility factor must be non-negative.' }).optional().nullable(),
		minimum_investable: z.coerce.number({ required_error: 'Minimum investable amount is required.', invalid_type_error: 'Minimum investable amount must be a number.' }).nonnegative({ message: 'Minimum investable amount must be non-negative.' }).default(0), // Default to 0 if not provided, but it's required.
		maximum_investable: z.coerce.number({ required_error: 'Maximum investable amount is required.', invalid_type_error: 'Maximum investable amount must be a number.' }).nonnegative({ message: 'Maximum investable amount must be non-negative.' }).default(0), // Default to 0 if not provided, but it's required.
	})
	.refine((data) => data.maximum_investable >= data.minimum_investable, {
		message: 'Maximum investable amount cannot be less than minimum investable amount.',
		path: ['maximum_investable'],
	});

type CategoryEditFormValues = z.infer<typeof categoryEditFormSchema>;

export default function EditCategoryPage() {
	const router = useRouter();
	const params = useParams<{ slug: string }>();
	const [categoryId, setCategoryId] = useState(params?.slug);

	const [initialCategoryData, setInitialCategoryData] = useState<Category | null>(null);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const form = useForm<CategoryEditFormValues>({
		resolver: zodResolver(categoryEditFormSchema) as any,
		mode: 'onChange',
	});

	const {
		formState: { isSubmitting },
		watch,
		reset,
		setValue,
	} = form;

	const imageFileWatcher = watch('imageFile');

	useEffect(() => {
		if (imageFileWatcher && imageFileWatcher instanceof File) {
			const objectUrl = URL.createObjectURL(imageFileWatcher);
			setImagePreview(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		} else if (!imageFileWatcher && initialCategoryData?.image) {
			setImagePreview(initialCategoryData.image); // Show existing image if no new one selected
		} else if (!imageFileWatcher) {
			setImagePreview(null);
		}
	}, [imageFileWatcher, initialCategoryData?.image]);

	const fetchCategoryDetails = useCallback(
		async (id: string) => {
			setIsLoadingData(true);
			NProgress.start();
			try {
				const response = await fetch(`/api/admin/categories/${id}`);
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.message || `Failed to fetch category details: ${response.statusText}`);
				}
				const result: SingleCategoryResponse = await response.json();
				if (result.status === 'success' && result.data) {
					setInitialCategoryData(result.data);
					reset({
						name: result.data.name,
						ticker: result.data.ticker,
						description: result.data.description || null,
						imageFile: undefined, // Don't prefill file input
						is_locked: result.data.is_locked,
						is_launched: result.data.is_launched === undefined ? true : result.data.is_launched,
						current_price_per_unit: result.data.current_price_per_unit,
						quantity: result.data.quantity,
						total_liquidity: result.data.total_liquidity,
						admin_target_multiplier: result.data.admin_target_multiplier || null,
						fee: result.data.fee || null,
						volatility_factor: result.data.volatility_factor || null,
						minimum_investable: result.data.minimum_investable ?? 0,
						maximum_investable: result.data.maximum_investable ?? 0,
					});
					if (result.data.image) {
						setImagePreview(result.data.image);
					}
					setCategoryId(result.data.id);
				} else {
					throw new Error(result.data?.toString() || 'Category data is invalid.');
				}
			} catch (error) {
				console.error('Error fetching category:', error);
				toast.error((error as Error).message || 'Could not load category for editing.');
				router.push('/admin/categories');
			} finally {
				setIsLoadingData(false);
				NProgress.done();
			}
		},
		[router, reset]
	);

	useEffect(() => {
		if (categoryId) {
			fetchCategoryDetails(categoryId);
		} else {
			toast.error('No category ID specified for editing.');
			router.push('/admin/categories');
		}
	}, [categoryId, fetchCategoryDetails, router]);

	async function onSubmit(data: CategoryEditFormValues) {
		if (!categoryId) {
			toast.error('Category ID is missing. Cannot save.');
			return;
		}
		NProgress.start();
		const formData = new FormData();

		// Append all fields from 'data' except 'imageFile'
		Object.entries(data).forEach(([key, value]) => {
			if (key === 'imageFile') {
				if (value instanceof File) {
					formData.append('image', value);
				}
			} else if (value !== null && value !== undefined) {
				formData.append(key, String(value));
			}
		});

		// Ensure boolean values are sent correctly
		formData.set('is_locked', String(data.is_locked));
		formData.set('is_launched', String(data.is_launched));

		try {
			const response = await fetch(`/api/admin/categories/${categoryId}`, {
				method: 'PUT',
				body: formData,
				credentials: 'include',
			});

			if (response.ok) {
				const responseData = await response.json();
				toast.success(`Category "${responseData.data?.name || data.name}" updated successfully!`);
				NProgress.start();
				router.push(`/admin/categories/${generateSlug(params?.slug)}`);
			} else {
				let errorMessage = `Failed to update category. Status: ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (e) {}
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error('Error updating category:', error);
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			NProgress.done();
		}
	}

	if (isLoadingData) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-200px)]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="ml-4 text-lg text-muted-foreground">Loading category data for editing...</p>
			</div>
		);
	}

	if (!initialCategoryData) {
		return <p className="text-center text-destructive p-8">Category not found or failed to load.</p>;
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader>
					<CardTitle>Edit Category: {initialCategoryData.name}</CardTitle>
					<CardDescription>
						Modify the details for the category. Fields marked with <span className="text-destructive">*</span> are required.
					</CardDescription>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="space-y-6">
							{/* Name and Ticker */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Name <span className="text-destructive">*</span>
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
									name="ticker"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Ticker <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input placeholder="e.g., TECH" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Min 2, Max 10 uppercase alphanumeric.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Description */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea placeholder="Optional: A brief description (max 255 characters)" {...field} value={field.value ?? ''} disabled={isSubmitting} rows={3} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Image Upload */}
							<FormField
								control={form.control}
								name="imageFile"
								render={({ field: { onChange, value, ...restField } }) => (
									<FormItem>
										<FormLabel>Category Image</FormLabel>
										<FormControl>
											<Input
												type="file"
												accept={ACCEPTED_IMAGE_TYPES.join(',')}
												onChange={(event) => onChange(event.target.files ? event.target.files[0] : null)}
												{...restField}
												className="pt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormDescription>{imageFileWatcher instanceof File ? imageFileWatcher.name : 'Current image will be kept if no new file is chosen. Max 2MB. JPG, PNG, WEBP.'}</FormDescription>
										<FormMessage />
										{imagePreview && (
											<div className="mt-2">
												<Image src={imagePreview} alt="Image preview" width={128} height={128} className="h-32 w-32 object-cover rounded-md border" />
											</div>
										)}
										{!imagePreview && (
											<div className="mt-2 h-32 w-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground border">
												<ImageIcon size={48} />
											</div>
										)}
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Current Price Per Unit */}
								<FormField
									control={form.control}
									name="current_price_per_unit"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Current Price Per Unit</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Quantity */}
								<FormField
									control={form.control}
									name="quantity"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Quantity</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} disabled={isSubmitting} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Total Liquidity */}
								<FormField
									control={form.control}
									name="total_liquidity"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Total Liquidity</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Admin Target Multiplier */}
								<FormField
									control={form.control}
									name="admin_target_multiplier"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Admin Target Multiplier</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" {...field} onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Optional: Target multiplier for admin.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Fee */}
								<FormField
									control={form.control}
									name="fee"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Fee (%)</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" placeholder="e.g., 0.5" {...field} onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Optional: Transaction fee percentage.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Volatility Factor */}
								<FormField
									control={form.control}
									name="volatility_factor"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Volatility Factor</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" placeholder="e.g., 0.1" {...field} onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Optional: Factor for market volatility.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Minimum Investable Amount */}
								<FormField
									control={form.control}
									name="minimum_investable"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Minimum Investable Amount</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" placeholder="e.g., 100" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} value={field.value ?? ''} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Minimum amount a user can invest in this category.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Maximum Investable Amount */}
								<FormField
									control={form.control}
									name="maximum_investable"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Maximum Investable Amount</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" placeholder="e.g., 10000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} value={field.value ?? ''} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>{'Maximum amount a user can invest in this category. Must be >= minimum.'}</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Switches: Is Locked & Is Launched */}
							<div className="space-y-4 pt-4 border-t">
								<FormField
									control={form.control}
									name="is_locked"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
											<div className="space-y-0.5">
												<FormLabel>Is Locked?</FormLabel>
												<FormDescription>Prevent users from interacting with this category.</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="is_launched"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
											<div className="space-y-0.5">
												<FormLabel>Is Launched?</FormLabel>
												<FormDescription>Make this category visible and available to users.</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
											</FormControl>
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
									router.push(params?.slug ? `/admin/categories/${generateSlug(params?.slug)}` : '/admin/categories');
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || isLoadingData}>
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
