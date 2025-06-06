'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { handleFetchErrorMessage } from '@/lib/helpers';

// Order type definition
interface Order {
	id: string;
	agent_id?: string;
	order_type: 'BUY_PLATFORM_CURRENCY' | 'SELL_PLATFORM_CURRENCY';
	fiat_currency: string;
	total_asset_amount: string;
	price_per_unit: string;
	payment_window_minutes: string;
	order_terms: string;
	status: 'active' | 'paused';
	created_at: string;
}

export default function AgentOrdersContent() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [form, setForm] = useState({
		order_type: '',
		fiat_currency: '',
		total_asset_amount: '',
		price_per_unit: '',
		payment_window_minutes: '',
		order_terms: 'Please ensure payment is made from an account with your name. No third-party payments allowed. Release will be made after confirmation.',
	});
	const [apiLoading, setApiLoading] = useState(false);

	// Edit modal state
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editForm, setEditForm] = useState<Order | null>(null);

	const { currentUser } = useAuthContext();

	// Helper to fetch and map orders from backend
	const fetchOrders = async () => {
		if (!currentUser?.agent_id) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/p2p/orders/agent/${currentUser.agent_id}`);
			const data = await res.json();
			const ordersRaw = data?.data?.orders || [];
			const mappedOrders: Order[] = ordersRaw.map((o: any) => ({
				id: o.id,
				order_type: o.order_type,
				fiat_currency: o.fiat_currency,
				total_asset_amount: o.total_asset_amount,
				price_per_unit: o.price_per_unit,
				payment_window_minutes: o.payment_window_minutes,
				order_terms: o.order_terms,
				status: o.status,
				created_at: o.created_at,
			}));
			setOrders(mappedOrders);
		} catch {
			toast.error('Failed to load orders');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, [currentUser?.agent_id]);

	const handleOpenModal = () => {
		setForm({
			order_type: '',
			fiat_currency: '',
			total_asset_amount: '',
			price_per_unit: '',
			payment_window_minutes: '',
			order_terms: 'Please ensure payment is made from an account in your name. No third-party payments allowed. Release will be made after confirmation.',
		});
		setModalOpen(true);
	};

	const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		for (const key of Object.keys(form)) {
			if (!form[key as keyof typeof form]) {
				toast.error('Please fill all fields');
				return;
			}
		}
		setApiLoading(true);
		try {
			const res = await fetch('/api/p2p/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...form, status: 'active' }),
			});

			if (res.ok) {
				toast.success('Order created');
				setModalOpen(false);
				await fetchOrders();
			} else {
				const error = await res.json().catch(() => ({}));
				throw new Error(error.message || 'Failed to upload avatar');
			}
		} catch (err: unknown) {
			const errorMessage = handleFetchErrorMessage(err, 'Failed to create order');
			toast.error(errorMessage);
		} finally {
			setApiLoading(false);
		}
	};

	const handleEditClick = (order: Order) => {
		setEditForm(order);
		setEditModalOpen(true);
	};

	const handleEditOrder = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!editForm) return;
		for (const key of ['order_type', 'fiat_currency', 'total_asset_amount', 'price_per_unit', 'payment_window_minutes', 'order_terms']) {
			if (!(editForm as any)[key]) {
				toast.error('Please fill all fields');
				return;
			}
		}
		setApiLoading(true);
		try {
			const res = await fetch(`/api/p2p/orders/${editForm.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editForm),
			});
			if (res.ok) {
				setEditModalOpen(false);
				await fetchOrders(); // Refetch after edit
				toast.success('Order updated');
			} else {
				const error = await res.json().catch(() => ({}));
				throw new Error(error.message || 'Failed to create order');
			}
		} catch (err: unknown) {
			const errorMessage = handleFetchErrorMessage(err, null, 'Failed to create order');
			toast.error(errorMessage);
		} finally {
			setApiLoading(false);
		}
	};

	return (
		<div className="max-w-2xl space-y-8 pb-16">
			<h1 className="sub-page-heading">P2P Orders</h1>
			<p className="sub-page-heading-sub-text mb-6">View and manage your P2P buy and sell orders. You can create new orders as an agent.</p>
			<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg text-foreground flex items-center justify-between">
						Orders
						<Button size="sm" variant="outline" onClick={handleOpenModal} disabled={apiLoading}>
							<Plus className="h-4 w-4 mr-1" /> New Order
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{loading ? (
						<ul className="divide-y divide-border">
							{Array.from({ length: 2 }).map((_, i) => (
								<li key={i} className="py-3 flex flex-col gap-2">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
										<div className="space-y-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-40" />
											<Skeleton className="h-3 w-32" />
										</div>
										<div className="flex items-center gap-2 mt-2 sm:mt-0">
											<Skeleton className="h-5 w-12" />
											<Skeleton className="h-8 w-8 rounded-full" />
										</div>
									</div>
								</li>
							))}
						</ul>
					) : orders.length === 0 ? (
						<p className="text-muted-foreground text-sm">No orders found.</p>
					) : (
						<ul className="divide-y divide-border">
							{orders.map((order) => (
								<li key={order.id} className="py-3 flex flex-col gap-2">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
										<div>
											<span className="font-medium text-foreground capitalize">{order.order_type === 'BUY_PLATFORM_CURRENCY' ? 'Buy' : 'Sell'} order</span>
											<span className="ml-2 text-xs text-muted-foreground">{order.created_at}</span>
											<div className="text-sm text-muted-foreground mt-1">
												<span className="font-semibold">{order.total_asset_amount}</span> {order.fiat_currency} @ <span className="font-semibold">₦{order.price_per_unit}</span>
											</div>
											<div className="text-xs text-muted-foreground mt-1">Window: {order.payment_window_minutes} min</div>
											<div className="text-xs text-muted-foreground mt-1">Terms: {order.order_terms}</div>
										</div>
										<div className="flex items-center gap-2 mt-2 sm:mt-0">
											<span className={`px-2 py-0.5 rounded text-xs font-medium ${order.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>{order.status}</span>
											<Button size="icon" variant="ghost" onClick={() => handleEditClick(order)} aria-label="Edit" disabled={apiLoading}>
												<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M12 20h9" />
													<path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
												</svg>
											</Button>
										</div>
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
						<DialogTitle>Create Order</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreateOrder} className="space-y-6 mt-5">
						<div className="space-y-3">
							<Label htmlFor="order_type">Order Type</Label>
							<Select value={form.order_type} onValueChange={(value) => setForm((f) => ({ ...f, order_type: value as 'BUY_PLATFORM_CURRENCY' | 'SELL_PLATFORM_CURRENCY' }))} required>
								<SelectTrigger className="account-input w-full">
									<SelectValue placeholder="Select order type" />
								</SelectTrigger>
								<SelectContent className="account-input w-full">
									<SelectItem value="BUY_PLATFORM_CURRENCY">Buy </SelectItem>
									<SelectItem value="SELL_PLATFORM_CURRENCY">Sell </SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-3">
							<Label htmlFor="fiat_currency">Fiat Currency</Label>
							<Input id="fiat_currency" value={form.fiat_currency} onChange={(e) => setForm((f) => ({ ...f, fiat_currency: e.target.value }))} placeholder="e.g. NGN" required className="account-input w-full" />
						</div>
						<div className="space-y-3">
							<Label htmlFor="total_asset_amount">Total Asset Amount</Label>
							<Input id="total_asset_amount" type="number" min="0" value={form.total_asset_amount} onChange={(e) => setForm((f) => ({ ...f, total_asset_amount: e.target.value }))} placeholder="Enter total asset amount" required className="account-input w-full" />
						</div>
						<div className="space-y-3">
							<Label htmlFor="price_per_unit">Price Per Unit</Label>
							<Input id="price_per_unit" type="number" min="0" step="any" value={form.price_per_unit} onChange={(e) => setForm((f) => ({ ...f, price_per_unit: e.target.value }))} placeholder="Enter price per unit" required className="account-input w-full" />
						</div>
						<div className="space-y-3">
							<Label htmlFor="payment_window_minutes">Payment Window (minutes)</Label>
							<Input id="payment_window_minutes" type="number" min="1" value={form.payment_window_minutes} onChange={(e) => setForm((f) => ({ ...f, payment_window_minutes: e.target.value }))} placeholder="e.g. 15" required className="account-input w-full" />
						</div>
						<div className="space-y-3">
							<Label htmlFor="order_terms">Order Terms</Label>
							<textarea
								id="order_terms"
								value={form.order_terms}
								onChange={(e) => setForm((f) => ({ ...f, order_terms: e.target.value }))}
								placeholder="e.g. Please ensure payment is made from an account with your name. No third-party payments allowed. Release will be made after confirmation."
								required
								className="account-input w-full min-h-[80px] resize-y rounded border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={apiLoading}>
								Cancel
							</Button>
							<Button type="submit" variant="success" disabled={apiLoading}>
								{apiLoading ? 'Creating...' : 'Create Order'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
			{/* Edit Modal */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Order</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleEditOrder} className="space-y-6 mt-5">
						<div className="space-y-3">
							<Label htmlFor="edit-order_type">Order Type</Label>
							<div className="account-input w-full bg-muted/50 px-3 py-2 rounded text-sm text-foreground">{editForm?.order_type === 'BUY_PLATFORM_CURRENCY' ? 'Buy' : 'Sell'}</div>
						</div>
						<div className="space-y-3">
							<Label htmlFor="edit-fiat_currency">Fiat Currency</Label>
							<Input id="edit-fiat_currency" value={editForm?.fiat_currency || ''} onChange={(e) => setEditForm((f) => (f ? { ...f, fiat_currency: e.target.value } : f))} required className="account-input w-full" />
						</div>
						<div className="space-y-3">
							<Label htmlFor="edit-total_asset_amount">Total Asset Amount</Label>
							<Input id="edit-total_asset_amount" type="number" min="0" value={editForm?.total_asset_amount || ''} onChange={(e) => setEditForm((f) => (f ? { ...f, total_asset_amount: e.target.value } : f))} required className="account-input w-full" />
						</div>
						<div className="space-y-3">
							<Label htmlFor="edit-price_per_unit">Price Per Unit</Label>
							<Input id="edit-price_per_unit" type="number" min="0" step="any" value={editForm?.price_per_unit || ''} onChange={(e) => setEditForm((f) => (f ? { ...f, price_per_unit: e.target.value } : f))} required className="account-input w-full" />
						</div>
						<div className="space-y-3">
							<Label htmlFor="edit-payment_window_minutes">Payment Window (minutes)</Label>
							<Input id="edit-payment_window_minutes" type="number" min="1" value={editForm?.payment_window_minutes || ''} onChange={(e) => setEditForm((f) => (f ? { ...f, payment_window_minutes: e.target.value } : f))} required className="account-input w-full" />
						</div>
						<div className="space-y-3">
							<Label htmlFor="edit-order_terms">Order Terms</Label>
							<textarea
								id="edit-order_terms"
								value={editForm?.order_terms || ''}
								onChange={(e) => setEditForm((f) => (f ? { ...f, order_terms: e.target.value } : f))}
								required
								className="account-input w-full min-h-[80px] resize-y rounded border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
						</div>
						<div className="space-y-3">
							<Label htmlFor="edit-status">Status</Label>
							<Select value={editForm?.status || ''} onValueChange={(value) => setEditForm((f) => (f ? { ...f, status: value as 'active' | 'paused' } : f))} required>
								<SelectTrigger className="account-input w-full">
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent className="account-input w-full">
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="paused">Pause</SelectItem>
								</SelectContent>
							</Select>
						</div>
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
		</div>
	);
}
