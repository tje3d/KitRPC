<script lang="ts">
	/** @type {string} - Form group label */
	export let label: string = '';

	/** @type {string} - Label for attribute (should match input id) */
	export let forAttr: string = '';

	/** @type {string} - Error message */
	export let error: string = '';

	/** @type {boolean} - Whether the field is required */
	export let required: boolean = false;

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {boolean} - Whether to show error state */
	export let showError: boolean = false;
</script>

<div class={`space-y-1 ${className}`}>
	{#if label || $$slots.actions}
		<div class="flex items-center justify-between">
			{#if label}
				<label
					for={forAttr}
					class={`block text-sm font-medium ${showError ? 'text-red-600' : 'text-gray-700'}`}
				>
					{label}
					{#if required}
						<span class="text-red-500">*</span>
					{/if}
				</label>
			{:else}
				<div></div>
			{/if}
			{#if $$slots.actions}
				<slot name="actions" />
			{/if}
		</div>
	{/if}
	<slot />
	{#if error && showError}
		<p class="text-sm text-red-600" id={`${forAttr}-error`}>
			{error}
		</p>
	{/if}
</div>
