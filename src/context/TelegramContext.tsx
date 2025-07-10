'use client';

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
};

const TelegramContext = createContext<TelegramContextType>({
	user: null,
});

export const TelegramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<TelegramUser | null>(null);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const tg = (window as any).Telegram?.WebApp;
			tg?.ready();
			tg?.expand();

			if (tg?.initDataUnsafe?.user) {
				setUser(tg.initDataUnsafe.user);
			}
		}
	}, []);

	return <TelegramContext.Provider value={{ user }}>{children}</TelegramContext.Provider>;
};

export function useTelegram(): TelegramContextType {
	return useContext(TelegramContext);
}
