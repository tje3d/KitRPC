<script lang="ts">
	import { formatCurrency } from '$lib/helpers/utils.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import TransactionHistoryProvider from '$lib/providers/TransactionHistoryProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { CurrencyType, TransactionStatus, TransactionType } from '@prisma/client';
	import { onMount } from 'svelte';

	// Types for our filters
	type TransactionFilters = Parameters<typeof transactionProvider.getHistory>[0];

	// Provider reference
	let transactionProvider: TransactionHistoryProvider;

	// State
	let error: string | null = null;

	// Pagination
	let currentPage = 1;
	const itemsPerPage = 10;

	// Filters
	let filters: TransactionFilters = {};

	// Filter options
	const transactionTypes = [
		{ value: 'DEPOSIT', label: 'واریز' },
		{ value: 'WITHDRAWAL', label: 'برداشت' },
		{ value: 'TRANSFER', label: 'انتقال' }
	];

	const currencyTypes = [
		{ value: 'IRT', label: 'IRT' },
		{ value: 'USDT', label: 'USDT' }
	];

	const transactionStatuses = [
		{ value: 'PENDING', label: 'در انتظار' },
		{ value: 'COMPLETED', label: 'تکمیل شده' },
		{ value: 'FAILED', label: 'ناموفق' },
		{ value: 'CANCELLED', label: 'لغو شده' }
	];

	// Selected filter values
	let selectedTypes: Record<string, boolean> = {};
	let selectedCurrencies: Record<string, boolean> = {};
	let selectedStatuses: Record<string, boolean> = {};
	let fromDate = '';
	let toDate = '';

	// Fetch transactions with current filters and pagination
	function fetchTransactions() {
		// Build filter object for the API call
		const apiFilters: TransactionFilters = {
			limit: itemsPerPage,
			offset: (currentPage - 1) * itemsPerPage
		};

		// Add filters if they exist
		if (filters.type) apiFilters.type = filters.type;
		if (filters.currency) apiFilters.currency = filters.currency;
		if (filters.status) apiFilters.status = filters.status;
		if (filters.fromDate) apiFilters.fromDate = filters.fromDate;
		if (filters.toDate) apiFilters.toDate = filters.toDate;

		transactionProvider.getHistory(apiFilters);
	}

	// Apply filters
	function applyFilters() {
		// Reset to first page when filters change
		currentPage = 1;

		// Build filters object
		filters = {};

		// For this implementation, we'll use the first selected value for each filter type
		// In a more complex implementation, you might want to support multiple selections
		const selectedType = Object.keys(selectedTypes).find((key) => selectedTypes[key]);
		if (selectedType) filters.type = selectedType as TransactionType;

		const selectedCurrency = Object.keys(selectedCurrencies).find((key) => selectedCurrencies[key]);
		if (selectedCurrency) filters.currency = selectedCurrency as CurrencyType;

		const selectedStatus = Object.keys(selectedStatuses).find((key) => selectedStatuses[key]);
		if (selectedStatus) filters.status = selectedStatus as TransactionStatus;

		// Set fromDate to start of day (00:00:00)
		if (fromDate) {
			const fromDateObj = new Date(fromDate);
			fromDateObj.setHours(0, 0, 0, 0);
			filters.fromDate = fromDateObj;
		}

		// Set toDate to end of day (23:59:59.999)
		if (toDate) {
			const toDateObj = new Date(toDate);
			toDateObj.setHours(23, 59, 59, 999);
			filters.toDate = toDateObj;
		}

		fetchTransactions();
	}

	// Reset all filters
	function resetFilters() {
		selectedTypes = {};
		selectedCurrencies = {};
		selectedStatuses = {};
		fromDate = '';
		toDate = '';
		filters = {};
		currentPage = 1;
		fetchTransactions();
	}

	// Handle sorting (for future implementation)
	function handleSortChange(key: string, direction: 'asc' | 'desc') {
		// For now, we'll just log the sort change
		// In the future, this can be implemented to send sort parameters to the API
		console.log('Sort changed:', key, direction);
	}

	// Get type icon
	function getTypeIcon(type: string): string {
		switch (type) {
			case 'DEPOSIT':
				return 'icon-[heroicons--arrow-down-tray]';
			case 'WITHDRAWAL':
				return 'icon-[heroicons--arrow-up-tray]';
			case 'TRANSFER':
				return 'icon-[heroicons--arrows-right-left]';
			default:
				return 'icon-[heroicons--currency-dollar]';
		}
	}

	// Define columns for the DataTable
	const columns = [
		{
			key: 'type',
			label: 'نوع',
			render: (value: string, row: any) => `
				<div class="flex items-center">
					<span class="${getTypeIcon(value)} h-5 w-5 text-gray-500"></span>
					<span class="ms-2 text-sm font-medium text-gray-900">${value}</span>
				</div>
			`
		},
		{
			key: 'amount',
			label: 'مبلغ',
			render: (value: number, row: any) => {
				return formatCurrency(value, row.currency);
			}
		},
		{
			key: 'status',
			label: 'وضعیت',
			sortable: true,
			render: (value: string) => {
				// Map status values to badge variants
				const statusMap: Record<string, string> = {
					COMPLETED: 'success',
					PENDING: 'pending',
					FAILED: 'error',
					CANCELLED: 'info'
				};

				const statusVariant = statusMap[value] || 'info';
				const statusLabel = value.charAt(0) + value.slice(1).toLowerCase();

				return `
					<div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
						${statusVariant === 'success' ? 'bg-green-100 text-green-800 border-green-200' : ''}
						${statusVariant === 'pending' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
						${statusVariant === 'error' ? 'bg-red-100 text-red-800 border-red-200' : ''}
						${statusVariant === 'info' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}">
						<span class="me-1.5 h-3 w-3
						${statusVariant === 'success' ? 'text-green-600' : ''}
						${statusVariant === 'pending' ? 'text-gray-600' : ''}
						${statusVariant === 'error' ? 'text-red-600' : ''}
						${statusVariant === 'info' ? 'text-blue-600' : ''}
						${
							statusVariant === 'success'
								? 'icon-[heroicons--check-circle]'
								: statusVariant === 'pending'
									? 'icon-[heroicons--clock]'
									: statusVariant === 'error'
										? 'icon-[heroicons--x-circle]'
										: 'icon-[heroicons--information-circle]'
						}">
						</span>
						<span>${statusLabel}</span>
					</div>
				`;
			}
		},
		{
			key: 'createdAt',
			label: 'تاریخ',
			sortable: true,
			render: (value: Date) => `
				<div class="text-sm whitespace-nowrap text-gray-500">
					${value.toLocaleDateString()}
				</div>
			`
		},
		{
			key: 'description',
			label: 'توضیحات',
			render: (value: string) => `
				<div class="text-sm text-gray-500">
					${value || '-'}
				</div>
			`
		}
	];

	// Load transactions when component mounts
	onMount(() => {
		fetchTransactions();
	});
</script>

<TransactionHistoryProvider
	bind:this={transactionProvider}
	let:loading
	let:clearError
	let:transactions
	let:totalCount
	onError={(message) => toast.error(message || 'Failed to fetch transactions')}
>
	<PanelPageWrapper title="تاریخچه تراکنش‌ها" description="مشاهده و فیلتر تاریخچه تراکنش‌های شما.">
		<!-- Filters Section -->
		<Card variant="flat" className="mb-6">
			<!-- Filter Header with Toggle -->
			<div class="flex items-center justify-between border-b border-gray-200 pb-4">
				<div class="flex items-center space-x-2">
					<span class="icon-[heroicons--funnel] h-5 w-5 text-gray-500"></span>
					<h2 class="text-lg font-semibold text-gray-800">فیلترها</h2>
				</div>
				<div class="flex items-center space-x-3">
					<Button size="sm" variant="secondary" onClick={resetFilters}>
						<span class="icon-[heroicons--arrow-path] me-1 h-4 w-4"></span>
						بازنشانی
					</Button>
					<Button size="sm" onClick={applyFilters}>
						<span class="icon-[heroicons--magnifying-glass] me-1 h-4 w-4"></span>
						اعمال
					</Button>
				</div>
			</div>

			<!-- Quick Filter Pills -->
			<div class="py-4">
				<div class="flex flex-wrap items-center gap-3">
					<!-- Transaction Type Pills -->
					<div class="flex items-center space-x-2">
						<span class="text-sm font-medium text-gray-600">نوع:</span>
						<div class="flex space-x-1">
							{#each transactionTypes as type}
								<button
									class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors
										{selectedTypes[type.value]
										? 'border border-blue-200 bg-blue-100 text-blue-800'
										: 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'}"
									on:click={() => {
										selectedTypes = {};
										if (!selectedTypes[type.value]) {
											selectedTypes[type.value] = true;
										}
									}}
								>
									<span class="{getTypeIcon(type.value)} me-1 h-3 w-3"></span>
									{type.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Currency Pills -->
					<div class="flex items-center space-x-2">
						<span class="text-sm font-medium text-gray-600">ارز:</span>
						<div class="flex space-x-1">
							{#each currencyTypes as currency}
								<button
									class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors
										{selectedCurrencies[currency.value]
										? 'border border-green-200 bg-green-100 text-green-800'
										: 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'}"
									on:click={() => {
										selectedCurrencies = {};
										if (!selectedCurrencies[currency.value]) {
											selectedCurrencies[currency.value] = true;
										}
									}}
								>
									<span class="icon-[heroicons--currency-dollar] me-1 h-3 w-3"></span>
									{currency.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Status Pills -->
					<div class="flex items-center space-x-2">
						<span class="text-sm font-medium text-gray-600">وضعیت:</span>
						<div class="flex space-x-1">
							{#each transactionStatuses as status}
								<button
									class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors
										{selectedStatuses[status.value]
										? status.value === 'COMPLETED'
											? 'border border-green-200 bg-green-100 text-green-800'
											: status.value === 'PENDING'
												? 'border border-yellow-200 bg-yellow-100 text-yellow-800'
												: status.value === 'FAILED'
													? 'border border-red-200 bg-red-100 text-red-800'
													: 'border border-gray-200 bg-gray-100 text-gray-800'
										: 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'}"
									on:click={() => {
										selectedStatuses = {};
										if (!selectedStatuses[status.value]) {
											selectedStatuses[status.value] = true;
										}
									}}
								>
									<span
										class="me-1 h-3 w-3 {status.value === 'COMPLETED'
											? 'icon-[heroicons--check-circle]'
											: status.value === 'PENDING'
												? 'icon-[heroicons--clock]'
												: status.value === 'FAILED'
													? 'icon-[heroicons--x-circle]'
													: 'icon-[heroicons--information-circle]'}"
									></span>
									{status.label}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Advanced Filters (Collapsible) -->
			<div class="border-t border-gray-200 pt-4">
				<div class="flex flex-col space-y-4 sm:flex-row sm:items-end sm:space-y-0 sm:space-x-4">
					<!-- Date Range -->
					<div class="flex-1">
						<label class="mb-2 block text-sm font-medium text-gray-700">
							<span class="icon-[heroicons--calendar-days] me-1 h-4 w-4"></span>
							بازه زمانی
						</label>
						<div class="flex space-x-2">
							<div class="flex-1">
								<Input
									type="date"
									id="fromDate"
									name="fromDate"
									bind:value={fromDate}
									placeholder="از تاریخ"
									className="text-sm"
								/>
							</div>
							<div class="flex items-center">
								<span class="text-gray-400">تا</span>
							</div>
							<div class="flex-1">
								<Input
									type="date"
									id="toDate"
									name="toDate"
									bind:value={toDate}
									placeholder="تا تاریخ"
									className="text-sm"
								/>
							</div>
						</div>
					</div>

					<!-- Quick Date Presets -->
					<div class="flex space-x-2">
						<button
							class="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
							on:click={() => {
								const today = new Date();
								const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
								fromDate = lastWeek.toISOString().split('T')[0];
								toDate = today.toISOString().split('T')[0];
							}}
						>
							۷ روز گذشته
						</button>
						<button
							class="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
							on:click={() => {
								const today = new Date();
								const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
								fromDate = lastMonth.toISOString().split('T')[0];
								toDate = today.toISOString().split('T')[0];
							}}
						>
							۳۰ روز گذشته
						</button>
						<button
							class="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
							on:click={() => {
								fromDate = '';
								toDate = '';
							}}
						>
							پاک کردن
						</button>
					</div>
				</div>
			</div>
		</Card>

		<!-- Loading State -->
		{#if loading}
			<div class="flex justify-center py-12">
				<span class="icon-[svg-spinners--bars-scale-fade] h-8 w-8 text-blue-500"></span>
			</div>
		{/if}

		<!-- Error State -->
		{#if error}
			<Card variant="flat" className="mb-6">
				<div class="rounded-md bg-red-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<span class="icon-[heroicons--x-circle] h-5 w-5 text-red-400"></span>
						</div>
						<div class="ms-3">
							<h3 class="text-sm font-medium text-red-800">خطا در بارگذاری تراکنش‌ها</h3>
							<div class="mt-2 text-sm text-red-700">
								<p>{error}</p>
								<button
									class="mt-2 text-sm text-red-600 underline hover:text-red-500"
									on:click={() => {
										error = null;
										clearError();
									}}
								>
									رد
								</button>
							</div>
						</div>
					</div>
				</div>
			</Card>
		{/if}

		<!-- Transactions Table -->
		{#if !loading && !error}
			<Card variant="flat">
				<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 class="text-lg font-bold text-gray-800">تراکنش‌ها</h2>
						<p class="mt-1 text-sm text-gray-600">فهرست تاریخچه تراکنش‌های شما</p>
					</div>
				</div>

				{#if transactions?.length === 0}
					<div class="py-12 text-center">
						<div class="mx-auto h-12 w-12 text-gray-400">
							<span class="icon-[heroicons--document-text] h-12 w-12"></span>
						</div>
						<h3 class="mt-2 text-sm font-medium text-gray-900">هیچ تراکنشی یافت نشد</h3>
						<p class="mt-1 text-sm text-gray-500">
							سعی کنید فیلترهای خود را تغییر دهید تا آنچه را که به دنبالش هستید پیدا کنید.
						</p>
					</div>
				{:else}
					<DataTable
						data={transactions?.map((r) => ({
							...r,
							createdAt: new Date(r.createdAt),
							updatedAt: new Date(r.updatedAt)
						}))}
						{columns}
						{itemsPerPage}
						totalItems={totalCount}
						{currentPage}
						showPagination={totalCount > itemsPerPage}
						showSearch={false}
						onPageChange={(page) => {
							if (page < 1 || page > Math.ceil(totalCount / itemsPerPage)) return;
							currentPage = page;
							fetchTransactions();
						}}
						onSortChange={handleSortChange}
					/>
				{/if}
			</Card>
		{/if}
	</PanelPageWrapper>
</TransactionHistoryProvider>
