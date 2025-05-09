'use client'; // Required for state management (dialog open/close)

import { useState } from 'react'; // Import useState
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose, // Import DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs'; // Import Breadcrumbs

// Placeholder Category Data Structure and Data
// TODO: Replace with actual data fetching and type definition
type Category = {
	id: string;
	name: string;
	description: string;
	status: 'Locked' | 'Unlocked';
	totalInvested: number;
	investorCount: number;
	dateCreated: string;
};

const placeholderCategories: Category[] = [
	{ id: 'cat_1', name: 'Foodstuffs', description: 'Investments in staple food items.', status: 'Unlocked', totalInvested: 55000, investorCount: 120, dateCreated: '2024-01-10' },
	{ id: 'cat_2', name: 'Accessories', description: 'Fashion accessories and gadgets.', status: 'Unlocked', totalInvested: 32000, investorCount: 85, dateCreated: '2024-01-15' },
	{ id: 'cat_3', name: 'Accommodation', description: 'Short-term rental investments.', status: 'Locked', totalInvested: 15000, investorCount: 30, dateCreated: '2024-02-01' },
	{ id: 'cat_4', name: 'Lifestyle', description: 'Experiences and lifestyle products.', status: 'Unlocked', totalInvested: 78000, investorCount: 210, dateCreated: '2024-02-20' },
	{ id: 'cat_5', name: 'Vacation Packages', description: 'Travel and vacation deals.', status: 'Unlocked', totalInvested: 41000, investorCount: 95, dateCreated: '2024-03-05' },
];

// Helper function to determine badge variant based on status
const getStatusVariant = (status: Category['status']): 'destructive' | 'default' => {
	return status === 'Locked' ? 'destructive' : 'default';
};

export default function CategoryManagementPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [newCategoryDescription, setNewCategoryDescription] = useState('');

	// TODO: Implement actual category creation logic (API call)
	const handleCreateCategory = () => {
		console.log('Creating category:', { name: newCategoryName, description: newCategoryDescription });
		// Reset form and close dialog after submission (replace with actual logic)
		setNewCategoryName('');
		setNewCategoryDescription('');
		setIsCreateDialogOpen(false);
		alert('Category created (placeholder)! Check logger.'); // Placeholder feedback
	};

	return (
		<div className="space-y-4">
			{/* Add Breadcrumbs and remove the old h1 */}
			<Breadcrumbs />
			<div className="flex justify-between items-center mt-2">
				{/* Added mt-2 */}
				<h1 className="text-2xl font-semibold">Investment Category Management</h1> {/* Restore Title */}
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusCircle className="mr-2 h-4 w-4" /> Create Category
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create New Category</DialogTitle>
							<DialogDescription>Enter the details for the new investment category. Click create when done.</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right">
									Name
								</Label>
								<Input id="name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="col-span-3" placeholder="e.g., Foodstuffs" />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="description" className="text-right">
									Description
								</Label>
								<Textarea id="description" value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} className="col-span-3" placeholder="Enter a brief description..." />
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" onClick={handleCreateCategory} disabled={!newCategoryName || !newCategoryDescription}>
								{/* Basic validation */}
								Create Category
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<p className="text-muted-foreground">Create, edit, lock/unlock, and view investment categories here.</p>

			{/* Category Data Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Total Invested</TableHead>
							<TableHead>Investors</TableHead>
							<TableHead>Date Created</TableHead>
							<TableHead>
								<span className="sr-only">Actions</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{placeholderCategories.length > 0 ? (
							placeholderCategories.map((category) => (
								<TableRow key={category.id}>
									<TableCell className="font-medium">{category.name}</TableCell>
									<TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={category.description}>
										{category.description}
									</TableCell>
									<TableCell>
										<Badge variant={getStatusVariant(category.status)}>{category.status}</Badge>
									</TableCell>
									<TableCell>${category.totalInvested.toLocaleString()}</TableCell>
									<TableCell>{category.investorCount}</TableCell>
									<TableCell>{category.dateCreated}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem
													onClick={() => alert(`Editing ${category.name}`)} // Replace with actual action
												>
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => alert(`Toggling lock for ${category.name}`)} // Replace with actual action
												>
													{category.status === 'Unlocked' ? 'Lock' : 'Unlock'} Category
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => alert(`Viewing chart for ${category.name}`)} // Replace with actual action
												>
													View Chart/Ledger
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-red-600 focus:text-red-600 focus:bg-red-100"
													onClick={() => alert(`Deleting ${category.name}`)} // Replace with actual action (optional)
												>
													Delete (Optional)
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									No categories found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{/* TODO: Add Pagination if needed */}
		</div>
	);
}
