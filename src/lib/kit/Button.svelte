<script lang="ts">
	/** @type {string} - Button type (button, submit, reset) */
	export let type: 'button' | 'submit' | 'reset' = 'button';

	/** @type {boolean} - Whether the button is disabled */
	export let disabled: boolean = false;

	/** @type {boolean} - Whether the button is in loading state */
	export let loading: boolean = false;

	/** @type {Function} - Click handler function */
	export let onClick: () => void = () => {};

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {string} - Button variant (primary, secondary, gradient) */
	export let variant:
		| 'primary'
		| 'secondary'
		| 'gradient'
		| 'gradient-secondary'
		| 'gradient-success' = 'primary';

	// Base button classes
	const baseButtonClasses =
		'w-full transform rounded-2xl px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:ring-2 focus:ring-offset-2 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-lg';

	// Variant classes
	$: variantClasses =
		{
			primary: 'bg-blue-600 focus:ring-blue-500',
			secondary: 'bg-gray-600 focus:ring-gray-500',
			gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 focus:ring-blue-500',
			'gradient-secondary': 'bg-gradient-to-r from-gray-600 to-gray-800 focus:ring-gray-500',
			'gradient-success': 'bg-gradient-to-r from-green-500 to-emerald-600 focus:ring-green-500'
		}[variant] || 'bg-blue-600 focus:ring-blue-500';

	// Combined classes
	$: buttonClasses = `${baseButtonClasses} ${variantClasses} ${className}`;

	// Effective disabled state (disabled when explicitly disabled or when loading)
	$: isDisabled = disabled || loading;

	// Handle click event
	function handleClick() {
		if (!isDisabled) {
			onClick();
		}
	}
</script>

<button
	{type}
	disabled={isDisabled}
	class={buttonClasses}
	on:click={handleClick}
	aria-busy={loading}
	aria-disabled={isDisabled}
>
	{#if loading}
		<div class="flex items-center justify-center">
			<svg class="mr-3 -ml-1 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			<slot name="loading-text">Loading...</slot>
		</div>
	{:else}
		<slot />
	{/if}
</button>
