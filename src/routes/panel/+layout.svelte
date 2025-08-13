<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { authUser, isLoggedIn } from '$lib/flow/auth.flow';
	import Button from '$lib/kit/Button.svelte';
	import Popover from '$lib/kit/Popover.svelte';
	import Sidebar from '$lib/kit/Sidebar.svelte';
	import LogoutProvider from '$lib/providers/LogoutProvider.svelte';

	// State for sidebar visibility
	let isSidebarOpen = true;
	let isMobile = false;
	let showUserPopover = false;

	const checkMobile = () => {
		if (!browser) return false;

		isMobile = window.innerWidth < 768;
		if (isMobile) {
			isSidebarOpen = false;
		} else {
			isSidebarOpen = true;
		}
	};

	checkMobile();

	// Toggle sidebar visibility
	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	// Navigation items
	const navItems = [
		{ name: 'Dashboard', href: '/panel', icon: 'dashboard', category: 'General' },
		{ name: 'Projects', href: '/panel/projects', icon: 'folder', category: 'Work' },
		{ name: 'Tasks', href: '/panel/tasks', icon: 'check-circle', category: 'Work' },
		{ name: 'Calendar', href: '/panel/calendar', icon: 'calendar', category: 'Work' },
		{ name: 'Cards', href: '/panel/cards', icon: 'credit-card', category: 'Work' },
		{ name: 'Transactions', href: '/panel/transactions', icon: 'credit-card', category: 'Work' },
		{ name: 'Settings', href: '/panel/settings', icon: 'cog', category: 'General' }
	];

	// Check if current route matches nav item (reactive)
	$: isActive = (href: string) => {
		// Use route.id for more reliable matching
		const routeId = $page.route.id || '/';

		// Handle special case for dashboard
		if (href === '/panel') {
			return routeId === '/panel' || routeId === '/';
		}

		// Normalize paths for comparison
		const normalizedRouteId = routeId.endsWith('/') ? routeId.slice(0, -1) : routeId;
		const normalizedHref = href.endsWith('/') ? href.slice(0, -1) : href;

		// For other routes, check for exact match or prefix match
		return (
			normalizedRouteId === normalizedHref || normalizedRouteId.startsWith(normalizedHref + '/')
		);
	};
</script>

<svelte:window on:resize={checkMobile} />

{#if $isLoggedIn}
	<LogoutProvider onLoggedOut={() => invalidateAll()} let:logout>
		<div class="flex h-screen bg-gray-50">
			<!-- Mobile navbar -->
			{#if isMobile}
				<div
					class="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white shadow-sm md:hidden"
				>
					<div class="flex items-center justify-between px-4 py-3">
						<!-- Toggle sidebar button -->
						<Button
							variant="secondary"
							onClick={toggleSidebar}
							className="p-2 rounded-lg hover:bg-gray-100"
						>
							<span class="icon-[heroicons--bars-3] h-6 w-6 text-gray-600"></span>
						</Button>

						<!-- User avatar with popover -->
						<Popover
							bind:visible={showUserPopover}
							position="bottom"
							showOnHover={false}
							showOnClick={true}
							className="w-48 p-0"
						>
							<div
								slot="trigger"
								class="flex cursor-pointer touch-manipulation items-center space-x-2"
							>
								<!-- User avatar -->
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white"
								>
									{$authUser?.username.charAt(0)?.toUpperCase() || 'U'}
								</div>
							</div>

							<!-- Popover content -->
							<div class="py-2">
								<div class="border-b border-gray-100 px-4 py-2">
									<p class="text-sm font-medium text-gray-900">{$authUser?.username || 'User'}</p>
									{#if $authUser?.role}
										<p class="text-xs text-gray-500">{$authUser.role.name}</p>
									{/if}
								</div>
								<div class="py-1">
									<a
										href="/panel/settings"
										class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									>
										<span class="icon-[heroicons--cog-6-tooth] mr-2 inline h-4 w-4"></span>
										Settings
									</a>
									<button
										class="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
										on:click={logout}
									>
										<span class="icon-[heroicons--arrow-right-on-rectangle] mr-2 inline h-4 w-4"
										></span>
										Logout
									</button>
								</div>
							</div>
						</Popover>
					</div>
				</div>
			{/if}

			<!-- Sidebar -->
			<Sidebar
				bind:isOpen={isSidebarOpen}
				{isMobile}
				{navItems}
				{isActive}
				on:toggle={toggleSidebar}
			/>

			<!-- Main content -->
			<div class="flex flex-1 flex-col overflow-hidden">
				<!-- Page content -->
				<main
					class="flex-1 overflow-y-auto p-4 pt-20 md:p-6 md:pt-6"
					class:pt-20={isMobile}
					class:md:pt-6={true}
				>
					<div class="mx-auto max-w-7xl">
						<slot />
					</div>
				</main>
			</div>
		</div>
	</LogoutProvider>
{/if}
