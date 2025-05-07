import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Assuming utility for class names

interface DashboardCardProps {
	title: string;
	image: string;
	// category: string; // Removed as it's not displayed in the design
	minimum: string;
	buttonText: string;
	buttonEnabled: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, image, minimum, buttonText, buttonEnabled }) => {
	return (
		<div className={`category-card-account ${buttonEnabled ? 'opacity-100' : 'opacity-40'}`}>
			<div className="relative w-full aspect-[6/2]">
				<Image
					src={image}
					alt={title}
					fill // Use fill instead of layout="fill"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Provide sizes for optimization
					className="object-cover" // Ensure image covers the area
					priority={title === 'Food'} // Prioritize loading the first image potentially
				/>
			</div>
			<div className="p-1 flex w-full flex-col">
				<div className="flex justify-between items-center mb-4">
					<div>
						<span className="subtext">Category</span>
						<h3 className="text-lg font-semibold text-foreground lg:text-[var(--dashboard-secondary-foreground)]">{title}</h3>
					</div>
					<div className="flex flex-col items-end">
						<span className="subtext">Amount</span>
						<p className="text-lg font-bold text-foreground lg:text-[var(--dashboard-secondary-foreground)]">{minimum}</p>
					</div>
				</div>
				<div className="mt-auto pt">
					<Button
						size="lg"
						className={cn(
							'w-full rounded-lg py-3 text-sm font-bold transition-colors' // Increased py-2.5 to py-3
						)}
						disabled={!buttonEnabled}
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
