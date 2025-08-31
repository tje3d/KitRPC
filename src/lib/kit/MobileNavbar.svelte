<script lang="ts">
	import { base } from '$app/paths';
	import { authUser, userDisplayName } from '$lib/flow/auth.flow';
	import Button from './Button.svelte';
	import Popover from './Popover.svelte';

	/** @type {boolean} - Whether the mobile navbar is visible */
	export let visible: boolean = true;

	/** @type {Function} - Function to toggle sidebar */
	export let onToggleSidebar: () => void;

	/** @type {Function} - Function to handle logout */
	export let onLogout: () => void;

	// State for user popover
	let showUserPopover = false;

	// Get user initials for avatar
	$: userInitials = $userDisplayName?.charAt(0)?.toUpperCase() || 'U';
	$: userRole = $authUser?.role?.name;
</script>

{#if visible}
	<!-- Modern Mobile Navbar -->
	<div
		class="fixed top-0 right-0 left-0 z-50 border-b border-gray-200/50 bg-white/95 shadow-lg backdrop-blur-md"
	>
		<div class="flex items-center justify-between px-4 py-3">
			<!-- Left side - Menu toggle -->
			<div class="flex items-center">
				<Button
					variant="ghost"
					onClick={onToggleSidebar}
					className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:scale-105 active:scale-95"
				>
					<span class="icon-[heroicons--bars-3] h-6 w-6 text-gray-700"></span>
				</Button>
			</div>

			<!-- Center - App title/logo -->
			<div class="flex items-center">
				<h1
					class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent"
				>
					KitRPC
				</h1>
			</div>

			<!-- Right side - User menu -->
			<div class="flex items-center">
				<Popover
					bind:visible={showUserPopover}
					position="bottom"
					showOnHover={false}
					showOnClick={true}
					className="w-56 p-0 rounded-xl shadow-xl border border-gray-200/50"
				>
					<div
						slot="trigger"
						class="flex cursor-pointer touch-manipulation items-center space-x-2 rounded-xl p-1 transition-all duration-200 hover:bg-gray-100/50"
					>
						<!-- Modern User Avatar -->
						<div class="relative">
							<div
								class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-lg ring-2 ring-white"
							>
								{userInitials}
							</div>
							<!-- Online indicator -->
							<div
								class="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"
							></div>
						</div>
						<!-- Chevron down icon -->
						<span
							class="icon-[heroicons--chevron-down] h-4 w-4 text-gray-500 transition-transform duration-200"
							class:rotate-180={showUserPopover}
						></span>
					</div>

					<!-- Modern Popover Content -->
					<div class="py-2">
						<!-- User Info Section -->
						<div class="border-b border-gray-100 px-4 py-3">
							<div class="flex items-center space-x-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white"
								>
									{userInitials}
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-semibold text-gray-900">{$userDisplayName}</p>
									{#if userRole}
										<p class="truncate text-xs text-gray-500">{userRole}</p>
									{/if}
								</div>
							</div>
						</div>

						<!-- Menu Items -->
						<div class="py-2">
							<a
								href="{base}/panel/settings/profile"
								class="flex items-center px-4 py-2.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50"
							>
								<span class="icon-[heroicons--user-circle] mr-3 h-5 w-5 text-gray-400"></span>
								<span>پروفایل</span>
							</a>
							<div class="my-2 border-t border-gray-100"></div>
							<button
								class="flex w-full items-center px-4 py-2.5 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50"
								on:click={onLogout}
							>
								<span class="icon-[heroicons--arrow-right-on-rectangle] mr-3 h-5 w-5 text-red-500"
								></span>
								<span>خروج</span>
							</button>
						</div>
					</div>
				</Popover>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom styles for enhanced mobile navbar */
	:global(.mobile-navbar-backdrop) {
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
</style>
