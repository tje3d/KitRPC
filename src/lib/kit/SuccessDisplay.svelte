<script lang="ts">
	export let message: string = '';
	export let onDismiss: () => void = () => {};
	export let className: string = '';
</script>

<div class={`rounded-2xl border border-green-200 bg-green-50/80 p-4 backdrop-blur-sm ${className}`}>
	<div class="flex items-start">
		<span class="icon-[heroicons--check-circle-solid] mt-0.5 h-5 w-5 flex-shrink-0 text-green-400"
		></span>
		<div class="ms-3 flex-1">
			<p class="text-sm text-green-800">{message}</p>
		</div>
		<button
			type="button"
			on:click={onDismiss}
			class="ms-3 text-green-400 transition-colors hover:text-green-600"
			aria-label="Dismiss success message"
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
