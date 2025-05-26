'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { AmmParameterFields } from '@/components/admin/AmmParameterFields';
import Image from 'next/image';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ammModelTypes = ['adjusted_l_s', 'constant_product', 'linear_bonding_curve', 'exponential_bonding_curve'] as const;

const categoryFormSchema = z
	.object({
		amm_model_type: z.enum(ammModelTypes, {
			required_error: 'AMM Model Type is required',
		}),
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
		fee: z.coerce.number({ invalid_type_error: 'Fee must be a number.' }).nonnegative({ message: 'Fee must be non-negative.' }).optional().nullable(),
		volatility_factor: z.coerce.number({ invalid_type_error: 'Volatility factor must be a number.' }).nonnegative({ message: 'Volatility factor must be non-negative.' }).optional().nullable(),
		minimum_investable: z.coerce.number({ required_error: 'Minimum investable amount is required.', invalid_type_error: 'Minimum investable amount must be a number.' }).positive({ message: 'Minimum investable amount must be greater than 0.' }),
		maximum_investable: z.coerce.number({ required_error: 'Maximum investable amount is required.', invalid_type_error: 'Maximum investable amount must be a number.' }).positive({ message: 'Minimum investable amount must be greater than 0.' }),
		amm_parameters: z
			.record(z.string(), z.number().or(z.string()))
			.nullable()
			.refine(
				(val) => {
					if (!val) return true;
					return Object.keys(val).length > 0;
				},
				{
					message: 'AMM parameters are required',
				}
			)
			.refine(
				(val) => {
					if (!val) return true;
					return Object.values(val).every((v) => v !== null && v !== undefined && v !== '');
				},
				{
					message: 'All AMM parameters must have values',
				}
			),
		early_withdrawal_penalty_type: z
			.enum(['none', 'forfeit_profit', 'percentage_fee'], {
				required_error: 'Early withdrawal penalty type is required',
			})
			.default('none'),
		early_withdrawal_penalty_value: z.coerce.number().min(0, { message: 'Penalty value must be non-negative' }).max(1, { message: 'Penalty value must not exceed 100%' }).optional().nullable(),
	})
	.refine(
		(data) => {
			if (data.early_withdrawal_penalty_type === 'percentage_fee') {
				return data.early_withdrawal_penalty_value !== null && data.early_withdrawal_penalty_value !== undefined;
			}
			return true;
		},
		{
			message: 'Percentage fee requires a value between 0 and 1',
			path: ['early_withdrawal_penalty_value'],
		}
	)
	.refine((data) => data.maximum_investable >= data.minimum_investable, {
		message: 'Maximum investable amount cannot be less than minimum investable amount.',
		path: ['maximum_investable'],
	});

export type CategoryFormValues = z.infer<typeof categoryFormSchema> & {
	amm_parameters: Record<string, string | number>;
};

const defaultValues: Partial<CategoryFormValues> = {
	amm_model_type: undefined,
	amm_parameters: {},
	name: '',
	ticker: '',
	description: null,
	image: undefined,
	is_locked: false,
	is_launched: true,
	current_price_per_unit: 0.0,
	quantity: 0,
	total_liquidity: 0,
	admin_target_multiplier: 2,
	fee: null,
	volatility_factor: null,
	minimum_investable: 0,
	maximum_investable: 0,
	early_withdrawal_penalty_type: 'none',
	early_withdrawal_penalty_value: null,
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

	const ammModelType = form.watch('amm_model_type');

	async function onSubmit(data: CategoryFormValues) {
		NProgress.start();
		const formData = new FormData();

		const ammParams: { [key: string]: number } = {};
		Object.entries(data.amm_parameters).forEach(([key, value]) => {
			if (value !== null && value !== undefined) {
				ammParams[key] = Number(value);
			}
		});

		Object.entries(data).forEach(([key, value]) => {
			if (key === 'image') {
				if (value instanceof File) {
					formData.append(key, value);
				}
			} else if (value !== null && value !== undefined) {
				formData.append(key, String(value));
			}
		});

		formData.delete('amm_parameters');
		formData.append('amm_parameters', JSON.stringify(ammParams));

		if (data.ticker) {
			formData.set('ticker', data.ticker.toUpperCase());
		}

		// for (let [key, value] of formData.entries()) {
		// 	console.log(`${key}: ${value}`);
		// }

		try {
			const response = await fetch('/api/categories', {
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
				} catch (_e) {}
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
													<Image src={imagePreview} alt="Image preview" width={128} height={128} className="h-32 w-32 object-cover rounded-md border" />
												</div>
											)}
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
									name="amm_model_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												AMM Model Type <span className="text-destructive">*</span>
											</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select AMM model type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{ammModelTypes.map((type) => (
														<SelectItem key={type} value={type}>
															{type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<AmmParameterFields ammModelType={ammModelType} isSubmitting={isSubmitting} control={form.control} />
								<FormField
									control={form.control}
									name="early_withdrawal_penalty_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Early Withdrawal Penalty Type</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a penalty type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													<SelectItem value="forfeit_profit">Forfeit Profit</SelectItem>
													<SelectItem value="percentage_fee">Percentage Fee</SelectItem>
												</SelectContent>
											</Select>
											<FormDescription>Choose how to handle early withdrawals</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>{' '}
								{form.watch('early_withdrawal_penalty_type') === 'percentage_fee' && (
									<FormField
										control={form.control}
										name="early_withdrawal_penalty_value"
										render={({ field: { onChange, value, ...fieldProps } }) => (
											<FormItem>
												<FormLabel>Penalty Percentage</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														min="0"
														max="1"
														placeholder="0.10"
														{...fieldProps}
														value={value ?? ''}
														onChange={(e) => {
															const newValue = e.target.value === '' ? null : parseFloat(e.target.value);
															onChange(newValue);
														}}
													/>
												</FormControl>
												<FormDescription>Enter the penalty percentage as a decimal (e.g., 0.10 for 10%)</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>

							{/* Column 2 */}
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="minimum_investable"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Minimum Investable Amount</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" placeholder="e.g., 100" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Minimum amount a user can invest in this category.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="maximum_investable"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Maximum Investable Amount</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" placeholder="e.g., 10000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>{`Maximum amount a user can invest in this category. Must be  >= minimum.`}</FormDescription>
											<FormMessage />
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
												<Input
													type="number"
													min="0"
													step="any"
													{...field}
													// onChange={(e) => field.onChange(parseFloat(e.target.value))}
													disabled={true}
												/>
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
									name="fee"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Fee (%)</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" placeholder="e.g., 0.5 for 0.5%" {...field} onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Optional: Transaction fee percentage for this category.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="volatility_factor"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Volatility Factor</FormLabel>
											<FormControl>
												<Input type="number" min="0" step="any" placeholder="e.g., 0.1" {...field} onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} disabled={isSubmitting} />
											</FormControl>
											<FormDescription>Optional: Factor to adjust for market volatility.</FormDescription>
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
