<script lang="ts">
	/** @type {string} - The page title */
	export let title: string;

	// Get app title from environment variable
	const appTitle = import.meta.env.VITE_APP_TITLE || 'KitRPC';

	// Format the complete title
	$: formattedTitle = title ? `${title} • ${appTitle}` : appTitle;
</script>

<svelte:head>
	<title>{formattedTitle}</title>
</svelte:head>