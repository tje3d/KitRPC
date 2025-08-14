<script lang="ts">
	/** @type {number} - Password strength score (0-5) */
	export let strength: number = 0;

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	// Strength labels
	const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

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
		<span class="text-sm font-medium text-gray-700">Password Strength</span>
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
			Use at least 8 characters with a mix of letters, numbers, and symbols.
		{:else if strength < 4}
			Getting stronger! Try adding more character variety.
		{:else if strength < 6}
			Great password! It meets all security requirements.
		{:else}
			Excellent password! Maximum security achieved.
		{/if}
	</div>
</div>
