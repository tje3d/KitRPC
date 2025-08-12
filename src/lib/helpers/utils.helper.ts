import { shareIt } from '$lib/helpers/rxjs.helper';
import { Observable } from 'rxjs';

let date = Date.now();
export const generateId = (): string => (++date).toString(36);

// Scroll Control
export const disableScroll = new Observable<void>((observer) => {
	// SSR guard - only run in browser environment
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return () => {}; // Return empty cleanup function for SSR
	}

	const target = document.body;
	const initialOverflow = target.style.overflow;
	const initialPaddingRight = target.style.paddingRight;

	// Calculate scrollbar width
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

	// Apply styles
	target.style.overflow = 'hidden';
	target.style.paddingRight = `${parseFloat(initialPaddingRight || '0') + scrollbarWidth}px`;

	return () => {
		target.style.overflow = initialOverflow || '';
		target.style.paddingRight = initialPaddingRight || '';
	};
}).pipe(shareIt());

// Format currency
export function formatCurrency(amount: number, currency: 'IRT' | 'USDT'): string {
	if (currency === 'IRT') {
		return new Intl.NumberFormat('fa-IR', {
			style: 'currency',
			currency: 'IRR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	} else {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 6
		})
			.format(amount)
			.replace('$', 'USDT ');
	}
}
