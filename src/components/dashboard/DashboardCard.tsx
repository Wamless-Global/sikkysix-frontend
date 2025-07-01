import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatBaseurrency } from '@/lib/helpers';

interface DashboardCardProps {
	title: string;
	image: string;
	minimum: string;
	buttonText: string;
	buttonEnabled: boolean;
	status?: 'Active' | 'Locked' | 'Not Launched';
	is_locked?: boolean;
	is_launched?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, image, minimum, buttonText, buttonEnabled, status, is_locked, is_launched }) => {
	return (
		<div className={`category-card-account ${buttonEnabled ? 'opacity-100' : 'opacity-40'}`}>
			<div className="relative w-full aspect-[6/2]">
				<Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" priority={title === 'Food'} />
			</div>
			<div className="p-1 flex w-full flex-col">
				<div className="flex justify-between items-center mb-4">
					<div>
						<span className="subtext">Club</span>
						<h3 className="text-base font-semibold text-foreground lg:text-[var(--dashboard-secondary-foreground)]">{title}</h3>
						{status && <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${status === 'Active' ? 'bg-green-100 text-green-700' : status === 'Locked' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{status}</span>}
					</div>
					<div className="flex flex-col items-end">
						<span className="subtext">Amount</span>
						<p className="text-base font-bold text-foreground lg:text-[var(--dashboard-secondary-foreground)]">
							<span className="text-xs text-muted-foreground">Min </span>
							{formatBaseurrency(minimum)}
						</p>
					</div>
				</div>
				<div className="mt-auto pt">
					<Button
						size="lg"
						className={cn('w-full rounded-lg py-3 text-sm font-bold transition-colors', status === 'Locked' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : status === 'Not Launched' ? 'bg-yellow-200 text-yellow-700' : '')}
						disabled={!buttonEnabled || status === 'Locked'}
						variant="cta"
					>
						{buttonText}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DashboardCard;
