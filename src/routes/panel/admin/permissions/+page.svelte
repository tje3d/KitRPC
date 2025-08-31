<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { Button, DataTable, DTActionButton, PanelPageWrapper } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import DTColumn from '$lib/kit/DTColumn.svelte';
	import DeletePermissionProvider from '$lib/providers/DeletePermissionProvider.svelte';
	import ListPermissionsProvider from '$lib/providers/ListPermissionsProvider.svelte';
	import { toast } from '$lib/toast/store';

	// State
	let currentPage = 1;
	let searchTerm = '';
</script>

<PanelPageWrapper title="مدیریت مجوزها" description="مدیریت مجوزهای سیستم برای نقش‌ها و کاربران">
	<div slot="actions">
		<Button href="/panel/admin/permissions/create" variant="primary">
			<span class="icon-[heroicons--plus] me-2 h-4 w-4"></span>
			افزودن مجوز
		</Button>
	</div>

	<Card variant="elevated">
		<ListPermissionsProvider
			let:permissions
			let:pagination
			let:loading
			let:errorMessage
			let:listPermissions
		>
			<DeletePermissionProvider
				onSuccess={(data) => {
					if (data) {
						toast.success('مجوز با موفقیت حذف شد');
						// Refresh the list
						listPermissions({ page: currentPage, limit: 10, search: searchTerm });
					}
				}}
				onError={(error) => {
					toast.error(error || 'حذف مجوز ناموفق بود');
				}}
				let:deletePermission
				let:loading={deleteLoading}
			>
				{#if loading}
					<div class="p-8 text-center">
						<span class="icon-[svg-spinners--ring-resize] me-3 h-8 w-8 text-blue-500"></span>
					</div>
				{:else if errorMessage}
					<div class="p-6">
						<div class="rounded-lg border border-red-200 bg-red-50 p-4">
							<div class="flex items-center">
								<span class="icon-[heroicons--exclamation-triangle] me-2 h-5 w-5 text-red-500"
								></span>
								<span class="text-red-700">{errorMessage}</span>
							</div>
						</div>
					</div>
				{:else}
					<DataTable
						data={permissions}
						itemsPerPage={10}
						totalItems={pagination?.total || 0}
						{currentPage}
						onPageChange={(page) => {
							currentPage = page;
							listPermissions({ page: currentPage, limit: 10, search: searchTerm });
						}}
						showPagination={true}
						bind:searchTerm
						{loading}
					>
						<svelte:fragment slot="header" let:handleSort let:getSortIcon>
							<DTColumn sortable sortKey="name" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">نام</svelte:fragment>
							</DTColumn>
							<DTColumn sortable sortKey="resource" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">منبع</svelte:fragment>
							</DTColumn>
							<DTColumn sortable sortKey="action" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">عمل</svelte:fragment>
							</DTColumn>
							<DTColumn sortable sortKey="description" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">توضیحات</svelte:fragment>
							</DTColumn>
							<DTColumn sortable sortKey="createdAt" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">ایجاد شده</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">عملیات</svelte:fragment>
							</DTColumn>
						</svelte:fragment>

						<svelte:fragment slot="row" let:row>
							<DTColumn>{row.name}</DTColumn>
							<DTColumn>{row.resource}</DTColumn>
							<DTColumn>{row.action}</DTColumn>
							<DTColumn>
								{#if row.description}
									{row.description}
								{:else}
									<span class="text-gray-400">بدون توضیحات</span>
								{/if}
							</DTColumn>
							<DTColumn>{row.createdAt.toLocaleString('fa-IR')}</DTColumn>
							<DTColumn>
								<div class="flex items-center justify-end gap-2">
									<DTActionButton variant="edit" href="/panel/admin/permissions/{row.id}/edit" />
									<DTActionButton
										variant="delete"
										title="حذف مجوز"
										onClick={() => {
											dialogStore.open({
												component: ConfirmDialog,
												props: {
													title: 'حذف مجوز',
													message: `آیا مطمئن هستید که می‌خواهید مجوز "${row.name}" را حذف کنید؟ این عمل قابل بازگشت نیست.`,
													confirm: 'حذف',
													cancel: 'لغو',
													color: 'red',
													onConfirm: () => {
														history.back();
														deletePermission({ id: row.id });
													}
												}
											});
										}}
									/>
								</div>
							</DTColumn>
						</svelte:fragment>
					</DataTable>
				{/if}
			</DeletePermissionProvider>
		</ListPermissionsProvider>
	</Card>
</PanelPageWrapper>
