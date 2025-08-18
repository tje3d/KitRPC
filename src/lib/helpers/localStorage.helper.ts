import { browser } from '$app/environment';
import { jsonDecodeWorker, jsonEncodeWorker } from '$lib/helpers/jsonWorker.helper';
import { shareIt } from '$lib/helpers/rxjs.helper';
import { Observable, of } from 'rxjs';

export async function saveToLocalStorage(key: string, data: any) {
	if (!browser) {
		return false;
	}

	try {
		return new Promise((resolve) => {
			jsonEncodeWorker<string>(data).subscribe((v) => {
				localStorage.setItem(key, v);
				resolve(true);
			});
		});
	} catch (e) {
		console.error('ذخیره داده در localStorage ناموفق بود', e);
		return false;
	}
}

export async function loadFromLocalStorage<T>(key: string): Promise<T | null> {
	if (!browser) {
		return null;
	}

	try {
		const serializedData = localStorage.getItem(key);
		if (serializedData === null) {
			return null;
		}

		return new Promise<T>((resolve) => {
			jsonDecodeWorker<T>(serializedData).subscribe((data) => {
				resolve(data);
			});
		});
	} catch (e) {
		console.error('Failed to load data from localStorage', e);
		if (browser) {
			localStorage.removeItem(key);
		}
		return null;
	}
}

export async function removeFromLocalStorage(key: string): Promise<void> {
	if (!browser) {
		return;
	}

	localStorage.removeItem(key);
}

type StorageOptions<T> = {
	serializer?: (value: T) => string;
	deserializer?: (value: string) => T;
	validator?: (value: string) => boolean;
	removeOnNullish?: boolean;
};

/**
 * A React-like hook for managing state in localStorage with RxJS
 * @param key The localStorage key
 * @param defaultValue Default value if nothing exists in storage
 * @param options Configuration for serialization/deserialization
 * @returns [state$, setState] - An Observable and setter function
 */
export function useLocalStorage<T>(
	key: string,
	defaultValue: T,
	options: StorageOptions<T> = {}
): [Observable<T>, (value: T | undefined | null) => void] {
	// Default serializer/deserializer functions
	const serializer = options.serializer || JSON.stringify;
	const deserializer = options.deserializer || ((value: string) => JSON.parse(value) as T);
	const validator = options.validator || (() => true);
	const removeOnNullish = options.removeOnNullish || false;

	// If not in browser environment, return default value observable and no-op setter
	if (!browser) {
		return [of(defaultValue), () => {}];
	}

	// Create an Observable that syncs with localStorage
	const state$ = new Observable<T>((subscriber) => {
		// Get initial value from localStorage
		const storedValue = localStorage.getItem(key);

		// Determine the initial value
		const initialValue =
			storedValue && validator(storedValue) ? deserializer(storedValue) : defaultValue;

		// Emit the initial value
		subscriber.next(initialValue);

		// If we're using defaultValue, initialize localStorage
		if (!storedValue || !validator(storedValue)) {
			localStorage.setItem(key, serializer(defaultValue));
		}

		// Setup storage event listener to keep in sync across tabs
		const storageListener = (event: StorageEvent) => {
			if (event.key === key && event.newValue) {
				if (validator(event.newValue)) {
					subscriber.next(deserializer(event.newValue));
				}
			} else if (event.key === key && event.newValue === null) {
				// Handle removal case
				subscriber.next(defaultValue);
			}
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('storage', storageListener);
		}

		// Cleanup
		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('storage', storageListener);
			}
		};
	}).pipe(shareIt());

	// Function to update the state
	const setState = (value: T | undefined | null) => {
		if (!browser) {
			return;
		}

		if (removeOnNullish && (value === undefined || value === null)) {
			// Remove the key if value is nullish and removeOnNullish is true
			localStorage.removeItem(key);

			// Manually dispatch an event for the current tab to signal removal
			if (typeof window !== 'undefined') {
				const event = new StorageEvent('storage', {
					key,
					newValue: null
				});
				window.dispatchEvent(event);
			}
		} else {
			// Update localStorage with the provided value
			localStorage.setItem(key, serializer(value as T));

			// Manually dispatch an event for the current tab
			if (typeof window !== 'undefined') {
				const event = new StorageEvent('storage', {
					key,
					newValue: serializer(value as T)
				});
				window.dispatchEvent(event);
			}
		}
	};

	return [state$, setState];
}

// Convenience function for boolean values
export function useBooleanStorage(
	key: string,
	defaultValue: boolean = false
): [Observable<boolean>, (value: boolean) => void] {
	return useLocalStorage<boolean>(key, defaultValue, {
		serializer: (value) => String(value),
		deserializer: (value) => value === 'true',
		validator: (value) => value === 'true' || value === 'false'
	});
}

/**
 * Convenience function for string values in localStorage
 */
export function useStringStorage(
	key: string,
	defaultValue: string = ''
): [Observable<string>, (value: string) => void] {
	return useLocalStorage<string>(key, defaultValue, {
		serializer: (value) => value,
		deserializer: (value) => value,
		validator: (value) => typeof value === 'string'
	});
}

/**
 * Convenience function for number values in localStorage
 */
export function useNumberStorage(
	key: string,
	defaultValue: number = 0
): [Observable<number>, (value: number) => void] {
	return useLocalStorage<number>(key, defaultValue, {
		serializer: (value) => String(value),
		deserializer: (value) => Number(value),
		validator: (value) => !isNaN(Number(value))
	});
}

/**
 * Convenience function for object values in localStorage
 * @template T The object type
 */
export function useObjectStorage<T extends Record<string, any>>(
	key: string,
	defaultValue?: T
): [Observable<T | undefined>, (value: T | undefined | null) => void] {
	return useLocalStorage<T | undefined>(key, defaultValue, {
		serializer: (value) => JSON.stringify(value),
		deserializer: (value) => {
			try {
				return JSON.parse(value) as T;
			} catch (e) {
				return defaultValue;
			}
		},
		validator: (value) => {
			try {
				const parsed = JSON.parse(value);
				return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed);
			} catch (e) {
				return false;
			}
		},
		removeOnNullish: true
	});
}

/**
 * Convenience function for array values in localStorage
 * @template T The array item type
 */
export function useArrayStorage<T>(
	key: string,
	defaultValue: T[] = []
): [Observable<T[]>, (value: T[]) => void] {
	return useLocalStorage<T[]>(key, defaultValue, {
		serializer: (value) => JSON.stringify(value),
		deserializer: (value) => {
			try {
				return JSON.parse(value) as T[];
			} catch (e) {
				return defaultValue;
			}
		},
		validator: (value) => {
			try {
				const parsed = JSON.parse(value);
				return Array.isArray(parsed);
			} catch (e) {
				return false;
			}
		}
	});
}
