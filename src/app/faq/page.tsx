'use client';

import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { CustomLink } from '@/components/ui/CustomLink';

const faqs = [
	{
		q: 'What is Sikky Six?',
		a: `Sikky Six is a private, digital contribution platform where members join goal-based clubs, contribute consistently, and earn rewards through a transparent point system.\nThe name Sikky Six comes from the Nigerian slang for Double Six in Ludo—the highest roll in the game. It symbolizes luck, breakthrough, and winning through community effort.`,
	},
	{
		q: 'How does Sikky Six work?',
		a: `Members join clubs that match their goals (e.g. school fees, food, rent), contribute regularly, and earn CLUB POINTS based on amount and timing. The value of the points rises or falls based on club activity. When value rises, your contribution could be worth more than what you put in.`,
	},
	{
		q: 'Are Club Points money?',
		a: `No. They’re trackable units representing your share in a club. Their value changes based on club activity (capped at 2x your contribution).`,
	},
	{
		q: 'Who controls the money?',
		a: `No single person. This is not an investment platform. Clubs are member-managed, and all flows are visible in real-time.`,
	},
	{
		q: 'Can I lose money?',
		a: `Yes. If fewer members contribute, Point values may drop. Point values may dip if participation falls. We encourage clubs to recruit actively but never guarantee returns. Only contribute what you can afford to lose.`,
	},
	{
		q: 'Is this legal?',
		a: `Sikky Six operates as a private social club, not a financial service. Members join by mutual agreement.`,
	},
	{
		q: 'How is this different from crypto?',
		a: `Club Points exist only in Sikky Six—no blockchain or public trading. This avoids crypto’s volatility and scams.`,
	},
	{
		q: 'Why the 2x reward cap?',
		a: `To prioritize sustainability over hype. Early members earn fairly without draining later joiners.`,
	},
	{
		q: 'How do I become a Sikky Agent?',
		a: `Apply through your Sikky account, submit the required documents, and wait for approval. For a better chance, have a good amount of SKY in your wallet as proof of fund availability.`,
	},
	{
		q: 'How do I join a club?',
		a: `After registering and buying SKY from a verified agent, you choose any club that fits your personal goal and begin contributing based on that club’s rules.`,
	},
];

export default function FaqPage() {
	return (
		<div className="bg-background text-foreground min-h-screen font-sans">
			<div className="container mx-auto px-4 py-12 max-w-3xl">
				<div className="flex items-center space-x-3 mb-8">
					<Logo alt="Sikky Six Logo" />
					<h1 className="text-3xl font-bold">Sikky Six FAQs</h1>
				</div>
				<nav className="flex space-x-4 mb-8">
					<CustomLink href="/" passHref>
						<Button variant="outline" className="rounded-full px-6">
							Home
						</Button>
					</CustomLink>
					<CustomLink href="/about" passHref>
						<Button variant="outline" className="rounded-full px-6">
							About
						</Button>
					</CustomLink>
					<CustomLink href="/faq" passHref>
						<Button className="bg-[var(--lp-green-primary)] text-primary-foreground rounded-full px-6">FAQ</Button>
					</CustomLink>
				</nav>
				<div className="space-y-8">
					{faqs.map((item, idx) => (
						<div key={idx} className="border-b border-[var(--lp-border)] pb-6">
							<h2 className="text-lg font-semibold mb-2">
								{idx + 1}) {item.q}
							</h2>
							<p className="text-base text-muted-foreground whitespace-pre-line">{item.a}</p>
						</div>
					))}
				</div>
				<div className="mt-10 flex justify-center">
					<CustomLink href="/auth/register" passHref>
						<Button className="bg-[var(--lp-green-primary)] hover:opacity-90 text-primary-foreground rounded-full px-8 py-3 text-lg">Join Sikky Six</Button>
					</CustomLink>
				</div>
			</div>
		</div>
	);
}
