<script lang="ts">
	import { toasts$ } from './store.js';
	import Toast from './Toast.svelte';
</script>

<!-- ARIA live region -->
<div aria-live="polite" aria-atomic="false" class="sr-only">
	{$toasts$.map((t) => `${t.variant}: ${t.message}`).join(', ')}
</div>

<!-- Visual container -->
<div
	class="pointer-events-none fixed top-6 right-6 z-[1100] flex flex-col gap-3 max-sm:top-4 max-sm:right-4 max-sm:left-4"
>
	{#each $toasts$ as t (t.id)}
		<Toast data={t} />
	{/each}
</div>
