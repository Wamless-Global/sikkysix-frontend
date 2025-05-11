'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { Loader2 } from 'lucide-react';
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

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const categoryFormSchema = z.object({
	name: z.string().min(3, { message: 'Name must be at least 3 characters.' }).max(50, { message: 'Name must not exceed 50 characters.' }),
	ticker: z
		.string()
		.min(2, { message: 'Ticker must be at least 2 characters.' })
		.max(10, { message: 'Ticker must not exceed 10 characters.' })
		.regex(/^[A-Z0-9]+$/, { message: 'Ticker must be uppercase alphanumeric.' }),
	description: z.string().max(255, { message: 'Description must not exceed 255 characters.' }).optional().nullable(),
	image: z
		.instanceof(File, { message: 'Image is required.' })
		.optional()
		.nullable()
		.refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
		.refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only .jpg, .jpeg, .png and .webp formats are supported.'),
	is_locked: z.boolean().default(false),
	is_launched: z.boolean().default(false),
	current_price_per_unit: z.coerce.number({ invalid_type_error: 'Price must be a number.' }).nonnegative({ message: 'Price must be non-negative.' }).default(0.0),
	quantity: z.coerce.number({ invalid_type_error: 'Quantity must be a number.' }).int({ message: 'Quantity must be an integer.' }).nonnegative({ message: 'Quantity must be non-negative.' }).default(1000000000),
	total_liquidity: z.coerce.number({ invalid_type_error: 'Total liquidity must be a number.' }).nonnegative({ message: 'Total liquidity must be non-negative.' }).default(0),
	admin_target_multiplier: z.coerce.number({ invalid_type_error: 'Multiplier must be a number.' }).nonnegative({ message: 'Multiplier must be non-negative.' }).default(2),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const defaultValues: Partial<CategoryFormValues> = {
	name: '',
	ticker: '',
	description: null,
	image: undefined,
	is_locked: false,
	is_launched: true,
	current_price_per_unit: 0.0,
	quantity: 1000000000,
	total_liquidity: 0,
	admin_target_multiplier: 2,
};

export default function CreateCategoryPage() {
	const router = useRouter();
	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema) as any,
		defaultValues,
		mode: 'onChange',
	});

	const {
		formState: { isSubmitting },
		watch,
	} = form;

	const imageFile = watch('image');
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	useEffect(() => {
		if (imageFile && imageFile instanceof File) {
			const objectUrl = URL.createObjectURL(imageFile);
			setImagePreview(objectUrl);

			return () => URL.revokeObjectURL(objectUrl);
		} else {
			setImagePreview(null);
		}
	}, [imageFile]);

	async function onSubmit(data: CategoryFormValues) {
		NProgress.start();
		const formData = new FormData();

		Object.entries(data).forEach(([key, value]) => {
			if (key === 'image') {
				if (value instanceof File) {
					formData.append(key, value);
				}
			} else if (value !== null && value !== undefined) {
				formData.append(key, String(value));
			}
		});

		if (data.ticker) {
			formData.set('ticker', data.ticker.toUpperCase());
		}

		try {
			const response = await fetch('/api/admin/categories', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});

			if (response.ok) {
				NProgress.start();
				const { data } = await response.json();
				toast.success(`Category "${data.name}" created successfully!`);
				router.push('/admin/categories');
			} else {
				let errorMessage = `Failed to create category. Status: ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (e) {}
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error('Error creating category:', error);
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			NProgress.done();
		}
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<Card>
				<CardHeader>
					<CardTitle>Create New Category</CardTitle>
					<CardDescription>
						Fill in the details for the new category. Fields marked with <span className="text-destructive">*</span> are required.
					</CardDescription>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Column 1 */}
							<div className="space-y-4">
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
											<FormDescription>Min 2, Max 10 uppercase alphanumeric characters.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea placeholder="Optional: A brief description of the category (max 255 characters)" {...field} value={field.value ?? ''} disabled={isSubmitting} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="image"
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
											<FormDescription>{imageFile instanceof File ? imageFile.name : 'Max 2MB. JPG, PNG, WEBP.'}</FormDescription>
											<FormMessage />
											{imagePreview && (
												<div className="mt-2">
													<img src={imagePreview} alt="Image preview" className="h-32 w-32 object-cover rounded-md border" />
												</div>
											)}
										</FormItem>
									)}
								/>
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
							</div>

							{/* Column 2 */}
							<div className="space-y-4">
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
								<FormField
									control={form.control}
									name="admin_target_multiplier"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Admin Target Multiplier</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="is_locked"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-5">
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
												<FormLabel>Launch Immediately?</FormLabel>
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
									router.push('/admin/categories');
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isSubmitting ? 'Creating...' : 'Create Category'}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</div>
	);
}
