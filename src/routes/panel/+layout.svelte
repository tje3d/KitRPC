<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/kit/Button.svelte';
	import Sidebar from '$lib/kit/Sidebar.svelte';
	import { onMount } from 'svelte';

	// State for sidebar visibility
	let isSidebarOpen = true;
	let isMobile = false;

	// Check if we're on mobile
	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
			if (isMobile) {
				isSidebarOpen = false;
			} else {
				isSidebarOpen = true;
			}
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

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
		return normalizedRouteId === normalizedHref || normalizedRouteId.startsWith(normalizedHref + '/');
	};
</script>

<div class="flex h-screen bg-gray-50">
	<!-- Sidebar -->
	<Sidebar bind:isOpen={isSidebarOpen} {isMobile} {navItems} {isActive} on:toggle={toggleSidebar} />

	<!-- Main content -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Top navigation bar (mobile) -->
		{#if isMobile}
			<header
				class="flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm"
			>
				<Button variant="secondary" on:click={toggleSidebar} className="p-2">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path>
					</svg>
				</Button>
			</header>
		{/if}

		<!-- Page content -->
		<main class="flex-1 overflow-y-auto p-4 md:p-6">
			<div class="mx-auto max-w-7xl">
				<slot />
			</div>
		</main>
	</div>
</div>
