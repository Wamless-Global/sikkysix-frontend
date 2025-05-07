'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

interface InsufficientBalanceModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentBalance?: number;
	requiredAmount?: number;
}

const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({ isOpen, onClose, currentBalance, requiredAmount }) => {
	const router = useRouter();

	const handleFundAccount = () => {
		nProgress.start();
		router.push('/account/wallet/deposit');
		onClose();
	};

	if (!isOpen) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="bg-[var(--dashboard-secondary)] border-none rounded-2xl w-[90%] max-w-md text-center shadow-xl p-6 py-10 md:p-10">
				<DialogHeader className="flex flex-col items-center">
					{/* <DialogClose asChild>
						<button onClick={onClose} className="absolute top-4 right-4 rounded-full bg-black text-white p-2 hover:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-gray-500" aria-label="Close"></button>
					</DialogClose> */}
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black mb-4 -mt-2">
						<X className="h-7 w-7 text-[var(--dashboard-secondary)]" />
					</div>
					<DialogTitle className="text-xl font-bold text-[var(--dashboard-secondary-foreground)]">Insufficient Balance</DialogTitle>
				</DialogHeader>
				<DialogDescription className="text-sm mt-2 mb-4 px-4 text-[var(--dashboard-secondary-foreground)]">
					Sorry, you do not have sufficient balance to carry out this transaction, please fund your account and try again later.
					{currentBalance !== undefined && requiredAmount !== undefined && (
						<div className="mt-2">
							<p>
								Current Balance: <span className="font-bold">₦{currentBalance.toFixed(2)}</span>
							</p>
							<p>
								Required: <span className="font-bold">₦{requiredAmount.toFixed(2)}</span>
							</p>
						</div>
					)}
				</DialogDescription>
				<DialogFooter className="sm:justify-center">
					<Button onClick={handleFundAccount} size="lg" variant={'fixed-cta'}>
						Fund Account
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default InsufficientBalanceModal;
