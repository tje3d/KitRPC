<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { isLoggedIn } from '$lib/flow/auth.flow';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	$: if ($isLoggedIn && browser) {
		goto('/panel');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	<div class="w-full max-w-md" in:fly={{ y: 20, duration: 600, easing: quintOut }}>
		<!-- Header -->
		<div class="mb-6 text-center">
			<div
				class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600"
			>
				<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
	</div>
</div>
