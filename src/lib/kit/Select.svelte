<script lang="ts">
	import FormGroup from './FormGroup.svelte';

	// Define props using Svelte 5 syntax
	const {
		id,
		name,
		value = '',
		options = [],
		placeholder = 'Select an option',
		multiple = false,
		disabled = false,
		error = false,
		errorMessage = '',
		label = '',
		onChange = () => {},
		className = '',
		variant = 'primary'
	} = $props<{
		id: string;
		name: string;
		value?: string | string[];
		options?: Array<{ value: string; label: string }>;
		placeholder?: string;
		multiple?: boolean;
		disabled?: boolean;
		error?: boolean;
		errorMessage?: string;
		label?: string;
		onChange?: (value: string | string[]) => void;
		className?: string;
		variant?: 'primary' | 'secondary';
	}>();

	// State for dropdown visibility
	let isOpen = $state(false);

	// State for search term (for filtering options)
	let searchTerm = $state('');

	// State for selected options (for multiple selection)
	let selectedOptions = $state<string[]>(Array.isArray(value) ? [...value] : []);

	// Base select classes with modern styling
	const baseSelectClasses =
		'w-full rounded-xl border bg-white px-4 py-3 text-gray-700 placeholder-gray-400 shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:border-transparent focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed';

	// Variant classes
	type VariantType = 'primary' | 'secondary';
	const variantMap: Record<VariantType, string> = {
		primary: 'border-gray-300 focus:ring-blue-500 focus:shadow-blue-100',
		secondary: 'border-gray-200 focus:ring-gray-500 focus:shadow-gray-100'
	};
	const variantClasses = $derived(variantMap[variant as VariantType] || variantMap.primary);

	// Error select classes with enhanced visual feedback
	const errorSelectClasses = 'border-red-500 bg-red-50 focus:ring-red-500 focus:shadow-red-100';

	// Combined classes with all states
	const selectClasses = $derived(
		`${baseSelectClasses} ${error ? errorSelectClasses : variantClasses} ${className}`
	);

	// Filtered options based on search term
	const filteredOptions = $derived(
		options.filter((option: { value: string; label: string }) =>
			option.label.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	// Display value for single selection
	const displayValue = $derived(() => {
		if (multiple) {
			if (selectedOptions.length === 0) return placeholder;
			if (selectedOptions.length === 1) {
				const option = options.find(
					(opt: { value: string; label: string }) => opt.value === selectedOptions[0]
				);
				return option ? option.label : '';
			}
			return `${selectedOptions.length} items selected`;
		} else {
			const option = options.find((opt: { value: string; label: string }) => opt.value === value);
			return option ? option.label : placeholder;
		}
	});

	// Handle click outside to close dropdown
	function handleClickOutside(event: MouseEvent) {
		const selectElement = document.getElementById(`select-${id}`);
		if (selectElement && !selectElement.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	// Toggle dropdown visibility
	function toggleDropdown() {
		if (!disabled) {
			isOpen = !isOpen;
			if (isOpen) {
				// Add event listener for click outside
				setTimeout(() => {
					window.addEventListener('click', handleClickOutside);
				}, 0);
			} else {
				// Remove event listener
				window.removeEventListener('click', handleClickOutside);
			}
		}
	}

	// Handle option selection
	function handleOptionSelect(optionValue: string) {
		if (multiple) {
			// Toggle selection in array
			if (selectedOptions.includes(optionValue)) {
				selectedOptions = selectedOptions.filter((val: string) => val !== optionValue);
			} else {
				selectedOptions = [...selectedOptions, optionValue];
			}
			onChange(selectedOptions);
		} else {
			// Single selection
			onChange(optionValue);
			isOpen = false;
		}
	}

	// Check if an option is selected
	function isOptionSelected(optionValue: string) {
		if (multiple) {
			return selectedOptions.includes(optionValue);
		} else {
			return value === optionValue;
		}
	}

	// Clear selection (for multiple)
	function clearSelection() {
		if (multiple) {
			selectedOptions = [];
			onChange([]);
		}
	}
</script>

<div class="relative" id={`select-${id}`}>
	{#if label}
		<label for={id} class="mb-1 block text-sm font-medium text-gray-700">
			{label}
		</label>
	{/if}
	<div
		class={selectClasses}
		class:cursor-pointer={!disabled}
		on:click={toggleDropdown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<div class="flex items-center justify-between">
			<span class="truncate">{displayValue()}</span>
			<span
				class={`icon-[heroicons--chevron-down] h-5 w-5 text-gray-400 transition-transform duration-200 ${
					isOpen ? 'rotate-180' : ''
				}`}
			></span>
		</div>
	</div>

	{#if isOpen}
		<div
			class="ring-opacity-5 absolute z-10 mt-1 w-full rounded-xl bg-white shadow-lg ring-1 ring-black focus:outline-none"
			role="listbox"
		>
			<!-- Search input for filtering options -->
			{#if options.length > 5}
				<div class="p-2">
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="Search..."
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						on:click={(e) => e.stopPropagation()}
					/>
				</div>
			{/if}

			<!-- Options list -->
			<ul class="max-h-60 overflow-auto py-1">
				{#each filteredOptions as option (option.value)}
					<li
						class="relative cursor-pointer py-2 pr-9 pl-3 select-none hover:bg-gray-100 focus:bg-gray-100"
						class:bg-blue-50={isOptionSelected(option.value)}
						role="option"
						on:click={(e) => {
							e.stopPropagation();
							handleOptionSelect(option.value);
						}}
					>
						<div class="flex items-center">
							{#if multiple}
								<input
									type="checkbox"
									checked={isOptionSelected(option.value)}
									class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									on:click={(e) => e.stopPropagation()}
									readonly
								/>
							{/if}
							<span
								class={`block truncate ${isOptionSelected(option.value) ? 'font-semibold' : 'font-normal'}`}
							>
								{option.label}
							</span>
						</div>

						{#if isOptionSelected(option.value) && !multiple}
							<span class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
								<span class="icon-[heroicons--check] h-5 w-5"></span>
							</span>
						{/if}
					</li>
				{:else}
					<li class="py-2 pl-3 pr-9 text-gray-500">No options found</li>
				{/each}
			</ul>

			{#if multiple && selectedOptions.length > 0}
				<div class="border-t border-gray-200 p-2">
					<button
						type="button"
						class="w-full rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
						on:click={(e) => {
							e.stopPropagation();
							clearSelection();
						}}
					>
						Clear selection
					</button>
				</div>
			{/if}
		</div>
	{/if}

	{#if error && errorMessage}
		<p class="mt-1 text-sm text-red-600" id={`${id}-error`}>
			{errorMessage}
		</p>
	{/if}
</div>
