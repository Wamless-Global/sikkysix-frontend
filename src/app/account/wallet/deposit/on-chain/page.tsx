'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Copy } from 'lucide-react'; // Removed ArrowLeft, ChevronDown, ChevronUp as they are not used or handled by Accordion
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';

// Placeholder for QR code generation or a static QR code image
const MOCK_QR_CODE_URL = '/images/mock-qr-code.png'; // Replace with your actual QR code or generation logic
const MOCK_WALLET_ADDRESS = 'XzwhwzfjZdDY6CtwK1kzg'; // As per image
const MOCK_NETWORK = 'SOL'; // As per image
const MOCK_FEES = '2.5%'; // As per image

export default function OnChainDepositPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const amount = searchParams.get('amount'); // Get amount from query params

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(
			() => {
				toast.success('Wallet address copied to clipboard!');
			},
			(err) => {
				toast.error('Failed to copy address.');
				console.error('Failed to copy text: ', err);
			}
		);
	};

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
								<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(MOCK_WALLET_ADDRESS)}>
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
								<AccordionContent className="text-xs text-muted-foreground pt-2 pb-0 text-left">
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

// Create a placeholder SVG for QR code if actual image is not available
// You should replace this with a real QR code image or generation library
// Save this as public/qr-code-placeholder.svg
/*
<svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="100" height="100" fill="#D1D5DB"/> <!-- Light gray background -->
<rect x="15" y="15" width="20" height="20" fill="black"/>
<rect x="65" y="15" width="20" height="20" fill="black"/>
<rect x="15" y="65" width="20" height="20" fill="black"/>
<rect x="40" y="40" width="20" height="20" fill="black"/>
<rect x="15" y="40" width="5" height="5" fill="black"/>
<rect x="25" y="20" width="5" height="5" fill="black"/>
<rect x="70" y="45" width="5" height="5" fill="black"/>
<rect x="45" y="70" width="5" height="5" fill="black"/>
<rect x="65" y="65" width="5" height="5" fill="black"/>
<text x="50" y="55" font-family="Arial" font-size="10" fill="black" text-anchor="middle">QR CODE</text>
</svg>
*/
