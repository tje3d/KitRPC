<script lang="ts">
	import Pagination from './Pagination.svelte';

	/** @type {Array<any>} - The data to display in the table */
	export let data: Array<any> = [];

	/** @type {Array<{key: string, label: string, sortable?: boolean}>} - Column definitions */
	export let columns: Array<{
		key: string;
		label: string;
		sortable?: boolean;
		render?: (value: any, row: any) => any;
	}> = [];

	/** @type {number} - Number of items per page */
	export let itemsPerPage: number = 10;

	/** @type {string} - Additional CSS classes for the table */
	export let className: string = '';

	/** @type {boolean} - Whether to show pagination controls */
	export let showPagination: boolean = true;

	/** @type {number} - Total number of items (for server-side pagination) */
	export let totalItems: number = 0;

	/** @type {number} - Current page (for server-side pagination) */
	export let currentPage: number = 1;

	/** @type {function} - Callback when page changes (for server-side pagination) */
	export let onPageChange: ((page: number) => void) | null = null;

	/** @type {function} - Callback when sort changes (for server-side pagination) */
	export let onSortChange: ((key: string, direction: 'asc' | 'desc') => void) | null = null;

	// State for client-side sorting (when server-side callbacks are not provided)
	let sortKey: string | null = null;
	let sortDirection: 'asc' | 'desc' = 'asc';

	// Computed properties
	$: isServerSide = onPageChange !== null;
	$: totalPages = isServerSide
		? Math.ceil(totalItems / itemsPerPage)
		: Math.ceil(data.length / itemsPerPage);

	$: sortedData = isServerSide
		? data
		: data.slice().sort((a, b) => {
				if (!sortKey) return 0;

				const aValue = a[sortKey];
				const bValue = b[sortKey];

				if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
				if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			});

	$: paginatedData = isServerSide
		? sortedData
		: sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	// Functions
	function handleSort(key: string) {
		if (isServerSide && onSortChange) {
			const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
			sortKey = key;
			sortDirection = newDirection;
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
</script>

<div class={`overflow-x-auto ${className}`}>
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
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
					{#each columns as column (column.key)}
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
							{#if column.render}
								{@html column.render(row[column.key], row)}
							{:else}
								{row[column.key]}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	{#if showPagination && totalPages > 1}
		<Pagination
			totalItems={isServerSide ? totalItems : data.length}
			{currentPage}
			{itemsPerPage}
			onPageChange={(page) => {
				if (isServerSide && onPageChange) {
					onPageChange(page);
				} else {
					currentPage = page;
				}
			}}
			className="mt-4"
		/>
	{/if}
</div>
