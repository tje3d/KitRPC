<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let isOpen: boolean = true;
	export let isMobile: boolean = false;
	export let navItems: Array<{ name: string; href: string; icon: string; category?: string }> = [];
	export let isActive: (href: string) => boolean = () => false;

	// Dispatch events
	const dispatch = createEventDispatcher();

	// Handle toggle event
	function handleToggle() {
		dispatch('toggle');
	}

	// Get icon component based on icon name
	function getIcon(iconName: string) {
		const icons: Record<string, string> = {
			dashboard: 'icon-[heroicons--home-20-solid]',
			folder: 'icon-[heroicons--folder-20-solid]',
			'check-circle': 'icon-[heroicons--check-circle-20-solid]',
			calendar: 'icon-[heroicons--calendar-20-solid]',
			cog: 'icon-[heroicons--cog-20-solid]',
			user: 'icon-[heroicons--user-circle-20-solid]'
		};
		return icons[iconName] || icons.dashboard;
	}

	// User profile data (in a real app, this would come from a store or context)
	let userProfile = {
		name: 'John Doe',
		email: 'john@example.com',
		avatar: ''
	};

	// Collapsible sections state
	let collapsedSections: Record<string, boolean> = {};

	// Toggle section collapse state
	function toggleSection(category: string) {
		collapsedSections[category] = !collapsedSections[category];
	}

	// Group nav items by category
	$: groupedNavItems = navItems.reduce(
		(acc, item) => {
			const category = item.category || 'General';
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(item);
			return acc;
		},
		{} as Record<string, typeof navItems>
	);
</script>

<!-- Sidebar backdrop (mobile only) -->
{#if isMobile && isOpen}
	<div class="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden" on:click={handleToggle}></div>
{/if}

<!-- Sidebar -->
<aside
	class={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-all duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none
		${isOpen ? 'translate-x-0' : '-translate-x-full'} 
		${isMobile ? 'h-full' : 'h-screen'}`}
>
	<div class="flex h-full flex-col">
		<!-- Sidebar header -->
		<div class="flex items-center justify-between border-b border-gray-200 p-4">
			<div class="flex items-center space-x-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						></path>
					</svg>
				</div>
				<h1 class="text-xl font-bold text-gray-800">KitRPC</h1>
			</div>

			<!-- Close button (mobile only) -->
			{#if isMobile}
				<button
					on:click={handleToggle}
					class="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			{/if}
		</div>

		<!-- User profile section -->
		<div class="border-b border-gray-200 p-4">
			<div class="flex items-center space-x-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500"
				>
					<span class={getIcon('user') + ' h-6 w-6'}></span>
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-gray-800">{userProfile.name}</p>
					<p class="truncate text-sm text-gray-500">{userProfile.email}</p>
				</div>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto p-4">
			{#each Object.entries(groupedNavItems) as [category, items]}
				<div class="mb-4">
					{#if category !== 'General'}
						<button
							on:click={() => toggleSection(category)}
							class="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase hover:bg-gray-100"
						>
							<span>{category}</span>
							<svg
								class={`h-4 w-4 transition-transform duration-200 ${collapsedSections[category] ? 'rotate-180' : ''}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								></path>
							</svg>
						</button>
					{/if}
					<ul
						class={`mt-1 space-y-1 ${category !== 'General' && collapsedSections[category] ? 'hidden' : ''}`}
					>
						{#each items as item}
							{@const active = isActive(item.href)}
							<li>
								<a
									href={item.href}
									class={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200
										${active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
								>
									<span class={getIcon(item.icon) + ' h-5 w-5'}></span>
									<span class="ml-3">{item.name}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>

		<!-- Sidebar footer -->
		<div class="border-t border-gray-200 p-4">
			<button
				on:click={handleToggle}
				class="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
			>
				<svg
					class={`h-5 w-5 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
					></path>
				</svg>
				<span class="ml-2">{isOpen ? 'Collapse' : 'Expand'}</span>
			</button>
		</div>
	</div>
</aside>

<!-- Sidebar toggle button (desktop only, when sidebar is collapsed) -->
{#if !isMobile && !isOpen}
	<button
		on:click={handleToggle}
		class="fixed top-1/2 left-0 z-40 rounded-r-lg bg-white p-2 shadow-md hover:bg-gray-50"
	>
		<svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
		</svg>
	</button>
{/if}
