'use client';

import { OnlineContextType, UserProviderProps } from '@/types';
import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuthContext } from './AuthContext';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const OnlineContext = createContext<OnlineContextType | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const OnlineProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [online, setOnline] = useState<boolean>(true);
	const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

	const { currentUser } = useAuthContext();
	const currentUserId = currentUser?.id || null;

	const channelRef = useRef<any>(null);
	const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const setupChannel = () => {
		if (!currentUserId) return;

		if (channelRef.current) {
			channelRef.current.unsubscribe();
		}

		const channel = supabase.channel('online-presence', {
			config: {
				presence: { key: currentUserId },
			},
		});

		channel.on('presence', { event: 'sync' }, () => {
			const state = channel.presenceState();
			setOnlineUserIds(new Set(Object.keys(state)));
			logger.log(`user connected: ${currentUserId}`);
			setOnline(true); // if we got a sync, we're online
			logger.log('Synced presence:', [...Object.keys(state)]);
		});

		channel.on('presence', { event: 'leave' }, () => {
			// Optional: re-check state
			const state = channel.presenceState();
			setOnlineUserIds(new Set(Object.keys(state)));
		});

		channel.subscribe((status) => {
			if (status === 'SUBSCRIBED') {
				channel.track({ online_at: Date.now() });
				logger.log('Subscribed to online-presence');
			}
		});

		channelRef.current = channel;
	};

	const reconnect = () => {
		logger.log('Attempting reconnection...');
		setupChannel();
	};

	useEffect(() => {
		if (!currentUserId) return;

		setupChannel();

		// Retry every 5 seconds if we're marked offline
		reconnectIntervalRef.current = setInterval(() => {
			if (!online) {
				reconnect();
			}
		}, 5000);

		return () => {
			channelRef.current?.unsubscribe();
			if (reconnectIntervalRef.current) clearInterval(reconnectIntervalRef.current);
		};
	}, [currentUserId]);

	const isUserOnline = (userId: string) => onlineUserIds.has(userId);

	const value = {
		online,
		setOnline,
		isUserOnline,
	};

	return <OnlineContext.Provider value={value}>{children}</OnlineContext.Provider>;
};

export const useOnlineContext = (): OnlineContextType => {
	const context = useContext(OnlineContext);
	if (context === undefined) {
		throw new Error('useOnlineContext must be used within a OnlineProvider');
	}
	return context;
};
