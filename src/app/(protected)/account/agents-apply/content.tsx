'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorMessage from '@/components/ui/ErrorMessage';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import nProgress from 'nprogress';
import { toast } from 'sonner';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/config/app';
import { useAuthContext } from '@/context/AuthContext';
import { handleFetchErrorMessage } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';

const kycFormSchema = z.object({
	fullName: z.string().min(1, { message: 'Full legal name is required.' }),
	dateOfBirth: z.string().min(1, { message: 'Date of birth is required.' }),
	residentialAddress: z.string().min(1, { message: 'Residential address is required.' }),
	idDocumentType: z.enum(['Passport', "Driver's License", 'National ID', 'Other'], {
		errorMap: () => ({ message: 'Please select an identification document type.' }),
	}),
	idDocumentNumber: z.string().min(1, { message: 'Identification document number is required.' }),
	image: z
		.instanceof(File, { message: 'Identification document image is required.' })
		.optional()
		.nullable()
		.refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 2MB.`)
		.refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only .jpg, .jpeg, .png and .webp formats are supported.'),
});

type KycFormValues = z.infer<typeof kycFormSchema>;

const AgentApplyContent = () => {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { currentUser } = useAuthContext();
	const router = useRouter();

	const fetchApplicationStatus = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetchWithAuth(`/api/agents/application/user/${currentUser?.id}`, {
				method: 'GET',
			});

			if (response.ok) {
				const { data } = await response.json();

				logger.log(data);

				const status = data.length > 0 ? (data[0].status ? data[0].status : '') : '';

				if (status === 'approved') {
					nProgress.start();
					router.push('/account/agents');
				} else {
					setApplicationStatus(status);
				}
			} else {
				const err = await response.json();
				const errorMessage = handleFetchErrorMessage(err, `Failed to fetch application status. Status: ${response.status}`);
				setError(errorMessage);
			}
		} catch (error) {
			console.error('Error fetching application status:', error);
			setError('An unexpected error occurred while fetching status. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchApplicationStatus();
	}, []);

	const form = useForm<KycFormValues>({
		resolver: zodResolver(kycFormSchema),
		defaultValues: {
			fullName: '',
			dateOfBirth: '',
			residentialAddress: '',
			idDocumentType: undefined,
			idDocumentNumber: '',
			image: undefined,
		},
	});

	const {
		formState: { isSubmitting },
	} = form;

	const onSubmit = async (values: KycFormValues) => {
		const formData = new FormData();

		Object.entries(values).forEach(([key, value]) => {
			if (key === 'image') {
				if (value instanceof File) {
					formData.append(key, value);
				}
			} else if (value !== null && value !== undefined) {
				formData.append(key, String(value));
			}
		});

		try {
			const response = await fetchWithAuth('/api/agents/apply', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				nProgress.start();
				toast.success(`Application submitted successfully`);
				setIsSubmitted(true);
			} else {
				let errorMessage = `Failed to submit application. Status: ${response.status}`;
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
			nProgress.done();
		}
	};

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">Agent Application - KYC Verification</h1>

			{isLoading && (
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-32" />
				</div>
			)}

			{error && <ErrorMessage message={error} onRetry={fetchApplicationStatus} />}

			{!isLoading && !error && applicationStatus === 'pending' && (
				<div className="">
					<p className="text-xl">Your agent application is currently pending review.</p>
					<p>We will notify you once your application status has been updated.</p>
				</div>
			)}

			{!isLoading && !error && applicationStatus !== 'pending' && !isSubmitted && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Legal Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter your full legal name" {...field} disabled={isSubmitting} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="dateOfBirth"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date of Birth</FormLabel>
									<FormControl>
										<Input type="date" {...field} disabled={isSubmitting} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="residentialAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Residential Address</FormLabel>
									<FormControl>
										<Textarea placeholder="Enter your residential address" {...field} disabled={isSubmitting} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="idDocumentType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Government-Issued ID Type</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select an ID type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="Passport">Passport</SelectItem>
											<SelectItem value="Driver's License">Driver&apos;s License</SelectItem>
											<SelectItem value="National ID">National ID</SelectItem>
											<SelectItem value="Other">Other</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="idDocumentNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Government-Issued ID Number</FormLabel>
									<FormControl>
										<Input placeholder="Enter your ID number" {...field} disabled={isSubmitting} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="image"
							render={({ field: { value, onChange, ...fieldProps } }) => (
								<FormItem>
									<FormLabel>Government-Issued ID Image</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept={ACCEPTED_IMAGE_TYPES.join(',')}
											{...fieldProps}
											onChange={(event) => {
												onChange(event.target.files ? event.target.files[0] : null);
											}}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button variant={'success'} size={'lg'} type="submit">
							Submit Application
						</Button>
					</form>
				</Form>
			)}

			{!isLoading && !error && isSubmitted && (
				<div className="text-green-600">
					<p className="text-xl">Application submitted successfully!</p>
					<p>Please wait for a response regarding your application status.</p>
				</div>
			)}
		</div>
	);
};

export default AgentApplyContent;
