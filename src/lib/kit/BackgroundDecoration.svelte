<script lang="ts">
	/** @type {string} - Additional CSS classes */
	export let className: string = '';
</script>

<div class={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
	<div
		class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"
	></div>
	<div
		class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 blur-3xl"
	></div>
</div>
