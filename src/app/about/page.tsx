'use client';

import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { CustomLink } from '@/components/ui/CustomLink';

export default function AboutPage() {
	return (
		<div className="bg-background text-foreground min-h-screen font-sans">
			<div className="container mx-auto px-4 py-12 max-w-3xl">
				<div className="flex items-center space-x-3 mb-8">
					<Logo alt="Sikky Six Logo" />
					<h1 className="text-3xl font-bold">About Sikky Six</h1>
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
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">🌍 Traditional Contribution Systems</h2>
					<p className="mb-2">In Nigeria and other parts of Africa, people have trusted informal savings groups like:</p>
					<ul className="list-disc list-inside mb-2">
						<li>Ajo</li>
						<li>Isusu</li>
						<li>Akawo</li>
					</ul>
					<p className="mb-2">These groups help members buy food, pay rent/school fees, and start small businesses. But if even one person is dishonest or inconsistent, everyone suffers. Money can disappear, trust breaks, and the group falls apart.</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">💻 The Modern Problem</h2>
					<p className="mb-2">New tech platforms (like crypto or formal investments) can be too complicated, risky (e.g., price crashes), or intimidating for many people.</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">🚀 How Sikky Six Started</h2>
					<p className="mb-2">Sikky Six is a modern twist on traditional contribution groups. The big idea:</p>
					<blockquote className="border-l-4 border-[var(--lp-green-primary)] pl-4 italic mb-2">What if people could contribute like Ajo, but also earn digital rewards like crypto?</blockquote>
					<p className="mb-2">
						Sikky Six introduced <b>CLUB POINTS</b> - digital points you earn when you contribute. The value of these points goes up or down based on how well your club is doing (more money in = higher value).
					</p>
					<p className="mb-2">The name “Sikky Six” comes from the Nigerian slang for “Double Six” in Ludo: it means luck, winning, and community breakthroughs.</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">🤝 How Clubs Work</h2>
					<p className="mb-2">Types of Clubs include:</p>
					<ul className="list-disc list-inside mb-2">
						<li>Food Stuff Club</li>
						<li>Medical Bills Club</li>
						<li>Single Parent Club</li>
						<li>...and more</li>
					</ul>
					<p className="mb-2">Key Features:</p>
					<ul className="list-disc list-inside mb-2">
						<li>You choose a club that aligns with your personal goals</li>
						<li>All contributions are automated (no human middleman/admin)</li>
						<li>You earn SKY (Sikky Currency) and Club Points</li>
						<li>Everything is transparent—you can see who contributed, how much money is in the club, and the value of your Club Points in real time</li>
					</ul>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">👤 How to Join Sikky Six</h2>
					<ol className="list-decimal list-inside mb-2">
						<li>Register on the platform</li>
						<li>Buy SKY tokens (Sikky Currency) using your local money from a verified agent</li>
						<li>Join a Club that fits your goal (e.g., Food Club)</li>
						<li>Contribute regularly according to club rules</li>
					</ol>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">💸 What Happens Next?</h2>
					<ul className="list-disc list-inside mb-2">
						<li>Your Club Points increase in value when your club performs well</li>
						<li>When your total value doubles your contributions, you&apos;ve &quot;hit Sikky Six&quot; (this is the max reward)</li>
						<li>You can withdraw (sell SKY) anytime</li>
						<li>But withdrawing early = you lose bonus rewards</li>
					</ul>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">⚙ Sikky Six Operations – How the System Works</h2>
					<p className="mb-2">Who sells SKY?</p>
					<ul className="list-disc list-inside mb-2">
						<li>Agents apply to be verified</li>
						<li>They buy SKY in bulk (using USDT, a stablecoin)</li>
						<li>Members buy SKY from agents in their area</li>
					</ul>
					<p className="mb-2">Fees:</p>
					<ul className="list-disc list-inside mb-2">
						<li>5% fee on contributions</li>
						<li>5% fee on withdrawals</li>
						<li>Total fee = 10% (6% for the platform, 2% for system maintenance, 2% for the referral program)</li>
					</ul>
					<p className="mb-2">Transparency: You can see all verified agents, their rates, and choose who you want to buy from.</p>
				</section>
				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-2">⭐ Why Join Sikky Six?</h2>
					<ul className="list-disc list-inside mb-2">
						<li>It&apos;s more than saving: it&apos;s a social club with purpose</li>
						<li>You join hands with others working toward similar goals</li>
						<li>You grow together financially</li>
						<li>You can earn more than you contribute</li>
					</ul>
					<blockquote className="border-l-4 border-[var(--lp-green-primary)] pl-4 italic mt-4">💥 Contribute with purpose. Grow with community. Hit Sikky Six.</blockquote>
				</section>
				<div className="mt-10 flex justify-center">
					<CustomLink href="/auth/register" passHref>
						<Button className="bg-[var(--lp-green-primary)] hover:opacity-90 text-primary-foreground rounded-full px-8 py-3 text-lg">Join Sikky Six</Button>
					</CustomLink>
				</div>
			</div>
		</div>
	);
}
