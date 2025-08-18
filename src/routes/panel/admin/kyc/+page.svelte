<script lang="ts">
	import PermissionCheck from '$lib/components/PermissionCheck.svelte';
	import { DataTable, KycStatusTableCell, PanelPageWrapper, Select } from '$lib/kit';
	import Card from '$lib/kit/Card.svelte';
	import type { Column } from '$lib/kit/DataTable.svelte';
	import Input from '$lib/kit/Input.svelte';
	import ListKycProvider from '$lib/providers/ListKycProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { RouterOutputs } from '$lib/trpc/router';

	type KycRequest = RouterOutputs['kyc']['listKycRequests']['kycRequests'][0];

	// State
	let currentPage = 1;
	let searchTerm = '';
	let statusFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | '' = '';
	let listKycProvider: ListKycProvider;

	// Load KYC requests
	function loadKycRequests() {
		if (listKycProvider) {
			listKycProvider.listKycRequests({
				limit: 10,
				offset: (currentPage - 1) * 10,
				search: searchTerm || undefined,
				status: statusFilter || undefined
			});
		}
	}

	// Handle page change
	function handlePageChange(page: number) {
		currentPage = page;
		loadKycRequests();
	}

	// Handle search
	function handleSearch() {
		currentPage = 1;
		loadKycRequests();
	}

	// Handle status filter change
	function handleStatusFilterChange(value: string | string[]) {
		// Since we're not using multiple selection, value will be a string
		if (typeof value === 'string') {
			statusFilter = value as 'PENDING' | 'APPROVED' | 'REJECTED' | '';
			currentPage = 1;
			loadKycRequests();
		}
	}

	// Handle list error
	function handleListError(error: string) {
		toast.error(error || 'Failed to load KYC requests');
	}

	// DataTable columns configuration
	const columns: Column[] = [
		{
			key: 'user',
			label: 'User',
			sortable: true,
			render: (value: any, row: KycRequest) => {
				return `
					<div class="flex items-center">
						<div class="flex-shrink-0 h-10 w-10">
							<div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
								<span class="text-sm font-medium text-gray-700">
									${row.username?.charAt(0).toUpperCase() || 'U'}
								</span>
							</div>
						</div>
						<div class="ms-4">
							<div class="text-sm font-medium text-gray-900">${row.username || 'N/A'}</div>
							${row.email ? `<div class="text-sm text-gray-500">${row.email}</div>` : ''}
						</div>
					</div>
				`;
			}
		},
		{
			key: 'status',
			label: 'Status',
			sortable: true,
			component: KycStatusTableCell
		},
		{
			key: 'name',
			label: 'Name',
			sortable: true,
			render: (value: any, row: KycRequest) => {
				return 'N/A';
			}
		},
		{
			key: 'nationalId',
			label: 'National ID',
			sortable: true,
			render: (value: any, row: KycRequest) => {
				return row.nationalId || 'N/A';
			}
		},
		{
			key: 'mobile',
			label: 'Mobile',
			sortable: true,
			render: (value: any, row: KycRequest) => {
				return row.mobile || 'N/A';
			}
		},
		{
			key: 'actions',
			label: 'Actions',
			render: (value: any, row: KycRequest) => {
				return `
					<div class="flex justify-end">
						<a href="/panel/admin/kyc/${row.id}" class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<span class="icon-[heroicons--eye] w-4 h-4 me-1"></span>
							Review
						</a>
					</div>
				`;
			}
		}
	];
</script>

<PanelPageWrapper title="KYC Management" description="Manage user KYC verification requests">
	<PermissionCheck permission={{ resource: 'kyc', action: 'manage' }} redirect="/panel">
		<Card variant="flat">
			<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div class="flex flex-col gap-4 md:flex-row md:items-center">
					<div class="w-full md:w-64">
						<Input
							id="search"
							name="search"
							type="text"
							placeholder="Search by username or email..."
							bind:value={searchTerm}
							on:input={handleSearch}
							className="w-full"
						/>
					</div>
					<div class="w-full md:w-48">
						<Select
							id="status-filter"
							name="status-filter"
							value={statusFilter}
							onChange={handleStatusFilterChange}
							options={[
								{ value: '', label: 'All Statuses' },
								{ value: 'PENDING', label: 'Pending' },
								{ value: 'APPROVED', label: 'Approved' },
								{ value: 'REJECTED', label: 'Rejected' }
							]}
						/>
					</div>
				</div>
			</div>

			<ListKycProvider
				bind:this={listKycProvider}
				onError={handleListError}
				let:kycRequests
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
						data={kycRequests || []}
						{columns}
						itemsPerPage={10}
						totalItems={pagination?.totalCount || 0}
						{currentPage}
						onPageChange={handlePageChange}
						showPagination={true}
					>
						<div slot="empty" class="py-12 text-center">
							<span
								class="icon-[heroicons--document-magnifying-glass] mx-auto h-12 w-12 text-gray-400"
							></span>
							<h3 class="mt-2 text-sm font-medium text-gray-900">No KYC requests found</h3>
							<p class="mt-1 text-sm text-gray-500">
								Try adjusting your search or filter criteria.
							</p>
						</div>
					</DataTable>
				{/if}
			</ListKycProvider>
		</Card>
	</PermissionCheck>
</PanelPageWrapper>
