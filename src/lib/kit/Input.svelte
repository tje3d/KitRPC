<script lang="ts">
	import cardNumberInput from '$lib/actions/cardNumberInput.action';
	import OnlyNumber from '$lib/actions/onlyNumber.action';

	/** @type {string} - Input ID (required) */
	export let id: string;

	/** @type {string} - Input name (required) */
	export let name: string;

	/** @type {string} - Input type */
	export let type: string = 'text';

	/** @type {string} - Input value (bound) */
	export let value: string = '';

	/** @type {string} - Placeholder text */
	export let placeholder: string = '';

	/** @type {any} - Autocomplete attribute */
	export let autocomplete: any = undefined;

	/** @type {boolean} - Whether the input is disabled */
	export let disabled: boolean = false;

	/** @type {boolean} - Whether the input is in error state */
	export let error: boolean = false;

	/** @type {string} - Error message to display */
	export let errorMessage: string = '';

	/** @type {string} - Label for the input */
	export let label: string = '';

	/** @type {Function} - Blur event handler */
	export let onBlur: () => void = () => {};

	/** @type {Function} - Change event handler */
	export let onChange: () => void = () => {};

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {"ltr" | "rtl" | "auto" | null | undefined} */
	export let dir: 'ltr' | 'rtl' | 'auto' | null | undefined = undefined;

	/** @type {number} - Maximum length of input */
	export let maxlength: number | undefined = undefined;

	/** @type {boolean} - Whether the input is required */
	export let required: boolean = false;

	/** @type {boolean} - Whether to format input as card number */
	export let formatCard: boolean = false;

	/** @type {boolean} - Whether to enable only number input */
	export let onlyNumber: boolean = false;

	/** @type {number} - Maximum value allowed */
	export let max: number | undefined = undefined;

	/** @type {number} - Maximum decimal places allowed */
	export let maxDecimals: number | undefined = undefined;

	/** @type {boolean} - Whether to add thousand separators */
	export let thousandSeparator: boolean = false;

	/** @type {boolean} - Whether to allow leading zeros */
	export let allowLeadingZero: boolean = false;

	/** @type {number} - Maximum number of leading zeros allowed */
	export let leadingZeroLimit: number | undefined = undefined;

	/** @type {boolean} - Whether to convert leading zeros to regular numbers */
	export let convertLeadingZeros: boolean = false;

	// Base input classes with modern styling
	const baseInputClasses =
		'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 placeholder-gray-400 shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed';

	// Error input classes with enhanced visual feedback
	const errorInputClasses = 'border-red-500 bg-red-50 focus:ring-red-500 focus:shadow-red-100';

	// Success state classes
	const successInputClasses = 'border-green-500 focus:ring-green-500 focus:shadow-green-100';

	// Hover state classes
	const hoverInputClasses = 'hover:border-gray-400 hover:shadow-md';

	// Combined classes with all states
	$: inputClasses = `${baseInputClasses} ${error ? errorInputClasses : ''} ${className} ${hoverInputClasses}`;

	// Handle input event with proper typing
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
	}
</script>

<div class="space-y-1">
	{#if label}
		<label for={id} class="block text-sm font-medium text-gray-700">
			{label}
		</label>
	{/if}
	<input
		{id}
		{name}
		{type}
		{placeholder}
		{autocomplete}
		{disabled}
		{maxlength}
		{required}
		class={inputClasses}
		aria-invalid={error}
		aria-describedby={error && errorMessage ? `${id}-error` : undefined}
		{dir}
		on:blur={onBlur}
		on:change={onChange}
		on:input={handleInput}
		use:cardNumberInput={{ disable: !formatCard }}
		use:OnlyNumber={{
			enable: onlyNumber,
			max,
			maxDecimals,
			thousandSeparator,
			allowLeadingZero,
			leadingZeroLimit,
			convertLeadingZeros
		}}
		bind:value
	/>
	{#if error && errorMessage}
		<p class="text-sm text-red-600" id={`${id}-error`}>
			{errorMessage}
		</p>
	{/if}
</div>
