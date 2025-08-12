<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from '$lib/kit/Sidebar.svelte';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
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
		{ name: 'Dashboard', href: '/panel', icon: 'dashboard' },
		{ name: 'Projects', href: '/panel/projects', icon: 'folder' },
		{ name: 'Tasks', href: '/panel/tasks', icon: 'check-circle' },
		{ name: 'Calendar', href: '/panel/calendar', icon: 'calendar' },
		{ name: 'Settings', href: '/panel/settings', icon: 'cog' }
	];

	// Check if current route matches nav item
	function isActive(href: string) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
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
				<h1 class="text-xl font-bold text-gray-800">Dashboard</h1>
				<div class="w-10"></div>
				<!-- Spacer for alignment -->
			</header>
		{/if}

		<!-- Page content -->
		<main class="flex-1 overflow-y-auto p-4 md:p-6">
			<div class="mx-auto max-w-7xl">
				<Card>
					<slot />
				</Card>
			</div>
		</main>
	</div>
</div>
