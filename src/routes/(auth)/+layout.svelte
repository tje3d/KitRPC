<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { isLoggedIn } from '$lib/flow/auth.flow';
	import BackgroundDecoration from '$lib/kit/BackgroundDecoration.svelte';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	$: if ($isLoggedIn && browser) {
		goto('/panel');
	}
</script>

<svelte:head>
	<title>Todo Manager</title>
	<meta name="description" content="Todo Manager - Organize your tasks efficiently" />
</svelte:head>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4"
>
	<BackgroundDecoration />

	<div class="relative z-10 w-full max-w-md" in:fly={{ y: 20, duration: 600, easing: quintOut }}>
		<!-- Header -->
		<div class="text-center">
			<div
				class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg"
			>
				<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<slot name="header" />
		</div>

		<slot />

		<!-- Security Notice -->
		<div class="mt-8 text-center">
			<p class="text-xs leading-relaxed text-gray-500">
				Protected by industry-standard encryption.
				<a href="/security" class="text-blue-600 hover:text-blue-800 hover:underline">Learn more</a>
			</p>
		</div>
	</div>
</div>
