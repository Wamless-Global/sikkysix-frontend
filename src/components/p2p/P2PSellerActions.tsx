import React from 'react';
import { Button } from '@/components/ui/button';

interface P2PSellerActionsProps {
	trade: any;
	onConfirmReceipt: () => void;
	isProcessing: boolean;
	canRaiseDispute: boolean;
	onRaiseDispute: () => void;
	isProcessingDispute: boolean;
}

const P2PSellerActions: React.FC<P2PSellerActionsProps> = ({ trade, onConfirmReceipt, isProcessing, canRaiseDispute, onRaiseDispute, isProcessingDispute }) => {
	// Render seller-specific actions based on trade status
	return (
		<div className="flex flex-col gap-2">
			{trade.status === 'fiat_payment_confirmed_by_buyer' && (
				<Button onClick={onConfirmReceipt} disabled={isProcessing} variant="success">
					{isProcessing ? 'Processing...' : 'Confirm Receipt'}
				</Button>
			)}
		</div>
	);
};

export default P2PSellerActions;
