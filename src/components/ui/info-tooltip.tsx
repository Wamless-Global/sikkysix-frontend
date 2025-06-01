import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import React from 'react';

interface InfoTooltipProps {
	content: React.ReactNode;
	className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className }) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<span tabIndex={0} className={className || 'ml-1 cursor-pointer inline-flex'}>
				<Info className="w-4 h-4 text-muted-foreground" />
			</span>
		</TooltipTrigger>
		<TooltipContent>{content}</TooltipContent>
	</Tooltip>
);

export default InfoTooltip;
