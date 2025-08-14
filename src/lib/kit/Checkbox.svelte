<script lang="ts">
	// Define props using Svelte 5 syntax
	const {
		id,
		name,
		checked = false,
		indeterminate = false,
		onChange = () => {},
		label = '',
		className = '',
		disabled = false,
		error = false
	} = $props<{
		id: string;
		name: string;
		checked?: boolean;
		indeterminate?: boolean;
		onChange?: (checked: boolean) => void;
		label?: string;
		className?: string;
		disabled?: boolean;
		error?: boolean;
	}>();

	// State for checkbox reference
	let checkboxRef = $state<HTMLInputElement | null>(null);

	// Update indeterminate state when prop changes
	$effect(() => {
		if (checkboxRef) {
			checkboxRef.indeterminate = indeterminate;
		}
	});

	// Handle change event
	function handleChange() {
		if (!disabled) {
			onChange(!checked);
		}
	}
</script>

<div class={`flex items-center ${className}`}>
	<div class="relative flex items-center">
		<input
			bind:this={checkboxRef}
			{id}
			{name}
			type="checkbox"
			{checked}
			{disabled}
			class="peer absolute z-10 h-5 w-5 cursor-pointer opacity-0"
			on:change={handleChange}
			aria-label={label || undefined}
			aria-invalid={error}
		/>
		<div
			class={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 bg-white transition-all duration-200 ease-in-out peer-focus:ring-2 peer-focus:ring-offset-2 ${
				indeterminate
					? 'border-blue-600 bg-blue-600 peer-hover:border-blue-700 peer-focus:ring-blue-500'
					: checked
						? 'border-blue-600 bg-blue-600 peer-hover:border-blue-700 peer-focus:ring-blue-500'
						: error
							? 'border-red-500 bg-red-50 peer-hover:border-red-600 peer-focus:ring-red-500'
							: disabled
								? 'border-gray-200 bg-gray-100'
								: 'border-gray-300 peer-hover:border-gray-400 peer-focus:ring-blue-500'
			} ${disabled ? 'cursor-not-allowed' : ''}`}
		>
			{#if indeterminate}
				<span
					class="icon-[heroicons--minus-small] h-3.5 w-3.5 transition-all duration-200 ease-in-out"
				></span>
			{:else if checked}
				<span class="icon-[heroicons--check] h-3.5 w-3.5 transition-all duration-200 ease-in-out"
				></span>
			{/if}
		</div>
	</div>
	{#if label}
		<label
			for={id}
			class={`ms-3 block text-sm font-medium transition-colors duration-200 ease-in-out select-none ${
				disabled
					? 'cursor-not-allowed text-gray-400'
					: error
						? 'text-red-600'
						: 'text-gray-700 peer-hover:text-gray-900 peer-focus:text-gray-900'
			}`}
		>
			{label}
		</label>
	{/if}
</div>
