<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import moment from 'moment-jalaali';

	// Configure moment-jalaali
	moment.loadPersian({ dialect: 'persian-modern' });

	interface Props {
		value?: string;
		placeholder?: string;
		label?: string;
		required?: boolean;
		disabled?: boolean;
		minDate?: string;
		maxDate?: string;
		class?: string;
		id?: string;
		name?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'انتخاب تاریخ',
		label = '',
		required = false,
		disabled = false,
		minDate = '',
		maxDate = '',
		class: className = '',
		id = '',
		name = ''
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		change: { value: string; jalaliValue: string };
		input: { value: string; jalaliValue: string };
	}>();

	let isOpen = $state(false);
	let inputElement: HTMLInputElement;
	let calendarElement: HTMLDivElement;
	let jalaliValue = $state('');
	let currentMonth = $state(moment().jMonth());
	let currentYear = $state(moment().jYear());
	let showYearSelect = $state(false);
	let showMonthSelect = $state(false);

	// Persian month names
	const persianMonths = [
		'فروردین',
		'اردیبهشت',
		'خرداد',
		'تیر',
		'مرداد',
		'شهریور',
		'مهر',
		'آبان',
		'آذر',
		'دی',
		'بهمن',
		'اسفند'
	];

	// Persian day names
	const persianDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

	// Convert Gregorian date to Jalali display
	function gregorianToJalali(gregorianDate: string): string {
		if (!gregorianDate) return '';
		return moment(gregorianDate).format('jYYYY/jMM/jDD');
	}

	// Convert Jalali date to Gregorian
	function jalaliToGregorian(jalaliDate: string): string {
		if (!jalaliDate) return '';
		try {
			const parts = jalaliDate.split('/');
			if (parts.length === 3) {
				const jYear = parseInt(parts[0]);
				const jMonth = parseInt(parts[1]) - 1; // moment-jalaali uses 0-based months
				const jDay = parseInt(parts[2]);
				return moment().jYear(jYear).jMonth(jMonth).jDate(jDay).format('YYYY-MM-DD');
			}
		} catch (error) {
			console.error('Error converting Jalali to Gregorian:', error);
		}
		return '';
	}

	// Generate calendar days for current month
	function generateCalendarDays() {
		const firstDay = moment().jYear(currentYear).jMonth(currentMonth).jDate(1);
		const lastDay = moment().jYear(currentYear).jMonth(currentMonth).endOf('jMonth');
		const startOfWeek = firstDay.clone().startOf('week');
		const endOfWeek = lastDay.clone().endOf('week');

		const days = [];
		let current = startOfWeek.clone();

		while (current.isSameOrBefore(endOfWeek)) {
			days.push({
				date: current.clone(),
				isCurrentMonth: current.jMonth() === currentMonth,
				isToday: current.isSame(moment(), 'day'),
				isSelected: value && current.isSame(moment(value), 'day'),
				isDisabled: isDateDisabled(current)
			});
			current.add(1, 'day');
		}

		return days;
	}

	// Check if a date is disabled
	function isDateDisabled(date: moment.Moment): boolean {
		if (minDate && date.isBefore(moment(minDate))) return true;
		if (maxDate && date.isAfter(moment(maxDate))) return true;
		return false;
	}

	// Handle date selection
	function selectDate(date: moment.Moment) {
		if (isDateDisabled(date)) return;

		const gregorianDate = date.format('YYYY-MM-DD');
		const jalaliDate = date.format('jYYYY/jMM/jDD');

		value = gregorianDate;
		jalaliValue = jalaliDate;
		isOpen = false;

		dispatch('change', { value: gregorianDate, jalaliValue: jalaliDate });
	}

	// Handle manual input
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const inputValue = target.value;
		jalaliValue = inputValue;

		// Try to convert to Gregorian
		const gregorianDate = jalaliToGregorian(inputValue);
		if (gregorianDate) {
			value = gregorianDate;
			dispatch('input', { value: gregorianDate, jalaliValue: inputValue });
		}
	}

	// Navigate months
	function previousMonth() {
		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear--;
		} else {
			currentMonth--;
		}
	}

	function nextMonth() {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear++;
		} else {
			currentMonth++;
		}
	}

	// Navigate years
	function previousYear() {
		currentYear--;
	}

	function nextYear() {
		currentYear++;
	}

	// Handle year selection
	function selectYear(year: number, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		currentYear = year;
		showYearSelect = false;
	}

	// Handle month selection
	function selectMonth(month: number, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		currentMonth = month;
		showMonthSelect = false;
	}

	// Generate year range (current year ± 50 years)
	function generateYearRange() {
		const currentJalaliYear = moment().jYear();
		const years = [];
		for (let i = currentJalaliYear - 50; i <= currentJalaliYear + 50; i++) {
			years.push(i);
		}
		return years;
	}

	// Close calendar when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		
		// Check if click is outside the entire calendar
		if (
			calendarElement &&
			!calendarElement.contains(target) &&
			!inputElement.contains(target)
		) {
			isOpen = false;
			showYearSelect = false;
			showMonthSelect = false;
			return;
		}
		
		// If click is inside calendar but outside year/month selectors, close them
		if (calendarElement && calendarElement.contains(target)) {
			const yearSelector = calendarElement.querySelector('.year-selector');
			const monthSelector = calendarElement.querySelector('.month-selector');
			
			if (yearSelector && !yearSelector.contains(target)) {
				showYearSelect = false;
			}
			
			if (monthSelector && !monthSelector.contains(target)) {
				showMonthSelect = false;
			}
		}
	}

	// Initialize jalali value from gregorian value
	$effect(() => {
		if (value && !jalaliValue) {
			jalaliValue = gregorianToJalali(value);
		}
	});

	// Update current month/year when value changes
	$effect(() => {
		if (value) {
			const date = moment(value);
			currentMonth = date.jMonth();
			currentYear = date.jYear();
		}
	});

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	$effect(() => {
		if (value) {
			jalaliValue = gregorianToJalali(value);
		}
	});
</script>

<div class="relative {className}">
	{#if label}
		<label for={id} class="mb-2 block text-sm font-medium text-gray-700">
			{label}
			{#if required}<span class="text-red-500">*</span>{/if}
		</label>
	{/if}

	<div class="relative">
		<input
			bind:this={inputElement}
			{id}
			{name}
			type="text"
			bind:value={jalaliValue}
			oninput={handleInput}
			onfocus={() => (isOpen = true)}
			{placeholder}
			{required}
			{disabled}
			autocomplete="off"
			class="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 pl-12 text-sm backdrop-blur-sm transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none {disabled
				? 'cursor-not-allowed opacity-50'
				: ''}"
			style="direction: ltr; text-align: start;"
		/>
		<button
			type="button"
			onclick={() => !disabled && (isOpen = !isOpen)}
			class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 transition-colors duration-200 hover:text-gray-600 {disabled
				? 'cursor-not-allowed'
				: ''}"
			{disabled}
		>
			<span class="icon-[solar--calendar-linear] block h-5 w-5"></span>
		</button>
	</div>

	{#if isOpen && !disabled}
		<div
			bind:this={calendarElement}
			class="absolute top-full left-0 z-50 mt-2 min-w-80 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-sm"
			style="direction: rtl;"
		>
			<!-- Calendar Header -->
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={nextYear}
						class="rounded-lg p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100"
						title="سال بعد"
					>
						<span class="icon-[solar--double-alt-arrow-right-linear] block h-4 w-4"></span>
					</button>
					<button
						type="button"
						onclick={nextMonth}
						class="rounded-lg p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100"
						title="ماه بعد"
					>
						<span class="icon-[solar--alt-arrow-right-linear] block h-4 w-4"></span>
					</button>
				</div>

				<div class="text-center relative">
					<div class="flex items-center gap-2 justify-center">
						<!-- Month Selector -->
						<div class="relative month-selector">
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									showMonthSelect = !showMonthSelect;
								}}
								class="flex items-center gap-1 rounded-lg px-3 py-2 text-lg font-bold text-gray-900 transition-colors duration-200 hover:bg-gray-100"
							>
								{persianMonths[currentMonth]}
								<span class="icon-[solar--alt-arrow-down-linear] block h-4 w-4"></span>
							</button>
							
							{#if showMonthSelect}
								<div class="absolute top-full left-0 z-60 mt-1 w-40 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
									{#each persianMonths as month, index}
										<button
											type="button"
											onclick={(e) => selectMonth(index, e)}
											class="w-full px-3 py-2 text-right text-sm transition-colors duration-200 hover:bg-emerald-50 {currentMonth === index ? 'bg-emerald-100 font-medium text-emerald-800' : 'text-gray-700'}"
										>
											{month}
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Year Selector -->
						<div class="relative year-selector">
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									showYearSelect = !showYearSelect;
								}}
								class="flex items-center gap-1 rounded-lg px-3 py-2 text-lg font-bold text-gray-900 transition-colors duration-200 hover:bg-gray-100"
							>
								{currentYear}
								<span class="icon-[solar--alt-arrow-down-linear] block h-4 w-4"></span>
							</button>
							
							{#if showYearSelect}
								<div class="absolute top-full left-0 z-60 mt-1 w-24 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
									{#each generateYearRange() as year}
										<button
											type="button"
											onclick={(e) => selectYear(year, e)}
											class="w-full px-3 py-2 text-center text-sm transition-colors duration-200 hover:bg-emerald-50 {currentYear === year ? 'bg-emerald-100 font-medium text-emerald-800' : 'text-gray-700'}"
										>
											{year}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={previousMonth}
						class="rounded-lg p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100"
						title="ماه قبل"
					>
						<span class="icon-[solar--alt-arrow-left-linear] block h-4 w-4"></span>
					</button>
					<button
						type="button"
						onclick={previousYear}
						class="rounded-lg p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100"
						title="سال قبل"
					>
						<span class="icon-[solar--double-alt-arrow-left-linear] block h-4 w-4"></span>
					</button>
				</div>
			</div>

			<!-- Days of Week Header -->
			<div class="mb-2 grid grid-cols-7 gap-1">
				{#each persianDays as day}
					<div class="p-2 text-center text-sm font-medium text-gray-600">
						{day}
					</div>
				{/each}
			</div>

			<!-- Calendar Days -->
			<div class="grid grid-cols-7 gap-1">
				{#each generateCalendarDays() as day}
					<button
						type="button"
						onclick={() => selectDate(day.date)}
						class="relative rounded-lg p-2 text-sm transition-all duration-200 {day.isCurrentMonth
							? day.isSelected
								? 'bg-emerald-600 font-bold text-white'
								: day.isToday
									? 'bg-emerald-100 font-medium text-emerald-800'
									: day.isDisabled
										? 'cursor-not-allowed text-gray-300'
										: 'text-gray-900 hover:bg-emerald-50'
							: 'text-gray-300'} {day.isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
						disabled={day.isDisabled}
					>
						{day.date.format('jDD')}
						{#if day.isToday && !day.isSelected}
							<div
								class="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-600"
							></div>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Quick Actions -->
			<div class="mt-4 flex justify-between border-t border-gray-200 pt-4">
				<button
					type="button"
					onclick={() => selectDate(moment())}
					class="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-800 transition-colors duration-200 hover:bg-emerald-200"
				>
					امروز
				</button>
				<button
					type="button"
					onclick={() => {
						value = '';
						jalaliValue = '';
						isOpen = false;
						dispatch('change', { value: '', jalaliValue: '' });
					}}
					class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
				>
					پاک کردن
				</button>
			</div>
		</div>
	{/if}
</div>
