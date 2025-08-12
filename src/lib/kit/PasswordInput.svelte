<script lang="ts">
	/** @type {string} - Input ID (required) */
	export let id: string;

	/** @type {string} - Input name (required) */
	export let name: string;

	/** @type {string} - Input value (bound) */
	export let value: string = '';

	/** @type {string} - Placeholder text */
	export let placeholder: string = '';

	/** @type {any} - Autocomplete attribute */
	export let autocomplete: any = undefined;

	/** @type {boolean} - Whether the input is disabled */
	export let disabled: boolean = false;

	/** @type {boolean} - Whether the input is in error state */
	export let error: boolean = false;

	/** @type {Function} - Blur event handler */
	export let onBlur: () => void = () => {};

	/** @type {Function} - Change event handler */
	export let onChange: () => void = () => {};

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {boolean} - Whether to show password */
	export let showPassword: boolean = false;

	/** @type {Function} - Toggle visibility handler */
	export let onToggle: () => void = () => {};

	// Base input classes with modern styling
	const baseInputClasses =
		'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-700 placeholder-gray-400 shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed';

	// Error input classes with enhanced visual feedback
	const errorInputClasses = 'border-red-500 bg-red-50 focus:ring-red-500 focus:shadow-red-100';

	// Hover state classes
	const hoverInputClasses = 'hover:border-gray-400 hover:shadow-md';

	// Combined classes with all states
	$: inputClasses = `${baseInputClasses} ${error ? errorInputClasses : ''} ${className} ${hoverInputClasses}`;

	// Handle input event with proper typing
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
	}

	// Toggle password visibility
	function togglePassword() {
		onToggle();
	}
</script>

<div class="relative">
	<input
		{id}
		{name}
		type={showPassword ? 'text' : 'password'}
		{placeholder}
		{autocomplete}
		{disabled}
		bind:value
		class={inputClasses}
		aria-invalid={error}
		aria-describedby={error ? `${id}-error` : undefined}
		on:blur={onBlur}
		on:change={onChange}
		on:input={handleInput}
	/>
	<button
		type="button"
		on:click={togglePassword}
		class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-all duration-200 ease-in-out hover:text-gray-600 focus:text-gray-700 focus:outline-none"
		aria-label={showPassword ? 'Hide password' : 'Show password'}
	>
		{#if showPassword}
			<svg
				class="h-5 w-5 transition-all duration-200 ease-in-out"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.878L3 3m6.888 6.878L21 21"
				/>
			</svg>
		{:else}
			<svg
				class="h-5 w-5 transition-all duration-200 ease-in-out"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
				/>
			</svg>
		{/if}
	</button>
</div>
