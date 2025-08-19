<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { authUser, isLoggedIn } from '$lib/flow/auth.flow';
	import MobileNavbar from '$lib/kit/MobileNavbar.svelte';
	import Sidebar from '$lib/kit/Sidebar.svelte';
	import LogoutProvider from '$lib/providers/LogoutProvider.svelte';

	// State for sidebar visibility
	let isSidebarOpen = true;
	let isMobile = false;

	const checkMobile = () => {
		if (!browser) return false;

		isMobile = window.innerWidth < 900;
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
	$: navItems = [
		{ name: 'داشبورد', href: `${base}/panel`, icon: 'dashboard', category: 'General' },

		// Financial
		{ name: 'کارت‌ها', href: `${base}/panel/cards`, icon: 'credit-card', category: 'مالی' },
		{
			name: 'تراکنش‌ها',
			href: `${base}/panel/transactions`,
			icon: 'banknotes',
			category: 'مالی'
		},
		{
			name: 'واریز',
			href: `${base}/panel/deposit`,
			icon: 'arrow-down-tray',
			category: 'مالی'
		},

		// Account & Security
		{
			name: 'احراز هویت',
			href: `${base}/panel/kyc`,
			icon: 'identification',
			category: 'اکانت'
		},
		{
			name: 'نشست‌ها',
			href: `${base}/panel/sessions`,
			icon: 'device-phone-mobile',
			category: 'اکانت'
		},
		// Add wallet management link for admin users
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'wallet' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'کیف پول‌ها',
						href: `${base}/panel/admin/wallets`,
						icon: 'wallet',
						category: 'مدیریت'
					}
				]
			: []),
		// Add user management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'user' && p.permission.action === 'manage'
		)
			? [{ name: 'کاربران', href: `${base}/panel/admin/users`, icon: 'users', category: 'مدیریت' }]
			: []),
		// Add role management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'role' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'نقش‌ها',
						href: `${base}/panel/admin/roles`,
						icon: 'user-group',
						category: 'مدیریت'
					}
				]
			: []),
		// Add permission management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'permission' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'مجوزها',
						href: `${base}/panel/admin/permissions`,
						icon: 'shield-check',
						category: 'مدیریت'
					}
				]
			: []),
		// Add media management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'media' && p.permission.action === 'manage'
		)
			? [{ name: 'رسانه‌ها', href: `${base}/panel/admin/media`, icon: 'photo', category: 'مدیریت' }]
			: []),
		// Add KYC management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'kyc' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'احراز هویت',
						href: `${base}/panel/admin/kyc`,
						icon: 'identification',
						category: 'مدیریت'
					}
				]
			: []),
		// Add capacity management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'capacity' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'مدیریت ظرفیت',
						href: `${base}/panel/admin/capacity`,
						icon: 'server-stack',
						category: 'مدیریت'
					}
				]
			: [])
	];

	// Check if current route matches nav item (reactive)
	$: isActive = (href: string) => {
		// Get current pathname with base prefix
		const currentPath = $page.url.pathname;

		// Remove base prefix from href for comparison
		const hrefWithoutBase = href.startsWith(base) ? href.slice(base.length) : href;

		// Handle special case for dashboard
		if (hrefWithoutBase === '/panel') {
			return (
				currentPath === `${base}/panel` ||
				currentPath === `${base}/` ||
				currentPath === base ||
				currentPath === '/'
			);
		}

		// Normalize paths for comparison
		const normalizedCurrentPath = currentPath.endsWith('/')
			? currentPath.slice(0, -1)
			: currentPath;
		const normalizedHref = href.endsWith('/') ? href.slice(0, -1) : href;

		// For other routes, check for exact match or prefix match
		return (
			normalizedCurrentPath === normalizedHref ||
			normalizedCurrentPath.startsWith(normalizedHref + '/')
		);
	};

	$: if (!$isLoggedIn && browser) {
		goto('/login');
	}
</script>

<svelte:window on:resize={checkMobile} />

{#if $isLoggedIn}
	<LogoutProvider onLoggedOut={() => invalidateAll()} let:logout>
		<div class="flex h-screen bg-gray-50">
			<!-- Modern Mobile Navbar -->
			<MobileNavbar visible={isMobile} onToggleSidebar={toggleSidebar} onLogout={logout} />

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
				<main class="flex-1 overflow-y-auto p-4 pt-4 md:p-6" class:!pt-20={isMobile}>
					<div class="mx-auto max-w-7xl">
						<slot />
					</div>
				</main>
			</div>
		</div>
	</LogoutProvider>
{/if}
