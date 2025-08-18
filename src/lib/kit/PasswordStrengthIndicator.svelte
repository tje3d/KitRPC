<script lang="ts">
	/** @type {number} - Password strength score (0-5) */
	export let strength: number = 0;

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	// Strength labels
	const strengthLabels = ['بسیار ضعیف', 'ضعیف', 'متوسط', 'خوب', 'قوی', 'بسیار قوی'];

	// Strength colors
	const strengthColors = [
		'bg-red-500', // Very Weak
		'bg-orange-500', // Weak
		'bg-yellow-500', // Fair
		'bg-blue-500', // Good
		'bg-green-500', // Strong
		'bg-purple-500' // Very Strong
	];

	// Get strength label
	$: strengthLabel = strengthLabels[strength] || 'Very Weak';

	// Get strength color
	$: strengthColor = strengthColors[strength] || 'bg-red-500';

	// Get bar width percentage
	$: barWidth = ((strength + 1) / 6) * 100;
</script>

<div class={`space-y-2 ${className}`}>
	<div class="flex justify-between">
		<span class="text-sm font-medium text-gray-700">قدرت رمز عبور</span>
		<span
			class={`text-sm font-medium ${strength < 2 ? 'text-red-500' : strength < 4 ? 'text-yellow-500' : 'text-green-500'}`}
		>
			{strengthLabel}
		</span>
	</div>
	<div class="h-2 w-full rounded-full bg-gray-200">
		<div
			class={`h-full rounded-full transition-all duration-300 ease-in-out ${strengthColor}`}
			style={`width: ${barWidth}%`}
		></div>
	</div>
	<div class="text-xs text-gray-500">
		{#if strength < 2}
			از حداقل ۸ کاراکتر با ترکیبی از حروف، اعداد و نمادها استفاده کنید.
		{:else if strength < 4}
			در حال قوی‌تر شدن است! سعی کنید تنوع کاراکترهای بیشتری اضافه کنید.
		{:else if strength < 6}
			رمز عبور عالی! تمام الزامات امنیتی را برآورده می‌کند.
		{:else}
			رمز عبور بسیار عالی! حداکثر امنیت حاصل شده است.
		{/if}
	</div>
</div>
