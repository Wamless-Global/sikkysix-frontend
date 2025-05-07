'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // For loading state

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: React.ReactNode;
	confirmButtonText: string;
	confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'cta' | 'fixed-cta'; // Match your Button variants
	showCancelButton?: boolean;
	cancelButtonText?: string;
	icon?: React.ElementType; // e.g., CheckCircle, AlertTriangle from lucide-react
	isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmButtonText,
	confirmButtonVariant = 'fixed-cta', // Default to the variant used in InsufficientBalanceModal
	showCancelButton = true,
	cancelButtonText = 'Cancel',
	icon: IconComponent,
	isLoading = false,
}) => {
	if (!isOpen) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="bg-[var(--dashboard-secondary)] border-none rounded-2xl w-[90%] max-w-md text-center shadow-xl p-6 py-10 md:p-10">
				<DialogHeader className="flex flex-col items-center">
					{IconComponent && (
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black mb-4 -mt-2">
							<IconComponent className="h-7 w-7 text-[var(--dashboard-secondary)]" />
						</div>
					)}
					<DialogTitle className="text-xl font-bold text-[var(--dashboard-secondary-foreground)]">{title}</DialogTitle>
				</DialogHeader>
				<DialogDescription className="text-sm mt-2 mb-6 px-4 text-[var(--dashboard-secondary-foreground)]">{description}</DialogDescription>
				<DialogFooter className="sm:justify-center flex flex-col sm:flex-row gap-3">
					{showCancelButton && (
						<Button onClick={onClose} size="lg" variant="destructive" className="w-full sm:w-auto">
							{cancelButtonText}
						</Button>
					)}
					<Button onClick={onConfirm} size="lg" variant={confirmButtonVariant} disabled={isLoading} className="w-full sm:w-auto">
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							confirmButtonText
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationModal;
