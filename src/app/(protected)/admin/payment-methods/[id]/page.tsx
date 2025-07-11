'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import nProgress from 'nprogress';
import { toast } from 'sonner';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { handleFetchMessage } from '@/lib/helpers';

const paymentMethodSchema = z.object({
	name: z.string().min(2, 'Name is required'),
	description: z.string().optional(),
	country: z.string().min(2, 'Country code is required'),
	image: z.instanceof(File).optional().nullable(),
	logo_url: z.string().optional(),
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

export default function EditP2PPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [countries, setCountries] = useState<{ code: string; name: string; id: string }[]>([]);
	const [countriesLoading, setCountriesLoading] = useState(true);

	const form = useForm<PaymentMethodForm>({
		resolver: zodResolver(paymentMethodSchema),
		defaultValues: {
			name: '',
			description: '',
			country: '',
			image: undefined,
			logo_url: '',
			is_active: false,
			fields_required: [{ name: '', label: '', type: 'text' }],
		},
		mode: 'onChange',
	});
	const { handleSubmit, setValue, watch, formState } = form;
	const fieldsRequired = watch('fields_required');
	const imageFile = watch('image');
	const logoUrl = watch('logo_url');

	useEffect(() => {
		const fetchCountries = async () => {
			setCountriesLoading(true);
			try {
				const res = await fetchWithAuth('/api/countries');
				const data = await res.json();

				if (!res.ok) {
					let errorMsg = `Unable to load countries. Status: ${res.status}`;
					try {
						const errorData = await res.json();
						errorMsg = handleFetchMessage(errorData, errorMsg);
					} catch (_e) {}
					toast.error(errorMsg);
					throw new Error(errorMsg);
				}
				setCountries(data.countries || []);
			} catch {
				setCountries([]);
			} finally {
				setCountriesLoading(false);
			}
		};
		fetchCountries();
	}, []);

	useEffect(() => {
		if (!id) return;
		setLoading(true);
		fetchWithAuth(`/api/p2p/payment-methods/${id}`)
			.then(async (res) => {
				if (!res.ok) throw new Error('Failed to fetch payment method');
				const data = await res.json();
				const method = data.data;
				setValue('name', method.name || '');
				setValue('description', method.description || '');
				setValue('country', method.country || '');
				setValue('logo_url', method.logo_url || '');
				setValue('is_active', !!method.is_active);
				let fields = [];
				try {
					fields = typeof method.fields_required === 'string' ? JSON.parse(method.fields_required) : method.fields_required;
					if (!Array.isArray(fields)) fields = [];
				} catch {
					fields = [];
				}
				setValue('fields_required', fields.length ? fields : [{ name: '', label: '', type: 'text' }]);
				setLoading(false);
			})
			.catch(() => {
				setError('Failed to load payment method');
				setLoading(false);
			});
	}, [id, setValue]);

	useEffect(() => {
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
		nProgress.start();
		setError('');
		const formData = new FormData();
		formData.append('name', data.name);
		formData.append('description', data.description || '');
		formData.append('country', data.country);
		formData.append('is_active', String(data.is_active));
		if (data.image instanceof File) {
			formData.append('image', data.image);
		}
		formData.append('fields_required', JSON.stringify(data.fields_required));
		try {
			const response = await fetchWithAuth(`/api/p2p/payment-methods/${id}`, {
				method: 'PUT',
				body: formData,
			});
			if (response.ok) {
				const { data: respData } = await response.json();
				toast.success(`Payment method "${respData.name}" updated successfully!`);
				router.push('/admin/payment-methods');
			} else {
				let errorMessage = `Failed to update payment method. Status: ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.detail || errorMessage;
				} catch (_e) {}
				toast.error(errorMessage);
			}
		} catch {
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			nProgress.done();
		}
	}

	if (loading) return <div className="p-6">Loading...</div>;

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Edit P2P Payment Method</h1>
			<p className="text-sm text-muted-foreground">
				Update the details for this payment method. Fields marked with <span className="text-destructive">*</span> are required.
			</p>
			<Card>
				<CardHeader>
					<CardTitle>Edit P2P Payment Method</CardTitle>
					<CardDescription>Update the details for this payment method.</CardDescription>
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
												<Input {...field} required />
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
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="country"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Country <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<Select value={field.value} onValueChange={field.onChange} disabled={countriesLoading}>
													<SelectTrigger className="w-full">
														<SelectValue placeholder={countriesLoading ? 'Loading...' : 'Select country'} />
													</SelectTrigger>
													<SelectContent>
														{countries.map((country) => (
															<SelectItem key={country.id} value={country.id}>
																{country.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
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
											{(imagePreview || logoUrl) && <Image src={imagePreview ?? logoUrl!} alt="Preview" width={64} height={64} className="h-16 w-16 object-cover rounded mt-2" />}
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
												<input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="mr-2" />
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
										<input type="hidden" value={field.name} readOnly />
										<div className="flex-1">
											<Input value={field.label} onChange={(e) => handleLabelChange(idx, e.target.value)} placeholder="Label (e.g. Account Number)" required />
										</div>
										<div className="w-28">
											<select
												value={field.type}
												onChange={(e) => setValue(`fields_required.${idx}.type`, e.target.value)}
												className="w-full h-12 px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
											>
												<option value="text">Text</option>
												<option value="number">Number</option>
												<option value="email">Email</option>
												<option value="date">Date</option>
											</select>
										</div>
										<Button type="button" variant="destructive" size="sm" onClick={() => removeField(idx)} disabled={fieldsRequired.length === 1}>
											Remove
										</Button>
									</div>
								))}
								<Button type="button" variant="outline" size="sm" onClick={addField}>
									Add Field
								</Button>
								{formState.errors.fields_required && <div className="text-destructive text-sm mt-2">{formState.errors.fields_required.message as string}</div>}
							</div>
						</CardContent>
						<CardFooter className="flex gap-2">
							<Button type="submit">Save</Button>
							<Button type="button" variant="outline" onClick={() => router.push('/admin/payment-methods')}>
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
