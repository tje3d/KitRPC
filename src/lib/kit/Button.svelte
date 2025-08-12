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
			<span class="icon-[svg-spinners--bars-scale-fade] mr-3 -ml-1 h-5 w-5 animate-spin text-white"
			></span>
			<slot name="loading-text">Loading...</slot>
		</div>
	{:else}
		<slot />
	{/if}
</button>
