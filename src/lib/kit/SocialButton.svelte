<script lang="ts">
	/** @type {string} - Social provider name */
	export let provider: string;

	/** @type {string} - SVG icon HTML */
	export let icon: string;

	/** @type {Function} - Click handler function */
	export let onClick: () => void = () => {};

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	// Social button classes from login page
	const socialButtonClasses =
		'group flex items-center justify-center rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl';

	// Social button text classes from login page
	const socialButtonTextClasses =
		'text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900';

	// Combined classes
	$: buttonClasses = `${socialButtonClasses} ${className}`;
</script>

<button
	class={buttonClasses}
	on:click={onClick}
	aria-label={`Sign in with ${provider}`}
	type="button"
>
	{@html icon}
	<span class={socialButtonTextClasses}>{provider}</span>
</button>
