import React from 'react';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

interface DisputeModalProps {
	isOpen: boolean;
	isLoading: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, isLoading, onClose, onConfirm }) => (
	<ConfirmationModal
		isOpen={isOpen}
		onClose={onClose}
		onConfirm={onConfirm}
		title="Raise Dispute"
		description="Are you sure you want to raise a dispute for this trade? Our team will review and contact you."
		confirmButtonText={isLoading ? 'Raising...' : 'Yes, Raise Dispute'}
		cancelButtonText="Cancel"
		isLoading={isLoading}
	/>
);

export default DisputeModal;
