'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CircularProgressDisplay from '@/components/ui/circular-progress-display';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { toast } from 'sonner';
import { currencyFormatter, formatRelativeTime, generateSlug, handleFetchErrorMessage } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthenticatedUser, Investment, SingleInvestmentResponse, WithdrawalPreviewResponse } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CustomLink } from '@/components/ui/CustomLink';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuthContext } from '@/context/AuthContext';

export default function PortfolioItemDetailPageContent() {
	const router = useRouter();
	const params = useParams();
	const investmentId = params.shareId ? decodeURIComponent(params.shareId as string) : undefined;

	const [investment, setInvestment] = useState<Investment | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [previewData, setPreviewData] = useState<WithdrawalPreviewResponse | null>(null);
	const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [isWithdrawing, setIsWithdrawing] = useState(false);
	const { setCurrentUser, currentUser } = useAuthContext();

	const isMobile = useMediaQuery('(max-width: 768px)');
	const size = isMobile ? 180 : 220;

	useEffect(() => {
		const fetchInvestment = async () => {
			if (!investmentId) return;
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(`/api/investments/${investmentId}`);
				if (!response.ok) {
					throw new Error('Failed to fetch investment details');
				}

				const data: SingleInvestmentResponse = await response.json();

				setInvestment(data.data.investment);
			} catch (err) {
				// console.error('Error fetching investment:', err);
				const errorMessage = handleFetchErrorMessage(err, 'Failed to load investment details');
				setError(errorMessage);
			} finally {
				setIsLoading(false);
			}
		};

		fetchInvestment();
	}, [investmentId]);

	const handleWithdrawClick = async () => {
		setIsWithdrawing(true);
		try {
			const response = await fetch(`/api/investments/${investmentId}/withdraw-preview`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					units_to_withdraw: investment?.units_purchased || 0,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to get withdrawal preview');
			}

			const { data } = await response.json();

			setPreviewData(data);
			setIsPreviewModalOpen(true);
		} catch (err) {
			// console.error('Error getting withdrawal preview:', err);
			toast.error('Failed to get withdrawal preview. Please try again.');
		} finally {
			setIsWithdrawing(false);
		}
	};

	const handlePreviewConfirm = () => {
		setIsPreviewModalOpen(false);
		setIsConfirmModalOpen(true);
	};

	const handleWithdrawConfirm = async () => {
		setIsConfirmModalOpen(false);
		setIsWithdrawing(true);
		const toastId = toast.loading('Processing withdrawal...');

		try {
			const response = await fetch(`/api/investments/${investmentId}/withdraw`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					units_to_withdraw: investment?.units_purchased || 0,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to process withdrawal');
			}

			const { data } = await response.json();

			setInvestment((prev) =>
				prev
					? {
							...prev,
							status: data.transaction.status,
							completed: true,
					  }
					: null
			);

			setCurrentUser({ ...(currentUser as AuthenticatedUser), wallet_balance: (currentUser?.wallet_balance ?? 0) + data.base_currency_amount });

			toast.success(`Withdrawal successful! ${currencyFormatter(data.base_currency_amount)} credited to your wallet.`, { id: toastId });
			router.push('/account/portfolio');
		} catch (err) {
			// console.error('Error processing withdrawal:', err);
			toast.error('Failed to process withdrawal. Please try again.', { id: toastId });
		} finally {
			setIsWithdrawing(false);
		}
	};

	if (isLoading) {
		return (
			<div className="max-w-2xl animate-pulse space-y-8">
				<div className="space-y-4">
					<Skeleton className="h-8 w-3/4 rounded" />
					<Skeleton className="h-4 w-2/3 rounded" />
				</div>
				<div className="flex items-center justify-between gap-6 md:gap-20">
					<Skeleton className="h-[220px] w-[220px] rounded-full" />
					<div className="flex-1 space-y-4">
						<Skeleton className="h-12 w-full rounded" />
						<Skeleton className="h-12 w-full rounded" />
					</div>
				</div>
				<div className="space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="flex justify-between">
							<Skeleton className="h-6 w-24 rounded" />
							<Skeleton className="h-6 w-32 rounded" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error || !investment) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] bg-background text-foreground p-4">
				<Alert variant="destructive" className="mb-6 max-w-md">
					<AlertCircle className="h-6 w-6 mr-2" />
					<AlertTitle>Investment Not Found</AlertTitle>
					<AlertDescription>{error || `The investment with ID "${investmentId}" could not be found.`}</AlertDescription>
				</Alert>
				<Button onClick={() => router.back()} variant="outline">
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-2xl">
			<div>
				<h1 className="sub-page-heading">Investment Details</h1>
				<p className="sub-page-heading-sub-text">Created {formatRelativeTime(investment.created_at)}</p>
			</div>

			<div className="flex items-center justify-between gap-6 md:gap-20 w-full my-10">
				<CircularProgressDisplay active={!investment.completed} value={currencyFormatter(investment.current_value)} percentage={investment.progress_percentage} size={size} />
				<div className="flex flex-col sm:flex-col gap-7 md:gap-4 mt-4">
					<CustomLink href={`/account/category/${generateSlug(investment.ticker)}`} passHref>
						<Button size={'lg'} className="w-full" variant={'success'} disabled={isWithdrawing}>
							Show Category
						</Button>
					</CustomLink>
					{!investment.completed && (
						<Button size={'lg'} variant="outline" className="w-full border-gray-600 text-foreground hover:bg-gray-700 py-3" onClick={handleWithdrawClick} disabled={isWithdrawing}>
							{isWithdrawing ? 'Processing...' : 'Withdraw'}
						</Button>
					)}
				</div>
			</div>

			<div className="w-full space-y-5 mt-6 bg-muted p-6">
				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Initial Investment</span>
					<span className="font-medium text-foreground">{currencyFormatter(investment.amount_invested)}</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Current Value</span>
					<span className="font-medium text-foreground">{currencyFormatter(investment.current_value)}</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Price Per Unit at Investment</span>
					<span className="font-medium text-foreground">{currencyFormatter(investment.price_per_unit_at_investment, 4)}</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Current Price Per Unit</span>
					<span className="font-medium text-foreground">{currencyFormatter(investment.current_price ?? 0, 4)}</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Units Purchased</span>
					<span className="font-medium text-foreground">{`${investment.units_purchased.toFixed(5)} ${investment.ticker.toLocaleUpperCase()}`}</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Target Value</span>
					<span className="font-medium text-foreground">{currencyFormatter(investment.target_total_value)}</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Progress</span>
					<span className="font-medium text-foreground">{investment.progress_percentage.toFixed(2)}%</span>
				</div>

				{investment.profit !== 0 && (
					<div className="flex justify-between items-center">
						<span className="text-muted-foreground">Current Profit</span>
						<span className={`font-medium ${investment.profit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{currencyFormatter(investment.profit)}</span>
					</div>
				)}

				<div className="flex justify-between items-center">
					<span className="text-muted-foreground">Status</span>
					<Badge variant={investment.completed ? 'completed' : 'active'} className="px-3 py-1 text-xs font-medium">
						{investment.status.toUpperCase()}
					</Badge>
				</div>
			</div>

			{/* Withdrawal Preview Dialog */}
			<Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
				<DialogContent className="sm:max-w-md mt-10 p-7">
					<DialogHeader className="mb-5">
						<DialogTitle>Withdrawal Preview</DialogTitle>
						<DialogDescription>Review the details of your withdrawal</DialogDescription>
					</DialogHeader>
					{previewData && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="text-muted-foreground">Units to Withdraw:</div>
								<div className="text-right font-medium">{previewData.units_to_withdraw}</div>

								<div className="text-muted-foreground">Selling Price:</div>
								<div className="text-right font-medium">{currencyFormatter(previewData.current_market_price_per_unit, 4)}</div>

								<div className="text-muted-foreground">Initial Amount:</div>
								<div className="text-right font-medium">{currencyFormatter(previewData.value_after_profit_cap)}</div>

								<div className="text-muted-foreground">Fees:</div>
								<div className={`text-right font-medium ${previewData.fee > 0 ? 'text-destructive' : ''}`}>-{currencyFormatter(previewData.fee)}</div>

								{previewData.penalty && (
									<>
										<div className="text-muted-foreground">Penalty:</div>
										<div className="text-right font-medium text-destructive">-{currencyFormatter(previewData.penalty.amount_deducted)}</div>
									</>
								)}

								<div className="text-muted-foreground font-medium">Final Amount:</div>
								<div className="text-right font-bold">{currencyFormatter(previewData.estimated_net_amount_to_user)}</div>
							</div>

							{previewData.is_early_withdrawal && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Early Withdrawal Warning</AlertTitle>
									<AlertDescription>{previewData.penalty?.description || 'Early withdrawal penalties will be applied.'}</AlertDescription>
								</Alert>
							)}
						</div>
					)}
					<DialogFooter>
						<Button variant="ghost" onClick={() => setIsPreviewModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handlePreviewConfirm} variant="success">
							Proceed
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmationModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={handleWithdrawConfirm}
				title="Confirm Withdrawal"
				description={
					previewData?.is_early_withdrawal
						? `Are you sure you want to withdraw early? You will receive ${currencyFormatter(previewData.estimated_net_amount_to_user)} after penalties.`
						: `Are you ready to withdraw? You will receive ${currencyFormatter(previewData?.estimated_net_amount_to_user || 0)}.`
				}
				confirmButtonText="Withdraw Now"
				cancelButtonText="Cancel"
				isLoading={isWithdrawing}
			/>
		</div>
	);
}
