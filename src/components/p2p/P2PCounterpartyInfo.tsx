import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle } from 'lucide-react';

interface P2PCounterpartyInfoProps {
	label: string;
	infoUser: any;
	paymentFields: Array<{ name: string; label: string; type: string }>;
	accountDetails: Record<string, string>;
	onCopy: (value: string, message: string) => void;
	onToggleMessageScreen: () => void;
	isBuyer: boolean;
}

const P2PCounterpartyInfo: React.FC<P2PCounterpartyInfoProps> = ({
	label,
	infoUser,
	paymentFields,
	accountDetails,
	onCopy,
	onToggleMessageScreen,

	isBuyer,
}) => {
	return (
		<Card className="bg-muted/30 dark:bg-muted/10 shadow-sm px-0">
			<CardHeader className="flex flex-row justify-between items-center px-4">
				<CardTitle className="text-lg text-foreground">{label}</CardTitle>
				<div className="text-muted-foreground hover:text-foreground" onClick={onToggleMessageScreen}>
					<MessageCircle className="h-6 w-6" />
				</div>
			</CardHeader>
			<CardContent className="space-y-1 px-4">
				<div className="mb-2">
					<div className="text-sm font-semibold text-muted-foreground">Name</div>
					<div className="text-base font-medium">{infoUser?.name || 'N/A'}</div>
				</div>
				{isBuyer && paymentFields.length > 0 ? (
					paymentFields.map((field) => (
						<div key={field.name} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
							<span className="text-sm text-muted-foreground">{field.label}</span>
							<Button variant="ghost" className="p-0 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-transparent" onClick={() => onCopy(accountDetails[field.name] || '', `${field.label} copied to clipboard!`)} disabled={!accountDetails[field.name]}>
								{accountDetails[field.name] || 'N/A'} <Copy className="ml-2 h-3 w-3" />
							</Button>
						</div>
					))
				) : isBuyer ? (
					<div className="text-muted-foreground text-sm">No payment details available.</div>
				) : null}
			</CardContent>
		</Card>
	);
};

export default P2PCounterpartyInfo;
