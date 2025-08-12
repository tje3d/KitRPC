<script lang="ts">
	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {boolean} - Whether to use compact padding */
	export let compact: boolean = false;

	/** @type {string} - Background color variant */
	export let variant: 'default' | 'light' | 'dark' = 'default';

	// Base card classes
	const baseCardClasses = 'space-y-6 rounded-3xl border p-8 shadow-2xl backdrop-blur-xl';

	// Padding classes
	$: paddingClasses = compact ? 'p-6' : 'p-8';

	// Variant classes
	$: variantClasses =
		{
			default: 'border-white/20 bg-white/80',
			light: 'border-gray-200 bg-white',
			dark: 'border-gray-800 bg-gray-900/90 text-white'
		}[variant] || 'border-white/20 bg-white/80';

	// Combined classes
	$: cardClasses = `${baseCardClasses} ${paddingClasses} ${variantClasses} ${className}`;
</script>

<div class={cardClasses}>
	<slot />
</div>
