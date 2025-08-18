<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { Button, DataTable, PanelPageWrapper, Input, Select } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import { toast } from '$lib/toast/store';
	import MediaProvider from '$lib/providers/MediaProvider.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { tick } from 'svelte';
	import { MediaReason, MediaVisibility } from '@prisma/client';

	type Media = RouterOutputs['media']['adminList']['media'][0];
	type Pagination = RouterOutputs['media']['adminList']['pagination'];
	type Statistics = RouterOutputs['media']['adminStats'];

	// State
	let currentPage = 1;
	let pageSize = 10;
	let mediaProvider: MediaProvider;
	let searchTerm = '';
	let selectedReason: MediaReason | '' = '';
	let selectedVisibility: MediaVisibility | '' = '';
	let ownerId = '';
	let startDate: string = '';
	let endDate: string = '';

	// Load media and statistics on component mount
	$: {
		if (mediaProvider) {
			loadMedia();
			loadStatistics();
		}
	}

	function loadMedia() {
		const filters: any = {
			page: currentPage,
			limit: pageSize
		};

		// Add search term if provided
		if (searchTerm) {
			// For simplicity, we'll use ownerId filter for search term
			// In a real implementation, you might want a separate search field
			filters.ownerId = searchTerm;
		}

		// Add reason filter if selected
		if (selectedReason) {
			filters.reason = selectedReason;
		}

		// Add visibility filter if selected
		if (selectedVisibility) {
			filters.visibility = selectedVisibility;
		}

		// Add owner ID filter if provided
		if (ownerId) {
			filters.ownerId = ownerId;
		}

		mediaProvider.adminListMedia(filters);
	}

	function loadStatistics() {
		mediaProvider.loadStatistics();
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadMedia();
	}

	function handlePageSizeChange(size: number) {
		pageSize = size;
		currentPage = 1; // Reset to first page
		loadMedia();
	}

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

	// Show delete confirmation dialog
	function confirmDelete(media: Media) {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'حذف رسانه',
				message: `آیا مطمئن هستید که می‌خواهید رسانه "${media.originalName}" را حذف کنید؟ این عمل قابل بازگشت نیست.`,
				confirm: 'حذف',
				cancel: 'لغو',
				color: 'red',
				onConfirm: () => {
					history.back();

					tick().then(() => {
						deleteMedia(media.id);
					});
				}
			}
		});
	}

	// Delete a media
	function deleteMedia(mediaId: string) {
		if (mediaProvider) {
			mediaProvider.deleteMedia({ id: mediaId });
		}
	}

	// Handle delete success
	function handleDeleteSuccess() {
		toast.success('رسانه با موفقیت حذف شد');
		loadMedia();
	}

	function handleDeleteError(error: string) {
		toast.error(error || 'حذف رسانه با خطا مواجه شد');
	}

	// Handle row actions
	function handleRowAction(event: Event, mediaList: Media[]) {
		const target = event.target as HTMLElement;
		const button = target.closest('button[data-action]');

		if (!button) return;

		const action = button.getAttribute('data-action');
		const id = button.getAttribute('data-id');

		if (!action || !id) return;

		switch (action) {
			case 'delete':
				// Find the media in the current list
				const media = mediaList?.find((m: Media) => m.id === id);
				if (media) {
					confirmDelete(media);
				}
				break;
			case 'view':
				// Find the media in the current list
				const mediaToView = mediaList?.find((m: Media) => m.id === id);
				if (mediaToView) {
					// Open media in new tab
					window.open(`/media/${mediaToView.id}`, '_blank');
				}
				break;
		}
	}

	// Reset filters
	function resetFilters() {
		searchTerm = '';
		selectedReason = '';
		selectedVisibility = '';
		ownerId = '';
		startDate = '';
		endDate = '';
		currentPage = 1;
		loadMedia();
	}

	// Apply filters
	function applyFilters() {
		currentPage = 1; // Reset to first page
		loadMedia();
	}

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

	// Reason options for filter
	const reasonOptions = Object.values(MediaReason).map((reason) => ({
		value: reason,
		label: reason.replace(/_/g, ' ')
	}));

	// Visibility options for filter
	const visibilityOptions = Object.values(MediaVisibility).map((visibility) => ({
		value: visibility,
		label: visibility.charAt(0) + visibility.slice(1).toLowerCase()
	}));
</script>

<PanelPageWrapper title="مدیریت رسانه" description="مدیریت تمام فایل‌های رسانه‌ای در سیستم">
	<MediaProvider
		bind:this={mediaProvider}
		onDeleteSuccess={handleDeleteSuccess}
		onDeleteError={handleDeleteError}
		let:media
		let:pagination
		let:statistics
		let:listLoading
		let:statsLoading
		let:listErrorMessage
		let:statsErrorMessage
		let:deleteLoading
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

		<Card variant="flat">
			{#if statsErrorMessage}
				<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--exclamation-circle] me-2 h-5 w-5 text-red-500"></span>
						<span class="text-red-700">{statsErrorMessage}</span>
					</div>
				</div>
			{/if}

			<!-- Filter Panel -->
			<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Input
					id="search"
					name="search"
					type="text"
					placeholder="جستجو بر اساس نام فایل یا شناسه مالک"
					bind:value={searchTerm}
					className="w-full"
				/>

				<Select
					id="reason"
					name="reason"
					placeholder="فیلتر بر اساس دلیل"
					value={selectedReason || ''}
					onChange={(value) => (selectedReason = value as MediaReason)}
					options={reasonOptions}
					className="w-full"
				/>

				<Select
					id="visibility"
					name="visibility"
					placeholder="فیلتر بر اساس نمایش"
					value={selectedVisibility || ''}
					onChange={(value) => (selectedVisibility = value as MediaVisibility)}
					options={visibilityOptions}
					className="w-full"
				/>

				<Input
					id="ownerId"
					name="ownerId"
					type="text"
					placeholder="فیلتر بر اساس شناسه مالک"
					bind:value={ownerId}
					className="w-full"
				/>
			</div>

			<!-- Date Range Filter -->
			<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
				<Input
					id="startDate"
					name="startDate"
					type="date"
					label="تاریخ شروع"
					bind:value={startDate}
					className="w-full"
				/>

				<Input
					id="endDate"
					name="endDate"
					type="date"
					label="تاریخ پایان"
					bind:value={endDate}
					className="w-full"
				/>

				<div class="flex items-end space-x-2">
					<Button onClick={applyFilters} variant="primary" className="flex-1">اعمال فیلترها</Button>
					<Button onClick={resetFilters} variant="secondary" className="flex-1">بازنشانی</Button>
				</div>
			</div>

			{#if listErrorMessage}
				<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--exclamation-circle] me-2 h-5 w-5 text-red-500"></span>
						<span class="text-red-700">{listErrorMessage}</span>
					</div>
				</div>
			{/if}

			<div on:click={(e) => handleRowAction(e, media)}>
				<DataTable
					data={media}
					{columns}
					itemsPerPage={pageSize}
					totalItems={pagination?.total || 0}
					{currentPage}
					onPageChange={handlePageChange}
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
