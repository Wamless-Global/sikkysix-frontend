'use client'; // Required for form state

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react'; // Icon
import Breadcrumbs from '@/components/layout/Breadcrumbs'; // Import Breadcrumbs

export default function CommunicationCenterPage() {
	const [messageTitle, setMessageTitle] = useState('');
	const [messageContent, setMessageContent] = useState('');

	// TODO: Implement actual broadcast logic (API call)
	const handleSendBroadcast = () => {
		if (!messageContent.trim()) {
			alert('Message content cannot be empty.');
			return;
		}
		console.log('Sending Broadcast:', { title: messageTitle, content: messageContent });
		// Reset form after sending
		setMessageTitle('');
		setMessageContent('');
		alert('Broadcast Sent (Placeholder)! Check logger.'); // Placeholder feedback
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs /> {/* Add Breadcrumbs component */}
			<h1 className="text-2xl font-semibold mt-2">Communication Center</h1> {/* Restore Title */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Broadcast Form Card */}
				<Card>
					<CardHeader>
						<CardTitle>Send Broadcast Message</CardTitle>
						<CardDescription>Send a pop-up message to all active users.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="messageTitle">Message Title (Optional)</Label>
							<Input id="messageTitle" placeholder="e.g., Important Update" value={messageTitle} onChange={(e) => setMessageTitle(e.target.value)} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="messageContent">Message Content</Label>
							<Textarea
								id="messageContent"
								placeholder="Type your message here..."
								value={messageContent}
								onChange={(e) => setMessageContent(e.target.value)}
								rows={8} // Adjust rows as needed
								required
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button onClick={handleSendBroadcast} disabled={!messageContent.trim()}>
							<Send className="mr-2 h-4 w-4" /> Send Broadcast
						</Button>
					</CardFooter>
				</Card>

				{/* Preview Card (Placeholder) */}
				<Card>
					<CardHeader>
						<CardTitle>Message Preview</CardTitle>
						<CardDescription>How the pop-up might appear to users.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 border rounded-md bg-background min-h-[200px]">
							{messageTitle && <h3 className="text-lg font-semibold mb-2">{messageTitle}</h3>}
							{messageContent ? <p className="text-sm whitespace-pre-wrap">{messageContent}</p> : <p className="text-sm text-muted-foreground italic">Preview will appear here...</p>}
						</div>
					</CardContent>
				</Card>
			</div>
			{/* TODO: Add Message History section */}
			{/* <Card>
         <CardHeader>
           <CardTitle>Message History</CardTitle>
           <CardDescription>Previously sent broadcast messages.</CardDescription>
         </CardHeader>
         <CardContent>
           <p className="text-muted-foreground">History will be displayed here.</p>
           {/* TODO: Implement history table/list * /}
         </CardContent>
       </Card> */}
		</div>
	);
}
