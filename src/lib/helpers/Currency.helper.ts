import type { CurrencyType } from '@prisma/client';

/**
 * Gets the icon path for a currency
 * @param currency - The currency type (IRT or USDT)
 * @returns Icon path string
 */
export function getCurrencyIcon(currency: CurrencyType | string): string {
	const currencyLower = currency.toLowerCase();
	
	switch (currencyLower) {
		case 'irt':
			return '/img/irt.png';
		case 'usdt':
			return '/img/usdt.png';
		default:
			return '/img/irt.png'; // fallback to IRT
	}
}

/**
 * Gets the display name for a currency
 * @param currency - The currency type (IRT or USDT)
 * @returns Display name string
 */
export function getCurrencyDisplayName(currency: CurrencyType | string): string {
	const currencyUpper = currency.toUpperCase();
	
	switch (currencyUpper) {
		case 'IRT':
			return 'تومان';
		case 'USDT':
			return 'USDT';
		default:
			return currency.toString();
	}
}

/**
 * Gets currency symbol
 * @param currency - The currency type (IRT or USDT)
 * @returns Currency symbol string
 */
export function getCurrencySymbol(currency: CurrencyType | string): string {
	const currencyUpper = currency.toUpperCase();
	
	switch (currencyUpper) {
		case 'IRT':
			return 'ریال';
		case 'USDT':
			return 'USDT';
		default:
			return currency.toString();
	}
}

/**
 * Currency configuration object
 */
export const CURRENCY_CONFIG = {
	IRT: {
		icon: '/img/irt.png',
		displayName: 'تومان',
		symbol: 'ریال',
		code: 'IRT'
	},
	USDT: {
		icon: '/img/usdt.png',
		displayName: 'USDT',
		symbol: 'USDT',
		code: 'USDT'
	}
} as const;

/**
 * Gets complete currency configuration
 * @param currency - The currency type (IRT or USDT)
 * @returns Currency configuration object
 */
export function getCurrencyConfig(currency: CurrencyType | string) {
	const currencyUpper = currency.toUpperCase() as keyof typeof CURRENCY_CONFIG;
	return CURRENCY_CONFIG[currencyUpper] || CURRENCY_CONFIG.IRT;
}

/**
 * Renders currency with icon as HTML string (for DataTable render functions)
 * @param currency - The currency type (IRT or USDT)
 * @returns HTML string with currency icon and label
 */
export function renderCurrencyWithIcon(currency: CurrencyType | string): string {
	const config = getCurrencyConfig(currency);
	return `<div class="flex items-center gap-2">
		<img src="${config.icon}" alt="${config.displayName}" class="w-4 h-4 object-contain" />
		<span>${config.displayName}</span>
	</div>`;
}