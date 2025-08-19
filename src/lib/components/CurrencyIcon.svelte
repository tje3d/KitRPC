<script lang="ts">
	import type { CurrencyType } from '@prisma/client';
	import { getCurrencyIcon, getCurrencyDisplayName } from '$lib/helpers/Currency.helper';

	export let currency: CurrencyType | string;
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let showLabel = false;
	export let alt: string | undefined = undefined;
	// Allow custom classes for styling the label
	let className = '';
	export { className as class };

	$: iconPath = getCurrencyIcon(currency);
	$: displayName = getCurrencyDisplayName(currency);
	$: altText = alt || `${displayName} icon`;

	$: sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
		xl: 'w-12 h-12'
	}[size];

	$: labelSizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base',
		xl: 'text-lg'
	}[size];
</script>

<div class="flex items-center gap-2">
	<img src={iconPath} alt={altText} class="{sizeClasses} object-contain" loading="lazy" />
	{#if showLabel}
		<span class="{labelSizeClasses} font-medium {className || 'text-gray-700'}">
			{displayName}
		</span>
	{/if}
</div>
