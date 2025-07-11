'use client';

import React, { ReactNode } from 'react';
import { useTelegram } from '@/context/TelegramContext';

type ShowWhenNotInTelegram = {
	children: ReactNode;
	fallback?: ReactNode;
};

export const ShowWhenNotInTelegram: React.FC<ShowWhenNotInTelegram> = ({ children, fallback = null }) => {
	const { isTelegram } = useTelegram();

	return <>{!isTelegram ? children : fallback}</>;
};
