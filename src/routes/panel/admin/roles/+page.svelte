<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { Button, DataTable, PanelPageWrapper } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import { toast } from '$lib/toast/store';
	import ListRolesProvider from '$lib/providers/ListRolesProvider.svelte';
	import DeleteRoleProvider from '$lib/providers/DeleteRoleProvider.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { tick } from 'svelte';

	type Role = RouterOutputs['roles']['listRoles']['roles'][0];
	type Pagination = RouterOutputs['roles']['listRoles']['pagination'];

	// State
	let currentPage = 1;
	let listRolesProvider: ListRolesProvider;
	let deleteRoleProvider: DeleteRoleProvider | null = null;

	// Load roles on component mount and when page changes
	$: {
		if (listRolesProvider) {
			loadRoles();
		}
	}

	function loadRoles() {
		listRolesProvider.listRoles({
			page: currentPage,
			limit: 10
		});
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadRoles();
	}

	function formatDate(date: string | Date) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Show delete confirmation dialog
	function confirmDelete(role: Role) {
		// Prevent deletion of default roles
		if (role.name === 'user' || role.name === 'admin') {
			toast.error('Cannot delete default roles');
			return;
		}

		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'Delete Role',
				message: `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`,
				confirm: 'Delete',
				cancel: 'Cancel',
				color: 'red',
				onConfirm: () => {
					history.back();

					tick().then(() => {
						deleteRole(role.id);
					});
				}
			}
		});
	}

	// Delete a role
	function deleteRole(roleId: string) {
		if (deleteRoleProvider) {
			deleteRoleProvider.deleteRole({ id: roleId });
		}
	}

	// Handle delete success
	function handleDeleteSuccess() {
		toast.success('Role deleted successfully');
		loadRoles(); // Refresh the list
	}

	// Handle delete error
	function handleDeleteError(error: string) {
		toast.error(error || 'Failed to delete role');
	}

	// Handle row actions
	function handleRowAction(event: Event, roles: Role[]) {
		const target = event.target as HTMLElement;
		const button = target.closest('button[data-action]');

		if (!button) return;

		const action = button.getAttribute('data-action');
		const id = button.getAttribute('data-id');

		if (!action || !id) return;

		switch (action) {
			case 'delete':
				// Find the role in the current list
				const role = roles?.find((r: Role) => r.id === id);
				if (role) {
					confirmDelete(role);
				}
				break;
		}
	}

	// DataTable columns configuration
	const columns = [
		{
			key: 'name',
			label: 'Name',
			sortable: true
		},
		{
			key: 'description',
			label: 'Description',
			sortable: true,
			render: (value: string) => {
				return value || '<span class="text-gray-400">No description</span>';
			}
		},
		{
			key: 'createdAt',
			label: 'Created',
			sortable: true,
			render: (value: any, row: Role) => {
				return formatDate(row.createdAt);
			}
		},
		{
			key: 'actions',
			label: 'Actions',
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
									title="Delete role"
								>
									<span class="icon-[heroicons--trash] w-4 h-4"></span>
								</button>`
								: `<button
									class="inline-flex items-center px-3 py-1.5 border border-gray-200 shadow-sm text-xs font-medium rounded text-gray-400 bg-gray-50 cursor-not-allowed"
									disabled
									title="Cannot delete default roles"
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

<PanelPageWrapper title="Role Management" description="Manage system roles and their permissions">
	<div slot="actions">
		<Button href="/panel/admin/roles/create" variant="primary">
			<span class="icon-[heroicons--plus] me-2 h-4 w-4"></span>
			Add Role
		</Button>
	</div>

	<Card variant="flat">
		<DeleteRoleProvider
			bind:this={deleteRoleProvider}
			onSuccess={handleDeleteSuccess}
			onError={handleDeleteError}
			let:loading={deleteLoading}
		>
			<ListRolesProvider
				bind:this={listRolesProvider}
				let:roles
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
					<div on:click={(e) => handleRowAction(e, roles)}>
						<DataTable
							data={roles}
							{columns}
							itemsPerPage={10}
							totalItems={pagination?.total || 0}
							{currentPage}
							onPageChange={handlePageChange}
							showPagination={true}
						/>
					</div>
				{/if}
			</ListRolesProvider>
		</DeleteRoleProvider>
	</Card>
</PanelPageWrapper>
