<script lang="ts">
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

	// State
	let currentPage = 1;
	let sortKey: string | null = null;
	let sortDirection: 'asc' | 'desc' = 'asc';

	// Computed properties
	$: totalPages = Math.ceil(data.length / itemsPerPage);

	$: sortedData = data.slice().sort((a, b) => {
		if (!sortKey) return 0;

		const aValue = a[sortKey];
		const bValue = b[sortKey];

		if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
		if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
		return 0;
	});

	$: paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	// Functions
	function handleSort(key: string) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
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
								<span class="ml-1 h-4 w-4 text-gray-400" data-icon={getSortIcon(column.key)}></span>
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
		<div class="mt-4 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
			<div class="flex flex-1 justify-between sm:hidden">
				<button
					class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					on:click={() => goToPage(currentPage - 1)}
					disabled={currentPage === 1}
				>
					Previous
				</button>
				<button
					class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					on:click={() => goToPage(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					Next
				</button>
			</div>
			<div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
				<div>
					<p class="text-sm text-gray-700">
						Showing
						<span class="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
						to
						<span class="font-medium">{Math.min(currentPage * itemsPerPage, data.length)}</span>
						of
						<span class="font-medium">{data.length}</span>
						results
					</p>
				</div>
				<div>
					<nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
						<button
							class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
							on:click={() => goToPage(currentPage - 1)}
							disabled={currentPage === 1}
						>
							<span class="sr-only">Previous</span>
							<span class="h-5 w-5" data-icon="heroicons--chevron-left"></span>
						</button>

						{#each Array(totalPages) as _, i}
							{#if i + 1 === currentPage}
								<button
									class="relative z-10 inline-flex items-center border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
									aria-current="page"
								>
									{i + 1}
								</button>
							{:else if i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1}
								<button
									class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
									on:click={() => goToPage(i + 1)}
								>
									{i + 1}
								</button>
							{/if}
						{/each}

						<button
							class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
							on:click={() => goToPage(currentPage + 1)}
							disabled={currentPage === totalPages}
						>
							<span class="sr-only">Next</span>
							<span class="h-5 w-5" data-icon="heroicons--chevron-right"></span>
						</button>
					</nav>
				</div>
			</div>
		</div>
	{/if}
</div>
