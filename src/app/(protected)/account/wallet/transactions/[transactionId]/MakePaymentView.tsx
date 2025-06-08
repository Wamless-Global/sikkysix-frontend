import React from 'react';
import { Button } from '@/components/ui/button';

interface MakePaymentViewProps {
	orderDetails: any;
	paymentFields: Array<{ name: string; label: string; type: string }>;
	accountDetails: Record<string, string>;
	infoUser: any;
	onCopy: (value: string, label: string) => void;
	onMadePayment: () => void;
	isProcessing: boolean;
	onCancel: () => void;
	isCancelling: boolean;
	openCancelModal: () => void;
}

const MakePaymentView: React.FC<MakePaymentViewProps> = ({ orderDetails, paymentFields, accountDetails, infoUser, onCopy, onMadePayment, isProcessing, onCancel, isCancelling, openCancelModal }) => (
	<>
		<div className="flex flex-col md:flex-row gap-2 mt-4">
			<Button onClick={onMadePayment} size="lg" variant="success" className="w-full md:w-auto" disabled={isProcessing}>
				{isProcessing ? 'Processing...' : 'I Have Made Payment'}
			</Button>
			<Button onClick={openCancelModal} size="lg" variant="destructive" className="w-full md:w-auto" disabled={isCancelling}>
				{isCancelling ? 'Cancelling...' : 'Cancel Trade'}
			</Button>
		</div>
	</>
);

export default MakePaymentView;
