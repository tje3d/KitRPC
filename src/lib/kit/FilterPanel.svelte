<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
	import Input from './Input.svelte';
	import JalaliDateRangePicker from './JalaliDateRangePicker.svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let title = 'فیلترها';
	export let showResetButton = true;
	export let showApplyButton = true;
	export let resetButtonText = 'بازنشانی';
	export let applyButtonText = 'اعمال';
	export let className = 'mb-6';

	// Filter groups configuration
	export let filterGroups: Array<{
		label: string;
		options: Array<{
			value: string;
			label: string;
			icon?: string;
			colorScheme?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
		}>;
		selected: Record<string, boolean>;
		multiSelect?: boolean;
	}> = [];

	// Input fields configuration
	export let inputFields: Array<{
		id: string;
		name: string;
		type: string;
		placeholder: string;
		value: string;
		colSpan?: number;
	}> = [];

	// Date range configuration
	export let showDateRange = false;
	export let startDate = '';
	export let endDate = '';
	export let startLabel = 'تاریخ شروع';
	export let endLabel = 'تاریخ پایان';
	export let startPlaceholder = 'انتخاب تاریخ شروع';
	export let endPlaceholder = 'انتخاب تاریخ پایان';
	export let allowSameDate = true;

	// Color scheme mapping for pills
	function getPillClasses(isSelected: boolean, colorScheme: string = 'blue', value?: string) {
		if (isSelected) {
			switch (colorScheme) {
				case 'green':
					return 'border border-green-200 bg-green-100 text-green-800';
				case 'yellow':
					return 'border border-yellow-200 bg-yellow-100 text-yellow-800';
				case 'red':
					return 'border border-red-200 bg-red-100 text-red-800';
				case 'purple':
					return 'border border-purple-200 bg-purple-100 text-purple-800';
				case 'gray':
					return 'border border-gray-200 bg-gray-100 text-gray-800';
				default:
					return 'border border-blue-200 bg-blue-100 text-blue-800';
			}
		}
		return 'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
	}

	// Handle pill click
	function handlePillClick(groupIndex: number, optionValue: string) {
		const group = filterGroups[groupIndex];

		if (group.multiSelect) {
			// Toggle selection for multi-select
			group.selected[optionValue] = !group.selected[optionValue];
		} else {
			// Single select - clear all and set only this one
			group.selected = {};
			group.selected[optionValue] = true;
		}

		// Update the filterGroups array to trigger reactivity
		filterGroups = [...filterGroups];

		// Dispatch change event
		dispatch('filterChange', {
			filterGroups,
			inputFields,
			startDate,
			endDate
		});
	}

	// Handle input change
	function handleInputChange(fieldIndex: number, value: string) {
		inputFields[fieldIndex].value = value;
		inputFields = [...inputFields];

		dispatch('filterChange', {
			filterGroups,
			inputFields,
			startDate,
			endDate
		});
	}

	// Handle date range change
	function handleDateChange() {
		dispatch('filterChange', {
			filterGroups,
			inputFields,
			startDate,
			endDate
		});
	}

	// Handle reset
	function handleReset() {
		// Reset all filter groups
		filterGroups = filterGroups.map((group) => ({
			...group,
			selected: {}
		}));

		// Reset all input fields
		inputFields = inputFields.map((field) => ({
			...field,
			value: ''
		}));

		// Reset date range
		startDate = '';
		endDate = '';

		dispatch('reset');
	}

	// Handle apply
	function handleApply() {
		dispatch('apply', {
			filterGroups,
			inputFields,
			startDate,
			endDate
		});
	}
</script>

<Card variant="flat" {className}>
	<!-- Filter Header -->
	<div class="flex items-center justify-between border-b border-gray-200 pb-4">
		<div class="flex items-center space-x-2">
			<span class="icon-[heroicons--funnel] h-5 w-5 text-gray-500"></span>
			<h2 class="text-lg font-semibold text-gray-800">{title}</h2>
		</div>
		<div class="flex items-center space-x-3">
			{#if showResetButton}
				<Button size="sm" variant="secondary" onClick={handleReset}>
					<span class="icon-[heroicons--arrow-path] me-1 h-4 w-4"></span>
					{resetButtonText}
				</Button>
			{/if}
			{#if showApplyButton}
				<Button size="sm" onClick={handleApply}>
					<span class="icon-[heroicons--magnifying-glass] me-1 h-4 w-4"></span>
					{applyButtonText}
				</Button>
			{/if}
		</div>
	</div>

	<!-- Quick Filter Pills -->
	{#if filterGroups.length > 0}
		<div class="py-4">
			<div class="flex flex-wrap items-center gap-3">
				{#each filterGroups as group, groupIndex}
					<div class="flex items-center space-x-2">
						<span class="text-sm font-medium text-gray-600">{group.label}:</span>
						<div class="flex space-x-1">
							{#each group.options as option}
								<button
									class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors {getPillClasses(
										group.selected[option.value],
										option.colorScheme,
										option.value
									)}"
									on:click={() => handlePillClick(groupIndex, option.value)}
								>
									{#if option.icon}
										<span class="{option.icon} me-1 h-3 w-3"></span>
									{/if}
									{option.label}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Advanced Filters -->
	{#if inputFields.length > 0 || showDateRange}
		<div class="border-t border-gray-200 pt-4">
			<!-- Input Fields -->
			{#if inputFields.length > 0}
				<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each inputFields as field, fieldIndex}
						<Input
							id={field.id}
							name={field.name}
							type={field.type}
							placeholder={field.placeholder}
							value={field.value}
							className="w-full {field.colSpan === 2 ? 'md:col-span-2' : ''}"
							on:input={(e) => handleInputChange(fieldIndex, (e.target as HTMLInputElement).value)}
						/>
					{/each}
				</div>
			{/if}

			<!-- Date Range -->
			{#if showDateRange}
				<JalaliDateRangePicker
					bind:startDate
					bind:endDate
					{startLabel}
					{endLabel}
					{startPlaceholder}
					{endPlaceholder}
					{allowSameDate}
					class="w-full"
					on:change={handleDateChange}
				/>
			{/if}
		</div>
	{/if}
</Card>
