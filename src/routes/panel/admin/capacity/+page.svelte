<script lang="ts">
	import CurrencyIcon from '$lib/components/CurrencyIcon.svelte';
	import { renderCurrencyWithIcon } from '$lib/helpers/Currency.helper';
	import { formatCurrency } from '$lib/helpers/utils.helper';
	import { Button, Card, DataTable, FormGroup, Input, PanelPageWrapper } from '$lib/kit';
	import type { Column } from '$lib/kit/DataTable.svelte';
	import CreateCapacityTransactionProvider from '$lib/providers/CreateCapacityTransactionProvider.svelte';
	import GetCapacityTransactionsProvider from '$lib/providers/GetCapacityTransactionsProvider.svelte';
	import GetSystemCapacityStatsProvider from '$lib/providers/GetSystemCapacityStatsProvider.svelte';
	import { toast } from '$lib/toast/store';

	// Form state
	let showAddForm = false;
	let formData: {
		currency: 'USDT' | 'IRT' | '';
		amount: string;
		description: string;
	} = {
		currency: '',
		amount: '',
		description: ''
	};

	// Pagination state
	let currentPage = 1;
	let itemsPerPage = 10;

	// Currency options
	const currencyOptions = [
		{ value: 'USDT', label: 'USDT - Tether' },
		{ value: 'IRT', label: 'IRT - تومان' }
	];

	// Currency display configuration
	const currencyConfig = {
		USDT: {
			color: 'from-green-500 to-emerald-600'
		},
		IRT: {
			color: 'from-blue-500 to-indigo-600'
		}
	};

	// Table columns for transactions
	const transactionColumns: Column[] = [
		{
			key: 'id',
			label: 'ID',
			sortable: true
		},
		{
			key: 'currency',
			label: 'Currency',
			sortable: true,
			render: (value) => {
				return renderCurrencyWithIcon(value);
			}
		},
		{
			key: 'amount',
			label: 'Amount',
			sortable: true,
			render: (value, row) => {
				const num = parseFloat(value);
				const formatted = formatCurrency(Math.abs(num), row.currency);
				return num >= 0 ? `+${formatted}` : `-${formatted}`;
			}
		},
		{
			key: 'description',
			label: 'Description'
		},
		{
			key: 'createdAt',
			label: 'Created At',
			sortable: true,
			render: (value) => {
				return value.toLocaleString('fa-IR');
			}
		}
	];

	// Form validation
	$: isFormValid =
		formData.currency &&
		formData.amount &&
		!isNaN(parseFloat(formData.amount)) &&
		formData.description.trim();

	// Reset form
	function resetForm() {
		formData = {
			currency: '' as 'USDT' | 'IRT' | '',
			amount: '',
			description: ''
		};
		showAddForm = false;
	}
</script>

<PanelPageWrapper
	title="Capacity Management"
	description="Monitor system capacity and manage capacity transactions"
>
	<div class="flex flex-col gap-6">
		<GetSystemCapacityStatsProvider
			onError={(error) => {
				toast.error(error || 'Failed to fetch capacity stats');
			}}
			let:loading={statsLoading}
			let:capacityStats
			let:getStats
		>
			<GetCapacityTransactionsProvider
				onError={(error) => {
					toast.error(error || 'Failed to fetch transactions');
				}}
				let:loading={transactionsLoading}
				let:transactions
				let:totalCount
				let:getCapacityTransactions
			>
				<CreateCapacityTransactionProvider
					onSuccess={(data) => {
						if (data) {
							toast.success('Transaction created successfully');
							resetForm();
							// Refresh both stats and transactions
							getStats();
							getCapacityTransactions({
								limit: itemsPerPage,
								offset: (currentPage - 1) * itemsPerPage
							});
						}
					}}
					onError={(error) => {
						toast.error(error || 'Failed to create transaction');
					}}
					let:createCapacityTransaction
					let:loading={createLoading}
				>
					<!-- Capacity Stats Section -->
					<div class="grid gap-4 md:grid-cols-2">
						{#if statsLoading}
							<div class="col-span-full">
								<Card>
									<div class="flex items-center justify-center py-8">
										<span class="icon-[svg-spinners--ring-resize] h-6 w-6 text-blue-600"></span>
										<span class="ms-2 text-gray-600">Loading capacity stats...</span>
									</div>
								</Card>
							</div>
						{:else if capacityStats && capacityStats.length > 0}
							{#each capacityStats as stat}
								{@const config = currencyConfig[stat.currency]}
								{#if config}
									<div
										class="relative overflow-hidden rounded-2xl bg-gradient-to-br {config.color} p-6 text-white shadow-lg"
									>
										<div class="relative z-10">
											<div class="flex items-center justify-between">
												<div class="flex items-center space-x-3">
													<CurrencyIcon
														currency={stat.currency}
														showLabel={true}
														size="lg"
														class="text-white"
													/>
												</div>
											</div>
											<div class="mt-4">
												<div class="text-3xl font-bold">
													{formatCurrency(stat.amount || 0, stat.currency)}
												</div>
												<p class="mt-1 text-sm text-white/90">Available Balance</p>
											</div>
										</div>
										<!-- Decorative background pattern -->
										<div class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
										<div class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5"></div>
									</div>
								{/if}
							{/each}
						{:else}
							<div class="col-span-full">
								<Card>
									<div class="py-8 text-center">
										<span
											class="icon-[heroicons--information-circle] mx-auto h-12 w-12 text-gray-400"
										></span>
										<p class="mt-2 text-gray-600">No capacity data available</p>
									</div>
								</Card>
							</div>
						{/if}
					</div>

					<!-- Actions Section -->
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h2 class="text-xl font-semibold text-gray-800">Recent Transactions</h2>
						<div class="flex gap-2">
							<Button
								variant="secondary"
								onClick={() => {
									getStats();
									getCapacityTransactions({
										limit: itemsPerPage,
										offset: (currentPage - 1) * itemsPerPage
									});
								}}
								loading={statsLoading || transactionsLoading}
							>
								<span class="icon-[heroicons--arrow-path] h-4 w-4"></span>
								Refresh
							</Button>
							<Button variant="gradient" onClick={() => (showAddForm = !showAddForm)}>
								<span class="icon-[heroicons--plus] h-4 w-4"></span>
								Add Transaction
							</Button>
						</div>
					</div>

					<!-- Add Transaction Form -->
					{#if showAddForm}
						<Card>
							<form
								class="flex flex-col gap-4"
								on:submit|preventDefault={() => {
									if (isFormValid && formData.currency !== '') {
										createCapacityTransaction({
											currency: formData.currency as 'USDT' | 'IRT',
											amount: parseFloat(formData.amount),
											description: formData.description
										});
									}
								}}
							>
								<div class="mb-4">
									<h3 class="text-lg font-medium text-gray-800">Add New Transaction</h3>
									<p class="text-sm text-gray-600">Create a new capacity transaction</p>
								</div>

								<div class="grid gap-4 md:grid-cols-2">
									<FormGroup label="Currency" required>
										<select
											bind:value={formData.currency}
											class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 placeholder-gray-400 shadow-sm transition-all duration-200 ease-in-out focus:border-transparent focus:shadow-md focus:ring-2 focus:shadow-blue-100 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
											required
										>
											<option value="" disabled>Select currency</option>
											{#each currencyOptions as option}
												<option value={option.value}>{option.label}</option>
											{/each}
										</select>
									</FormGroup>

									<FormGroup label="Amount" required>
										<Input
											id="capacity-amount"
											name="capacity-amount"
											bind:value={formData.amount}
											type="number"
											placeholder="Enter amount (positive or negative)"
											required
										/>
									</FormGroup>
								</div>

								<FormGroup label="Description" required>
									<Input
										id="capacity-desc"
										name="capacity-desc"
										bind:value={formData.description}
										placeholder="Enter transaction description"
										required
									/>
								</FormGroup>

								<div class="flex gap-2 pt-4">
									<Button
										type="submit"
										variant="gradient-success"
										disabled={!isFormValid}
										loading={createLoading}
									>
										<span class="icon-[heroicons--check] h-4 w-4"></span>
										Create Transaction
									</Button>
									<Button type="button" variant="secondary" onClick={resetForm}>
										<span class="icon-[heroicons--x-mark] h-4 w-4"></span>
										Cancel
									</Button>
								</div>
							</form>
						</Card>
					{/if}

					<!-- Transactions Table -->
					<Card>
						<DataTable
							data={transactions || []}
							columns={transactionColumns}
							loading={transactionsLoading}
							totalItems={totalCount}
							{currentPage}
							{itemsPerPage}
							onPageChange={(page) => {
								currentPage = page;

								getCapacityTransactions({
									limit: itemsPerPage,
									offset: (currentPage - 1) * itemsPerPage
								});
							}}
							showPagination={true}
						/>
					</Card>
				</CreateCapacityTransactionProvider>
			</GetCapacityTransactionsProvider>
		</GetSystemCapacityStatsProvider>
	</div>
</PanelPageWrapper>
