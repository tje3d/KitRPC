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

	/** @type {string} - Button size (default, sm, lg) */
	export let size: 'default' | 'sm' | 'lg' = 'default';

	/** @type {boolean} - Whether the button should take full width */
	export let fullWidth: boolean = false;

	// Base button classes
	const baseButtonClasses =
		'inline-flex items-center justify-center transform rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

	// Size classes
	$: sizeClasses =
		{
			default: 'px-4 py-2 text-sm shadow',
			sm: 'px-3 py-1.5 text-xs shadow-sm',
			lg: 'px-6 py-3 text-base shadow-md'
		}[size] || 'px-4 py-2 text-sm shadow';

	// Full width class
	$: fullWidthClass = fullWidth ? 'w-full' : '';

	// Variant classes
	$: variantClasses =
		{
			primary:
				'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 hover:-translate-y-0.5 hover:shadow-md',
			secondary:
				'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 hover:-translate-y-0.5 hover:shadow-sm',
			gradient:
				'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 hover:-translate-y-0.5 hover:shadow-md',
			'gradient-secondary':
				'text-white bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 focus:ring-gray-500 hover:-translate-y-0.5 hover:shadow-md',
			'gradient-success':
				'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 hover:-translate-y-0.5 hover:shadow-md'
		}[variant] || 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

	// Disabled classes
	$: disabledClasses = disabled || loading ? 'transform-none shadow' : '';

	// Combined classes
	$: buttonClasses = `${baseButtonClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${fullWidthClass} ${className}`;

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
		<div class="flex items-center">
			<span class="icon-[svg-spinners--bars-scale-fade] mr-2 h-4 w-4 animate-spin"></span>
			<slot name="loading-text">Loading...</slot>
		</div>
	{:else}
		<slot />
	{/if}
</button>
