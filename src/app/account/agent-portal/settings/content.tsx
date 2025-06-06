'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ApiPaymentMethod, PaymentMethod } from '@/types';
import { useAuthContext } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function AgentPortalSettingsContent() {
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [form, setForm] = useState<{ type: string; details: Record<string, string> }>({ type: '', details: {} });
	const [availableMethods, setAvailableMethods] = useState<ApiPaymentMethod[]>([]);
	const [fields, setFields] = useState<{ name: string; label: string; type: string }[]>([]);
	const [loading, setLoading] = useState(true);
	const [apiLoading, setApiLoading] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedForDelete, setSelectedForDelete] = useState<any>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editForm, setEditForm] = useState<{ id: string | null; type: string; details: Record<string, string> }>({
		id: null,
		type: '',
		details: {},
	});
	const { currentUser } = useAuthContext();

	async function fetchMethods() {
		setLoading(true);
		try {
			const res = await fetch('/api/p2p/payment-methods');
			const data = await res.json();
			if (data.status === 'success') {
				console.log(data);

				setAvailableMethods(data.data.filter((m: ApiPaymentMethod) => m.is_active));
			}
		} catch (e) {
			toast.error('Error loading payment methods');
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchMethods();
	}, []);

	useEffect(() => {
		if (!form.type) {
			setFields([]);
			return;
		}
		const method = availableMethods.find((m) => m.id === form.type);
		if (method) {
			try {
				const parsed = JSON.parse(method.fields_required);
				setFields(parsed);
			} catch {
				setFields([]);
			}
		}
	}, [form.type, availableMethods]);

	// Helper to get label for a field from payment method definition
	function getFieldLabel(paymentMethodId: string, fieldName: string): string {
		const method = availableMethods.find((m) => m.id === paymentMethodId);
		if (!method) return fieldName;
		try {
			const fields = JSON.parse(method.fields_required) as { name: string; label: string }[];
			return fields.find((f) => f.name === fieldName)?.label || fieldName;
		} catch {
			return fieldName;
		}
	}

	useEffect(() => {
		const agentId = currentUser?.agent_id;
		if (!agentId) return;
		let ignore = false;
		async function fetchAgentPaymentOptions() {
			setLoading(true);
			try {
				const res = await fetch(`/api/agents/payment-options/agent/${agentId}`);
				const data = await res.json();
				if (!ignore) {
					if (res.ok && data.status === 'success') {
						setPaymentMethods(data.data);
					} else {
						toast.error('Failed to load your payment options');
					}
				}
			} catch (e) {
				if (!ignore) toast.error('Error loading your payment options');
			} finally {
				if (!ignore) setLoading(false);
			}
		}
		fetchAgentPaymentOptions();
		return () => {
			ignore = true;
		};
	}, [currentUser?.agent_id]);

	const handleAddPaymentMethod = async () => {
		if (!form.type) {
			toast.error('Please select a payment method type');
			return;
		}
		const payload = {
			agent_id: currentUser?.agent_id,
			payment_method_id: form.type,
			account_details: form.details,
		};

		setApiLoading(true);
		const toastId = toast.loading('Saving payment method...');
		try {
			const res = await fetch('/api/agents/payment-options', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (res.ok && data.status === 'success') {
				setPaymentMethods([
					...paymentMethods,
					{
						...data.data,
						payment_method_id: form.type,
						account_details: form.details,
					},
				]);
				setForm({ type: '', details: {} });
				setModalOpen(false);
				toast.success('Payment method added', { id: toastId });
			} else {
				toast.error(data.message || 'Failed to add payment method', { id: toastId });
			}
		} catch (e) {
			toast.error('Error adding payment method', { id: toastId });
		} finally {
			setApiLoading(false);
		}
	};

	const handleEditClick = (pm: any) => {
		setEditForm({ id: pm.id, type: pm.payment_method_id, details: { ...pm.account_details } });
		setEditModalOpen(true);
	};

	const handleEditPaymentMethod = async () => {
		if (!editForm.type) {
			toast.error('Please select a payment method type');
			return;
		}
		const payload = {
			payment_method_id: editForm.type,
			account_details: editForm.details,
		};
		setApiLoading(true);
		const toastId = toast.loading('Updating payment method...');
		try {
			const res = await fetch(`/api/agents/payment-options/${editForm.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (res.ok && data.status === 'success') {
				setPaymentMethods(paymentMethods.map((pm) => (pm.id === editForm.id ? { ...pm, ...data.data, payment_method_id: editForm.type, account_details: editForm.details } : pm)));
				setEditModalOpen(false);
				toast.success('Payment method updated', { id: toastId });
			} else {
				toast.error(data.message || 'Failed to update payment method', { id: toastId });
			}
		} catch (e) {
			toast.error('Error updating payment method', { id: toastId });
		} finally {
			setApiLoading(false);
		}
	};

	const handleRemove = async (id: number | string) => {
		setApiLoading(true);
		const toastId = toast.loading('Deleting payment method...');
		try {
			const res = await fetch(`/api/agents/payment-options/${id}`, {
				method: 'DELETE',
			});
			if (res.ok) {
				setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
				toast.success('Payment method deleted', { id: toastId });
			} else {
				toast.error('Failed to delete payment method', { id: toastId });
			}
		} catch (e) {
			toast.error('Error deleting payment method', { id: toastId });
		} finally {
			setApiLoading(false);
			setConfirmOpen(false);
			setSelectedForDelete(null);
		}
	};

	// Helper: get fields for edit modal based on editForm.type
	const editFields = editForm.type
		? (() => {
				const method = availableMethods.find((m) => m.id === editForm.type);
				if (method) {
					try {
						return JSON.parse(method.fields_required) as { name: string; label: string; type: string }[];
					} catch {
						return [];
					}
				}
				return [];
		  })()
		: [];

	return (
		<div className="max-w-2xl space-y-8 pb-16">
			<h1 className="sub-page-heading">Agent Settings</h1>
			<p className="sub-page-heading-sub-text mb-6">Manage your P2P agent profile and payment methods. The information provided here will be used for peer-to-peer transactions and payouts. Please ensure your payment methods are accurate and up to date to facilitate seamless transactions.</p>

			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg text-foreground flex items-center justify-between">
						Payment Methods
						<Button size="sm" variant="outline" onClick={() => setModalOpen(true)} disabled={loading || apiLoading}>
							{loading ? (
								<Skeleton className="h-4 w-16 rounded" />
							) : (
								<>
									<Plus className="h-4 w-4 mr-1" /> Add
								</>
							)}
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{loading ? (
						<>
							{Array.from({ length: 2 }).map((_, i) => (
								<div key={i} className="flex items-center gap-4">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-1/2 rounded" />
										<Skeleton className="h-3 w-3/4 rounded" />
									</div>
								</div>
							))}
						</>
					) : paymentMethods.length === 0 && !loading ? (
						<p className="text-muted-foreground text-sm">No payment methods added yet.</p>
					) : (
						<ul className="space-y-3">
							{paymentMethods.map((pm: any) => (
								<li key={pm.id} className="flex items-center justify-between bg-background rounded-lg px-4 py-3 border border-border">
									<div className="space-y-3">
										<div className="font-medium text-foreground">
											{/* Show payment method name if available */}
											{availableMethods.find((m) => m.id === pm.payment_method_id)?.name || pm.type}
										</div>
										<ul className="text-sm text-muted-foreground break-all list-disc list-inside">
											{Object.entries(pm.account_details || {}).map(([k, v]) => (
												<li key={k}>
													<span className="font-medium">{getFieldLabel(pm.payment_method_id, k)}:</span> {String(v)}
												</li>
											))}
										</ul>
									</div>
									<div className="flex gap-2">
										<Button size="icon" variant="ghost" onClick={() => handleEditClick(pm)} aria-label="Edit" disabled={apiLoading}>
											<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M12 20h9" />
												<path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
											</svg>
										</Button>
										<Button
											size="icon"
											variant="ghost"
											onClick={() => {
												setSelectedForDelete(pm);
												setConfirmOpen(true);
											}}
											aria-label="Remove"
											disabled={apiLoading}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add Payment Method</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleAddPaymentMethod();
						}}
						className="space-y-6 mt-5"
					>
						<div className="space-y-3">
							<Label htmlFor="type">Type</Label>
							{loading ? (
								<Skeleton className="h-10 w-full rounded" />
							) : (
								<Select value={form.type} onValueChange={(value) => setForm((f) => ({ ...f, type: value, details: {} }))} required>
									<SelectTrigger className="account-input w-full">
										<SelectValue placeholder={loading ? 'Loading...' : 'Select payment method'} />
									</SelectTrigger>
									<SelectContent className="account-input w-full">
										{availableMethods.map((m) => (
											<SelectItem key={m.id} value={m.id} className="bg-background text-foreground dark:bg-[oklch(var(--dashboard-muted-bg))] dark:text-foreground">
												{m.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>

						{loading
							? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)
							: fields.map((field) => (
									<div className="space-y-3" key={field.name}>
										<Label htmlFor={field.name}>{field.label}</Label>
										<Input id={field.name} type={field.type} placeholder={field.label} value={form.details[field.name] || ''} onChange={(e) => setForm((f) => ({ ...f, details: { ...f.details, [field.name]: e.target.value } }))} required className="account-input" />
									</div>
							  ))}
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={apiLoading}>
								Cancel
							</Button>
							<Button type="submit" variant="success" disabled={apiLoading || loading}>
								{apiLoading ? 'Adding new option...' : 'Add'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Modal */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Payment Method</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleEditPaymentMethod();
						}}
						className="space-y-6 mt-5"
					>
						<div className="space-y-3">
							<Label htmlFor="edit-type">Type</Label>
							<Input id="edit-type" value={availableMethods.find((m) => m.id === editForm.type)?.name || ''} disabled className="account-input w-full bg-muted/50 cursor-not-allowed" />
						</div>
						{editFields.length > 0 &&
							editFields.map((field) => (
								<div className="space-y-3" key={field.name}>
									<Label htmlFor={`edit-${field.name}`}>{field.label}</Label>
									<Input id={`edit-${field.name}`} type={field.type} placeholder={field.label} value={editForm.details[field.name] || ''} onChange={(e) => setEditForm((f) => ({ ...f, details: { ...f.details, [field.name]: e.target.value } }))} required className="account-input" />
								</div>
							))}
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} disabled={apiLoading}>
								Cancel
							</Button>
							<Button type="submit" variant="success" disabled={apiLoading}>
								{apiLoading ? 'Saving...' : 'Save Changes'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Confirmation Modal for Delete */}
			<ConfirmationModal
				isOpen={confirmOpen}
				onClose={() => {
					setConfirmOpen(false);
					setSelectedForDelete(null);
				}}
				onConfirm={() => selectedForDelete && handleRemove(selectedForDelete.id)}
				isLoading={apiLoading}
				title="Delete Payment Method"
				description="Are you sure you want to delete this payment method? This action cannot be undone."
				confirmButtonText="Delete"
			/>
		</div>
	);
}
