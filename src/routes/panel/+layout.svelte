<script lang="ts">
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { authUser, isLoggedIn } from '$lib/flow/auth.flow';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import KycStatusIndicator from '$lib/kit/KycStatusIndicator.svelte';
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
	$: navItems = [
		{ name: 'Dashboard', href: `${base}/panel`, icon: 'dashboard', category: 'General' },

		// Financial
		{ name: 'Cards', href: `${base}/panel/cards`, icon: 'credit-card', category: 'Financial' },
		{
			name: 'Transactions',
			href: `${base}/panel/transactions`,
			icon: 'banknotes',
			category: 'Financial'
		},
		{
			name: 'Deposit',
			href: `${base}/panel/deposit`,
			icon: 'arrow-down-tray',
			category: 'Financial'
		},

		// Account & Security
		{
			name: 'KYC Verification',
			href: `${base}/panel/kyc`,
			icon: 'identification',
			category: 'Account'
		},
		{
			name: 'Sessions',
			href: `${base}/panel/sessions`,
			icon: 'device-phone-mobile',
			category: 'Account'
		},
		// Add wallet management link for admin users
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'wallet' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'Wallets',
						href: `${base}/panel/admin/wallets`,
						icon: 'wallet',
						category: 'Admin'
					}
				]
			: []),
		// Add user management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'user' && p.permission.action === 'manage'
		)
			? [{ name: 'Users', href: `${base}/panel/admin/users`, icon: 'users', category: 'Admin' }]
			: []),
		// Add role management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'role' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'Roles',
						href: `${base}/panel/admin/roles`,
						icon: 'user-group',
						category: 'Admin'
					}
				]
			: []),
		// Add permission management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'permission' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'Permissions',
						href: `${base}/panel/admin/permissions`,
						icon: 'shield-check',
						category: 'Admin'
					}
				]
			: []),
		// Add media management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'media' && p.permission.action === 'manage'
		)
			? [{ name: 'Media', href: `${base}/panel/admin/media`, icon: 'photo', category: 'Admin' }]
			: []),
		// Add KYC management link for users with appropriate permissions
		...(($authUser?.role?.permissions || []).some(
			(p) => p.permission.resource === 'kyc' && p.permission.action === 'manage'
		)
			? [
					{
						name: 'KYC',
						href: `${base}/panel/admin/kyc`,
						icon: 'identification',
						category: 'Admin'
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

	// Helper functions to determine individual step statuses
	function getStep1Status() {
		if (!$authUser?.kycVerification) return undefined;
		return $authUser.kycVerification.step1Status || null;
	}

	function getStep2Status() {
		if (!$authUser?.kycVerification) return undefined;
		return $authUser.kycVerification.step2Status || null;
	}

	// Determine if we should show the KYC indicator for each step
	$: showStep1Indicator = $isLoggedIn && getStep1Status() !== 'APPROVED';
	$: showStep2Indicator =
		$isLoggedIn && getStep1Status() === 'APPROVED' && getStep2Status() !== 'APPROVED';

	// Get messages for each step
	$: step1Message = !$authUser?.kycVerification
		? 'Please complete your KYC verification step 1 to continue.'
		: getStep1Status() === 'REJECTED'
			? 'Your KYC step 1 verification was rejected. Please try again.'
			: getStep1Status() === 'PENDING'
				? 'Your KYC step 1 verification is in progress. You can check the status in the KYC page.'
				: 'Complete KYC step 1 to continue.';

	$: step2Message =
		!$authUser?.kycVerification || getStep1Status() !== 'APPROVED'
			? 'Please complete KYC step 1 first to unlock step 2.'
			: getStep2Status() === 'REJECTED'
				? 'Your KYC step 2 verification was rejected. Please try again.'
				: getStep2Status() === 'PENDING'
					? 'Your KYC step 2 verification is in progress. You can check the status in the KYC page.'
					: 'Complete KYC step 2 to finish verification.';
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
										href="{base}/panel/settings/profile"
										class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									>
										<span class="icon-[heroicons--cog-6-tooth] mr-2 inline h-4 w-4"></span>
										Profile
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
				<main class="flex-1 overflow-y-auto p-4 pt-4 md:p-6 md:pt-6" class:pt-20={isMobile}>
					<!-- KYC Status Indicators -->
					{#if showStep1Indicator || showStep2Indicator}
						<div class="mx-auto max-w-7xl">
							<Card variant="flat" className="mb-6">
								<div class="space-y-4">
									<!-- Step 1 Indicator -->
									{#if showStep1Indicator}
										<div class="flex flex-col md:flex-row md:items-center md:justify-between">
											<div class="flex items-start space-x-3">
												<KycStatusIndicator status={getStep1Status()} size="md" showLabel={false} />
												<div>
													<h3 class="text-sm font-medium text-gray-900">
														{#if $authUser?.kycVerification === undefined || getStep1Status() === 'REJECTED'}
															KYC Step 1 Verification Required
														{:else if getStep1Status() === 'PENDING'}
															KYC Step 1 Verification in Progress
														{:else}
															KYC Step 1 Complete
														{/if}
													</h3>
													<p class="mt-1 text-sm text-gray-600">{step1Message}</p>
												</div>
											</div>
											<div
												class="mt-3 flex flex-col space-y-2 md:mt-0 md:flex-row md:space-y-0 md:space-x-3"
											>
												{#if getStep1Status() === 'PENDING'}
													<KycStatusIndicator
														status={getStep1Status()}
														size="sm"
														showLabel={true}
													/>
												{/if}
												<Button href="{base}/panel/kyc" variant="primary" size="sm">
													{#if $authUser?.kycVerification === undefined || getStep1Status() === 'REJECTED' || getStep1Status() === null}
														Start KYC Step 1
													{:else}
														View Status
													{/if}
												</Button>
											</div>
										</div>
									{/if}

									<!-- Step 2 Indicator -->
									{#if showStep2Indicator}
										<div class="flex flex-col md:flex-row md:items-center md:justify-between">
											<div class="flex items-start space-x-3">
												<KycStatusIndicator status={getStep2Status()} size="md" showLabel={false} />
												<div>
													<h3 class="text-sm font-medium text-gray-900">
														{#if getStep2Status() === 'REJECTED'}
															KYC Step 2 Verification Required
														{:else if getStep2Status() === 'PENDING'}
															KYC Step 2 Verification in Progress
														{:else}
															KYC Step 2 Not Started
														{/if}
													</h3>
													<p class="mt-1 text-sm text-gray-600">{step2Message}</p>
												</div>
											</div>
											<div
												class="mt-3 flex flex-col space-y-2 md:mt-0 md:flex-row md:space-y-0 md:space-x-3"
											>
												{#if getStep2Status() === 'PENDING'}
													<KycStatusIndicator
														status={getStep2Status()}
														size="sm"
														showLabel={true}
													/>
												{/if}
												<Button href="{base}/panel/kyc" variant="primary" size="sm">
													{#if getStep2Status() === 'REJECTED' || getStep2Status() === null}
														Start KYC Step 2
													{:else}
														View Status
													{/if}
												</Button>
											</div>
										</div>
									{/if}
								</div>
							</Card>
						</div>
					{/if}

					<div class="mx-auto max-w-7xl">
						<slot />
					</div>
				</main>
			</div>
		</div>
	</LogoutProvider>
{/if}
