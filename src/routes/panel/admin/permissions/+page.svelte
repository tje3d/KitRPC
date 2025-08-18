<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { Button, DataTable, PanelPageWrapper } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import { toast } from '$lib/toast/store';
	import ListPermissionsProvider from '$lib/providers/ListPermissionsProvider.svelte';
	import DeletePermissionProvider from '$lib/providers/DeletePermissionProvider.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { tick } from 'svelte';

	type Permission = RouterOutputs['permissions']['listPermissions']['permissions'][0];
	type Pagination = RouterOutputs['permissions']['listPermissions']['pagination'];

	// State
	let currentPage = 1;
	let listPermissionsProvider: ListPermissionsProvider;
	let deletePermissionProvider: DeletePermissionProvider | null = null;
	let searchTerm = '';

	// Load permissions on component mount and when page/search changes
	$: {
		if (listPermissionsProvider) {
			loadPermissions();
		}
	}

	$: {
		if (listPermissionsProvider && searchTerm !== undefined) {
			currentPage = 1; // Reset to first page when searching
			loadPermissions();
		}
	}

	function loadPermissions() {
		listPermissionsProvider.listPermissions({
			page: currentPage,
			limit: 10,
			search: searchTerm
		});
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadPermissions();
	}

	function formatDate(date: string | Date) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Show delete confirmation dialog
	function confirmDelete(permission: Permission) {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'حذف مجوز',
				message: `آیا مطمئن هستید که می‌خواهید مجوز "${permission.name}" را حذف کنید؟ این عمل قابل بازگشت نیست.`,
				confirm: 'حذف',
				cancel: 'لغو',
				color: 'red',
				onConfirm: () => {
					history.back();

					tick().then(() => {
						deletePermission(permission.id);
					});
				}
			}
		});
	}

	// Delete a permission
	function deletePermission(permissionId: string) {
		if (deletePermissionProvider) {
			deletePermissionProvider.deletePermission({ id: permissionId });
		}
	}

	// Handle delete success
	function handleDeleteSuccess() {
		toast.success('مجوز با موفقیت حذف شد');
		loadPermissions(); // Refresh the list
	}

	// Handle delete error
	function handleDeleteError(error: string) {
		toast.error(error || 'حذف مجوز ناموفق بود');
	}

	// Handle row actions
	function handleRowAction(event: Event, permissions: Permission[]) {
		const target = event.target as HTMLElement;
		const button = target.closest('button[data-action]');

		if (!button) return;

		const action = button.getAttribute('data-action');
		const id = button.getAttribute('data-id');

		if (!action || !id) return;

		switch (action) {
			case 'delete':
				// Find the permission in the current list
				const permission = permissions?.find((p: Permission) => p.id === id);
				if (permission) {
					confirmDelete(permission);
				}
				break;
		}
	}

	// DataTable columns configuration
	const columns = [
		{
			key: 'name',
			label: 'نام',
			sortable: true
		},
		{
			key: 'resource',
			label: 'منبع',
			sortable: true
		},
		{
			key: 'action',
			label: 'عمل',
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
			render: (value: any, row: Permission) => {
				return formatDate(row.createdAt);
			}
		},
		{
			key: 'actions',
			label: 'عملیات',
			render: (value: any, row: Permission) => {
				return `
					<div class="flex items-center justify-end gap-2">
						<a href="/panel/admin/permissions/${row.id}/edit" class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<span class="icon-[heroicons--pencil] w-4 h-4"></span>
						</a>
						<button
							class="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							data-action="delete"
							data-id="${row.id}"
							title="حذف مجوز"
						>
							<span class="icon-[heroicons--trash] w-4 h-4"></span>
						</button>
					</div>
				`;
			}
		}
	];
</script>

<PanelPageWrapper title="مدیریت مجوزها" description="مدیریت مجوزهای سیستم برای نقش‌ها و کاربران">
	<div slot="actions">
		<Button href="/panel/admin/permissions/create" variant="primary">
			<span class="icon-[heroicons--plus] me-2 h-4 w-4"></span>
			افزودن مجوز
		</Button>
	</div>

	<Card variant="flat">
		<DeletePermissionProvider
			bind:this={deletePermissionProvider}
			onSuccess={handleDeleteSuccess}
			onError={handleDeleteError}
			let:loading={deleteLoading}
		>
			<ListPermissionsProvider
				bind:this={listPermissionsProvider}
				let:permissions
				let:pagination
				let:loading
				let:errorMessage
			>
				{#if errorMessage}
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
					<div on:click={(e) => handleRowAction(e, permissions)}>
						<DataTable
							data={permissions}
							{columns}
							itemsPerPage={10}
							totalItems={pagination?.total || 0}
							{currentPage}
							onPageChange={handlePageChange}
							showPagination={true}
							bind:searchTerm
							{loading}
						/>
					</div>
				{/if}
			</ListPermissionsProvider>
		</DeletePermissionProvider>
	</Card>
</PanelPageWrapper>
