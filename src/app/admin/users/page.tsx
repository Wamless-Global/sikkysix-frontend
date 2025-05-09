'use client'; // Make it a client component for state management

import { useState, useMemo, useEffect } from 'react';
import { useUserContext, UserFilters } from '@/context/UserContext'; // Import context hook and UserFilters type
import { useRouter } from 'next/navigation'; // Import useRouter
import NProgress from 'nprogress'; // Import NProgress
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added Select
import { MoreHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'; // Added Loader2 back
import Breadcrumbs from '@/components/layout/Breadcrumbs'; // Import Breadcrumbs
import Image from 'next/image'; // Import Next Image
import { User, Role, UserStatus, getStatusVariant, ALL_ROLES, ALL_STATUSES } from '@/lib/userUtils'; // Import from utils (removed ALL_COUNTRIES)
import { COUNTRIES } from '@/lib/countries'; // Import COUNTRIES
import { Label } from '@/components/ui/label'; // Import Label for date inputs

const ITEMS_PER_PAGE = 10; // Define items per page constant

export default function UserManagementPage() {
	const router = useRouter(); // Get router instance
	const { users, fetchUsers, isLoading, totalCount } = useUserContext(); // Get users, fetch function, loading state, and total count

	// Local state for filters and current page
	const [searchTerm, setSearchTerm] = useState('');
	const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
	const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all'); // Use UserStatus type
	const [filterCountry, setFilterCountry] = useState<string | 'all'>('all');
	const [filterStartDate, setFilterStartDate] = useState<string>(''); // State for start date
	const [filterEndDate, setFilterEndDate] = useState<string>(''); // State for end date
	const [currentPage, setCurrentPage] = useState(1); // Tracks the *current* page requested
	const [loadingButton, setLoadingButton] = useState<'previous' | 'next' | null>(null); // Track which button is loading

	// --- Server-Side Pagination Logic ---
	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE); // Calculate total pages based on totalCount from context

	// Refactored Effect to fetch users and handle filter changes
	useEffect(() => {
		const filters: UserFilters = {
			searchTerm: searchTerm || undefined,
			role: filterRole === 'all' ? undefined : filterRole, // Send undefined if 'all'
			status: filterStatus === 'all' ? undefined : filterStatus, // Send undefined if 'all'
			country: filterCountry === 'all' ? undefined : filterCountry, // Send undefined if 'all'
			startDate: filterStartDate || undefined,
			endDate: filterEndDate || undefined,
		};

		// Debounce fetching
		const timer = setTimeout(() => {
			// console.log('Fetching with filters:', filters, 'Page:', currentPage);
			fetchUsers(filters, currentPage);
		}, 300); // 300ms debounce

		return () => clearTimeout(timer);
	}, [searchTerm, filterRole, filterStatus, filterCountry, filterStartDate, filterEndDate, currentPage, fetchUsers]);

	// Effect to clear loading button state when main loading finishes
	useEffect(() => {
		if (!isLoading) {
			setLoadingButton(null);
		}
	}, [isLoading]);

	// Handlers for pagination - set loading state *before* changing page
	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setLoadingButton('previous');
			setCurrentPage((prev) => prev - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setLoadingButton('next');
			setCurrentPage((prev) => prev + 1);
		}
	};

	// Function to reset all filters
	const handleResetFilters = () => {
		setFilterRole('all');
		setFilterStatus('all');
		setFilterCountry('all');
		setFilterStartDate(''); // Reset start date
		setFilterEndDate(''); // Reset end date
		setSearchTerm('');
		setCurrentPage(1); // Reset page on filter reset
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-2xl font-semibold mt-2">User Management</h1>

			{/* Filter Cue */}
			<p className="text-sm text-muted-foreground">Use the filters below to refine the user list.</p>

			{/* Search and Filter Controls Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
				{/* Search Input */}
				<Input
					placeholder="Search by name or email..."
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setCurrentPage(1); // Reset page when search term changes
					}}
					className="max-w-lg w-full md:w-auto flex-grow" // Adjusted width
				/>
				{/* Add New User Button (Moved for better layout on smaller screens) */}
				<div className="w-full md:w-auto mt-4 md:mt-0">
					<Button className="w-full md:w-auto">Add New User</Button>
				</div>
			</div>

			{/* Filter Row */}
			<div className="flex flex-wrap gap-2 items-end mt-8">
				{/* Use items-end to align labels and inputs */}
				{/* Role Filter */}
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="role-filter">Role</Label>
					<Select
						value={filterRole}
						onValueChange={(value) => {
							setFilterRole(value as Role | 'all');
							setCurrentPage(1); // Reset page when filter changes
						}}
					>
						<SelectTrigger className="w-full sm:w-[160px]" id="role-filter">
							{/* Add id to trigger for label association */}
							<SelectValue placeholder="Role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							{ALL_ROLES.map((role) => (
								<SelectItem key={role} value={role}>
									{role.charAt(0).toUpperCase() + role.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{/* Status Filter */}
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="status-filter">Status</Label>
					<Select
						value={filterStatus}
						onValueChange={(value) => {
							setFilterStatus(value as UserStatus | 'all');
							setCurrentPage(1); // Reset page when filter changes
						}}
					>
						<SelectTrigger className="w-full sm:w-[160px]" id="status-filter">
							{/* Add id to trigger for label association */}
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							{ALL_STATUSES.map((status) => (
								<SelectItem key={status} value={status}>
									{status}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{/* Country Filter */}
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="country-filter">Country</Label>
					<Select
						value={filterCountry}
						onValueChange={(value) => {
							setFilterCountry(value);
							setCurrentPage(1);
						}}
					>
						<SelectTrigger className="w-full sm:w-[160px]" id="country-filter">
							<SelectValue placeholder="Country" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Countries</SelectItem>
							{COUNTRIES.map((country) => (
								<SelectItem key={country.code} value={country.code}>
									{country.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				{/* Registered Date Filter */}
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="start-date">Registered From</Label>
					<Input
						id="start-date"
						type="date"
						value={filterStartDate}
						onChange={(e) => {
							setFilterStartDate(e.target.value);
							setCurrentPage(1);
						}}
						className="w-full sm:w-[160px]"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="end-date">Registered To</Label>
					<Input
						id="end-date"
						type="date"
						value={filterEndDate}
						onChange={(e) => {
							setFilterEndDate(e.target.value);
							setCurrentPage(1);
						}}
						className="w-full sm:w-[160px]"
						min={filterStartDate}
					/>
				</div>
				{/* Reset Filters Button */}
				<Button variant="outline" onClick={handleResetFilters} className="self-end">
					{/* Align button with inputs */}
					Reset Filters
				</Button>
			</div>

			{/* User Data Table */}
			<div className="rounded-md border mt-4">
				{/* Added margin top */}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Roles</TableHead>
							<TableHead>Registered</TableHead>
							<TableHead>Investments</TableHead>
							<TableHead>Total Invested</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Country</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && currentPage === 1 ? (
							<TableRow>
								<TableCell colSpan={8} className="h-24 text-center">
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
								</TableCell>
							</TableRow>
						) : users.length > 0 ? (
							users.map((user: User) => (
								<TableRow
									key={user.id}
									className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
									onClick={() => {
										NProgress.start();
										router.push(`/admin/users/${user.username}`); // Use username for navigation
									}}
								>
									<TableCell className="font-medium">
										<div className="flex items-center gap-3">
											{user.profilePictureUrl && <Image src={user.profilePictureUrl} alt={`${user.name}'s profile picture`} width={40} height={40} className="rounded-full" />}
											<span>{user.name}</span>
										</div>
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{Array.isArray(user.roles) ? user.roles.map((role) => role.charAt(0).toUpperCase() + role.slice(1)).join(', ') : ''}</TableCell>
									<TableCell>{new Date(user.registrationDate).toLocaleString()}</TableCell>
									<TableCell>{user.investmentCount}</TableCell>
									<TableCell>${user.totalInvested.toLocaleString()}</TableCell>
									<TableCell>
										<Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
									</TableCell>
									<TableCell>{COUNTRIES.find((country) => country.code === user.country)?.name || 'Nigeria'}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={8} className="h-24 text-center">
									No users found {searchTerm || filterRole !== 'all' || filterStatus !== 'all' || filterCountry !== 'all' || filterStartDate || filterEndDate ? 'matching your criteria' : ''}.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between space-x-2 py-4 px-2">
					<div className="text-sm text-muted-foreground">
						Showing page {currentPage} of {totalPages} ({totalCount} users total) {/* Use totalCount from context */}
					</div>
					<div className="space-x-2 flex items-center">
						<Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading} className="cursor-pointer">
							{isLoading && loadingButton === 'previous' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4 mr-1" />}
							Previous
						</Button>
						<Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || isLoading} className="cursor-pointer">
							Next
							{isLoading && loadingButton === 'next' ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4 ml-1" />}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
