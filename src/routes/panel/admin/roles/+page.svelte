<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { Button, DataTable, DTActionButton, DTColumn, PanelPageWrapper } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import DeleteRoleProvider from '$lib/providers/DeleteRoleProvider.svelte';
	import ListRolesProvider from '$lib/providers/ListRolesProvider.svelte';
	import { toast } from '$lib/toast/store';

	// State
	let currentPage = 1;
</script>

<PanelPageWrapper title="مدیریت نقش‌ها" description="مدیریت نقش‌های سیستم و مجوزهای آن‌ها">
	<div slot="actions">
		<Button href="/panel/admin/roles/create" variant="primary">
			<span class="icon-[heroicons--plus] me-2 h-4 w-4"></span>
			افزودن نقش
		</Button>
	</div>

	<Card variant="flat">
		<ListRolesProvider
			requestOnSubscribe={true}
			let:roles
			let:pagination
			let:loading
			let:errorMessage
			let:listRoles
		>
			<DeleteRoleProvider
				onSuccess={(data) => {
					if (data) {
						toast.success('نقش با موفقیت حذف شد');
						listRoles({ page: currentPage, limit: 10 });
					}
				}}
				onError={(error) => {
					toast.error(error || 'حذف نقش ناموفق بود');
				}}
				let:deleteRole
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
						data={roles}
						itemsPerPage={10}
						totalItems={pagination?.total || 0}
						{currentPage}
						onPageChange={(page) => {
							currentPage = page;
							listRoles({ page: currentPage, limit: 10 });
						}}
						showPagination={true}
					>
						<svelte:fragment slot="header" let:handleSort let:getSortIcon>
							<DTColumn sortable sortKey="name" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">نام</svelte:fragment>
							</DTColumn>
							<DTColumn sortable sortKey="description" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">توضیحات</svelte:fragment>
							</DTColumn>
							<DTColumn sortable sortKey="createdAt" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">ایجاد شده</svelte:fragment>
							</DTColumn>
							<DTColumn className="text-end">
								<svelte:fragment slot="header">عملیات</svelte:fragment>
							</DTColumn>
						</svelte:fragment>

						<svelte:fragment slot="row" let:row>
							<DTColumn>
								{row.name}
							</DTColumn>
							<DTColumn>
								{#if row.description}
									{row.description}
								{:else}
									<span class="text-gray-400">بدون توضیحات</span>
								{/if}
							</DTColumn>
							<DTColumn>
								{row.createdAt.toLocaleString('fa-IR')}
							</DTColumn>
							<DTColumn className="text-end">
								<div class="flex items-center justify-end gap-2">
									<DTActionButton variant="edit" href="/panel/admin/roles/{row.id}/edit" />
									<DTActionButton
										variant="delete"
										disabled={row.name === 'user' || row.name === 'admin'}
										title={row.name === 'user' || row.name === 'admin'
											? 'نمی‌توان نقش‌های پیش‌فرض را حذف کرد'
											: 'حذف نقش'}
										onClick={() => {
											// Prevent deletion of default roles
											if (row.name === 'user' || row.name === 'admin') {
												toast.error('نمی‌توان نقش‌های پیش‌فرض را حذف کرد');
												return;
											}

											dialogStore.open({
												component: ConfirmDialog,
												props: {
													title: 'حذف نقش',
													message: `آیا مطمئن هستید که می‌خواهید نقش "${row.name}" را حذف کنید؟ این عمل قابل بازگشت نیست.`,
													confirm: 'حذف',
													cancel: 'لغو',
													color: 'red',
													onConfirm: () => {
														history.back();
														deleteRole({ id: row.id });
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
			</DeleteRoleProvider>
		</ListRolesProvider>
	</Card>
</PanelPageWrapper>
