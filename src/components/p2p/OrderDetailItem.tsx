import { formatNumber } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import React from 'react';

interface OrderDetailItemProps {
	label: string;
	value: string | number | null;
	unit?: string;
	className?: string;
	isBold?: boolean;
}

const OrderDetailItem: React.FC<OrderDetailItemProps> = ({ label, value, unit, isBold, className }) => {
	const formattedValue = value !== null ? (typeof value === 'number' ? formatNumber(value) : value) : 'N/A';
	return (
		<div className={cn(`flex justify-between items-center py-3`, className)}>
			<span className="text-sm text-[var(--dashboard-subtext)]">{label}</span>
			<span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-[var(--dashboard-foreground)]`}>
				{formattedValue} {unit}
			</span>
		</div>
	);
};

export default OrderDetailItem;
