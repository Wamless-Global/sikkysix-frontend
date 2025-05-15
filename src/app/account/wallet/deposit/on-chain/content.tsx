'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import copyToClipboard from '@/components/ui/copy-to-clipboard';

const MOCK_WALLET_ADDRESS = 'XzwhwzfjZdDY6CtwK1kzg';
const MOCK_NETWORK = 'SOL';
const MOCK_FEES = '2.5%';

export default function OnChainDepositPageContent() {
	const searchParams = useSearchParams();
	const amount = searchParams.get('amount');

	return (
		<div className="max-w-2xl space-y-8">
			<Card className="bg-background border-0 shadow-none">
				<CardHeader>
					<CardTitle className="sub-page-heading">Deposit USDT {amount ? `(${amount} NGN)` : ''}</CardTitle>
					<p className="sub-page-heading-sub-text">Scan the QR code or copy the address below to make your deposit.</p>
				</CardHeader>
				<CardContent className="space-y-6 pt-6">
					<div className="flex justify-center my-4">
						<div className="p-3 bg-background dark:bg-muted rounded-lg inline-block border border-border shadow-sm">
							<Image src="/qr-code-placeholder.svg" alt="USDT Deposit QR Code" width={180} height={180} className="rounded-sm" />
						</div>
					</div>

					<div className="space-y-3 mt-10">
						<div className="flex justify-between items-center py-3 border-b border-border">
							<span className="text-sm text-muted-foreground">Wallet Address</span>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-foreground break-all">{MOCK_WALLET_ADDRESS}</span>
								<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(MOCK_WALLET_ADDRESS, 'Wallet address copied to clipboard!', 'Failed to copy address.')}>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<div className="flex justify-between items-center py-3 border-b border-border">
							<span className="text-sm text-muted-foreground">Network</span>
							<span className="text-sm font-medium text-foreground">{MOCK_NETWORK}</span>
						</div>

						<div className="flex justify-between items-center py-3 border-b border-border">
							<span className="text-sm text-muted-foreground">Fees</span>
							<span className="text-sm font-medium text-foreground">{MOCK_FEES}</span>
						</div>

						<Accordion type="single" collapsible className="w-full pt-2">
							<AccordionItem value="notice" className="border-b-0">
								<AccordionTrigger className="flex justify-between items-center py-3 text-sm text-muted-foreground hover:no-underline hover:text-foreground focus:outline-none focus-visible:ring-0">Important Notice</AccordionTrigger>
								<AccordionContent className="text-sm text-muted-foreground pt-2 pb-0 text-left">
									Please ensure you are sending USDT on the {MOCK_NETWORK} network. Sending any other asset or using a different network may result in the permanent loss of your funds. Transactions typically confirm within a few minutes.
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
