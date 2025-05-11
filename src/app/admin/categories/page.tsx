'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { CustomLink } from '@/components/ui/CustomLink';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';

// TODO: Replace with actual data fetching and type definition
type Category = {
	id: string;
	name: string;
	slug: string; // Added slug for navigation
	description: string;
	status: 'Locked' | 'Unlocked';
	totalInvested: number;
	investorCount: number;
	dateCreated: string;
};

const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

const placeholderCategories: Category[] = [
	{ id: 'cat_1', name: 'Foodstuffs', slug: generateSlug('Foodstuffs'), description: 'Investments in staple food items.', status: 'Unlocked', totalInvested: 55000, investorCount: 120, dateCreated: '2024-01-10' },
	{ id: 'cat_2', name: 'Accessories', slug: generateSlug('Accessories'), description: 'Fashion accessories and gadgets.', status: 'Unlocked', totalInvested: 32000, investorCount: 85, dateCreated: '2024-01-15' },
	{ id: 'cat_3', name: 'Accommodation', slug: generateSlug('Accommodation'), description: 'Short-term rental investments.', status: 'Locked', totalInvested: 15000, investorCount: 30, dateCreated: '2024-02-01' },
	{ id: 'cat_4', name: 'Lifestyle', slug: generateSlug('Lifestyle'), description: 'Experiences and lifestyle products.', status: 'Unlocked', totalInvested: 78000, investorCount: 210, dateCreated: '2024-02-20' },
	{ id: 'cat_5', name: 'Vacation Packages', slug: generateSlug('Vacation Packages'), description: 'Travel and vacation deals.', status: 'Unlocked', totalInvested: 41000, investorCount: 95, dateCreated: '2024-03-05' },
];

// Helper function to determine badge variant based on status
const getStatusVariant = (status: Category['status']): 'destructive' | 'default' => {
	return status === 'Locked' ? 'destructive' : 'default';
};

export default function CategoryManagementPage() {
	const router = useRouter();

	return (
		<div className="space-y-4">
			<Breadcrumbs />
			<div className="flex justify-between items-center mt-2">
				<h1 className="text-2xl font-semibold">Investment Category Management</h1>
				<CustomLink href={'/admin/categories/create'}>
					<Button>
						<PlusCircle className="mr-2 h-4 w-4" /> Create Category
					</Button>
				</CustomLink>
			</div>

			<p className="text-muted-foreground">Create, edit, lock/unlock, and view investment categories here.</p>

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
									<TableCell className="font-medium">
										<CustomLink href={`/admin/categories/${category.slug}`} className="hover:underline">
											{category.name}
										</CustomLink>
									</TableCell>
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
												<DropdownMenuItem onClick={() => alert(`Editing ${category.name}`)}>Edit</DropdownMenuItem>
												<DropdownMenuItem onClick={() => alert(`Toggling lock for ${category.name}`)}>{category.status === 'Unlocked' ? 'Lock' : 'Unlock'} Category</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<CustomLink href={`/admin/categories/${category.slug}`} className="w-full justify-start">
														View Details
													</CustomLink>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100" onClick={() => alert(`Deleting ${category.name}`)}>
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
