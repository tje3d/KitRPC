<script lang="ts">
	export let className: string = '';
	export let sortable: boolean = false;
	export let sortKey: string = '';
	export let onSort: ((key: string) => void) | null = null;
	export let getSortIcon: ((key: string) => string) | null = null;

	function handleSort() {
		if (sortable && onSort) {
			onSort(sortKey);
		}
	}
</script>

<!-- Header Column -->
{#if $$slots.header}
	<th
		scope="col"
		class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase {className}"
		class:cursor-pointer={sortable}
		on:click={handleSort}
	>
		<div class="flex items-center">
			<slot name="header" />
			{#if sortable && getSortIcon}
				<span class="ms-1 h-4 w-4 text-gray-400 {getSortIcon(sortKey)}"></span>
			{/if}
		</div>
	</th>
{/if}

<!-- Data Column -->
{#if $$slots.default}
	<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 {className}">
		<slot />
	</td>
{/if}
