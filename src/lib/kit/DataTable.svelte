<script lang="ts" module>
	// Define types
	export type Column = {
		key: string;
		label: string;
		sortable?: boolean;
		filterable?: boolean;
		render?: (value: any, row: any) => any;
		component?: LegacyComponentType;
	};

	type Row = Record<string, any>;
</script>

<script lang="ts">
	import type { LegacyComponentType } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import Checkbox from './Checkbox.svelte';
	import Input from './Input.svelte';
	import Pagination from './Pagination.svelte';

	// Define props using Svelte 4 syntax
	export let data: Array<Row> = [];
	export let columns: Array<Column> = [];
	export let itemsPerPage: number = 10;
	export let className: string = '';
	export let showPagination: boolean = true;
	export let totalItems: number = 0;
	export let currentPage: number = 1;
	export let onPageChange: ((page: number) => void) | null = null;
	export let onSortChange: ((key: string, direction: 'asc' | 'desc') => void) | null = null;
	export let searchTerm: string = '';
	export let loading: boolean = false;
	export let showSearch = true;
	export let showCheckbox = true;

	// State for client-side sorting (when server-side callbacks are not provided)
	let sortKey: string | null = null;
	let sortDirection: 'asc' | 'desc' = 'asc';

	// State for search and filtering
	let columnFilters: Record<string, string> = {};
	let selectedRows: Record<any, boolean> = {};

	// Computed properties
	$: isServerSide = onPageChange !== null;
	$: totalPages = isServerSide
		? Math.ceil(totalItems / itemsPerPage)
		: Math.ceil(data.length / itemsPerPage);
	$: selectedRowsCount = Object.values(selectedRows).filter(Boolean).length;

	// Filtered data based on search term and column filters
	$: filteredData = (() => {
		if (isServerSide) return data;

		return data.filter((row: Row) => {
			// Global search
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				const matchesSearch = columns.some((column: Column) => {
					const value = row[column.key];
					return value && value.toString().toLowerCase().includes(searchLower);
				});
				if (!matchesSearch) return false;
			}

			// Column filters
			return columns.every((column: Column) => {
				if (!column.filterable || !columnFilters[column.key]) return true;
				const filterValue = columnFilters[column.key].toLowerCase();
				const cellValue = row[column.key];
				return cellValue && cellValue.toString().toLowerCase().includes(filterValue);
			});
		});
	})();

	$: sortedData = (() => {
		if (isServerSide) return filteredData;

		return filteredData.slice().sort((a: Row, b: Row) => {
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
		// Reset to first page when search changes
		if (!isServerSide && currentPage !== 1) {
			// In client-side mode, we would need to update currentPage
			// But since it's a prop, we can't directly modify it
		}
	}

	function handleFilterChange(columnKey: string) {
		// Reset to first page when filter changes
		if (!isServerSide && currentPage !== 1) {
			// In client-side mode, we would need to update currentPage
			// But since it's a prop, we can't directly modify it
		}
	}

	function handleSelectAll() {
		// Create a copy of the current selectedRows object to avoid direct mutation
		const newSelectedRows = { ...selectedRows };

		// Check if all rows in the current page are already selected
		const allSelected = selectedRowsCount === paginatedData.length && paginatedData.length > 0;

		// Toggle selection state for all rows in the current page
		for (const row of paginatedData) {
			// Use row.id as the key if available, otherwise skip (with a console warning)
			if (row.id === undefined) {
				console.warn('Row missing id property, cannot select:', row);
				continue;
			}

			// Set selection state based on whether all were previously selected
			newSelectedRows[row.id] = !allSelected;
		}

		// Update the selectedRows object to trigger reactivity
		selectedRows = newSelectedRows;
	}
</script>

<!-- Search and filter controls -->
<div class="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
	<!-- Global search -->
	{#if showSearch}
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
	{/if}

	<!-- Column filters -->
	<div class="flex flex-wrap gap-2">
		{#each columns as column}
			{#if column.filterable}
				<div class="w-32">
					<Input
						id={`filter-${column.key}`}
						name={`filter-${column.key}`}
						type="text"
						placeholder={`فیلتر ${column.label}`}
						value={columnFilters[column.key] || ''}
						onChange={() => handleFilterChange(column.key)}
						className="w-full"
					/>
				</div>
			{/if}
		{/each}
	</div>
</div>

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
				{#each columns as column (column.key)}
					<th
						scope="col"
						class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						class:cursor-pointer={column.sortable}
						on:click={() => column.sortable && handleSort(column.key)}
					>
						<div class="flex items-center">
							{column.label}
							{#if column.sortable}
								<span class="ms-1 h-4 w-4 text-gray-400 icon-[{getSortIcon(column.key)}]"></span>
							{/if}
						</div>
					</th>
				{/each}
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
					{#each columns as column (column.key)}
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
							{#if column.component}
								<svelte:component this={column.component} value={row[column.key]} {row} {column} />
							{:else if column.render}
								{@html column.render(row[column.key], row)}
							{:else}
								{row[column.key]}
							{/if}
						</td>
					{/each}
				</tr>
			{:else}
				<tr>
					<td
						colspan={columns.length + (showCheckbox ? 1 : 0)}
						class="px-6 py-4 text-center text-gray-500"
					>
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
				} else {
					// In client-side mode, we would need to update currentPage
					// But since it's a prop, we can't directly modify it
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
