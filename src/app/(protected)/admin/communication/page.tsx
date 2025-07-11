'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { logger } from '@/lib/logger';
import { handleFetchMessage } from '@/lib/helpers';
import { Switch } from '@/components/ui/switch';
import { Input as SearchInput } from '@/components/ui/input';
import { X } from 'lucide-react';

const formSchema = z.object({
	messageTitle: z.string().optional(),
	messageContent: z.string().min(1, 'Message content cannot be empty.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CommunicationCenterPage() {
	const [sentMessages, setSentMessages] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [previewHtml, setPreviewHtml] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [historyPage, setHistoryPage] = useState(1);
	const [historyTotal, setHistoryTotal] = useState(0);
	const [sendToAll, setSendToAll] = useState(true);
	const [deliveryMethod, setDeliveryMethod] = useState<'notification' | 'email' | 'both'>('notification');
	const [userSearch, setUserSearch] = useState('');
	const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
	const [userSearchLoading, setUserSearchLoading] = useState(false);
	const HISTORY_PAGE_SIZE = 10;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			messageTitle: '',
			messageContent: '',
		},
	});

	const { watch, handleSubmit, reset } = form;
	const messageContent = watch('messageContent');
	const messageTitle = watch('messageTitle');

	useEffect(() => {
		async function fetchSent() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetchWithAuth(`/api/notifications/sent?page=${historyPage}&pageSize=${HISTORY_PAGE_SIZE}`);
				const data = await res.json();
				if (data.status === 'error') {
					setError(data.message || 'Failed to fetch sent messages.');
					setSentMessages([]);
					setHistoryTotal(0);
					return;
				}
				setSentMessages(data.data.notifications);
				setHistoryTotal(data.data.count);
			} catch (e) {
				setError(handleFetchMessage(e, 'Failed to fetch sent messages.'));
				setSentMessages([]);
				setHistoryTotal(0);
			}
			setLoading(false);
		}
		fetchSent();
	}, [historyPage]);

	useEffect(() => {
		if (!messageContent) {
			setPreviewHtml('');
			return;
		}
		const isHtml = /<[a-z][\s\S]*>/i.test(messageContent);
		if (isHtml) {
			setPreviewHtml(messageContent);
		} else {
			setPreviewHtml(messageContent.replace(/\n/g, '<br/>').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
		}
	}, [messageContent]);

	// User search effect
	useEffect(() => {
		if (!userSearch || sendToAll) {
			setUserSearchResults([]);
			return;
		}
		let ignore = false;
		async function searchUsers() {
			setUserSearchLoading(true);
			try {
				const res = await fetchWithAuth(`/api/users/all?searchTerm=${encodeURIComponent(userSearch)}`);
				const { data } = await res.json();
				logger.log('User search results:', data);
				if (!ignore) setUserSearchResults(data.users || []);
			} catch (e) {
				if (!ignore) setUserSearchResults([]);
			}
			setUserSearchLoading(false);
		}
		const timer = setTimeout(searchUsers, 300);
		return () => {
			ignore = true;
			clearTimeout(timer);
		};
	}, [userSearch, sendToAll]);

	const handleAddUser = (user: any) => {
		if (!selectedUsers.some((u) => u.id === user.id)) {
			setSelectedUsers((prev) => [...prev, user]);
		}
		setUserSearch('');
		setUserSearchResults([]);
	};

	const handleRemoveUser = (userId: string) => {
		setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
	};

	const onSubmit = async (values: FormValues) => {
		setLoading(true);
		setError(null);
		try {
			const payload: any = {
				title: values.messageTitle,
				message: values.messageContent,
				delivery_method: deliveryMethod,
			};
			if (!sendToAll) {
				payload.recipient_id = selectedUsers.map((u) => u.id);
			}
			const res = await fetchWithAuth('/api/notifications/new', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (data.status === 'error') {
				const errorMessage = handleFetchMessage(data, 'Failed to send broadcast.');
				setError(errorMessage || 'Failed to send broadcast.');
				toast.error(errorMessage || 'Failed to send broadcast.');
				return;
			}
			reset();
			setSelectedUsers([]);
			setSendToAll(true);
			setDeliveryMethod('notification');
			setHistoryPage(1);
			toast.success('Broadcast Sent!');
		} catch (err) {
			logger.error('Failed to send broadcast:', err);
			const errorMessage = handleFetchMessage(err, 'Failed to send broadcast.');
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const totalPages = Math.ceil(historyTotal / HISTORY_PAGE_SIZE);

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-2xl font-semibold mt-2">Communication Center</h1>
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-2">
						<div>
							<CardTitle>Send Broadcast Message</CardTitle>
							<CardDescription className="mt-2">Send a pop-up message to all active users.</CardDescription>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<Switch checked={sendToAll} onCheckedChange={setSendToAll} id="send-to-all-toggle" />
								<label htmlFor="send-to-all-toggle" className="text-sm font-medium cursor-pointer select-none">
									{sendToAll ? 'Send to All' : 'Send to Selected'}
								</label>
							</div>
							{/* <div className="flex flex-col gap-2">
								<label htmlFor="delivery-method-select" className="text-sm font-medium select-none">
									Delivery Method:
								</label>
								<select id="delivery-method-select" className="border rounded px-2 py-1 text-sm bg-background" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as 'notification' | 'email' | 'both')}>
									<option value="notification">Notifications Only</option>
									<option value="email">Email Only</option>
									<option value="both">Notification and Email</option>
								</select>
							</div> */}
						</div>
					</CardHeader>
					<Form {...form}>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6">
							{!sendToAll && (
								<div className="mb-6">
									<SearchInput placeholder="Search users by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="mb-2" disabled={userSearchLoading} />
									{userSearch && userSearchResults.length > 0 && (
										<ul className="bg-popover border rounded shadow max-h-40 overflow-y-auto z-10 relative">
											{userSearchResults.map((user) => (
												<li key={user.id} className="px-4 py-2 hover:bg-muted cursor-pointer" onClick={() => handleAddUser(user)}>
													{user.name} <span className="text-muted-foreground text-xs">({user.email})</span>
												</li>
											))}
										</ul>
									)}
									{selectedUsers.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{selectedUsers.map((user) => (
												<span key={user.id} className="inline-flex items-center bg-muted rounded px-2 py-1 text-xs">
													{user.name} <span className="ml-1 text-muted-foreground">({user.email})</span>
													<button type="button" className="ml-1 text-destructive hover:text-red-700" onClick={() => handleRemoveUser(user.id)}>
														<X className="w-3 h-3" />
													</button>
												</span>
											))}
										</div>
									)}
								</div>
							)}
							<FormField
								control={form.control}
								name="messageTitle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Message Title (Optional)</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Important Update" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="messageContent"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Message Content (HTML or Plain Text)</FormLabel>
										<FormControl>
											<Textarea placeholder="Type your message here..." rows={8} required {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<CardFooter className="px-0">
								<Button type="submit" disabled={!messageContent?.trim() || loading || (!sendToAll && selectedUsers.length === 0)}>
									<Send className="mr-2 h-4 w-4" /> {loading ? 'Sending...' : 'Send Broadcast'}
								</Button>
							</CardFooter>
						</form>
					</Form>
				</Card>

				{/* PREVIEW CARD */}
				<Card>
					<CardHeader>
						<CardTitle>Message Preview</CardTitle>
						<CardDescription>How the pop-up might appear to users.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 border rounded-md bg-background min-h-[200px]">
							{messageTitle && <h3 className="text-lg font-semibold mb-2">{messageTitle}</h3>}
							{previewHtml ? <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: previewHtml }} /> : <p className="text-sm text-muted-foreground italic">Preview will appear here...</p>}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* HISTORY CARD */}
			{false && (
				<Card>
					<CardHeader>
						<CardTitle>Message History</CardTitle>
						<CardDescription>Previously sent broadcast messages.</CardDescription>
					</CardHeader>
					<CardContent>
						{error && <p className="text-destructive mb-2">{error}</p>}
						{loading ? (
							<p className="text-muted-foreground">Loading...</p>
						) : sentMessages.length === 0 ? (
							<p className="text-muted-foreground">No sent messages yet.</p>
						) : (
							<>
								<div className="overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead>
											<tr className="border-b">
												<th className="px-2 py-2 text-left">Title</th>
												<th className="px-2 py-2 text-left">Date</th>
												<th className="px-2 py-2 text-left">Read</th>
												<th className="px-2 py-2 text-left">Unread</th>
											</tr>
										</thead>
										<tbody>
											{sentMessages.map((msg) => (
												<tr key={msg.id} className="border-b hover:bg-muted/30">
													<td className="px-2 py-2 font-medium max-w-xs truncate">{msg.title || <span className="italic text-muted-foreground">(No Title)</span>}</td>
													<td className="px-2 py-2">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</td>
													<td className="px-2 py-2 text-green-600 font-semibold">{msg.read_count ?? 0}</td>
													<td className="px-2 py-2 text-red-600 font-semibold">{msg.unread_count ?? 0}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{totalPages > 1 && (
									<div className="flex items-center justify-between space-x-2 py-4 px-2">
										<div className="text-sm text-muted-foreground">
											Showing page {historyPage} of {totalPages} ({historyTotal} messages total)
										</div>
										<div className="space-x-2 flex items-center">
											<Button variant="outline" size="sm" onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage === 1 || loading} className="cursor-pointer">
												Previous
											</Button>
											<Button variant="outline" size="sm" onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))} disabled={historyPage === totalPages || loading} className="cursor-pointer">
												Next
											</Button>
										</div>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
