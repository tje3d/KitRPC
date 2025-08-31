<script lang="ts">
	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {boolean} - Whether to use compact padding */
	export let compact: boolean = false;

	/** @type {string} - Card variant for different use cases */
	export let variant:
		| 'elevated'
		| 'outlined'
		| 'filled'
		| 'glass'
		| 'minimal'
		| 'gradient'
		| 'dark' = 'elevated';

	// Base card structure
	$: baseClasses = 'relative overflow-hidden transition-all duration-300 ease-out';

	// Padding classes based on compact prop
	$: paddingClasses = compact ? 'p-4' : 'p-6';

	// Variant-specific styling
	$: variantClasses = {
		// Modern elevated card with subtle shadow - perfect for content sections
		elevated:
			'rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200',

		// Clean outlined card - great for forms and structured content
		outlined: 'rounded-lg bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm',

		// Filled card with background - ideal for highlighted content
		filled: 'rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-sm',

		// Glass morphism effect - perfect for overlays and auth forms
		glass:
			'rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/90 hover:shadow-2xl',

		// Minimal card with subtle styling - great for simple content
		minimal: 'rounded-lg bg-white border border-gray-100 hover:border-gray-200',

		// Gradient card with modern appeal - excellent for hero sections
		gradient:
			'rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-md hover:from-gray-50 hover:to-gray-100',

		// Dark theme card - perfect for dark mode or contrast sections
		dark: 'rounded-xl bg-gray-900 border border-gray-800 text-white shadow-lg hover:bg-gray-800 hover:border-gray-700'
	}[variant];

	// Enhanced padding for glass variant
	$: enhancedPaddingClasses = variant === 'glass' ? (compact ? 'p-6' : 'p-8') : paddingClasses;

	// Combined classes
	$: cardClasses = `${baseClasses} ${enhancedPaddingClasses} ${variantClasses} ${className}`;
</script>

<div class={cardClasses}>
	<slot />
</div>
