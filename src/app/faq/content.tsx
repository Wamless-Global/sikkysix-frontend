'use client';

import { Button } from '@/components/ui/button';
import { CustomLink } from '@/components/ui/CustomLink';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import { getPlatformName } from '@/lib/helpers';

const faqs = [
	{
		q: `What is ${getPlatformName()}?`,
		a: `${getPlatformName()} is a private, digital contribution platform where members join goal-based clubs, contribute consistently, and earn rewards through a transparent point system.\nThe name ${getPlatformName()} comes from the Nigerian slang for Double Six in Ludo—the highest roll in the game. It symbolizes luck, breakthrough, and winning through community effort.`,
	},
	{
		q: `How does ${getPlatformName()} work?`,
		a: `Members join clubs that match their goals (e.g. school fees, food, rent), contribute regularly, and earn CLUB POINTS based on amount and timing. The value of the points rises or falls based on club activity. When value rises, your contribution could be worth more than what you put in.`,
	},
	{
		q: `Are Club Points money?`,
		a: `No. They're trackable units representing your share in a club. Their value changes based on club activity (capped at 2x your contribution).`,
	},
	{
		q: `Who controls the money?`,
		a: `No single person. This is not an investment platform. Clubs are member-managed, and all flows are visible in real-time.`,
	},
	{
		q: `Can I lose money?`,
		a: `Yes. If fewer members contribute, Point values may drop. Point values may dip if participation falls. We encourage clubs to recruit actively but never guarantee returns. Only contribute what you can afford to lose.`,
	},
	{
		q: `Is this legal?`,
		a: `${getPlatformName()} operates as a private social club, not a financial service. Members join by mutual agreement.`,
	},
	{
		q: `How is this different from crypto?`,
		a: `Club Points exist only in ${getPlatformName()}—no blockchain or public trading. This avoids crypto’s volatility and scams.`,
	},
	{
		q: `Why the 2x reward cap?`,
		a: `To prioritize sustainability over hype. Early members earn fairly without draining later joiners.`,
	},
	{
		q: `How do I become a Sikky Agent?`,
		a: `Apply through your Sikky account, submit the required documents, and wait for approval. For a better chance, have a good amount of SKY in your wallet as proof of fund availability.`,
	},
	{
		q: `How do I join a club?`,
		a: `After registering and buying SKY from a verified agent, you choose any club that fits your personal goal and begin contributing based on that club's rules.`,
	},
];

export default function FaqPage() {
	return (
		<div className="bg-background text-foreground font-sans flex flex-col min-h-screen">
			<AppHeader />
			<section className="relative">
				<div className="container mx-auto px-4 sm:px-10 py-24 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
					<div className="flex-1 text-center md:text-left z-10">
						<h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">{getPlatformName()} FAQs</h1>
						<p className="sm:text-lg text-muted-foreground text-center max-w-2xl mx-auto mt-4">Find answers to the most common questions about how {getPlatformName()} works, membership, rewards, and more.</p>
					</div>
					<div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[var(--lp-green-primary)]/10 to-transparent" />
				</div>
			</section>

			<section className="container mx-auto px-6 py-12 max-w-3xl flex-1 mb-10">
				<Accordion type="single" collapsible className="w-full space-y-2">
					{faqs.map((item, idx) => (
						<AccordionItem key={idx} value={`faq-${idx}`}>
							<AccordionTrigger className="text-md sm:text-lg font-semibold">
								{idx + 1}. {item.q}
							</AccordionTrigger>
							<AccordionContent>
								<p className="text-muted-foreground whitespace-pre-line">{item.a}</p>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
				<div className="mt-10 flex justify-center">
					<CustomLink href="/auth/signup" passHref>
						<Button variant={'success'} size={'lg'}>
							Join {getPlatformName()}
						</Button>
					</CustomLink>
				</div>
			</section>
			<AppFooter />
		</div>
	);
}
