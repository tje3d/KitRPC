<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { Button, DataTable, PanelPageWrapper } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import { toast } from '$lib/toast/store';
	import ListUsersProvider from '$lib/providers/ListUsersProvider.svelte';
	import DeleteUserProvider from '$lib/providers/DeleteUserProvider.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { tick } from 'svelte';

	type User = RouterOutputs['users']['listUsers']['users'][0];
	type Pagination = RouterOutputs['users']['listUsers']['pagination'];

	// State
	let currentPage = 1;
	let listUsersProvider: ListUsersProvider;
	let deleteUserProvider: DeleteUserProvider | null = null;

	// Load users on component mount
	$: {
		if (listUsersProvider) {
			loadUsers();
		}
	}

	function loadUsers() {
		listUsersProvider.listUsers({
			page: currentPage,
			limit: 10
		});
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadUsers();
	}

	function formatDate(date: string | Date) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getUserRoleName(user: User): string {
		return user.role?.name || 'بدون نقش';
	}

	function getUserRoleColor(user: User): 'success' | 'warning' | 'error' | 'info' {
		const roleName = user.role?.name?.toLowerCase();
		if (roleName === 'admin') return 'error';
		if (roleName === 'moderator') return 'warning';
		if (roleName === 'user') return 'success';
		return 'info';
	}

	// Show delete confirmation dialog
	function confirmDelete(user: User) {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'حذف کاربر',
				message: `آیا مطمئن هستید که می‌خواهید کاربر "${user.username}" را حذف کنید؟ این عمل قابل بازگشت نیست.`,
				confirm: 'حذف',
				cancel: 'لغو',
				color: 'red',
				onConfirm: () => {
					history.back();

					tick().then(() => {
						deleteUser(user.id);
					});
				}
			}
		});
	}

	// Delete a user
	function deleteUser(userId: string) {
		if (deleteUserProvider) {
			deleteUserProvider.deleteUser({ id: userId });
		}
	}

	// Handle delete success
	function handleDeleteSuccess() {
		toast.success('کاربر با موفقیت حذف شد');
		loadUsers(); // Refresh the list
	}

	// Handle delete error
	function handleDeleteError(error: string) {
		toast.error(error || 'حذف کاربر ناموفق بود');
	}

	// Handle row actions
	function handleRowAction(event: Event, users: User[]) {
		const target = event.target as HTMLElement;
		const button = target.closest('button[data-action]');

		if (!button) return;

		const action = button.getAttribute('data-action');
		const id = button.getAttribute('data-id');

		if (!action || !id) return;

		switch (action) {
			case 'delete':
				// Find the user in the current list
				const user = users?.find((u: User) => u.id === id);
				if (user) {
					confirmDelete(user);
				}
				break;
		}
	}

	// DataTable columns configuration
	const columns = [
		{
			key: 'id',
			label: 'شناسه',
			sortable: true,
			render: (value: any, row: User) => {
				return `
					<div class="font-mono text-sm">
						${row.id.substring(0, 8)}
					</div>
				`;
			}
		},
		{
			key: 'user',
			label: 'کاربر',
			sortable: true,
			render: (value: any, row: User) => {
				return `
					<div class="flex items-center">
						<div class="flex-shrink-0 h-10 w-10">
							<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
								<span class="text-sm font-medium text-gray-700">
									${row.username.charAt(0).toUpperCase()}
								</span>
							</div>
						</div>
						<div class="ms-4">
							<div class="text-sm font-medium text-gray-900">${row.username}</div>
							${row.email ? `<div class="text-sm text-gray-500">${row.email}</div>` : ''}
						</div>
					</div>
				`;
			}
		},
		{
			key: 'role',
			label: 'نقش',
			sortable: true,
			render: (value: any, row: User) => {
				const roleName = getUserRoleName(row);
				const roleColor = getUserRoleColor(row);
				return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${roleColor === 'success' ? 'green' : roleColor === 'warning' ? 'yellow' : roleColor === 'error' ? 'red' : 'blue'}-100 text-${roleColor === 'success' ? 'green' : roleColor === 'warning' ? 'yellow' : roleColor === 'error' ? 'red' : 'blue'}-800">${roleName}</span>`;
			}
		},
		{
			key: 'createdAt',
			label: 'ایجاد شده',
			sortable: true,
			render: (value: any, row: User) => {
				return formatDate(row.createdAt);
			}
		},
		{
			key: 'actions',
			label: 'عملیات',
			render: (value: any, row: User) => {
				return `
					<div class="flex items-center justify-end gap-2">
						<a href="/panel/admin/users/${row.id}/edit" class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<span class="icon-[heroicons--pencil] w-4 h-4"></span>
						</a>
						${
							row.username !== 'admin'
								? `<button
									class="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
									data-action="delete"
									data-id="${row.id}"
									title="حذف کاربر"
								>
									<span class="icon-[heroicons--trash] w-4 h-4"></span>
								</button>`
								: `<button
									class="inline-flex items-center px-3 py-1.5 border border-gray-200 shadow-sm text-xs font-medium rounded text-gray-400 bg-gray-50 cursor-not-allowed"
									disabled
									title="نمی‌توان کاربر مدیر را حذف کرد"
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

<PanelPageWrapper title="مدیریت کاربران" description="مدیریت کاربران سیستم و نقش‌های آن‌ها">
	<div slot="actions">
		<Button href="/panel/admin/users/create" variant="primary">
			<span class="icon-[heroicons--plus] me-2 h-4 w-4"></span>
			افزودن کاربر
		</Button>
	</div>

	<Card variant="flat">
		<DeleteUserProvider
			bind:this={deleteUserProvider}
			onSuccess={handleDeleteSuccess}
			onError={handleDeleteError}
			let:loading={deleteLoading}
		>
			<ListUsersProvider
				bind:this={listUsersProvider}
				let:users
				let:pagination
				let:loading
				let:errorMessage
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
					<div on:click={(e) => handleRowAction(e, users)}>
						<DataTable
							data={users}
							{columns}
							itemsPerPage={10}
							totalItems={pagination?.total || 0}
							{currentPage}
							onPageChange={handlePageChange}
							showPagination={true}
						/>
					</div>
				{/if}
			</ListUsersProvider>
		</DeleteUserProvider>
	</Card>
</PanelPageWrapper>
