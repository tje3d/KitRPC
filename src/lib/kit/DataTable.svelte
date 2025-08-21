<script lang="ts" module>
	type Row = Record<string, any>;
</script>

<script lang="ts" generics="T extends Row">
	import { fade } from 'svelte/transition';
	import Checkbox from './Checkbox.svelte';
	import Input from './Input.svelte';
	import Pagination from './Pagination.svelte';

	// Define props
	export let data: Array<T> = [];
	export let itemsPerPage: number = 10;
	export let className: string = '';
	export let showPagination: boolean = true;
	export let totalItems: number = 0;
	export let currentPage: number = 1;
	export let onPageChange: ((page: number) => void) | null = null;
	export let onSortChange: ((key: string, direction: 'asc' | 'desc') => void) | null = null;
	export let searchTerm: string = '';
	export let loading: boolean = false;
	export let showSearch = false;
	export let showCheckbox = false;

	// State for client-side sorting
	let sortKey: string | null = null;
	let sortDirection: 'asc' | 'desc' = 'asc';

	// State for selection
	let selectedRows: Record<any, boolean> = {};

	// Computed properties
	$: isServerSide = onPageChange !== null;
	$: totalPages = isServerSide
		? Math.ceil(totalItems / itemsPerPage)
		: Math.ceil(data.length / itemsPerPage);
	$: selectedRowsCount = Object.values(selectedRows).filter(Boolean).length;

	// Filtered data based on search term
	$: filteredData = (() => {
		if (isServerSide) return data;

		return data.filter((row: T) => {
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				const matchesSearch = Object.values(row).some((value) => {
					return value && value.toString().toLowerCase().includes(searchLower);
				});
				if (!matchesSearch) return false;
			}
			return true;
		});
	})();

	$: sortedData = (() => {
		if (isServerSide) return filteredData;

		return filteredData.slice().sort((a: T, b: T) => {
			if (!sortKey) return 0;

			const aValue = a[sortKey];
			const bValue = b[sortKey];

			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	})();

	$: paginatedData = (() => {
		if (isServerSide) return sortedData;

		return sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	})();

	// Functions
	function handleSort(key: string) {
		if (isServerSide && onSortChange) {
			const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
			sortKey = key;
			sortDirection = newDirection as 'asc' | 'desc';
			onSortChange(key, newDirection);
		} else {
			if (sortKey === key) {
				sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			} else {
				sortKey = key;
				sortDirection = 'asc';
			}
		}
	}

	function getSortIcon(key: string) {
		if (sortKey !== key) return 'heroicons--chevron-up-down';
		return sortDirection === 'asc' ? 'heroicons--chevron-up' : 'heroicons--chevron-down';
	}

	function handleSearchChange() {
		// Reset to first page when search changes in client-side mode
		if (!isServerSide && currentPage !== 1) {
			// Note: currentPage is a prop, parent component should handle this
		}
	}

	function handleSelectAll() {
		const newSelectedRows = { ...selectedRows };
		const allSelected = selectedRowsCount === paginatedData.length && paginatedData.length > 0;

		for (const row of paginatedData) {
			if (row.id === undefined) {
				console.warn('Row missing id property, cannot select:', row);
				continue;
			}
			newSelectedRows[row.id] = !allSelected;
		}

		selectedRows = newSelectedRows;
	}
</script>

<!-- Search controls -->
{#if showSearch}
	<div class="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="w-full md:w-64">
			<Input
				id="datatable-search"
				name="datatable-search"
				type="text"
				placeholder="جستجو"
				bind:value={searchTerm}
				onChange={handleSearchChange}
				className="w-full"
			/>
		</div>
	</div>
{/if}

<div class={`relative overflow-x-auto ${className}`}>
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<!-- Selection column -->
				{#if showCheckbox}
					<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
						<Checkbox
							id="select-all-checkbox"
							name="select-all"
							checked={selectedRowsCount > 0 && selectedRowsCount === paginatedData.length}
							indeterminate={selectedRowsCount > 0 && selectedRowsCount < paginatedData.length}
							onChange={handleSelectAll}
						/>
					</th>
				{/if}
				<!-- Header slot for custom headers -->
				<slot name="header" {handleSort} {getSortIcon} {sortKey} {sortDirection} />
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 bg-white">
			{#each paginatedData as row, i (row.id || i)}
				<tr class="hover:bg-gray-50">
					<!-- Selection cell -->
					{#if showCheckbox}
						<td class="px-6 py-4 text-sm whitespace-nowrap">
							<Checkbox
								id={`select-row-${i}`}
								name={`select-row-${i}`}
								bind:checked={selectedRows[row.id]}
							/>
						</td>
					{/if}
					<!-- Row slot for custom column rendering -->
					<slot name="row" {row} {i} />
				</tr>
			{:else}
				<tr>
					<td class="px-6 py-4 text-center text-gray-500" colspan="100">
						<slot name="empty">داده‌ای در دسترس نیست</slot>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if showPagination && totalPages > 1}
		<Pagination
			totalItems={isServerSide ? totalItems : filteredData.length}
			{currentPage}
			{itemsPerPage}
			onPageChange={(page) => {
				if (isServerSide && onPageChange) {
					onPageChange(page);
				}
			}}
			className="mt-4"
		/>
	{/if}

	{#if loading}
		<div
			class="absolute inset-0 z-10 flex items-center justify-center bg-black/20"
			in:fade|local={{ delay: 1_000 }}
		>
			<span class="icon-[svg-spinners--ring-resize] h-8 w-8 text-blue-500"></span>
		</div>
	{/if}
</div>
