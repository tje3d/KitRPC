<script lang="ts">
	import { onDestroy } from 'svelte';

	export let condition = false;
	export let callback: (() => void) | undefined = undefined;
	export let interval = 0;
	export let teardown: (() => void) | undefined = undefined;

	let intervalId: NodeJS.Timeout | undefined = undefined;
	let initialized = false;

	$: if (condition && callback) {
		if (interval > 0) {
			if (!intervalId) {
				intervalId = setInterval(() => {
					if (condition) callback();
				}, interval);
			}
		} else {
			if (!initialized) {
				callback();
				initialized = true;
			}
		}
	} else {
		clearInterval(intervalId);
		intervalId = undefined;
		initialized = false;
	}

	// Handle teardown
	let previousCondition = false;
	$: if (condition !== previousCondition) {
		if (!condition && teardown && previousCondition) teardown();
		previousCondition = condition;
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
		if (condition && teardown) teardown();
	});
</script>

<slot />
