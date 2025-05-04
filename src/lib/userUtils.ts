// Define Role type
export type Role = 'user' | 'figure head' | 'agent' | 'admin';
export const ALL_ROLES: Role[] = ['user', 'figure head', 'agent', 'admin'];

// Define User Status type and constants
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';
export const ALL_STATUSES: UserStatus[] = ['Active', 'Inactive', 'Suspended'];

// Define Country constants
export const ALL_COUNTRIES = ['Nigeria', 'USA', 'UK', 'Ghana', 'Canada']; // Assuming these are all possible countries for now

// Define User Data Structure
export type User = {
	id: string;
	name: string;
	email: string;
	profilePictureUrl?: string;
	roles: Role;
	registrationDate: string;
	investmentCount: number;
	totalInvested: number;
	status: UserStatus;
	country: string;
};

// Generate placeholder users
const generateUsers = (count: number): User[] => {
	const users = Array.from({ length: count }, (_, i) => {
		const email = `user${i + 1}@example.com`;
		return {
			id: `usr_${i + 1}`,
			name: `User Name ${i + 1}`,
			email: email,
			profilePictureUrl: `https://avatar.vercel.sh/${email}.png?size=40`, // Generate avatar URL
			roles: ALL_ROLES[i % ALL_ROLES.length], // Assign roles cyclically
			registrationDate: `2024-0${Math.floor(Math.random() * 4) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
			investmentCount: Math.floor(Math.random() * 15),
			totalInvested: Math.floor(Math.random() * 5000) + 100,
			status: ALL_STATUSES[i % ALL_STATUSES.length],
			country: ALL_COUNTRIES[i % ALL_COUNTRIES.length],
		};
	});
	return users;
};

// Initial set of placeholder users
export const initialUsers: User[] = generateUsers(35);

// Helper function to determine badge variant based on status
export const getStatusVariant = (status: UserStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
	switch (status) {
		case 'Active':
			return 'default';
		case 'Inactive':
			return 'secondary';
		case 'Suspended':
			return 'destructive';
		default:
			return 'outline';
	}
};
