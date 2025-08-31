<script lang="ts">
	import { base } from '$app/paths';
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import {
		createDateFilter,
		FilterManager,
		getInputValue,
		getSelectedValue,
		type FilterGroup,
		type InputField
	} from '$lib/helpers/filter.helper';
	import { DataTable, FilterPanel, PanelPageWrapper } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import DTActionButton from '$lib/kit/DTActionButton.svelte';
	import DTColumn from '$lib/kit/DTColumn.svelte';
	import MediaProvider from '$lib/providers/MediaProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { RouterInputs } from '$lib/trpc/router';
	import { MediaReason, MediaVisibility } from '@prisma/client';
	import { tick } from 'svelte';

	type AdminListMediaRequestParams = RouterInputs['media']['adminList'];

	// State
	const pageSize = 10;
	let mediaProvider: MediaProvider;

	// Filter configuration
	const filterGroups: FilterGroup[] = [
		{
			label: 'دلیل',
			options: Object.values(MediaReason).map((reason) => ({
				value: reason,
				label: reason.replace(/_/g, ' '),
				colorScheme: 'blue' as const
			})),
			selected: {},
			multiSelect: false
		},
		{
			label: 'نمایش',
			options: Object.values(MediaVisibility).map((visibility) => ({
				value: visibility,
				label: visibility.charAt(0) + visibility.slice(1).toLowerCase(),
				colorScheme: visibility === 'PUBLIC' ? ('green' as const) : ('purple' as const)
			})),
			selected: {},
			multiSelect: false
		}
	];

	const inputFields: InputField[] = [
		{
			id: 'filename',
			name: 'filename',
			type: 'text',
			placeholder: 'فیلتر دقیق بر اساس نام فایل',
			value: '',
			colSpan: 2
		}
	];

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 بایت';
		const k = 1024;
		const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	// Filter Manager setup
	const filterManager = new FilterManager<AdminListMediaRequestParams>({
		filterGroups,
		inputFields,
		onApply: (filters, page) => {
			const apiFilters: AdminListMediaRequestParams = {
				page,
				limit: pageSize,
				...filters
			};
			mediaProvider.adminListMedia(apiFilters);
		},
		buildFilters: (state) => {
			const filters: Partial<AdminListMediaRequestParams> = {};

			const selectedReason = getSelectedValue(state.filterGroups, 'دلیل');
			if (selectedReason) filters.reason = selectedReason as MediaReason;

			const selectedVisibility = getSelectedValue(state.filterGroups, 'نمایش');
			if (selectedVisibility) filters.visibility = selectedVisibility as MediaVisibility;

			const filename = getInputValue(state.inputFields, 'filename');
			if (filename) filters.filename = filename;

			const startDate = createDateFilter(state.startDate);
			if (startDate) filters.startDate = startDate;

			const endDate = createDateFilter(state.endDate, true);
			if (endDate) filters.endDate = endDate;

			return filters as AdminListMediaRequestParams;
		}
	});

	// Get reactive state from filter manager
	const filterStateStore = filterManager.stateStore;
	$: filterState = $filterStateStore;
	$: ({
		filterGroups: reactiveFilterGroups,
		inputFields: reactiveInputFields,
		startDate,
		endDate,
		currentPage
	} = filterState);
</script>

<PanelPageWrapper title="مدیریت رسانه" description="مدیریت تمام فایل‌های رسانه‌ای در سیستم">
	<MediaProvider
		bind:this={mediaProvider}
		onDeleteSuccess={() => {
			toast.success('رسانه با موفقیت حذف شد');
			// Refresh media list after successful deletion
			const state = filterManager.getState();
			const filters = filterManager['config'].buildFilters(state);
			mediaProvider.adminListMedia({ page: state.currentPage, limit: pageSize, ...filters });
		}}
		onDeleteError={(error) => {
			toast.error(error || 'حذف رسانه با خطا مواجه شد');
		}}
		let:media
		let:pagination
		let:statistics
		let:listLoading
		let:statsLoading
		let:listErrorMessage
		let:statsErrorMessage
		let:deleteLoading
		let:adminListMedia
		let:loadStatistics
		let:deleteMedia
	>
		<!-- Statistics Summary Cards -->
		<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Total Media Count -->
			<Card variant="elevated" compact className="border-s-4 border-s-blue-500">
				<div class="flex items-center">
					<div class="flex-shrink-0 rounded-full bg-blue-100 p-3">
						<span class="icon-[heroicons--photo] block h-6 w-6 text-blue-600"></span>
					</div>
					<div class="ms-4">
						<p class="text-sm font-medium text-gray-500">کل رسانه‌ها</p>
						{#if statsLoading}
							<div class="mt-1 h-6 w-20 animate-pulse rounded bg-gray-200"></div>
						{:else}
							<p class="text-2xl font-semibold text-gray-900">{statistics?.totalCount ?? 0}</p>
						{/if}
					</div>
				</div>
			</Card>

			<!-- Total File Size -->
			<Card variant="elevated" compact className="border-s-4 border-s-green-500">
				<div class="flex items-center">
					<div class="flex-shrink-0 rounded-full bg-green-100 p-3">
						<span class="icon-[heroicons--server-stack] block h-6 w-6 text-green-600"></span>
					</div>
					<div class="ms-4">
						<p class="text-sm font-medium text-gray-500">حجم کل</p>
						{#if statsLoading}
							<div class="mt-1 h-6 w-20 animate-pulse rounded bg-gray-200"></div>
						{:else}
							<p class="text-2xl font-semibold text-gray-900">
								{formatFileSize(statistics?.totalFileSize ?? 0)}
							</p>
						{/if}
					</div>
				</div>
			</Card>

			<!-- Public Media Count -->
			<Card variant="elevated" compact className="border-s-4 border-s-yellow-500">
				<div class="flex items-center">
					<div class="flex-shrink-0 rounded-full bg-yellow-100 p-3">
						<span class="icon-[heroicons--eye] block h-6 w-6 text-yellow-600"></span>
					</div>
					<div class="ms-4">
						<p class="text-sm font-medium text-gray-500">رسانه‌های عمومی</p>
						{#if statsLoading}
							<div class="mt-1 h-6 w-20 animate-pulse rounded bg-gray-200"></div>
						{:else}
							<p class="text-2xl font-semibold text-gray-900">
								{statistics?.visibilityDistribution?.PUBLIC ?? 0}
							</p>
						{/if}
					</div>
				</div>
			</Card>

			<!-- Private Media Count -->
			<Card variant="elevated" compact className="border-s-4 border-s-purple-500">
				<div class="flex items-center">
					<div class="flex-shrink-0 rounded-full bg-purple-100 p-3">
						<span class="icon-[heroicons--lock-closed] block h-6 w-6 text-purple-600"></span>
					</div>
					<div class="ms-4">
						<p class="text-sm font-medium text-gray-500">رسانه‌های خصوصی</p>
						{#if statsLoading}
							<div class="mt-1 h-6 w-20 animate-pulse rounded bg-gray-200"></div>
						{:else}
							<p class="text-2xl font-semibold text-gray-900">
								{statistics?.visibilityDistribution?.PRIVATE ?? 0}
							</p>
						{/if}
					</div>
				</div>
			</Card>
		</div>

		{#if statsErrorMessage}
			<Card variant="elevated" className="mb-6">
				<div class="rounded-lg border border-red-200 bg-red-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--exclamation-circle] me-2 h-5 w-5 text-red-500"></span>
						<span class="text-red-700">{statsErrorMessage}</span>
					</div>
				</div>
			</Card>
		{/if}

		<!-- Filters Section -->
		<FilterPanel
			filterGroups={reactiveFilterGroups}
			inputFields={reactiveInputFields}
			showDateRange={true}
			bind:startDate
			bind:endDate
			startLabel="تاریخ شروع فیلتر"
			endLabel="تاریخ پایان فیلتر"
			startPlaceholder="انتخاب تاریخ شروع"
			endPlaceholder="انتخاب تاریخ پایان"
			allowSameDate={true}
			on:filterChange={filterManager.handleFilterChange.bind(filterManager)}
			on:reset={filterManager.handleFilterReset.bind(filterManager)}
			on:apply={filterManager.handleFilterApply.bind(filterManager)}
		/>

		{#if listErrorMessage}
			<Card variant="elevated" className="mb-6">
				<div class="rounded-lg border border-red-200 bg-red-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--exclamation-circle] me-2 h-5 w-5 text-red-500"></span>
						<span class="text-red-700">{listErrorMessage}</span>
					</div>
				</div>
			</Card>
		{/if}

		<Card variant="elevated">
			<DataTable
				data={media}
				itemsPerPage={pageSize}
				totalItems={pagination?.total || 0}
				{currentPage}
				onPageChange={(page) => {
					filterManager.handlePageChange(page);
				}}
				showPagination={true}
				loading={listLoading}
			>
				<svelte:fragment slot="header" let:handleSort let:getSortIcon>
					<DTColumn sortable={true} sortKey="id" onSort={handleSort} {getSortIcon}>
						<svelte:fragment slot="header">شناسه</svelte:fragment>
					</DTColumn>
					<DTColumn sortable={true} sortKey="filename" onSort={handleSort} {getSortIcon}>
						<svelte:fragment slot="header">نام فایل</svelte:fragment>
					</DTColumn>
					<DTColumn sortable={true} sortKey="reason" onSort={handleSort} {getSortIcon}>
						<svelte:fragment slot="header">دلیل</svelte:fragment>
					</DTColumn>
					<DTColumn sortable={true} sortKey="visibility" onSort={handleSort} {getSortIcon}>
						<svelte:fragment slot="header">نمایش</svelte:fragment>
					</DTColumn>
					<DTColumn sortable={true} sortKey="owner" onSort={handleSort} {getSortIcon}>
						<svelte:fragment slot="header">مالک</svelte:fragment>
					</DTColumn>
					<DTColumn sortable={true} sortKey="fileSize" onSort={handleSort} {getSortIcon}>
						<svelte:fragment slot="header">اندازه</svelte:fragment>
					</DTColumn>
					<DTColumn sortable={true} sortKey="createdAt" onSort={handleSort} {getSortIcon}>
						<svelte:fragment slot="header">آپلود شده</svelte:fragment>
					</DTColumn>
					<DTColumn>
						<svelte:fragment slot="header">عملیات</svelte:fragment>
					</DTColumn>
				</svelte:fragment>

				<svelte:fragment slot="row" let:row>
					<DTColumn className="font-medium text-gray-900">
						<div class="font-mono text-sm">
							{row.id.substring(0, 8)}
						</div>
					</DTColumn>
					<DTColumn>
						<div class="flex items-center">
							<div class="h-10 w-10 flex-shrink-0">
								{#if row.mimeType.startsWith('image/')}
									<img
										src="/{row.storagePath}"
										alt={row.originalName}
										class="h-10 w-10 rounded object-cover"
									/>
								{:else}
									<div class="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
										<span class="icon-[heroicons--document-text] h-6 w-6 text-gray-500"></span>
									</div>
								{/if}
							</div>
							<div class="ms-4">
								<div class="text-sm font-medium text-gray-900">{row.originalName}</div>
								<div class="text-sm text-gray-500">{row.filename}</div>
							</div>
						</div>
					</DTColumn>
					<DTColumn>
						<span
							class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
							>{row.reason}</span
						>
					</DTColumn>
					<DTColumn>
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {row.visibility ===
							MediaVisibility.PUBLIC
								? 'bg-green-100 text-green-800'
								: 'bg-yellow-100 text-yellow-800'}">{row.visibility}</span
						>
					</DTColumn>
					<DTColumn>
						{#if row.owner}
							<div class="text-sm font-medium text-gray-900">{row.owner.username}</div>
							<div class="text-sm text-gray-500">{row.owner.id.substring(0, 8)}</div>
						{:else}
							<span class="text-gray-500">نامشخص</span>
						{/if}
					</DTColumn>
					<DTColumn>
						<span class="text-sm text-gray-900">{formatFileSize(row.fileSize)}</span>
					</DTColumn>
					<DTColumn>
						{row.createdAt.toLocaleDateString('fa-IR')}
					</DTColumn>
					<DTColumn>
						<div class="flex items-center justify-end gap-2">
							<DTActionButton
								variant="view"
								href={`${base}/media/${row.id}`}
								target="_blank"
								title="مشاهده رسانه"
								ariaLabel="مشاهده"
								icon="icon-[heroicons--magnifying-glass]"
							/>
							<DTActionButton
								variant="delete"
								title="حذف رسانه"
								ariaLabel="حذف"
								icon="icon-[heroicons--x-mark]"
								onClick={() => {
									dialogStore.open({
										component: ConfirmDialog,
										props: {
											title: 'حذف رسانه',
											message: `آیا مطمئن هستید که می‌خواهید رسانه "${row.originalName}" را حذف کنید؟ این عمل قابل بازگشت نیست.`,
											confirm: 'حذف',
											cancel: 'لغو',
											color: 'red',
											onConfirm: () => {
												history.back();
												tick().then(() => {
													deleteMedia({ id: row.id });
												});
											}
										}
									});
								}}
							/>
						</div>
					</DTColumn>
				</svelte:fragment>

				<div slot="empty" class="py-8 text-center">
					<span class="icon-[heroicons--folder-open] mx-auto h-12 w-12 text-gray-400"></span>
					<h3 class="mt-2 text-sm font-medium text-gray-900">فایل رسانه‌ای وجود ندارد</h3>
					<p class="mt-1 text-sm text-gray-500">با آپلود فایل‌های رسانه‌ای شروع کنید.</p>
				</div>
			</DataTable>
		</Card>
	</MediaProvider>
</PanelPageWrapper>
