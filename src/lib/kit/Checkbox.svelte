<script lang="ts">
	/** @type {string} - Checkbox ID (required) */
	export let id: string;

	/** @type {string} - Checkbox name (required) */
	export let name: string;

	/** @type {boolean} - Whether the checkbox is checked */
	export let checked: boolean = false;

	/** @type {Function} - Change event handler */
	export let onChange: () => void = () => {};

	/** @type {string} - Label text */
	export let label: string = '';

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	// Handle change event
	function handleChange() {
		onChange();
	}
</script>

<div class={`flex items-center ${className}`}>
	<div class="relative flex items-center">
		<input
			{id}
			{name}
			type="checkbox"
			bind:checked
			class="peer absolute z-10 h-5 w-5 cursor-pointer opacity-0"
			on:change={handleChange}
			aria-label={label || undefined}
		/>
		<div
			class="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all duration-200 ease-in-out peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-hover:border-gray-400 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2"
		>
			<span
				class="icon-[heroicons--check] h-3.5 w-3.5 text-white transition-all duration-200 ease-in-out"
			></span>
		</div>
	</div>
	{#if label}
		<label
			for={id}
			class="ms-3 block text-sm font-medium text-gray-700 transition-colors duration-200 ease-in-out select-none peer-hover:text-gray-900 peer-focus:text-gray-900"
		>
			{label}
		</label>
	{/if}
</div>
