import React from 'react';
import { Button } from '@/components/ui/button';

interface P2PBuyerActionsProps {
	trade: any;
	onMadePayment: () => void;
	isProcessing: boolean;
	onCancel: () => void;
	isCancelling: boolean;
	openCancelModal: () => void;
	canRaiseDispute: boolean;
	onRaiseDispute: () => void;
	isProcessingDispute: boolean;
}

const P2PBuyerActions: React.FC<P2PBuyerActionsProps> = ({ trade, onMadePayment, isProcessing, onCancel, isCancelling, openCancelModal, canRaiseDispute, onRaiseDispute, isProcessingDispute }) => {
	// Render buyer-specific actions based on trade status
	return (
		<div className="flex flex-col gap-2">
			{trade.status === 'pending' && (
				<Button onClick={onMadePayment} disabled={isProcessing} variant="success">
					{isProcessing ? 'Processing...' : "I've Made Payment"}
				</Button>
			)}
			{trade.status === 'pending' && (
				<Button onClick={openCancelModal} disabled={isCancelling} variant="outline">
					{isCancelling ? 'Cancelling...' : 'Cancel Trade'}
				</Button>
			)}
		</div>
	);
};

export default P2PBuyerActions;
