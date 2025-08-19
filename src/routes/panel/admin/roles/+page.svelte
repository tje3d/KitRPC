<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { Button, DataTable, PanelPageWrapper } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import DeleteRoleProvider from '$lib/providers/DeleteRoleProvider.svelte';
	import ListRolesProvider from '$lib/providers/ListRolesProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { tick } from 'svelte';

	type Role = RouterOutputs['roles']['listRoles']['roles'][0];
	type Pagination = RouterOutputs['roles']['listRoles']['pagination'];

	// State
	let currentPage = 1;

	// DataTable columns configuration
	const columns = [
		{
			key: 'name',
			label: 'نام',
			sortable: true
		},
		{
			key: 'description',
			label: 'توضیحات',
			sortable: true,
			render: (value: string) => {
				return value || '<span class="text-gray-400">بدون توضیحات</span>';
			}
		},
		{
			key: 'createdAt',
			label: 'ایجاد شده',
			sortable: true,
			render: (value: any, row: Role) => {
				return row.createdAt.toLocaleString('fa-IR');
			}
		},
		{
			key: 'actions',
			label: 'عملیات',
			render: (value: any, row: Role) => {
				return `
					<div class="flex items-center justify-end gap-2">
						<a href="/panel/admin/roles/${row.id}/edit" class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<span class="icon-[heroicons--pencil] w-4 h-4"></span>
						</a>
						${
							row.name !== 'user' && row.name !== 'admin'
								? `<button
									class="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
									data-action="delete"
									data-id="${row.id}"
									title="حذف نقش"
								>
									<span class="icon-[heroicons--trash] w-4 h-4"></span>
								</button>`
								: `<button
									class="inline-flex items-center px-3 py-1.5 border border-gray-200 shadow-sm text-xs font-medium rounded text-gray-400 bg-gray-50 cursor-not-allowed"
									disabled
									title="نمی‌توان نقش‌های پیش‌فرض را حذف کرد"
								>
									<span class="icon-[heroicons--trash] w-4 h-4"></span>
								</button>`
						}
					</div>
				`;
			}
		}
	];
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
					<div
						on:click={(e) => {
							const target = e.target as HTMLElement;
							const button = target.closest('button[data-action]');

							if (!button) return;

							const action = button.getAttribute('data-action');
							const id = button.getAttribute('data-id');

							if (!action || !id) return;

							if (action === 'delete') {
								const role = roles?.find((r) => r.id === id);
								if (role) {
									// Prevent deletion of default roles
									if (role.name === 'user' || role.name === 'admin') {
										toast.error('نمی‌توان نقش‌های پیش‌فرض را حذف کرد');
										return;
									}

									dialogStore.open({
										component: ConfirmDialog,
										props: {
											title: 'حذف نقش',
											message: `آیا مطمئن هستید که می‌خواهید نقش "${role.name}" را حذف کنید؟ این عمل قابل بازگشت نیست.`,
											confirm: 'حذف',
											cancel: 'لغو',
											color: 'red',
											onConfirm: () => {
												history.back();
												tick().then(() => {
													deleteRole({ id: role.id });
												});
											}
										}
									});
								}
							}
						}}
					>
						<DataTable
							data={roles}
							{columns}
							itemsPerPage={10}
							totalItems={pagination?.total || 0}
							{currentPage}
							onPageChange={(page) => {
								currentPage = page;
								listRoles({ page: currentPage, limit: 10 });
							}}
							showPagination={true}
						/>
					</div>
				{/if}
			</DeleteRoleProvider>
		</ListRolesProvider>
	</Card>
</PanelPageWrapper>
