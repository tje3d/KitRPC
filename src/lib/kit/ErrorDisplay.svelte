<script lang="ts">
	export let message: string = '';
	export let onDismiss: () => void = () => {};
	export let className: string = '';
</script>

<div class={`rounded-2xl border border-red-200 bg-red-50/80 p-4 backdrop-blur-sm ${className}`}>
	<div class="flex items-start">
		<svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
			<path
				fill-rule="evenodd"
				d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
				clip-rule="evenodd"
			/>
		</svg>
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
