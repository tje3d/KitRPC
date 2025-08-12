<script lang="ts">
	import { browser } from '$app/environment';
	import { pushState } from '$app/navigation';
	import Click from '$lib/actions/click.action';
	import { dialogStore } from '$lib/dialog/store';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { disableScroll } from '$lib/helpers/utils.helper';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';

	export let id: string;
	export let onClose: (() => void) | undefined = undefined;
	export let preventBackdropClose = false;
	export let preventDirtyClose = true;
	export let showClose = true;
	export let noPadding = false;
	export let center = true;
	export let isLatest = false;
	export let fullScreen = false;
	export let transitionType: 'scale' | 'fly' = 'scale';

	const dispatch = createEventDispatcher();

	let mouseDownOnBackdrop = false;
	let dialogElement: HTMLElement;

	const checkForDirtyInputs = (): boolean => {
		if (!browser || !dialogElement) return false;

		const formElements = dialogElement.querySelectorAll('input, textarea, select');
		return Array.from(formElements).some((element) => {
			if (element.hasAttribute('data-exclude-from-dirty-check')) return false;
			return (element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
		});
	};

	const handlePopState = () => {
		if (!browser || !isLatest) return;

		const state = window.history.state;
		if (!state || state.overlayType !== 'dialog' || state.overlayId !== id) {
			dialogStore.close(id);
			dispatch('close');
		}
	};

	const closeDialog = () => {
		if (browser) {
			history.back();
		} else {
			// Fallback for SSR - directly close the dialog
			dialogStore.close(id);
			dispatch('close');
		}
	};

	const handleMouseDown = (event: MouseEvent) => {
		mouseDownOnBackdrop = event.target === event.currentTarget;
	};

	const canClose = () => {
		if (preventBackdropClose) return false;
		if (!preventDirtyClose) return true;
		return !checkForDirtyInputs();
	};

	const handleBackdropClick = () => {
		if (isLatest && mouseDownOnBackdrop && canClose()) {
			closeDialog();
		}
		mouseDownOnBackdrop = false;
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (isLatest && event.key === 'Escape' && canClose()) {
			closeDialog();
		}
	};

	onMount(() => {
		if (browser) {
			pushState(window.location.href, { overlayType: 'dialog', overlayId: id });
			window.addEventListener('popstate', handlePopState);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('popstate', handlePopState);
		}
	});

	subscribe(disableScroll);

	$: transitionFn = transitionType === 'fly' ? fly : scale;
	$: transitionParams =
		transitionType === 'fly'
			? { duration: 300, x: '100%', opacity: 1 }
			: { duration: 200, start: 0.95, opacity: 0 };
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	class="fixed inset-0 z-[1003] overflow-y-auto bg-gray-600/50 backdrop-blur-sm transition-transform duration-150 ease-out dark:bg-neutral-900/50"
	class:scale-[1.02]={preventBackdropClose && mouseDownOnBackdrop}
	role="dialog"
	aria-modal="true"
	in:fade|local={{ duration: 150 }}
	out:fade|local={{ duration: 100 }}
	on:mousedown|self={handleMouseDown}
	on:click|self|stopPropagation={handleBackdropClick}
>
	<div
		class="{fullScreen
			? 'flex min-h-dvh items-stretch'
			: center
				? 'flex min-h-full items-center justify-center p-4'
				: 'flex justify-center p-4'} pointer-events-none"
	>
		<div
			bind:this={dialogElement}
			class={fullScreen
				? 'dark:bg-neutral-850 w-full bg-white shadow-xl'
				: 'dark:bg-neutral-850 relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl dark:border dark:border-neutral-700/25'}
			class:p-6={!noPadding && !fullScreen}
			transition:transitionFn|local={transitionParams}
			style="pointer-events: auto;"
		>
			{#if showClose}
				<button
					type="button"
					class="absolute end-4 top-4 z-10 flex size-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-black/5 active:bg-black/10 dark:text-gray-400 dark:hover:bg-white/5 dark:active:bg-white/10"
					use:Click
					on:click={closeDialog}
					aria-label="Close dialog"
				>
					<span class="icon-[heroicons--x-mark] size-6" />
				</button>
			{/if}
			<slot />
		</div>
	</div>
</div>
