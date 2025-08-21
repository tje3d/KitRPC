<script lang="ts">
	/** @type {string} - Status type (e.g., 'success', 'warning', 'error', 'info', 'pending', 'COMPLETED', 'PENDING', 'FAILED', 'CANCELLED') */
	export let status:
		| 'success'
		| 'warning'
		| 'error'
		| 'info'
		| 'pending'
		| 'COMPLETED'
		| 'PENDING'
		| 'FAILED'
		| 'CANCELLED'
		| string = 'info';

	/** @type {string} - Custom label for the badge */
	export let label: string = '';

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {boolean} - Whether to show an icon */
	export let showIcon: boolean = true;

	/** @type {string} - Custom icon class (if not using default icons) */
	export let iconClass: string = '';

	/** @type {'default' | 'subtle' | 'minimal'} - Style variant */
	export let variant: 'default' | 'subtle' | 'minimal' = 'default';

	// Predefined color schemes
	const statusConfig = {
		success: {
			default: 'bg-green-100 text-green-800 border-green-200',
			subtle: 'bg-green-50 text-green-700 border-green-100',
			minimal: 'text-green-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--check-circle]'
		},
		warning: {
			default: 'bg-yellow-100 text-yellow-800 border-yellow-200',
			subtle: 'bg-yellow-50 text-yellow-700 border-yellow-100',
			minimal: 'text-yellow-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--exclamation-triangle]'
		},
		error: {
			default: 'bg-red-100 text-red-800 border-red-200',
			subtle: 'bg-red-50 text-red-700 border-red-100',
			minimal: 'text-red-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--x-circle]'
		},
		info: {
			default: 'bg-blue-100 text-blue-800 border-blue-200',
			subtle: 'bg-blue-50 text-blue-700 border-blue-100',
			minimal: 'text-blue-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--information-circle]'
		},
		pending: {
			default: 'bg-gray-100 text-gray-800 border-gray-200',
			subtle: 'bg-gray-50 text-gray-700 border-gray-100',
			minimal: 'text-gray-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--clock]'
		},
		// Transaction-specific statuses
		COMPLETED: {
			default: 'bg-green-100 text-green-800 border-green-200',
			subtle: 'bg-green-50 text-green-700 border-green-100',
			minimal: 'text-green-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--check-circle]'
		},
		PENDING: {
			default: 'bg-gray-100 text-gray-800 border-gray-200',
			subtle: 'bg-gray-50 text-gray-700 border-gray-100',
			minimal: 'text-gray-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--clock]'
		},
		FAILED: {
			default: 'bg-red-100 text-red-800 border-red-200',
			subtle: 'bg-red-50 text-red-700 border-red-100',
			minimal: 'text-red-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--x-circle]'
		},
		CANCELLED: {
			default: 'bg-blue-100 text-blue-800 border-blue-200',
			subtle: 'bg-blue-50 text-blue-700 border-blue-100',
			minimal: 'text-blue-600 bg-transparent border-transparent',
			icon: 'icon-[heroicons--information-circle]'
		}
	};

	// Get configuration for the current status
	// Get configuration for the current status
	function getConfig() {
		return statusConfig[status as keyof typeof statusConfig] || statusConfig.info;
	}

	$: config = getConfig();

	// Get classes based on variant
	$: badgeClasses = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config[variant]} ${className}`;

	// Get icon class
	$: iconClasses = `me-1.5 h-3 w-3 ${config[variant].includes('text-') ? config[variant].split(' ').find((cls: string) => cls.startsWith('text-')) : 'text-current'}`;

	// Get status label for transaction statuses
	function getStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			COMPLETED: 'تکمیل شده',
			PENDING: 'در انتظار',
			FAILED: 'ناموفق',
			CANCELLED: 'لغو شده'
		};
		return labels[status] || status;
	}
</script>

<span class={badgeClasses} role="status" aria-label={label || status}>
	{#if showIcon}
		<span class={iconClasses + ' ' + (iconClass || config.icon)}></span>
	{/if}
	<span>{label || getStatusLabel(status)}</span>
</span>
