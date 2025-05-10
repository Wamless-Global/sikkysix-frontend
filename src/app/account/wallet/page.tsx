import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUp, BanknoteArrowDown, BanknoteArrowUp, Loader2 } from 'lucide-react';
import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
	interface Transaction {
		id: string;
		type: string;
		timestamp: string;
		amount: string;
		isCredit: boolean;
		completed: boolean;
	}

	const LIMIT = 3;

	const transactionsData: Transaction[] = [
		{ id: 'TXN-P2P-17466146399101', type: 'Referral Bonus', timestamp: '08:58:52 05/03/2025', amount: '500.00 NGN', completed: false, isCredit: true },
		{ id: 'TXN-P2P-17466146399102', type: 'Withdrawal', timestamp: '13:41:22 02/03/2025', amount: '15,000.00 NGN', completed: true, isCredit: false },
		{ id: 'TXN-P2P-17466146399103', type: 'Withdrawal', timestamp: '08:29:53 01/03/2025', amount: '5,000.00 NGN', completed: true, isCredit: false },
		{ id: 'TXN-P2P-17466146399104', type: 'Shares#01 Maturity', timestamp: '10:00:00 15/02/2025', amount: '20,000.00 NGN', completed: true, isCredit: true },
		{ id: 'TXN-P2P-17466146399105', type: 'Deposit', timestamp: '16:20:11 10/02/2025', amount: '10,000.00 NGN', completed: true, isCredit: true },
	];

	const calculateBalance = (transactions: Transaction[]): string => {
		const total = transactions.reduce((acc, transaction) => {
			const amountValue = parseFloat(transaction.amount.replace(/ NGN|,/g, ''));
			if (isNaN(amountValue)) {
				console.warn(`Invalid amount found for transaction ID ${transaction.id}: ${transaction.amount}`);
				return acc;
			}
			return transaction.isCredit ? acc + amountValue : acc - amountValue;
		}, 0);

		return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(total);
	};

	const availableBalance = calculateBalance(transactionsData);
	const hasTransactions = transactionsData.length > 0;

	return (
		<div className="space-y-12">
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2 overflow-hidden">
				<CardContent className="p-1 px-6 md:p-6 flex justify-center items-center relative">
					<div className="flex items-center flex-col">
						<p className="text-sm opacity-80 mb-1">Available Balance</p>
						<p className="amount-heading-extra-large">{availableBalance}</p>
					</div>
					<div className="opacity-80 dark:opacity-70 absolute right-0">
						<Image src="/wallet.png" alt="Wallet Graphic" width={80} height={50} className="hidden sm:block" />
						<Image src="/wallet.png" alt="Wallet Graphic" width={60} height={40} className="sm:hidden" />
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-center gap-8 md:gap-12">
				<CustomLink href={'/account/wallet/deposit'} className="flex flex-col items-center gap-2 cursor-pointer group">
					<div className="bg-[var(--dashboard-accent)] rounded-full p-3 md:p-4 group-hover:opacity-80 transition-opacity">
						<BanknoteArrowDown className="h-6 w-6 md:h-10 md:w-10 text-[var(--success-foreground)]" />
					</div>
					<span className="text-sm font-medium text-foreground">Deposit</span>
				</CustomLink>
				<CustomLink href={'/account/wallet/withdraw'} className="flex flex-col items-center gap-2 cursor-pointer group">
					<div className="bg-[var(--dashboard-accent)] rounded-full p-3 md:p-4 group-hover:opacity-80 transition-opacity">
						<BanknoteArrowUp className="h-6 w-6 md:h-10 md:w-10 text-[var(--success-foreground)]" />
					</div>
					<span className="text-sm font-medium text-foreground">Withdraw</span>
				</CustomLink>
			</div>
			<div className="sm:mt-20">
				<h2 className="text-lg font-semibold text-foreground my-4 text-center">Transaction History</h2>
				{hasTransactions ? (
					<div className="space-y-2 md:space-y-5">
						{transactionsData.slice(0, LIMIT).map((transaction) => (
							<CustomLink href={`/account/wallet/transactions/${transaction.id}`} key={transaction.id} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-background/100">
								<div className="flex items-center gap-3">
									{!transaction.completed ? (
										<div className="flex justify-center items-center h-full p-3">
											<Loader2 className="h-4 w-4 animate-spin text-slate-400" />
										</div>
									) : transaction.isCredit ? (
										<div className="bg-[var(--success)] rounded-full p-3">
											<ArrowDown className="h-6 w-6 text-[var(--success-foreground)]" />
										</div>
									) : (
										<div className="bg-[var(--danger)] rounded-full p-3">
											<ArrowUp className="h-5 w-5 text-[var(--danger-foreground)]" />
										</div>
									)}
									<div>
										<p className="font-medium text-sm md:text-base text-foreground">{transaction.type}</p>
										<p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
									</div>
								</div>
								<p className={`font-semibold text-base md:text-lg ${transaction.isCredit ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{transaction.amount}</p>
							</CustomLink>
						))}
						{transactionsData.length > LIMIT && (
							<div className="mt-20 text-center">
								<CustomLink href="/account/wallet/transactions">
									<Button variant="success" className="w-full sm:w-auto" size={'lg'}>
										View More Transactions
										<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
									</Button>
								</CustomLink>
							</div>
						)}
					</div>
				) : (
					<div className="text-center py-10 px-4 flex flex-col items-center">
						<Image src="/box.png" alt="Empty Box" width={80} height={80} className="mb-6" />
						<p className="text-muted-foreground mb-6 leading-8">You haven't made any transaction yet.</p>
					</div>
				)}
			</div>
		</div>
	);
}
