import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'; // Icons for Deposit/Withdraw
import { CustomLink } from '@/components/ui/CustomLink';

export default function WalletPage() {
	// Mock data - replace with actual data fetching later
	const availableBalance = '₦0.00';
	const hasTransactions = false; // Toggle this to show/hide empty state

	return (
		<div className="space-y-12">
			<Card className="bg-[var(--dashboard-secondary)] border-none shadow-md rounded-2xl text-[var(--dashboard-secondary-foreground)] md:py-2 overflow-hidden">
				<CardContent className="p-1 px-6 md:p-6 flex justify-center items-center relative">
					<div>
						<p className="text-sm opacity-80 mb-1">Available Balance</p>
						<p className="text-3xl md:text-4xl font-extrabold">{availableBalance}</p>
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
						<ArrowDownCircle className="h-6 w-6 md:h-8 md:w-8 text-[var(--dashboard-accent-foreground)]" />
					</div>
					<span className="text-sm font-medium text-foreground">Deposit</span>
				</CustomLink>
				<CustomLink href={'/account/wallet/withdraw'} className="flex flex-col items-center gap-2 cursor-pointer group">
					<div className="bg-[var(--dashboard-accent)] rounded-full p-3 md:p-4 group-hover:opacity-80 transition-opacity">
						<ArrowUpCircle className="h-6 w-6 md:h-8 md:w-8 text-[var(--dashboard-accent-foreground)]" />
					</div>
					<span className="text-sm font-medium text-foreground">Withdraw</span>
				</CustomLink>
			</div>
			{/* Transaction History */}
			<div>
				<h2 className="text-lg font-semibold text-foreground my-4 text-center">Transaction History</h2>
				{hasTransactions ? (
					<div>{/* Placeholder for Transaction List/Table */}</div>
				) : (
					// Align empty state styling with Portfolio
					<div className="text-center py-10 px-4 flex flex-col items-center">
						{/* Add mb-20 */}
						<Image src="/box.png" alt="Empty Box" width={80} height={80} className="mb-6" />
						<p className="text-muted-foreground mb-6 leading-8">You haven't made any transaction yet.</p> {/* Add mb-6, leading-8 */}
					</div>
				)}
			</div>
		</div>
	);
}
