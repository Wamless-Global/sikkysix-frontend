import React from 'react';

interface OrderDetailItemProps {
	label: string;
	value: string | number;
	unit?: string;
	isBold?: boolean;
}

const OrderDetailItem: React.FC<OrderDetailItemProps> = ({ label, value, unit, isBold }) => (
	<div className="flex justify-between items-center py-3">
		<span className="text-sm text-[var(--dashboard-subtext)]">{label}</span>
		<span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-[var(--dashboard-foreground)]`}>
			{typeof value === 'number' ? value.toFixed(unit === 'USDT' ? 4 : 2) : value} {unit}
		</span>
	</div>
);

export default OrderDetailItem;
