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
export function formatCurrency(
	amount: number,
	currency: 'IRT' | 'USDT',
	compact: boolean = false
): string {
	if (currency === 'IRT') {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'IRT',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
			roundingMode: 'trunc',
			...(compact && { notation: 'compact', compactDisplay: 'short' })
		}).format(amount);
	} else {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			roundingMode: 'trunc',
			...(compact && { notation: 'compact', compactDisplay: 'short' })
		})
			.format(amount)
			.replace('$', 'USDT ');
	}
}

// Format date to display on two lines (date and time separately)
export function formatDateTimeTwoLines(date: Date | string, locale: string = 'fa-IR'): string {
	const d = typeof date === 'string' ? new Date(date) : date;

	// Format date part
	const dateOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	};

	// Format time part
	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	};

	const dateString = d.toLocaleDateString(locale, dateOptions);
	const timeString = d.toLocaleTimeString(locale, timeOptions);

	return `${dateString}<br>${timeString}`;
}

// Extract device information from request context
export function extractDeviceInfo(ctx: { request: Request }) {
	const userAgent = ctx.request.headers.get('user-agent') || undefined;
	const ipAddress =
		ctx.request.headers.get('x-forwarded-for') || ctx.request.headers.get('x-real-ip') || undefined;

	// Simple device type detection based on user agent
	let deviceType = 'desktop';
	let browser = 'unknown';

	if (userAgent) {
		if (/mobile/i.test(userAgent)) {
			deviceType = 'mobile';
		} else if (/tablet/i.test(userAgent)) {
			deviceType = 'tablet';
		}

		// Simple browser detection
		if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
			browser = 'Chrome';
		} else if (/firefox/i.test(userAgent)) {
			browser = 'Firefox';
		} else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
			browser = 'Safari';
		} else if (/edge/i.test(userAgent)) {
			browser = 'Edge';
		}
	}

	return {
		userAgent,
		ipAddress,
		deviceType,
		browser
	};
}
