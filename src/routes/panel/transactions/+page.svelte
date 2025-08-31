<script lang="ts">
	import { renderCurrencyWithIcon } from '$lib/helpers/Currency.helper';
	import {
		createDateFilter,
		FilterManager,
		getSelectedValue,
		type FilterGroup
	} from '$lib/helpers/filter.helper';
	import { getTransactionTypeIcon, getTransactionTypeLabel } from '$lib/helpers/transaction.helper';
	import { formatCurrency } from '$lib/helpers/utils.helper';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import DTColumn from '$lib/kit/DTColumn.svelte';
	import FilterPanel from '$lib/kit/FilterPanel.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import StatusBadge from '$lib/kit/StatusBadge.svelte';
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
				},
				{
					value: 'SELL_USDT',
					label: 'فروش USDT',
					icon: 'icon-[heroicons--arrow-trending-down]',
					colorScheme: 'red' as const
				},
				{
					value: 'BUY_USDT',
					label: 'خرید USDT',
					icon: 'icon-[heroicons--arrow-trending-up]',
					colorScheme: 'green' as const
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
			<Card variant="elevated" className="mb-6">
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
			<Card variant="elevated">
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
						{itemsPerPage}
						totalItems={totalCount}
						{currentPage}
						showPagination={totalCount > itemsPerPage}
						showSearch={false}
						onPageChange={(page) => {
							if (page < 1 || page > Math.ceil(totalCount / itemsPerPage)) return;
							filterManager.handlePageChange(page);
						}}
					>
						<svelte:fragment slot="header">
							<DTColumn>
								<svelte:fragment slot="header">نوع</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">مبلغ</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">ارز</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">وضعیت</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">تاریخ</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">توضیحات</svelte:fragment>
							</DTColumn>
						</svelte:fragment>

						<svelte:fragment slot="row" let:row>
							<!-- Type Column -->
							<DTColumn>
								<div class="flex items-center">
									<span class="{getTransactionTypeIcon(row.type)} me-2 size-5 text-gray-500"></span>
									<span class="text-sm font-medium text-gray-900"
										>{getTransactionTypeLabel(row.type)}</span
									>
								</div>
							</DTColumn>

							<!-- Amount Column -->
							<DTColumn>
								<span class="font-medium text-gray-900"
									>{formatCurrency(row.amount, row.currency)}</span
								>
							</DTColumn>

							<!-- Currency Column -->
							<DTColumn>
								{@html renderCurrencyWithIcon(row.currency)}
							</DTColumn>

							<!-- Status Column -->
							<DTColumn>
								<StatusBadge status={row.status} />
							</DTColumn>

							<!-- Date Column -->
							<DTColumn className="text-gray-500">
								{row.createdAt.toLocaleString('fa-IR')}
							</DTColumn>

							<!-- Description Column -->
							<DTColumn className="text-gray-500">
								{row.description || '-'}
							</DTColumn>
						</svelte:fragment>
					</DataTable>
				{/if}
			</Card>
		{/if}
	</PanelPageWrapper>
</TransactionHistoryProvider>
