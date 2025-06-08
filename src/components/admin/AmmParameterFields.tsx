import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AmmModelType } from '@/types';
import { Control } from 'react-hook-form';

interface AmmParameterFieldsProps {
	ammModelType: AmmModelType | undefined;
	isSubmitting: boolean;
	control: Control<any>;
}

export function AmmParameterFields({ ammModelType, isSubmitting, control }: AmmParameterFieldsProps) {
	if (!ammModelType) {
		return null;
	}

	switch (ammModelType) {
		case 'adjusted_l_s':
			return (
				<>
					<FormField
						control={control}
						name="amm_parameters.deposit_impact_factor"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Deposit Impact Factor</FormLabel>
								<FormControl>
									<Input type="number" min="0" step="any" placeholder="e.g., 0.1" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>Factor to adjust deposit impact.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="amm_parameters.withdrawal_impact_factor"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Withdrawal Impact Factor</FormLabel>
								<FormControl>
									<Input type="number" min="0" step="any" placeholder="e.g., 0.1" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>Factor to adjust withdrawal impact.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="amm_parameters.base_starting_price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Base Starting Price</FormLabel>
								<FormControl>
									<Input type="number" min="0" step="any" placeholder="e.g., 100" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>The initial price of the asset.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			);
		case 'constant_product':
			return (
				<>
					<FormField
						control={control}
						name="amm_parameters.initial_ngn_pool_balance"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Initial {process.env.NEXT_PUBLIC_BASE_CURRENCY} Balance</FormLabel>
								<FormControl>
									<Input type="number" min="0" step="any" placeholder="e.g., 1000" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>Initial {process.env.NEXT_PUBLIC_BASE_CURRENCY} pool balance.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="amm_parameters.initial_units_pool_balance"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Initial Units Balance</FormLabel>
								<FormControl>
									<Input type="number" min="0" step="any" placeholder="e.g., 10" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>Initial unit pool balance.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			);
		case 'linear_bonding_curve':
			return (
				<>
					<FormField
						control={control}
						name="amm_parameters.slope_m"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Slope (m)</FormLabel>
								<FormControl>
									<Input type="number" step="any" placeholder="e.g., 0.5" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>The slope of the linear bonding curve.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="amm_parameters.intercept_b"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Intercept (b)</FormLabel>
								<FormControl>
									<Input type="number" step="any" placeholder="e.g., 10" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>The intercept of the linear bonding curve.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			);
		case 'exponential_bonding_curve':
			return (
				<>
					<FormField
						control={control}
						name="amm_parameters.coefficient_a"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Coefficient (a)</FormLabel>
								<FormControl>
									<Input type="number" min="0" step="any" placeholder="e.g., 10" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>The coefficient of the exponential bonding curve.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="amm_parameters.exponent_n"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Exponent (n)</FormLabel>
								<FormControl>
									<Input type="number" min="0" step="any" placeholder="e.g., 2" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>The exponent of the exponential bonding curve.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="amm_parameters.base_price_b"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Base Price (b)</FormLabel>
								<FormControl>
									<Input type="number" min="0" step="any" placeholder="e.g., 1" {...field} disabled={isSubmitting} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
								</FormControl>
								<FormDescription>The base price of the exponential bonding curve.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			);
		default:
			return null;
	}
}
