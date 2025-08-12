<script lang="ts">
	/** @type {string} - Link destination */
	export let href: string;

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {boolean} - Whether to open link in new tab */
	export let external: boolean = false;

	/** @type {string} - ARIA label for the link */
	export let ariaLabel: string | undefined = undefined;

	// Base link classes from login page
	const baseLinkClasses = 'font-semibold text-blue-600 transition-colors hover:text-blue-700';

	// Combined classes
	$: linkClasses = `${baseLinkClasses} ${className}`;

	// External link attributes
	$: externalAttrs = external ? { target: '_blank', rel: 'noopener' } : {};
</script>

<a {href} class={linkClasses} {...externalAttrs} aria-label={ariaLabel}>
	<slot />
</a>
