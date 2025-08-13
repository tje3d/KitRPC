<script lang="ts">
	/** @type {number} - Total number of items */
	export let totalItems: number = 0;

	/** @type {number} - Current page */
	export let currentPage: number = 1;

	/** @type {number} - Number of items per page */
	export let itemsPerPage: number = 10;

	/** @type {function} - Callback when page changes */
	export let onPageChange: ((page: number) => void) | null = null;

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	// Computed properties
	$: totalPages = Math.ceil(totalItems / itemsPerPage);

	// Functions
	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			if (onPageChange) {
				onPageChange(page);
			} else {
				currentPage = page;
			}
		}
	}

	function getPaginationItems(totalPages: number, currentPage: number) {
		const items = [];
		const delta = 2; // Number of pages to show around current page

		if (totalPages <= 7) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				items.push({ type: 'page', value: i });
			}
		} else {
			// Always show first page
			items.push({ type: 'page', value: 1 });

			// Add ellipsis if there's a gap after first page
			if (currentPage > delta + 2) {
				items.push({ type: 'ellipsis', value: '...' });
			}

			// Add pages around current page
			const start = Math.max(2, currentPage - delta);
			const end = Math.min(totalPages - 1, currentPage + delta);

			for (let i = start; i <= end; i++) {
				items.push({ type: 'page', value: i });
			}

			// Add ellipsis if there's a gap before last page
			if (currentPage < totalPages - delta - 1) {
				items.push({ type: 'ellipsis', value: '...' });
			}

			// Always show last page
			items.push({ type: 'page', value: totalPages });
		}

		return items;
	}

	$: paginationItems = getPaginationItems(totalPages, currentPage);
</script>

<div
	class={`flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 ${className}`}
>
	<div class="flex flex-1 justify-between sm:hidden">
		<button
			class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			on:click={() => goToPage(currentPage - 1)}
			disabled={currentPage === 1}
		>
			Previous
		</button>
		<button
			class="relative ms-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
				<span class="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>
				of
				<span class="font-medium">{totalItems}</span>
				results
			</p>
		</div>
		<div>
			<nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
				<button
					class="relative inline-flex items-center rounded-s-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
					on:click={() => goToPage(currentPage - 1)}
					disabled={currentPage === 1}
				>
					<span class="sr-only">Previous</span>
					<span class="icon-[heroicons--chevron-right] h-5 w-5"></span>
				</button>

				{#each paginationItems as item}
					{#if item.type === 'page'}
						{#if item.value === currentPage}
							<button
								class="relative z-10 inline-flex items-center border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
								aria-current="page"
							>
								{item.value}
							</button>
						{:else}
							<button
								class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
								on:click={() => goToPage(Number(item.value))}
							>
								{item.value}
							</button>
						{/if}
					{:else if item.type === 'ellipsis'}
						<span
							class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
						>
							{item.value}
						</span>
					{/if}
				{/each}

				<button
					class="relative inline-flex items-center rounded-e-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
					on:click={() => goToPage(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					<span class="sr-only">Next</span>
					<span class="icon-[heroicons--chevron-left] h-5 w-5"></span>
				</button>
			</nav>
		</div>
	</div>
</div>
