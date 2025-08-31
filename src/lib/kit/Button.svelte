<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	/** @type {string} - Button type (button, submit, reset) */
	export let type: 'button' | 'submit' | 'reset' = 'button';

	/** @type {boolean} - Whether the button is disabled */
	export let disabled: boolean = false;

	/** @type {boolean} - Whether the button is in loading state */
	export let loading: boolean = false;

	/** @type {Function} - Click handler function */
	export let onClick: (() => void) | undefined = undefined;

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {string} - Button variant (primary, secondary, gradient, outline, ghost) */
	export let variant:
		| 'primary'
		| 'secondary'
		| 'gradient'
		| 'gradient-secondary'
		| 'gradient-success'
		| 'outline'
		| 'ghost' = 'primary';

	/** @type {string} - Button size (default, sm, lg) */
	export let size: 'default' | 'sm' | 'lg' = 'default';

	/** @type {boolean} - Whether the button should take full width */
	export let fullWidth: boolean = false;

	/** @type {string} - Optional href to render as anchor link */
	export let href: string | undefined = undefined;

	// Base button classes with modern design
	const baseButtonClasses =
		'cursor-pointer inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none relative overflow-hidden group';

	const dispatch = createEventDispatcher();

	// Size classes with modern spacing and typography
	$: sizeClasses =
		{
			default: 'px-6 py-3 text-sm rounded-xl shadow-lg hover:shadow-xl',
			sm: 'px-4 py-2 text-xs rounded-lg shadow-md hover:shadow-lg',
			lg: 'px-8 py-4 text-base rounded-2xl shadow-xl hover:shadow-2xl'
		}[size] || 'px-6 py-3 text-sm rounded-xl shadow-lg hover:shadow-xl';

	// Full width class
	$: fullWidthClass = fullWidth ? 'w-full' : '';

	// Modern variant classes with enhanced gradients and effects
	$: variantClasses =
		{
			primary:
				'text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 focus:ring-blue-500/50 hover:scale-105 active:scale-95 shadow-blue-500/25',
			secondary:
				'text-gray-700 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 hover:from-gray-100 hover:via-gray-200 hover:to-gray-300 focus:ring-gray-500/50 border border-gray-200 hover:border-gray-300 hover:scale-105 active:scale-95 shadow-gray-500/10',
			outline:
				'text-blue-600 bg-transparent border-2 border-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white focus:ring-blue-500/50 hover:scale-105 active:scale-95 shadow-blue-500/20 hover:shadow-blue-500/40',
			ghost:
				'text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-800 focus:ring-gray-500/50 hover:scale-105 active:scale-95 shadow-none hover:shadow-md',
			gradient:
				'text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-blue-500/50 hover:scale-105 active:scale-95 shadow-blue-500/30',
			'gradient-secondary':
				'text-white bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 hover:from-slate-700 hover:via-gray-800 hover:to-slate-900 focus:ring-gray-500/50 hover:scale-105 active:scale-95 shadow-slate-500/30',
			'gradient-success':
				'text-white bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 focus:ring-emerald-500/50 hover:scale-105 active:scale-95 shadow-emerald-500/30'
		}[variant] || 'text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 focus:ring-blue-500/50 hover:scale-105 active:scale-95 shadow-blue-500/25';

	// Disabled classes
	$: disabledClasses = disabled || loading ? 'hover:scale-100 active:scale-100 opacity-60 cursor-not-allowed' : '';

	// Combined classes
	$: buttonClasses = `${baseButtonClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${fullWidthClass} ${className}`;

	// Effective disabled state (disabled when explicitly disabled or when loading)
	$: isDisabled = disabled || loading;

	// Handle click event
	function handleClick() {
		if (!isDisabled && !href) {
			if (onClick) {
				onClick();
			} else {
				dispatch('click');
			}
		}
	}
</script>

{#if href}
	<a
		{href}
		class={buttonClasses}
		on:click={handleClick}
		aria-busy={loading}
		aria-disabled={isDisabled}
		role="button"
		tabindex={isDisabled ? -1 : 0}
	>
		<!-- Shimmer effect overlay -->
		<div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 group-hover:animate-pulse"></div>
		
		<!-- Content -->
		<div class="relative z-10 flex items-center">
			{#if loading}
				<div class="flex items-center">
					<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
					<slot name="loading-text">Loading...</slot>
				</div>
			{:else}
				<slot />
			{/if}
		</div>
	</a>
{:else}
	<button
		{type}
		disabled={isDisabled}
		class={buttonClasses}
		on:click={handleClick}
		aria-busy={loading}
		aria-disabled={isDisabled}
	>
		<!-- Shimmer effect overlay -->
		<div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 group-hover:animate-pulse"></div>
		
		<!-- Content -->
		<div class="relative z-10 flex items-center">
			{#if loading}
				<div class="flex items-center">
					<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
					<slot name="loading-text" />
				</div>
			{:else}
				<slot />
			{/if}
		</div>
	</button>
{/if}