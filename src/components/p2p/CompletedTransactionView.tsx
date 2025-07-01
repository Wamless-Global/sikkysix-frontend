import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import OrderDetailItem from '@/components/p2p/OrderDetailItem';
import { useRouter } from 'next/navigation';
import nprogress from 'nprogress';
import type { TradeResponse } from '@/types/modules/trade';
import { formatDateNice, getBaseCurrency } from '@/lib/helpers';

interface CompletedTransactionViewProps {
	trade: TradeResponse;
	currentUserId: string;
	isAgent?: boolean;
}

const CompletedTransactionView: React.FC<CompletedTransactionViewProps> = ({ trade, currentUserId, isAgent }) => {
	const router = useRouter();

	// Determine user role
	const isBuyer = trade.buyer_id === currentUserId;
	const isSeller = trade.seller_id === currentUserId;

	// Transaction summary
	const orderDetails = {
		amount: trade.fiat_amount ? parseFloat(trade.fiat_amount) : 0,
		rate: trade.price_per_unit ? parseFloat(trade.price_per_unit) : 0,
		tokenQuantity: trade.platform_currency_amount ? parseFloat(trade.platform_currency_amount) : 0,
		transactionFees: trade?.fee || 0,
		fiat_currency: trade.fiat_currency,
	};

	// Time details

	const initiated = trade.created_at;
	const finished = trade.platform_currency_released_at;

	const duration =
		trade.platform_currency_released_at && trade.created_at
			? (() => {
					const ms = new Date(trade.platform_currency_released_at).getTime() - new Date(trade.created_at).getTime();
					const minutes = Math.floor(ms / 60000);
					const seconds = Math.floor((ms % 60000) / 1000);
					return `${minutes}m ${seconds}s`;
			  })()
			: '-';
	const type = 'P2P Transfer';

	// Party info
	const partyInfo = [
		{
			label: 'Buyer',
			user: trade.buyer_user,
			highlight: isBuyer,
			icon: <User className="mr-2 h-4 w-4" />,
		},
		{
			label: 'Seller',
			user: trade.seller_user,
			highlight: isSeller,
			icon: <User className="mr-2 h-4 w-4" />,
		},
	];

	// Agent info
	const agentInfo = trade.agent_details && (
		<div className="flex items-center gap-2 p-3 rounded bg-muted/50 border border-muted-foreground/10 mt-2">
			<ShieldCheck className="h-5 w-5 text-[var(--dashboard-accent)]" />
			<div>
				<div className="font-semibold text-sm">Agent</div>
				<div className="text-base font-medium">{trade.agent_details.name}</div>
				<div className="text-xs text-muted-foreground">{trade.agent_details.email}</div>
			</div>
		</div>
	);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex flex-row justify-between items-center gap-4">
				<h1 className="sub-page-heading text-left flex items-center gap-2">
					<CheckCircle2 className="text-success h-7 w-7" /> Completed Transaction
				</h1>
				<Badge variant="success" className="px-4 py-1.5 text-lg font-mono font-semibold uppercase">
					Completed
				</Badge>
			</div>
			<p className="sub-page-heading-sub-text text-left -mt-2">
				Transaction ID: <span className="font-mono bg-muted text-muted-foreground p-1 rounded-sm">{trade.escrow_transaction_id}</span>
				<br />
				{isBuyer && `You purchased ${getBaseCurrency()} and your payment has been confirmed.`}
				{isSeller && `You sold ${getBaseCurrency()} and the payment has been confirmed.`}
			</p>
			<Card className="bg-background border-0 shadow-none">
				<CardHeader className="px-0">
					<CardTitle className="text-lg text-foreground flex items-center gap-2">
						<ArrowRightLeft className="h-5 w-5 text-[var(--dashboard-accent)]" /> Transaction Summary
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1 px-0">
					{isBuyer ? (
						<>
							<OrderDetailItem label="Amount Paid" value={orderDetails.amount} unit={orderDetails.fiat_currency} isBold />
							<OrderDetailItem label="Exchange Rate" value={orderDetails.rate} unit={orderDetails.fiat_currency} />
							<OrderDetailItem label="Quantity Received" value={orderDetails.tokenQuantity} unit={getBaseCurrency()} className="money" isBold />
						</>
					) : (
						<>
							<OrderDetailItem label="Amount Received" value={orderDetails.amount} unit={orderDetails.fiat_currency} isBold />
							<OrderDetailItem label="Exchange Rate" value={orderDetails.rate} unit={orderDetails.fiat_currency} />
							<OrderDetailItem label="Quantity Sold" value={orderDetails.tokenQuantity} unit={getBaseCurrency()} className="money" isBold />
						</>
					)}
					<OrderDetailItem label="Fee" value={orderDetails.transactionFees} unit="%" />
					<div className="pt-4 space-y-2 text-sm text-muted-foreground">
						<div className="flex justify-between">
							<p>Initiated:</p> <p>{formatDateNice(initiated)}</p>
						</div>
						<div className="flex justify-between">
							<p>Finished:</p> <p>{formatDateNice(finished)}</p>
						</div>
						<div className="flex justify-between">
							<p>Duration:</p> <p>{duration}</p>
						</div>
						<div className="flex justify-between">
							<p>Type:</p> <p>{type}</p>
						</div>
					</div>
				</CardContent>
			</Card>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{partyInfo.map(({ label, user, highlight, icon }) => (
					<Card key={label} className={`border-0 shadow-none bg-muted/30 ${highlight ? 'ring-2 ring-[var(--dashboard-accent)]' : ''}`}>
						<CardHeader className="flex flex-row items-center gap-2 px-4 pb-2">
							{icon}
							<CardTitle className="text-base text-foreground">{label}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-1 px-4">
							<div className="text-sm font-semibold text-muted-foreground">Name</div>
							<div className="text-base font-medium">{user?.name || 'N/A'}</div>
							<div className="text-sm font-semibold text-muted-foreground mt-2">Email</div>
							<div className="text-base font-medium">{user?.email || 'N/A'}</div>
							{user?.phone && (
								<>
									<div className="text-sm font-semibold text-muted-foreground mt-2">Phone</div>
									<div className="text-base font-medium">{user.phone}</div>
								</>
							)}
						</CardContent>
					</Card>
				))}
			</div>
			{agentInfo}

			{isAgent ? (
				<Button
					onClick={() => {
						nprogress.start();
						router.push('/account/agent-portal/overview');
					}}
					variant="outline"
					className="w-full mt-4"
					size={'lg'}
				>
					Back to Portal
				</Button>
			) : (
				<Button
					onClick={() => {
						nprogress.start();
						router.push('/account/wallet');
					}}
					variant="outline"
					className="w-full mt-4"
					size={'lg'}
				>
					Back to Wallet
				</Button>
			)}
		</div>
	);
};

export default CompletedTransactionView;
