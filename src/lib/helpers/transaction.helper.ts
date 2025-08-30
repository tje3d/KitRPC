import type { TransactionStatus, TransactionType } from '@prisma/client';

// Transaction type labels
export function getTransactionTypeLabel(type: TransactionType): string {
	switch (type) {
		case 'DEPOSIT':
			return 'واریز';
		case 'WITHDRAWAL':
			return 'برداشت';
		case 'TRANSFER':
			return 'انتقال';
		case 'SELL_USDT':
			return 'فروش USDT';
		case 'BUY_USDT':
			return 'خرید USDT';
		default:
			return type;
	}
}

// Transaction type icons
export function getTransactionTypeIcon(type: TransactionType): string {
	switch (type) {
		case 'DEPOSIT':
			return 'icon-[heroicons--arrow-down-tray]';
		case 'WITHDRAWAL':
			return 'icon-[heroicons--arrow-up-tray]';
		case 'TRANSFER':
			return 'icon-[heroicons--arrows-right-left]';
		case 'SELL_USDT':
			return 'icon-[heroicons--arrow-trending-down]';
		case 'BUY_USDT':
			return 'icon-[heroicons--arrow-trending-up]';
		default:
			return 'icon-[heroicons--currency-dollar]';
	}
}

// Transaction type CSS classes
export function getTransactionTypeClass(type: TransactionType): string {
	switch (type) {
		case 'DEPOSIT':
			return 'text-green-600';
		case 'WITHDRAWAL':
			return 'text-red-600';
		case 'TRANSFER':
			return 'text-blue-600';
		case 'SELL_USDT':
			return 'text-red-600';
		case 'BUY_USDT':
			return 'text-green-600';
		default:
			return 'text-gray-600';
	}
}

// Transaction status labels
export function getTransactionStatusLabel(status: TransactionStatus): string {
	switch (status) {
		case 'PENDING':
			return 'در انتظار';
		case 'COMPLETED':
			return 'تکمیل شده';
		case 'FAILED':
			return 'ناموفق';
		case 'CANCELLED':
			return 'لغو شده';
		default:
			return status;
	}
}

// Transaction status CSS classes
export function getTransactionStatusClass(status: TransactionStatus): string {
	switch (status) {
		case 'PENDING':
			return 'text-yellow-600';
		case 'COMPLETED':
			return 'text-green-600';
		case 'FAILED':
			return 'text-red-600';
		case 'CANCELLED':
			return 'text-gray-600';
		default:
			return 'text-gray-600';
	}
}
