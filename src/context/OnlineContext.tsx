'use client';

import { OnlineContextType, UserProviderProps } from '@/types';
import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useAuthContext } from './AuthContext';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { RealtimeChannel } from '@supabase/supabase-js';

const OnlineContext = createContext<OnlineContextType | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const OnlineProvider: React.FC<UserProviderProps> = ({ children }) => {
	// CHANGE: Added a 'connecting' state for better UI feedback
	const [online, setOnline] = useState<boolean>(() => (typeof window !== 'undefined' ? window.navigator.onLine : true));
	const [connecting, setConnecting] = useState<boolean>(true);
	const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

	const { currentUser } = useAuthContext();
	const currentUserId = currentUser?.id || null;

	const channelRef = useRef<RealtimeChannel | null>(null);

	// CHANGE: The setupChannel function is now memoized with useCallback.
	const setupChannel = useCallback(() => {
		if (!currentUserId) return;

		// Clean up any existing channel before creating a new one
		if (channelRef.current) {
			channelRef.current.unsubscribe();
			channelRef.current = null;
		}

		setConnecting(true);
		const channel = supabase.channel('online-presence', {
			config: {
				presence: { key: currentUserId },
			},
		});

		channel.on('presence', { event: 'sync' }, () => {
			const state = channel.presenceState();
			const userIds = Object.keys(state);
			setOnlineUserIds(new Set(userIds));
			logger.log('Presence synced. Online users:', userIds);
		});

		channel.subscribe((status, err) => {
			if (status === 'SUBSCRIBED') {
				logger.log('Subscribed to online-presence');
				channel.track({ online_at: new Date().toISOString() });
				setOnline(true);
				setConnecting(false);
			} else if (status === 'CLOSED') {
				logger.log('Channel closed.');
				setOnline(false);
				setConnecting(false);
			} else if (['CHANNEL_ERROR', 'TIMED_OUT'].includes(status)) {
				logger.log(`Channel error, status: ${status}`, err);
				setOnline(false);
				setConnecting(false);
			}
		});

		channelRef.current = channel;
	}, [currentUserId]);

	useEffect(() => {
		if (currentUserId) {
			setupChannel();
		}

		return () => {
			if (channelRef.current) {
				channelRef.current.unsubscribe();
				channelRef.current = null;
			}
		};
	}, [currentUserId, setupChannel]);

	// CHANGE: New effect to handle browser online/offline events
	useEffect(() => {
		const handleOnline = () => {
			logger.log('Browser back online. Attempting to reconnect...');
			setOnline(true);
			// Let Supabase handle the reconnection attempt automatically on 'online' event.
			// If we want to be more aggressive, we can call setupChannel() here.
			// supabase.realtime.connect() can also be used if the whole client was offline.
			if (channelRef.current?.state !== 'joined') {
				setupChannel();
			}
		};

		const handleOffline = () => {
			logger.log('Browser is offline.');
			setOnline(false);
			setConnecting(false);
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [setupChannel]); // Depend on the memoized setupChannel function

	const isUserOnline = (userId: string) => onlineUserIds.has(userId);

	const value = {
		online,
		connecting, // Expose the connecting state
		isUserOnline,
		setOnline,
	};

	return <OnlineContext.Provider value={value}>{children}</OnlineContext.Provider>;
};

export const useOnlineContext = (): OnlineContextType => {
	const context = useContext(OnlineContext);
	if (context === undefined) {
		throw new Error('useOnlineContext must be used within an OnlineProvider');
	}
	return context;
};
