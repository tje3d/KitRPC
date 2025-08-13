<script lang="ts">
	import { afterNavigate, invalidateAll } from '$app/navigation';
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { authUser } from '$lib/flow/auth.flow';
	import Balance from '$lib/kit/Balance.svelte';
	import Popover from '$lib/kit/Popover.svelte';
	import LogoutProvider from '$lib/providers/LogoutProvider.svelte';
	import { createEventDispatcher, tick } from 'svelte';
	import { fade } from 'svelte/transition';

	// Props
	export let isOpen: boolean = true;
	export let isMobile: boolean = false;
	export let navItems: Array<{ name: string; href: string; icon: string; category?: string }> = [];
	export let isActive: (href: string) => boolean = () => false;

	// Dispatch events
	const dispatch = createEventDispatcher();

	// Handle logout with confirmation dialog
	async function handleLogout(logout: () => void) {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'Confirm Logout',
				message:
					'Are you sure you want to log out? You will need to sign in again to access your tasks.',
				confirm: 'Logout',
				cancel: 'Cancel',
				color: 'red',
				onConfirm() {
					history.back();

					tick().then(() => {
						logout();
					});
				}
			}
		});
	}

	function onLoggedOut() {
		invalidateAll();
	}

	// Handle toggle event
	function handleToggle() {
		dispatch('toggle');
	}

	// Get icon component based on icon name
	function getIcon(iconName: string) {
		const icons: Record<string, string> = {
			dashboard: 'icon-[heroicons--home]',
			folder: 'icon-[heroicons--folder]',
			'check-circle': 'icon-[heroicons--check-circle]',
			calendar: 'icon-[heroicons--calendar]',
			'credit-card': 'icon-[heroicons--credit-card]',
			cog: 'icon-[heroicons--cog]',
			user: 'icon-[heroicons--user-circle]',
			'chevron-down': 'icon-[heroicons--chevron-down]',
			'chevron-up': 'icon-[heroicons--chevron-up]',
			profile: 'icon-[heroicons--user]',
			account: 'icon-[heroicons--identification]',
			help: 'icon-[heroicons--question-mark-circle]',
			theme: 'icon-[heroicons--moon]',
			logout: 'icon-[heroicons--arrow-left-on-rectangle]'
		};
		return icons[iconName] || icons.dashboard;
	}

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

	afterNavigate((nav) => {
		if (nav.from?.route.id && nav.to?.route.id && nav.from.route.id !== nav.to.route.id) {
			isOpen = false;
		}
	});
</script>

<!-- Sidebar backdrop (mobile only) -->
{#if isMobile && isOpen}
	<div
		class="bg-opacity-50 fixed inset-0 z-[90] touch-manipulation bg-black/25 lg:hidden"
		transition:fade|local
		on:click={handleToggle}
	></div>
{/if}

<!-- Sidebar -->
<aside
	class={`fixed inset-y-0 start-0 z-[100] w-64 transform bg-white shadow-xl transition-all duration-300 ease-in-out lg:static lg:translate-x-0
		${isOpen ? 'translate-x-0' : 'translate-x-full'}
		${isMobile ? 'h-full' : 'h-screen'}`}
>
	<div class="flex h-full flex-col">
		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto p-4">
			<!-- Sidebar header -->
			<div class="mb-4 flex items-center justify-between border-b border-gray-100 p-5">
				<div class="flex items-center space-x-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							></path>
						</svg>
					</div>
					<h1 class="text-xl font-bold text-gray-900">KitRPC</h1>
				</div>

				<!-- Close button (mobile only) -->
				{#if isMobile}
					<button
						on:click={handleToggle}
						class="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

			{#each Object.entries(groupedNavItems) as [category, items]}
				<div class="mb-2">
					{#if category !== 'General'}
						<button
							on:click={() => toggleSection(category)}
							class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold tracking-wider text-gray-500 transition-colors duration-200 hover:bg-gray-100"
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
						class={`mt-1 space-y-0.5 ${category !== 'General' && collapsedSections[category] ? 'hidden' : ''}`}
					>
						{#each items as item}
							{@const active = isActive(item.href)}
							<li>
								<a
									href={item.href}
									class={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
										${
											active
												? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
												: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
										}`}
								>
									<span class={getIcon(item.icon) + ' h-5 w-5'}></span>
									<span class="ms-3">{item.name}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>

		<!-- Balance section -->
		<div class="px-4 pb-4">
			<Balance />
		</div>

		<!-- User profile section -->
		<div class="border-t border-gray-100 p-4">
			<LogoutProvider {onLoggedOut} let:loading let:errorMessage let:clearError let:logout>
				<Popover position="auto" offset={10} showOnHover={false}>
					<div
						slot="trigger"
						class="flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 shadow-sm dark:from-gray-700 dark:to-gray-800 dark:text-gray-300"
						>
							<span class={getIcon('user') + ' h-5 w-5'}></span>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
								{$authUser?.username || 'User'}
							</p>
							{#if $authUser?.role?.name}
								<p class="truncate text-xs text-gray-500 dark:text-gray-400">
									{$authUser.role.name}
								</p>
							{/if}
						</div>
					</div>

					<div class="w-72 p-2">
						<!-- User info header -->
						<div
							class="flex items-center space-x-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
						>
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 shadow-sm dark:from-gray-700 dark:to-gray-800 dark:text-gray-300"
							>
								<span class={getIcon('user') + ' h-6 w-6'}></span>
							</div>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
									{$authUser?.username || 'User'}
								</p>
								{#if $authUser?.role?.name}
									<p class="truncate text-xs text-gray-500 dark:text-gray-400">
										{$authUser.role.name}
									</p>
								{/if}
							</div>
						</div>

						<!-- Divider -->
						<div class="my-2 border-t border-gray-100 dark:border-gray-700"></div>

						<!-- Menu items -->
						<div class="py-1">
							<a
								href="/panel/settings"
								class="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
							>
								<span class={getIcon('profile') + ' h-5 w-5'}></span>
								<span>Profile & Settings</span>
							</a>

							<a
								href="/panel/settings"
								class="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
							>
								<span class={getIcon('account') + ' h-5 w-5'}></span>
								<span>Account Management</span>
							</a>

							<a
								href="/panel/help"
								class="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
							>
								<span class={getIcon('help') + ' h-5 w-5'}></span>
								<span>Help & Support</span>
							</a>
						</div>

						<!-- Divider -->
						<div class="my-2 border-t border-gray-100 dark:border-gray-700"></div>

						<!-- Logout section -->
						<div class="py-1">
							<button
								on:click={() => handleLogout(logout)}
								disabled={loading}
								class="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
							>
								<span class={getIcon('logout') + ' h-5 w-5'}></span>
								<span>
									{#if loading}
										<span class="flex items-center justify-center gap-2">
											<span
												class="iconify h-4 w-4 animate-spin"
												data-icon="svg-spinners:bars-scale-fade"
											></span>
											Logging out...
										</span>
									{:else}
										Logout
									{/if}
								</span>
							</button>

							<!-- Logout error display -->
							{#if errorMessage}
								<div class="mt-2 rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
									<div class="flex items-center gap-2">
										<span
											class="iconify h-4 w-4 text-red-500 dark:text-red-400"
											data-icon="heroicons:exclamation-circle-20-solid"
										></span>
										<span class="text-sm text-red-700 dark:text-red-300">{errorMessage}</span>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</Popover>
			</LogoutProvider>
		</div>
	</div>
</aside>
