<script lang="ts">
	import moment from 'moment-jalaali';
	import { createEventDispatcher } from 'svelte';
	import JalaliDatePicker from './JalaliDatePicker.svelte';

	// Configure moment-jalaali
	moment.loadPersian({ dialect: 'persian-modern' });

	interface Props {
		startDate?: string;
		endDate?: string;
		startLabel?: string;
		endLabel?: string;
		startPlaceholder?: string;
		endPlaceholder?: string;
		required?: boolean;
		disabled?: boolean;
		minDate?: string;
		maxDate?: string;
		class?: string;
		allowSameDate?: boolean;
		showQuickPresets?: boolean;
	}

	let {
		startDate = $bindable(''),
		endDate = $bindable(''),
		startLabel = 'تاریخ شروع',
		endLabel = 'تاریخ پایان',
		startPlaceholder = 'انتخاب تاریخ شروع',
		endPlaceholder = 'انتخاب تاریخ پایان',
		required = false,
		disabled = false,
		minDate = '',
		maxDate = '',
		class: className = '',
		allowSameDate = false,
		showQuickPresets = true
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		change: {
			startDate: string;
			endDate: string;
			startJalali: string;
			endJalali: string;
		};
		startChange: { value: string; jalaliValue: string };
		endChange: { value: string; jalaliValue: string };
		error: { message: string };
	}>();

	let startJalali = $state('');
	let endJalali = $state('');
	let errorMessage = $state('');

	// Validate date range
	function validateDateRange() {
		if (!startDate || !endDate) {
			errorMessage = '';
			return true;
		}

		const start = moment(startDate);
		const end = moment(endDate);

		if (allowSameDate) {
			if (end.isBefore(start)) {
				errorMessage = 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد';
				dispatch('error', { message: errorMessage });
				return false;
			}
		} else {
			if (end.isSameOrBefore(start)) {
				errorMessage = 'تاریخ پایان باید بعد از تاریخ شروع باشد';
				dispatch('error', { message: errorMessage });
				return false;
			}
		}

		errorMessage = '';
		return true;
	}

	// Handle start date change
	function handleStartDateChange(event: CustomEvent<{ value: string; jalaliValue: string }>) {
		startDate = event.detail.value;
		startJalali = event.detail.jalaliValue;

		// If end date is set and is before new start date, clear it
		if (endDate && moment(endDate).isBefore(moment(startDate))) {
			endDate = '';
			endJalali = '';
		}

		dispatch('startChange', event.detail);

		if (validateDateRange()) {
			dispatch('change', {
				startDate,
				endDate,
				startJalali,
				endJalali
			});
		}
	}

	// Handle end date change
	function handleEndDateChange(event: CustomEvent<{ value: string; jalaliValue: string }>) {
		endDate = event.detail.value;
		endJalali = event.detail.jalaliValue;

		dispatch('endChange', event.detail);

		if (validateDateRange()) {
			dispatch('change', {
				startDate,
				endDate,
				startJalali,
				endJalali
			});
		}
	}

	// Get date range info
	function getDateRangeInfo() {
		if (!startDate || !endDate) return null;

		const start = moment(startDate);
		const end = moment(endDate);
		const duration = end.diff(start, 'days');

		return {
			duration: duration + (allowSameDate ? 1 : 0),
			durationText: duration === 0 ? 'همان روز' : `${duration + (allowSameDate ? 1 : 0)} روز`
		};
	}

	// Quick preset functions
	function setToday() {
		const today = moment().format('YYYY-MM-DD');
		startDate = today;
		endDate = today;
		startJalali = moment().format('jYYYY/jMM/jDD');
		endJalali = moment().format('jYYYY/jMM/jDD');

		dispatch('change', {
			startDate,
			endDate,
			startJalali,
			endJalali
		});
	}

	function setThisWeek() {
		const start = moment().startOf('week');
		const end = moment().endOf('week');

		startDate = start.format('YYYY-MM-DD');
		endDate = end.format('YYYY-MM-DD');
		startJalali = start.format('jYYYY/jMM/jDD');
		endJalali = end.format('jYYYY/jMM/jDD');

		dispatch('change', {
			startDate,
			endDate,
			startJalali,
			endJalali
		});
	}

	function setThisMonth() {
		const start = moment().startOf('jMonth');
		const end = moment().endOf('jMonth');

		startDate = start.format('YYYY-MM-DD');
		endDate = end.format('YYYY-MM-DD');
		startJalali = start.format('jYYYY/jMM/jDD');
		endJalali = end.format('jYYYY/jMM/jDD');

		dispatch('change', {
			startDate,
			endDate,
			startJalali,
			endJalali
		});
	}

	function clearDates() {
		startDate = '';
		endDate = '';
		startJalali = '';
		endJalali = '';
		errorMessage = '';

		dispatch('change', {
			startDate: '',
			endDate: '',
			startJalali: '',
			endJalali: ''
		});
	}
</script>

<div class="space-y-4 {className}">
	<!-- Date Range Inputs -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<JalaliDatePicker
			bind:value={startDate}
			label={startLabel}
			placeholder={startPlaceholder}
			{required}
			{disabled}
			{minDate}
			maxDate={endDate || maxDate}
			on:change={handleStartDateChange}
		/>

		<JalaliDatePicker
			bind:value={endDate}
			label={endLabel}
			placeholder={endPlaceholder}
			{required}
			{disabled}
			minDate={startDate
				? allowSameDate
					? startDate
					: moment(startDate).add(1, 'day').format('YYYY-MM-DD')
				: minDate}
			{maxDate}
			on:change={handleEndDateChange}
		/>
	</div>

	<!-- Error Message -->
	{#if errorMessage}
		<div class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
			<div class="flex items-center gap-2">
				<span class="icon-[solar--danger-circle-linear] block h-4 w-4"></span>
				<span>{errorMessage}</span>
			</div>
		</div>
	{/if}

	<!-- Date Range Info -->
	{#if startDate && endDate && !errorMessage}
		{@const rangeInfo = getDateRangeInfo()}
		{#if rangeInfo}
			<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="icon-[solar--calendar-linear] block h-4 w-4"></span>
						<span>مدت زمان انتخاب شده: <strong>{rangeInfo.durationText}</strong></span>
					</div>
					<div class="text-xs text-emerald-600">
						{startJalali} تا {endJalali}
					</div>
				</div>
			</div>
		{/if}
	{/if}

	<!-- Quick Presets -->
	{#if showQuickPresets}
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				onclick={setToday}
				{disabled}
				class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
			>
				امروز
			</button>
			<button
				type="button"
				onclick={setThisWeek}
				{disabled}
				class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
			>
				این هفته
			</button>
			<button
				type="button"
				onclick={setThisMonth}
				{disabled}
				class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
			>
				این ماه
			</button>
			{#if startDate || endDate}
				<button
					type="button"
					onclick={clearDates}
					{disabled}
					class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-all duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
				>
					پاک کردن
				</button>
			{/if}
		</div>
	{/if}
</div>
