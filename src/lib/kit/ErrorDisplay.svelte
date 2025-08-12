<script lang="ts">
	export let message: string = '';
	export let onDismiss: () => void = () => {};
	export let className: string = '';
</script>

<div class={`rounded-2xl border border-red-200 bg-red-50/80 p-4 backdrop-blur-sm ${className}`}>
	<div class="flex items-start">
		<span class="icon-[heroicons--exclamation-circle] mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
		></span>
		<div class="ml-3 flex-1">
			<p class="text-sm text-red-800">{message}</p>
		</div>
		<button
			type="button"
			on:click={onDismiss}
			class="ml-3 text-red-400 transition-colors hover:text-red-600"
			aria-label="Dismiss error"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	</div>
</div>
