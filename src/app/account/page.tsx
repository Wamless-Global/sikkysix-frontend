import DashboardCard from '@/components/dashboard/DashboardCard'; // We'll create this next
import { CustomLink } from '@/components/ui/CustomLink'; // Custom link component for navigation

// Mock data for cards - replace with actual data fetching
const categories = [
	{
		title: 'Food',
		slug: 'food', // Add slug
		// Using loremflickr for random images. Dimensions match typical card image ratios.
		image: '/Variety-fruits-vegetables.png',
		category: 'Category', // This label seems unused in the final design, but keeping data structure
		minimum: '₦10,000.00',
		buttonText: 'Buy Now',
		buttonEnabled: true,
	},
	{
		title: 'Lifestyle',
		slug: 'lifestyle', // Add slug
		image: '/Variety-fruits-vegetables.png', // Using 'concert' for lifestyle
		category: 'Category',
		minimum: '₦50,000.00', // Updated based on mobile design
		buttonText: 'Buy Now',
		buttonEnabled: true,
	},
	{
		title: 'Transport',
		slug: 'transport', // Add slug
		image: '/Variety-fruits-vegetables.png', // Using 'truck' for transport
		category: 'Category',
		minimum: '₦100,000.00', // Updated based on mobile design
		buttonText: 'Coming Soon', // Updated based on mobile design
		buttonEnabled: false, // Disabled for 'Coming Soon'
	},
	// Add more categories if needed
];

// Mock user data - replace with actual context/auth logic
const user = { name: 'Adewale D.' };

export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<div>
				<p className="account-page-title mt-0 mb-4">Home</p>
				<h2 className="text-2xl font-semibold text-text-primary mb-1">Welcome, {user.name}</h2>
				<p className="text-text-secondary">Get the opportunity to own shares in a unique category</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
				{categories.map((category) =>
					category.buttonEnabled ? (
						<CustomLink key={category.slug} href={`/account/category/${category.slug}`} className="block hover:opacity-90 transition-opacity">
							<DashboardCard title={category.title} image={category.image} minimum={category.minimum} buttonText={category.buttonText} buttonEnabled={category.buttonEnabled} />
						</CustomLink>
					) : (
						<div>
							<DashboardCard title={category.title} image={category.image} minimum={category.minimum} buttonText={category.buttonText} buttonEnabled={category.buttonEnabled} />
						</div>
					)
				)}
			</div>
		</div>
	);
}
