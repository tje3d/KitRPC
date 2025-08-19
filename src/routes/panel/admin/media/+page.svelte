<script lang="ts">
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
	import MediaProvider from '$lib/providers/MediaProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { MediaReason, MediaVisibility } from '@prisma/client';
	import { tick } from 'svelte';

	type Media = RouterOutputs['media']['adminList']['media'][0];
	type Pagination = RouterOutputs['media']['adminList']['pagination'];
	type Statistics = RouterOutputs['media']['adminStats'];
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

	// Helper functions (pure functions that don't interact with providers)
	function formatDate(date: string | Date) {
		return new Date(date).toLocaleDateString('fa-IR', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

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

	// DataTable columns configuration
	const columns = [
		{
			key: 'id',
			label: 'شناسه',
			sortable: true,
			render: (value: any, row: Media) => {
				return `
					<div class="font-mono text-sm">
						${row.id.substring(0, 8)}
					</div>
				`;
			}
		},
		{
			key: 'filename',
			label: 'نام فایل',
			sortable: true,
			render: (value: any, row: Media) => {
				return `
					<div class="flex items-center">
						<div class="flex-shrink-0 h-10 w-10">
							${
								row.mimeType.startsWith('image/')
									? `<img src="/${row.storagePath}" alt="${row.originalName}" class="h-10 w-10 rounded object-cover">`
									: `<div class="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
										<span class="icon-[heroicons--document-text] h-6 w-6 text-gray-500"></span>
									  </div>`
							}
						</div>
						<div class="ms-4">
							<div class="text-sm font-medium text-gray-900">${row.originalName}</div>
							<div class="text-sm text-gray-500">${row.filename}</div>
						</div>
					</div>
				`;
			}
		},
		{
			key: 'reason',
			label: 'دلیل',
			sortable: true,
			render: (value: any, row: Media) => {
				return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${row.reason}</span>`;
			}
		},
		{
			key: 'visibility',
			label: 'نمایش',
			sortable: true,
			render: (value: any, row: Media) => {
				const isPublic = row.visibility === MediaVisibility.PUBLIC;
				return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${row.visibility}</span>`;
			}
		},
		{
			key: 'owner',
			label: 'مالک',
			sortable: true,
			render: (value: any, row: Media) => {
				return row.owner
					? `
					<div class="text-sm font-medium text-gray-900">${row.owner.username}</div>
					<div class="text-sm text-gray-500">${row.owner.id.substring(0, 8)}</div>
				`
					: '<span class="text-gray-500">نامشخص</span>';
			}
		},
		{
			key: 'fileSize',
			label: 'اندازه',
			sortable: true,
			render: (value: any, row: Media) => {
				return `<span class="text-sm text-gray-900">${formatFileSize(row.fileSize)}</span>`;
			}
		},
		{
			key: 'createdAt',
			label: 'آپلود شده',
			sortable: true,
			render: (value: any, row: Media) => {
				return formatDate(row.createdAt);
			}
		},
		{
			key: 'actions',
			label: 'عملیات',
			render: (value: any, row: Media) => {
				return `
					<div class="flex items-center justify-end gap-2">
						<button
							class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							data-action="view"
							data-id="${row.id}"
							title="مشاهده رسانه"
						>
							<span class="icon-[heroicons--magnifying-glass] w-4 h-4"></span>
						</button>
						<button
							class="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							data-action="delete"
							data-id="${row.id}"
							title="حذف رسانه"
						>
							<span class="icon-[heroicons--x-mark] w-4 h-4"></span>
						</button>
					</div>
				`;
			}
		}
	];
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
			<Card variant="flat" compact className="border-s-4 border-s-blue-500">
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
			<Card variant="flat" compact className="border-s-4 border-s-green-500">
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
			<Card variant="flat" compact className="border-s-4 border-s-yellow-500">
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
			<Card variant="flat" compact className="border-s-4 border-s-purple-500">
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
			<Card variant="flat" className="mb-6">
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
			<Card variant="flat" className="mb-6">
				<div class="rounded-lg border border-red-200 bg-red-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--exclamation-circle] me-2 h-5 w-5 text-red-500"></span>
						<span class="text-red-700">{listErrorMessage}</span>
					</div>
				</div>
			</Card>
		{/if}

		<Card variant="flat">
			<div
				on:click={(e) => {
					const target = e.target as HTMLElement;
					const button = target.closest('button[data-action]');

					if (!button) return;

					const action = button.getAttribute('data-action');
					const id = button.getAttribute('data-id');

					if (!action || !id) return;

					switch (action) {
						case 'delete':
							// Find the media in the current list
							const mediaItem = media?.find((m) => m.id === id);
							if (mediaItem) {
								dialogStore.open({
									component: ConfirmDialog,
									props: {
										title: 'حذف رسانه',
										message: `آیا مطمئن هستید که می‌خواهید رسانه "${mediaItem.originalName}" را حذف کنید؟ این عمل قابل بازگشت نیست.`,
										confirm: 'حذف',
										cancel: 'لغو',
										color: 'red',
										onConfirm: () => {
											history.back();
											tick().then(() => {
												deleteMedia({ id: mediaItem.id });
											});
										}
									}
								});
							}
							break;
						case 'view':
							// Find the media in the current list
							const mediaToView = media?.find((m) => m.id === id);
							if (mediaToView) {
								// Open media in new tab
								window.open(`/media/${mediaToView.id}`, '_blank');
							}
							break;
					}
				}}
			>
				<DataTable
					data={media}
					{columns}
					itemsPerPage={pageSize}
					totalItems={pagination?.total || 0}
					{currentPage}
					onPageChange={(page) => {
						filterManager.handlePageChange(page);
					}}
					showPagination={true}
					loading={listLoading}
				>
					<div slot="empty" class="py-8 text-center">
						<span class="icon-[heroicons--folder-open] mx-auto h-12 w-12 text-gray-400"></span>
						<h3 class="mt-2 text-sm font-medium text-gray-900">فایل رسانه‌ای وجود ندارد</h3>
						<p class="mt-1 text-sm text-gray-500">با آپلود فایل‌های رسانه‌ای شروع کنید.</p>
					</div>
				</DataTable>
			</div>
		</Card>
	</MediaProvider>
</PanelPageWrapper>
