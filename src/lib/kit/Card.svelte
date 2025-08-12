<script lang="ts">
	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {boolean} - Whether to use compact padding */
	export let compact: boolean = false;

	/** @type {string} - Background color variant */
	export let variant: 'glass' | 'flat' | 'light' | 'dark' = 'glass';

	// Base card classes based on variant
	$: baseCardClasses =
		variant === 'glass'
			? 'space-y-6 rounded-3xl border p-8 shadow-2xl backdrop-blur-xl'
			: 'rounded-lg shadow-xl shadow-[#e2e6ee] bg-white';

	// Padding classes
	$: paddingClasses = variant === 'glass' ? (compact ? 'p-6' : 'p-8') : compact ? 'p-4' : 'p-6';

	// Variant classes
	$: variantClasses =
		{
			glass: 'border-white/20 bg-white/80',
			flat: 'border-gray-200',
			light: 'border-gray-200 bg-white',
			dark: 'border-gray-800 bg-gray-900/90 text-white'
		}[variant] || 'border-white/20 bg-white/80';

	// Combined classes
	$: cardClasses = `${baseCardClasses} ${paddingClasses} ${variantClasses} ${className}`;
</script>

<div class={cardClasses}>
	<slot />
</div>
