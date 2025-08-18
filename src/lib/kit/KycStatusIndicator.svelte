<script lang="ts">
	import type { KycStatus } from '@prisma/client';

	export let status: KycStatus | undefined | null = null;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let showLabel: boolean = true;

	// Determine the status text and styling based on the KYC status
	$: statusInfo = {
		text: getStatusText(status),
		bgColor: getBgColor(status),
		textColor: getTextColor(status),
		icon: getIcon(status)
	};

	function getStatusText(status?: KycStatus | null): string {
		switch (status) {
			case 'PENDING':
				return 'در انتظار';
			case 'APPROVED':
				return 'تأیید شده';
			case 'REJECTED':
				return 'رد شده';
			default:
				return 'شروع نشده';
		}
	}

	function getBgColor(status?: KycStatus | null): string {
		switch (status) {
			case 'PENDING':
				return 'bg-yellow-200';
			case 'APPROVED':
				return 'bg-green-200';
			case 'REJECTED':
				return 'bg-red-200';
			default:
				return 'bg-gray-200';
		}
	}

	function getTextColor(status?: KycStatus | null): string {
		switch (status) {
			case 'PENDING':
				return 'text-yellow-800';
			case 'APPROVED':
				return 'text-green-800';
			case 'REJECTED':
				return 'text-red-800';
			default:
				return 'text-gray-800';
		}
	}

	function getIcon(status?: KycStatus | null): string {
		switch (status) {
			case 'PENDING':
				return 'icon-[heroicons--clock-20-solid]';
			case 'APPROVED':
				return 'icon-[heroicons--check-circle-20-solid]';
			case 'REJECTED':
				return 'icon-[heroicons--x-circle-20-solid]';
			default:
				return 'icon-[heroicons--question-mark-circle-20-solid]';
		}
	}

	// Determine the size classes
	$: sizeClasses = {
		sm: 'text-xs px-2 py-0.5',
		md: 'text-sm px-3 py-1',
		lg: 'text-base px-4 py-1.5'
	}[size];
</script>

<span
	class="{statusInfo.bgColor} {statusInfo.textColor} {sizeClasses} inline-flex items-center rounded-full font-medium"
>
	{#if showLabel}
		<span class="{statusInfo.icon} me-1.5 h-4 w-4"></span>
		<span>{statusInfo.text}</span>
	{:else}
		<span class="{statusInfo.icon} h-4 w-4"></span>
	{/if}
</span>
