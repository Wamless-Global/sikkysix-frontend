'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // For potential "Add Reference" button
import { Edit, Trash2 } from 'lucide-react'; // Icons for actions

// Mock data for references - replace with actual data fetching
const mockReferences = [
	{
		id: '1',
		name: 'Dr. Jane Smith',
		title: 'Senior Researcher',
		company: 'Tech Innovations Inc.',
		contact: 'jane.smith@email.com | (555) 123-4567',
		relationship: 'Former Manager',
	},
	{
		id: '2',
		name: 'John Doe',
		title: 'Lead Developer',
		company: 'Solutions Co.',
		contact: 'john.doe@email.com',
		relationship: 'Colleague',
	},
	{
		id: '3',
		name: 'Alice Brown',
		title: 'Professor of Computer Science',
		company: 'State University',
		contact: '(555) 987-6543',
		relationship: 'Academic Advisor',
	},
];

export default function ReferencesPage() {
	// Add state and handlers for adding/editing/deleting references later

	return (
		<div className="max-w-3xl mx-auto space-y-8">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-semibold text-foreground">Professional References</h1>
				{/* Optional: Add button to add new reference */}
				{/* <Button className="bg-[var(--dashboard-accent)] hover:bg-[var(--dashboard-accent)]/90 text-[var(--dashboard-accent-foreground)]">
					Add Reference
				</Button> */}
			</div>

			{mockReferences.length > 0 ? (
				<div className="space-y-6">
					{mockReferences.map((ref) => (
						<Card key={ref.id} className="bg-muted/30 dark:bg-muted/10 shadow-sm">
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<div>
										<CardTitle className="text-lg text-foreground">{ref.name}</CardTitle>
										<CardDescription className="text-sm">
											{ref.title} at {ref.company}
										</CardDescription>
									</div>
									{/* Optional: Action buttons for edit/delete */}
									{/* <div className="flex space-x-2">
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
										</Button>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
										</Button>
									</div> */}
								</div>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div>
									<span className="font-medium text-foreground">Contact: </span>
									<span className="text-muted-foreground">{ref.contact}</span>
								</div>
								<div>
									<span className="font-medium text-foreground">Relationship: </span>
									<span className="text-muted-foreground">{ref.relationship}</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<div className="text-center py-10">
					<p className="text-muted-foreground">You haven't added any professional references yet.</p>
					{/* Optional: Button to add first reference */}
					{/* <Button className="mt-4 bg-[var(--dashboard-accent)] hover:bg-[var(--dashboard-accent)]/90 text-[var(--dashboard-accent-foreground)]">
						Add Your First Reference
					</Button> */}
				</div>
			)}
		</div>
	);
}
