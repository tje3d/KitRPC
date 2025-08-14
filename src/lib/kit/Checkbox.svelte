<script lang="ts">
	export let id: string;
	export let name: string;
	export let checked: boolean = false;
	export let indeterminate: boolean = false;
	export let onChange: (checked: boolean) => void = () => {};
	export let label: string = '';
	export let className: string = '';
	export let disabled: boolean = false;
	export let error: boolean = false;

	// State for checkbox reference
	let checkboxRef: HTMLInputElement | null = null;

	// Update indeterminate state when prop changes using reactive statement
	$: if (checkboxRef) {
		checkboxRef.indeterminate = indeterminate;
	}

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
			bind:checked
			{disabled}
			class="peer absolute z-10 h-6 w-6 cursor-pointer opacity-0"
			on:change={handleChange}
			aria-label={label || undefined}
			aria-invalid={error}
		/>
		<div
			class={`group relative flex h-6 w-6 transform cursor-pointer items-center justify-center rounded-lg border-2 shadow-sm transition-all duration-300 ease-out peer-focus:ring-4 peer-focus:ring-offset-1 peer-active:scale-95 ${
				indeterminate
					? 'border-indigo-500 bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-200 peer-hover:from-indigo-600 peer-hover:to-indigo-700 peer-hover:shadow-md peer-focus:ring-indigo-200'
					: checked
						? 'border-indigo-500 bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-200 peer-hover:from-indigo-600 peer-hover:to-indigo-700 peer-hover:shadow-md peer-focus:ring-indigo-200'
						: error
							? 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 shadow-red-100 peer-hover:border-red-500 peer-hover:from-red-100 peer-hover:to-red-200 peer-focus:ring-red-200'
							: disabled
								? 'border-gray-200 bg-gray-50 shadow-gray-100'
								: 'border-gray-300 bg-white shadow-gray-100 peer-hover:border-indigo-300 peer-hover:bg-indigo-50 peer-hover:shadow-indigo-100 peer-focus:ring-indigo-200'
			} ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg'}`}
		>
			{#if indeterminate}
				<span
					class="icon-[heroicons--minus-small] h-4 w-4 transform text-white transition-all duration-300 ease-out group-hover:scale-110"
				></span>
			{:else if checked}
				<span
					class="icon-[heroicons--check] animate-in zoom-in-50 h-4 w-4 transform text-white transition-all duration-200 ease-out group-hover:scale-110"
				></span>
			{/if}
			<!-- Subtle inner glow effect -->
			<div
				class={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
					checked || indeterminate
						? 'bg-gradient-to-br from-white/20 to-transparent opacity-100'
						: 'opacity-0'
				}`}
			></div>
		</div>
	</div>
	{#if label}
		<label
			for={id}
			class={`ms-3 block cursor-pointer text-sm font-medium transition-all duration-300 ease-out select-none ${
				disabled
					? 'cursor-not-allowed text-gray-400 opacity-60'
					: error
						? 'text-red-600 hover:text-red-700'
						: 'text-gray-700 peer-focus:text-indigo-600 hover:text-indigo-600'
			}`}
		>
			{label}
		</label>
	{/if}
</div>
