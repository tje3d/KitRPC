<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { Button, DataTable, PanelPageWrapper } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import DTActionButton from '$lib/kit/DTActionButton.svelte';
	import DTColumn from '$lib/kit/DTColumn.svelte';
	import DeleteUserProvider from '$lib/providers/DeleteUserProvider.svelte';
	import ListUsersProvider from '$lib/providers/ListUsersProvider.svelte';
	import { toast } from '$lib/toast/store';
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
					<DataTable
						data={users}
						itemsPerPage={10}
						totalItems={pagination?.total || 0}
						{currentPage}
						onPageChange={handlePageChange}
						showPagination={true}
					>
						<svelte:fragment slot="header" let:handleSort let:getSortIcon>
							<DTColumn sortable={true} sortKey="id" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">شناسه</svelte:fragment>
							</DTColumn>
							<DTColumn sortable={true} sortKey="user" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">کاربر</svelte:fragment>
							</DTColumn>
							<DTColumn sortable={true} sortKey="role" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">نقش</svelte:fragment>
							</DTColumn>
							<DTColumn sortable={true} sortKey="createdAt" onSort={handleSort} {getSortIcon}>
								<svelte:fragment slot="header">ایجاد شده</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">عملیات</svelte:fragment>
							</DTColumn>
						</svelte:fragment>

						<svelte:fragment slot="row" let:row>
							<DTColumn>
								<div class="font-mono text-sm">
									{row.id.substring(0, 8)}
								</div>
							</DTColumn>
							<DTColumn>
								<div class="flex items-center">
									<div class="h-10 w-10 flex-shrink-0">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300"
										>
											<span class="text-sm font-medium text-gray-700">
												{row.username.charAt(0).toUpperCase()}
											</span>
										</div>
									</div>
									<div class="ms-4">
										<div class="text-sm font-medium text-gray-900">{row.username}</div>
										{#if row.email}
											<div class="text-sm text-gray-500">{row.email}</div>
										{/if}
									</div>
								</div>
							</DTColumn>
							<DTColumn>
								{@const roleName = getUserRoleName(row)}
								{@const roleColor = getUserRoleColor(row)}
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-{roleColor ===
									'success'
										? 'green'
										: roleColor === 'warning'
											? 'yellow'
											: roleColor === 'error'
												? 'red'
												: 'blue'}-100 text-{roleColor === 'success'
										? 'green'
										: roleColor === 'warning'
											? 'yellow'
											: roleColor === 'error'
												? 'red'
												: 'blue'}-800"
								>
									{roleName}
								</span>
							</DTColumn>
							<DTColumn>
								{formatDate(row.createdAt)}
							</DTColumn>
							<DTColumn>
								<div class="flex items-center justify-end gap-2">
									<DTActionButton
										variant="edit"
										href="/panel/admin/users/{row.id}/edit"
										ariaLabel="ویرایش"
									/>
									{#if row.username !== 'admin'}
										<DTActionButton
											variant="delete"
											title="حذف کاربر"
											ariaLabel="حذف"
											onClick={() => confirmDelete(row)}
										/>
									{:else}
										<DTActionButton
											variant="delete"
											title="نمی‌توان کاربر مدیر را حذف کرد"
											ariaLabel="حذف"
											disabled={true}
										/>
									{/if}
								</div>
							</DTColumn>
						</svelte:fragment>
					</DataTable>
				{/if}
			</ListUsersProvider>
		</DeleteUserProvider>
	</Card>
</PanelPageWrapper>
