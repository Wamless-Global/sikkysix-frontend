'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUserContext, UserFilters } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Image from 'next/image';
import { User, Role, UserStatus, getStatusVariant, ALL_ROLES, ALL_STATUSES } from '@/lib/userUtils';
import { COUNTRIES } from '@/lib/countries';
import { Label } from '@/components/ui/label';

const ITEMS_PER_PAGE = 10;

export default function UserManagementPage() {
	const router = useRouter();
	const { users, fetchUsers, isLoading, totalCount } = useUserContext();

	const [searchTerm, setSearchTerm] = useState('');
	const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
	const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');
	const [filterCountry, setFilterCountry] = useState<string | 'all'>('all');
	const [filterStartDate, setFilterStartDate] = useState<string>('');
	const [filterEndDate, setFilterEndDate] = useState<string>('');
	const [currentPage, setCurrentPage] = useState(1);
	const [loadingButton, setLoadingButton] = useState<'previous' | 'next' | null>(null);

	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

	useEffect(() => {
		const filters: UserFilters = {
			searchTerm: searchTerm || undefined,
			role: filterRole === 'all' ? undefined : filterRole,
			status: filterStatus === 'all' ? undefined : filterStatus,
			country: filterCountry === 'all' ? undefined : filterCountry,
			startDate: filterStartDate || undefined,
			endDate: filterEndDate || undefined,
		};

		const timer = setTimeout(() => {
			fetchUsers(filters, currentPage);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, filterRole, filterStatus, filterCountry, filterStartDate, filterEndDate, currentPage, fetchUsers]);

	useEffect(() => {
		if (!isLoading) {
			setLoadingButton(null);
		}
	}, [isLoading]);

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

	const handleResetFilters = () => {
		setFilterRole('all');
		setFilterStatus('all');
		setFilterCountry('all');
		setFilterStartDate('');
		setFilterEndDate('');
		setSearchTerm('');
		setCurrentPage(1);
	};

	return (
		<div className="space-y-6">
			<Breadcrumbs />
			<h1 className="text-2xl font-semibold mt-2">User Management</h1>

			<p className="text-sm text-muted-foreground">Use the filters below to refine the user list.</p>

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
				<Input
					placeholder="Search by name or email..."
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setCurrentPage(1);
					}}
					className="max-w-lg w-full md:w-auto flex-grow"
				/>
				<div className="w-full md:w-auto mt-4 md:mt-0">
					<Button className="w-full md:w-auto">Add New User</Button>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 items-end mt-8">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="role-filter">Role</Label>
					<Select
						value={filterRole}
						onValueChange={(value) => {
							setFilterRole(value as Role | 'all');
							setCurrentPage(1);
						}}
					>
						<SelectTrigger className="w-full sm:w-[160px]" id="role-filter">
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
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="status-filter">Status</Label>
					<Select
						value={filterStatus}
						onValueChange={(value) => {
							setFilterStatus(value as UserStatus | 'all');
							setCurrentPage(1);
						}}
					>
						<SelectTrigger className="w-full sm:w-[160px]" id="status-filter">
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
				<Button variant="outline" onClick={handleResetFilters} className="self-end">
					Reset Filters
				</Button>
			</div>

			<div className="rounded-md border mt-4">
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
										router.push(`/admin/users/${user.username}`);
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

			{totalPages > 1 && (
				<div className="flex items-center justify-between space-x-2 py-4 px-2">
					<div className="text-sm text-muted-foreground">
						Showing page {currentPage} of {totalPages} ({totalCount} users total)
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
