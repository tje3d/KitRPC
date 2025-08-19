<script lang="ts">
	import { renderCurrencyWithIcon } from '$lib/helpers/Currency.helper';
	import {
		createDateFilter,
		FilterManager,
		getSelectedValue,
		type FilterGroup
	} from '$lib/helpers/filter.helper';
	import { formatCurrency } from '$lib/helpers/utils.helper';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import FilterPanel from '$lib/kit/FilterPanel.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import TransactionHistoryProvider from '$lib/providers/TransactionHistoryProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { CurrencyType, TransactionStatus, TransactionType } from '@prisma/client';

	// Types for our filters
	type TransactionFilters = Parameters<typeof transactionProvider.getHistory>[0];

	// Provider reference
	let transactionProvider: TransactionHistoryProvider;

	// State
	let error: string | null = null;
	const itemsPerPage = 10;

	// Filter configuration
	const filterGroups: FilterGroup[] = [
		{
			label: 'نوع',
			options: [
				{
					value: 'DEPOSIT',
					label: 'واریز',
					icon: 'icon-[heroicons--arrow-down-tray]',
					colorScheme: 'blue' as const
				},
				{
					value: 'WITHDRAWAL',
					label: 'برداشت',
					icon: 'icon-[heroicons--arrow-up-tray]',
					colorScheme: 'blue' as const
				},
				{
					value: 'TRANSFER',
					label: 'انتقال',
					icon: 'icon-[heroicons--arrows-right-left]',
					colorScheme: 'blue' as const
				}
			],
			selected: {} as Record<string, boolean>,
			multiSelect: false
		},
		{
			label: 'ارز',
			options: [
				{
					value: 'IRT',
					label: 'IRT',
					colorScheme: 'green' as const
				},
				{
					value: 'USDT',
					label: 'USDT',
					colorScheme: 'green' as const
				}
			],
			selected: {} as Record<string, boolean>,
			multiSelect: false
		},
		{
			label: 'وضعیت',
			options: [
				{
					value: 'PENDING',
					label: 'در انتظار',
					icon: 'icon-[heroicons--clock]',
					colorScheme: 'yellow' as const
				},
				{
					value: 'COMPLETED',
					label: 'تکمیل شده',
					icon: 'icon-[heroicons--check-circle]',
					colorScheme: 'green' as const
				},
				{
					value: 'FAILED',
					label: 'ناموفق',
					icon: 'icon-[heroicons--x-circle]',
					colorScheme: 'red' as const
				},
				{
					value: 'CANCELLED',
					label: 'لغو شده',
					icon: 'icon-[heroicons--information-circle]'
				}
			],
			selected: {},
			multiSelect: false
		}
	];

	// Filter Manager setup
	const filterManager = new FilterManager<TransactionFilters>({
		filterGroups,
		inputFields: [],
		onApply: (filters, page) => {
			const apiFilters: TransactionFilters = {
				limit: itemsPerPage,
				offset: (page - 1) * itemsPerPage,
				...filters
			};
			transactionProvider.getHistory(apiFilters);
		},
		buildFilters: (state) => {
			const filters: TransactionFilters = {};

			const selectedType = getSelectedValue(state.filterGroups, 'نوع');
			if (selectedType) filters.type = selectedType as TransactionType;

			const selectedCurrency = getSelectedValue(state.filterGroups, 'ارز');
			if (selectedCurrency) filters.currency = selectedCurrency as CurrencyType;

			const selectedStatus = getSelectedValue(state.filterGroups, 'وضعیت');
			if (selectedStatus) filters.status = selectedStatus as TransactionStatus;

			const fromDate = createDateFilter(state.startDate);
			if (fromDate) filters.fromDate = fromDate;

			const toDate = createDateFilter(state.endDate, true);
			if (toDate) filters.toDate = toDate;

			return filters;
		}
	});

	// Get reactive state from filter manager
	const filterStateStore = filterManager.stateStore;
	$: filterState = $filterStateStore;
	$: ({
		filterGroups: reactiveFilterGroups,
		inputFields,
		startDate,
		endDate,
		currentPage
	} = filterState);

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
				return `<span class="font-medium">${formatCurrency(value, row.currency)}</span>`;
			}
		},
		{
			key: 'currency',
			label: 'ارز',
			render: (value: CurrencyType) => {
				return renderCurrencyWithIcon(value);
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
					${value.toLocaleString('fa-IR')}
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
		<FilterPanel
			filterGroups={reactiveFilterGroups}
			{inputFields}
			showDateRange={true}
			bind:startDate
			bind:endDate
			startLabel="تاریخ شروع"
			endLabel="تاریخ پایان"
			startPlaceholder="از تاریخ"
			endPlaceholder="تا تاریخ"
			allowSameDate={true}
			on:filterChange={filterManager.handleFilterChange.bind(filterManager)}
			on:reset={filterManager.handleFilterReset.bind(filterManager)}
			on:apply={filterManager.handleFilterApply.bind(filterManager)}
		/>

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
							filterManager.handlePageChange(page);
						}}
						onSortChange={handleSortChange}
					/>
				{/if}
			</Card>
		{/if}
	</PanelPageWrapper>
</TransactionHistoryProvider>
