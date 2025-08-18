<script lang="ts">
	import Focus from '../actions/focus.action';
	import Input from '../kit/Input.svelte';

	export let title: string = 'Warning!';
	export let message: string = 'Are you sure?';
	export let cancel: string = 'Cancel';
	export let confirm: string = 'Ok';
	export let onConfirm: (textInputValue?: string) => void = () => history.back();
	export let onCancel: () => void = () => history.back();
	export let color: 'red' | 'blue' = 'blue';

	// New props for text input
	export let showTextInput: boolean = false;
	export let textInputRequired: boolean = false;
	export let textInputLabel: string = 'Additional Information';
	export let textInputPlaceholder: string = 'Enter details here...';
	export let textInputValue: string = '';

	let textInputValid: boolean = true;

	const colors = {
		red: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
		blue: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
	};

	function handleConfirm() {
		if (showTextInput && textInputRequired && !textInputValue.trim()) {
			textInputValid = false;
			return;
		}

		textInputValid = true;
		onConfirm(textInputValue);
	}
</script>

<div role="dialog">
	{#if title}
		<h2 class="mb-4 text-2xl font-semibold text-black dark:text-white">
			{title}
		</h2>
	{/if}

	{#if message}
		<p class="dark:text-slate-450 mb-6 text-slate-500">
			{message}
		</p>
	{/if}

	{#if showTextInput}
		<div class="mb-6">
			<label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
				{textInputLabel}
				{#if textInputRequired}
					<span class="text-red-500">*</span>
				{/if}
			</label>
			<textarea
				bind:value={textInputValue}
				placeholder={textInputPlaceholder}
				class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white {textInputValid
					? ''
					: 'border-red-500'}"
				rows="4"
			></textarea>
			{#if !textInputValid}
				<p class="mt-1 text-sm text-red-500">This field is required</p>
			{/if}
		</div>
	{/if}

	<div class="flex justify-end gap-3">
		<button
			class="dark:hover:bg-slate-750 rounded-lg bg-slate-200 px-5 py-2 text-slate-600 transition hover:bg-slate-300 focus:ring-2 focus:ring-slate-400 focus:outline-none dark:bg-slate-800 dark:text-slate-300 dark:focus:ring-slate-600"
			on:click={onCancel}
		>
			{cancel}
		</button>
		<button
			use:Focus
			class="rounded-lg px-5 py-2 text-white transition focus:ring-2 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-500 {colors[
				color
			]}"
			on:click={handleConfirm}
		>
			{confirm}
		</button>
	</div>
</div>
