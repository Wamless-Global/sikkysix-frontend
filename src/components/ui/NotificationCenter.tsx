import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Bell, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { formatRelativeTime } from '@/lib/helpers';
import { CustomLink } from './CustomLink';

interface Notification {
	id: string;
	title: string;
	message: string;
	created_at: string;
	is_read: boolean;
	type?: string;
	action_link?: string | null;
	sender_id?: string;
}

interface NotificationCenterProps {
	open: boolean;
	onClose: () => void;
	handleUnread: (notifications: number) => void;
	userId: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose, userId, handleUnread }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	const unreadCount = notifications.filter((n) => !n.is_read).length;

	useEffect(() => {
		handleUnread(unreadCount);
	}, [unreadCount, handleUnread]);

	useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	useEffect(() => {
		if (!userId) return;
		let ignore = false;
		async function fetchNotifications() {
			setLoading(true);
			const { data, error } = await supabase.from('notifications').select('*').eq('recipient_id', userId).order('created_at', { ascending: false });
			if (!ignore && data) setNotifications(data as Notification[]);
			setLoading(false);
		}
		fetchNotifications();
		return () => {
			ignore = true;
		};
	}, [userId]);

	useEffect(() => {
		if (!userId) return;
		let channel: any;
		let reconnectTimeout: NodeJS.Timeout | null = null;

		const subscribe = () => {
			channel = supabase.channel(`notifications-${userId}`);
			channel.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notifications',
					filter: `recipient_id=eq.${userId}`,
				},
				(payload: { new: Notification }) => {
					setNotifications((prev) => [payload.new as Notification, ...prev]);
				}
			);
			channel.on('close', {}, () => {
				reconnectTimeout = setTimeout(() => {
					subscribe();
				}, 2000);
			});
			channel.subscribe();
		};

		subscribe();

		return () => {
			if (channel) channel.unsubscribe();
			if (reconnectTimeout) clearTimeout(reconnectTimeout);
		};
	}, [userId]);

	// Click-away to close on large screens
	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			const panel = document.querySelector('.notification-center-panel');
			if (panel && !panel.contains(e.target as Node)) {
				if (window.innerWidth >= 1024) onClose();
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [open, onClose]);

	useEffect(() => {
		if (!open || notifications.length === 0) return;
		const unread = notifications.filter((n) => !n.is_read);
		if (unread.length === 0) return;

		unread.forEach(async (n) => {
			try {
				await fetch(`/api/notifications/${n.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						is_read: true,
						read_at: new Date().toISOString(),
					}),
				});
				// Optionally update local state for instant feedback
				setNotifications((prev) => prev.map((notif) => (notif.id === n.id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif)));
			} catch (e) {
				logger.error('Failed to mark notification as read', e);
			}
		});
	}, [open, notifications]);

	useEffect(() => {
		if (!open || notifications.length === 0) return;
		const unread = notifications.filter((n) => !n.is_read);
		if (unread.length === 0) return;

		unread.forEach(async (n) => {
			try {
				await fetch(`/api/notifications/${n.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						is_read: true,
						read_at: new Date().toISOString(),
					}),
				});
				// Optionally update local state for instant feedback
				setNotifications((prev) => prev.map((notif) => (notif.id === n.id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif)));
			} catch (e) {
				logger.error('Failed to mark notification as read', e);
			}
		});
	}, [open, notifications]);

	// 1. Define the function for deleting a notification
	const handleDeleteNotification = async (id: string) => {
		try {
			await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
			setNotifications((prev) => prev.filter((notif) => notif.id !== id));
		} catch (e) {
			logger.error('Failed to delete notification', e);
		}
	};

	// Only render overlay and panel if open is true
	return open ? (
		<>
			<div className="fixed inset-0 z-90 bg-black/40 transition-opacity duration-200 opacity-100 pointer-events-auto" aria-hidden="true" />
			<div className="notification-center-panel enhanced fixed right-0 top-0 bottom-0 z-100 bg-[oklch(var(--dashboard-secondary))] border-l border-[oklch(var(--border))] shadow-2xl rounded-l-2xl max-w-md w-full lg:mr-4 animate-fade-in-up">
				<div className="notification-center-header enhanced flex items-center justify-between px-4 sm:px-8 py-4 border-b border-[oklch(var(--border))] bg-[oklch(var(--sidebar))] rounded-tl-2xl">
					<div className="flex items-center gap-3">
						<Bell className="h-6 w-6 text-[oklch(var(--dashboard-secondary-foreground))]" />
						<span className="font-nico text-lg sm:text-xl font-semibold text-[oklch(var(--dashboard-secondary-foreground))] tracking-tight">Notifications</span>
						{unreadCount > 0 && <span className="ml-2 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5">{unreadCount}</span>}
					</div>
					<Button variant="ghost" size="icon" onClick={onClose} className="notification-center-close text-[oklch(var(--dashboard-secondary-foreground))] opacity-80 hover:opacity-100 focus:opacity-100 z-10" aria-label="Close notifications panel">
						<X className="h-6 w-6" />
					</Button>
				</div>
				<div className="notification-center-list enhanced px-6 py-6 bg-[oklch(var(--dashboard-secondary))] rounded-b-2xl max-h-[80vh] overflow-y-auto">
					{loading ? (
						<div className="notification-center-empty text-center text-muted-foreground py-10">Loading...</div>
					) : notifications.length === 0 ? (
						<div className="notification-center-empty text-center text-muted-foreground py-10 !text-sm sm:text-base">No notifications yet.</div>
					) : (
						<div className="space-y-4">
							{notifications.map((n) => (
								<div
									key={n.id}
									className={`notification-center-item flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md px-6 py-4 relative group transition-all duration-150 ${n.is_read ? 'opacity-70' : 'opacity-100'} text-sm sm:text-base`}
									style={{ minHeight: 'unset' }}
								>
									<div className="flex items-center justify-between mb-1">
										<CustomLink href={`${n.action_link ? `${n.action_link}` : '#'}`} onClick={onClose} className="flex items-center gap-2 min-w-0">
											{!n.is_read && <span className="inline-block w-2 h-2 rounded-full bg-[var(--dashboard-accent)] animate-pulse flex-shrink-0" title="New" />}
											<span className="font-semibold text-[var(--dashboard-accent-muted)] text-base truncate lg:max-w-[240px]">{n.title}</span>
										</CustomLink>
										<Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(n.id)} className="opacity-60 hover:opacity-100 text-destructive ml-2 focus:outline-none" title="Delete notification">
											<Trash2Icon className="h-4 w-4" />
										</Button>
									</div>
									<div className="notification-center-item-body text-[var(--foreground)] text-sm mb-1 break-words whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: n.message }}></div>
									<div className="notification-center-item-date text-xs text-[var(--muted-foreground)] text-right">{formatRelativeTime(n.created_at)}</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	) : null;
};

export default NotificationCenter;
