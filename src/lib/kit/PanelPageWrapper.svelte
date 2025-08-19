<script lang="ts">
	import PageTitle from './PageTitle.svelte';

	/** @type {string} - Page title */
	export let title: string = '';

	/** @type {string} - Page description */
	export let description: string = '';

	/** @type {boolean} - Whether to show the title and description */
	export let showHeader: boolean = true;

	/** @type {string} - Additional CSS classes for the wrapper */
	export let className: string = '';

	/** @type {string} - Additional CSS classes for the header */
	export let headerClassName: string = '';

	/** @type {string} - Additional CSS classes for the content area */
	export let contentClassName: string = '';

	// Base wrapper classes
	const baseWrapperClasses = 'space-y-6';

	// Base header classes
	const baseHeaderClasses = 'flex flex-col justify-between gap-4 md:flex-row md:items-center';

	// Base title classes
	const baseTitleClasses = 'text-2xl font-bold text-gray-800';

	// Base description classes
	const baseDescriptionClasses = 'text-gray-600 mt-1';

	// Base content classes
	const baseContentClasses = '';

	// Combined classes
	$: wrapperClasses = `${baseWrapperClasses} ${className}`;
	$: headerClasses = `${baseHeaderClasses} ${headerClassName}`;
	$: titleClasses = baseTitleClasses;
	$: descriptionClasses = baseDescriptionClasses;
	$: contentClasses = `${baseContentClasses} ${contentClassName}`;
</script>

{#if title}
	<PageTitle {title} />
{/if}

<div class={wrapperClasses}>
	{#if showHeader && (title || description || $$slots.header)}
		<header class={headerClasses}>
			<div>
				{#if title}
					<h1 class={titleClasses}>{title}</h1>
				{/if}
				{#if description}
					<p class={descriptionClasses}>{description}</p>
				{/if}
				<slot name="header" />
			</div>
			{#if $$slots.actions}
				<div class="flex space-x-3">
					<slot name="actions" />
				</div>
			{/if}
		</header>
	{/if}

	<div class={contentClasses}>
		<slot />
	</div>
</div>
