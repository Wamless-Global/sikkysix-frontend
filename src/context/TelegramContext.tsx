'use client';

import { getTGData, isLoggedInViaTG } from '@/lib/helpers';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type TelegramUser = {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
};

type TelegramContextType = {
	user: TelegramUser | null;
	isTelegram?: boolean;
};

const TelegramContext = createContext<TelegramContextType>({
	user: null,
});

export const TelegramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<TelegramUser | null>(null);
	const [isTelegram, setIsTelegram] = useState(false);

	useEffect(() => {
		let tg, tg_local;
		if (typeof window !== 'undefined') {
			tg = (window as any).Telegram?.WebApp;
			tg_local = getTGData();

			tg?.ready();
			tg?.expand();
		}

		if (tg?.initDataUnsafe?.user || (tg_local && tg_local != '') || isLoggedInViaTG()) {
			setIsTelegram(true);
			if (tg?.initDataUnsafe?.user) setUser(tg.initDataUnsafe.user);
		}
	}, []);

	return <TelegramContext.Provider value={{ user, isTelegram }}>{children}</TelegramContext.Provider>;
};

export function useTelegram(): TelegramContextType & { closeTelegramApp: () => void } {
	const context = useContext(TelegramContext);

	const closeTelegramApp = () => {
		if (typeof window !== 'undefined') {
			const tg = (window as any).Telegram?.WebApp;
			if (tg && typeof tg.close === 'function') {
				tg.close();
			}
		}
	};
	return { ...context, closeTelegramApp };
}
