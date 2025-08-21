<script lang="ts">
	export let variant: 'edit' | 'delete' | 'view' | 'custom' = 'edit';
	export let href: string | undefined = undefined;
	export let onClick: (() => void) | undefined = undefined;
	export let disabled = false;
	export let ariaLabel: string | undefined = undefined;
	export let title: string | undefined = undefined;
	export let icon: string | undefined = undefined;
	export let customClass: string = '';
	export let target: string | undefined = undefined;

	// Default configurations for each variant
	const variants = {
		edit: {
			icon: 'icon-[heroicons--pencil]',
			baseClass: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
			ariaLabel: 'ویرایش',
			title: 'ویرایش'
		},
		delete: {
			icon: 'icon-[heroicons--trash]',
			baseClass: 'border-red-300 bg-white text-red-700 hover:bg-red-50 focus:ring-red-500',
			ariaLabel: 'حذف',
			title: 'حذف'
		},
		view: {
			icon: 'icon-[heroicons--eye]',
			baseClass: 'border-blue-300 bg-white text-blue-700 hover:bg-blue-50 focus:ring-blue-500',
			ariaLabel: 'مشاهده',
			title: 'مشاهده'
		},
		custom: {
			icon: 'icon-[heroicons--ellipsis-horizontal]',
			baseClass: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
			ariaLabel: 'عملیات',
			title: 'عملیات'
		}
	};

	$: currentVariant = variants[variant];
	$: finalIcon = icon || currentVariant.icon;
	$: finalAriaLabel = ariaLabel || currentVariant.ariaLabel;
	$: finalTitle = title || currentVariant.title;
	$: finalClass = `inline-flex items-center rounded border px-3 py-1.5 text-xs font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none ${currentVariant.baseClass} ${customClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
</script>

{#if href && !disabled}
	<a
		{href}
		{target}
		aria-label={finalAriaLabel}
		title={finalTitle}
		class={finalClass}
	>
		<span class="{finalIcon} h-4 w-4"></span>
		<slot />
	</a>
{:else}
	<button
		aria-label={finalAriaLabel}
		title={finalTitle}
		class={finalClass}
		on:click={onClick}
		{disabled}
		type="button"
	>
		<span class="{finalIcon} h-4 w-4"></span>
		<slot />
	</button>
{/if}