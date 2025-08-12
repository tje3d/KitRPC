<script lang="ts">
	/** @type {string} - Text to display in the divider */
	export let text: string = '';

	/** @type {string} - Additional CSS classes */
	export let className: string = '';
</script>

<div class={`relative my-6 ${className}`}>
	<div class="absolute inset-0 flex items-center">
		<div class="w-full border-t border-gray-200"></div>
	</div>
	<div class="relative flex justify-center text-sm">
		<span class="bg-white/80 px-4 text-gray-500">{text}</span>
	</div>
</div>
