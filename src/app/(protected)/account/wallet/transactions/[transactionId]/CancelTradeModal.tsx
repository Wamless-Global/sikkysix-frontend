import React from 'react';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

interface CancelTradeModalProps {
	isOpen: boolean;
	isLoading: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const CancelTradeModal: React.FC<CancelTradeModalProps> = ({ isOpen, isLoading, onClose, onConfirm }) => (
	<ConfirmationModal
		isOpen={isOpen}
		onClose={onClose}
		onConfirm={onConfirm}
		title="Cancel Trade"
		description="Are you sure you want to cancel this trade? This action cannot be undone."
		confirmButtonText={isLoading ? 'Cancelling...' : 'Yes, Cancel Trade'}
		cancelButtonText="No, Go Back"
		isLoading={isLoading}
	/>
);

export default CancelTradeModal;
