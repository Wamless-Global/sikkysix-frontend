'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import NProgress from 'nprogress';
import nProgress from 'nprogress';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

const paymentMethodSchema = z.object({
	name: z.string().min(2, 'Name is required'),
	description: z.string().optional(),
	country_code: z.string().min(2, 'Country code is required'),
	image: z.instanceof(File).optional().nullable(),
	is_active: z.boolean(),
	fields_required: z
		.array(
			z.object({
				name: z.string().min(1, 'Field name required'),
				label: z.string().min(1, 'Label required'),
				type: z.string().min(1, 'Type required'),
			})
		)
		.min(1, 'At least one field is required'),
});

type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;

export default function AddP2PPage() {
	const router = useRouter();
	const form = useForm<PaymentMethodForm>({
		resolver: zodResolver(paymentMethodSchema),
		defaultValues: {
			name: '',
			description: '',
			country_code: '',
			image: undefined,
			is_active: false,
			fields_required: [{ name: '', label: '', type: 'text' }],
		},
		mode: 'onChange',
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
		setValue,
		watch,
	} = form;

	const [error, setError] = useState('');
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const fieldsRequired = watch('fields_required');
	const imageFile = watch('image');

	React.useEffect(() => {
		if (imageFile && imageFile instanceof File) {
			const objectUrl = URL.createObjectURL(imageFile);
			setImagePreview(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		} else {
			setImagePreview(null);
		}
	}, [imageFile]);

	const addField = () => setValue('fields_required', [...fieldsRequired, { name: '', label: '', type: 'text' }]);
	const removeField = (idx: number) =>
		setValue(
			'fields_required',
			fieldsRequired.filter((_, i) => i !== idx)
		);

	const handleLabelChange = (idx: number, value: string) => {
		const name = value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
		setValue(`fields_required.${idx}.label`, value);
		setValue(`fields_required.${idx}.name`, name);
	};

	async function onSubmit(data: PaymentMethodForm) {
		NProgress.start();
		const toastId = toast.loading('Creating new payment method...');

		setError('');
		const formData = new FormData();
		formData.append('name', data.name);
		formData.append('description', data.description || '');
		formData.append('country_code', data.country_code);
		formData.append('is_active', String(data.is_active));

		if (data.image instanceof File) {
			formData.append('image', data.image);
		}

		formData.append('fields_required', JSON.stringify(data.fields_required));

		try {
			const response = await fetchWithAuth('/api/p2p/payment-methods', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});
			if (response.ok) {
				const { data: respData } = await response.json();
				toast.success(`Payment method "${respData.name}" created successfully!`, { id: toastId });
				router.push('/admin/payment-methods');
			} else {
				let errorMessage = `Failed to create payment method. Status: ${response.status}`;
				try {
					const errorData = await response.json();
					console.log('Error response data:', errorData);

					if (Array.isArray(errorData.errors)) {
						errorData.errors.forEach((err: any) => {
							if (err.message) toast.error(err.message, { id: toastId });
						});
						errorMessage = errorData.message || errorMessage;
					} else {
						errorMessage = errorData.message || errorData.detail || errorMessage;
						toast.error(errorMessage, { id: toastId });
					}
				} catch (_e) {
					toast.error(errorMessage, { id: toastId });
				}
			}
		} catch {
			toast.error('An unexpected error occurred. Please try again.', { id: toastId });
		} finally {
			NProgress.done();
		}
	}

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Add P2P Payment Method</h1>
			</div>
			<p className="text-sm text-muted-foreground">
				Fill in the details for the new payment method. Fields marked with <span className="text-destructive">*</span> are required.
			</p>
			<Card>
				<CardHeader>
					<CardTitle>Add P2P Payment Method</CardTitle>
					<CardDescription>Fill in the details for the new payment method.</CardDescription>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
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
												<Input {...field} required disabled={isSubmitting} />
											</FormControl>
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
												<Textarea {...field} disabled={isSubmitting} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="country_code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Country Code <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Input {...field} required disabled={isSubmitting} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="image"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Image</FormLabel>
											<FormControl>
												<Input
													type="file"
													accept="image/*"
													disabled={isSubmitting}
													onChange={(e) => {
														const file = e.target.files?.[0];
														field.onChange(file);
														if (file) {
															const objectUrl = URL.createObjectURL(file);
															setImagePreview(objectUrl);
														} else {
															setImagePreview(null);
														}
													}}
												/>
											</FormControl>
											{imagePreview && (
												<Image
													src={imagePreview}
													alt="Preview"
													width={64}
													height={64}
													className="h-16 w-16 object-cover rounded mt-2"
												/>
											)}
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="is_active"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-2">
												<input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={isSubmitting} className="mr-2" />
												Active
											</FormLabel>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="space-y-4">
								<FormLabel className="block font-medium mb-2">
									Fields Required <span className="text-destructive">*</span>
								</FormLabel>
								{fieldsRequired.map((field, idx) => (
									<div key={idx} className="flex gap-4 mb-5 items-end">
										{/* Name is auto-generated from label, so hide the input */}
										<input type="hidden" value={field.name} readOnly />
										<div className="flex-1">
											<Input value={field.label} onChange={(e) => handleLabelChange(idx, e.target.value)} placeholder="Label (e.g. Account Number)" required disabled={isSubmitting} />
										</div>
										<div className="w-28">
											<select
												value={field.type}
												onChange={(e) => setValue(`fields_required.${idx}.type`, e.target.value)}
												className="w-full h-12 px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
												disabled={isSubmitting}
											>
												<option value="text">Text</option>
												<option value="number">Number</option>
												<option value="email">Email</option>
												<option value="date">Date</option>
											</select>
										</div>
										<Button type="button" variant="destructive" size="sm" onClick={() => removeField(idx)} disabled={fieldsRequired.length === 1 || isSubmitting}>
											Remove
										</Button>
									</div>
								))}
								<Button type="button" variant="outline" size="sm" onClick={addField} disabled={isSubmitting}>
									Add Field
								</Button>
								{/* Optionally show error for fields_required */}
								{form.formState.errors.fields_required && <div className="text-destructive text-sm mt-2">{form.formState.errors.fields_required.message as string}</div>}
							</div>
						</CardContent>
						<CardFooter className="flex gap-2">
							<Button type="submit" disabled={isSubmitting}>
								Save
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									nProgress.start();
									router.push('/admin/payment-methods');
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
						</CardFooter>
						{error && <div className="text-red-500 text-sm px-6 pb-4">{error}</div>}
					</form>
				</Form>
			</Card>
		</div>
	);
}
