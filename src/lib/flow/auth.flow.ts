import { invalidateAll } from '$app/navigation';
import { useBooleanStorage, useObjectStorage } from '$lib/helpers/localStorage.helper';
import { shareIt, SvelteSubject } from '$lib/helpers/rxjs.helper';
import { distinctUntilChanged, interval, map, Observable } from 'rxjs';

export const [isLoggedInMain, setIsLoggedIn] = useBooleanStorage('isloggedin', false);
export const isLoggedIn = isLoggedInMain.pipe(distinctUntilChanged(), shareIt());

export const [authUser, setAuthUser] = useObjectStorage<App.AuthUser>('authUser');
export const [manualLogout, setManualLogout] = useBooleanStorage('manual_logout', false);

// Derived observables
export const userDisplayName = authUser.pipe(
	map((user) => {
		if (!user) return 'User';

		const parts = [];
		if (user.firstName) parts.push(user.firstName);
		if (user.lastName) parts.push(user.lastName);

		if (parts.length > 0) {
			return parts.join(' ');
		}

		return user.username || 'User';
	}),
	distinctUntilChanged(),
	shareIt()
);

export const ready = new SvelteSubject<boolean>(false);

// Getters

// Initialization
export const initAuthFlow = new Observable<boolean>((observer) => {
	const subs: Array<{ unsubscribe: () => void }> = [];

	subs.push(
		interval(60_000).subscribe(() => {
			invalidateUserData();
		})
	);

	// Set ready state
	ready.next(true);
	!observer.closed && observer.next(true);

	return () => {
		subs.forEach((sub) => sub.unsubscribe());
	};
});

// Methods
export const logoutLocal = () => {
	setAuthUser(undefined);
	setIsLoggedIn(false);

	const keysToKeep = ['uniqId', 'manual_logout'];
	const savedValues: Record<string, string | null> = {};

	keysToKeep.forEach((key) => {
		savedValues[key] = localStorage.getItem(key);
	});

	localStorage.clear();

	Object.entries(savedValues).forEach(([key, value]) => {
		if (value !== null) {
			localStorage.setItem(key, value);
		}
	});
};

/**
 * Invalidates the current user data by triggering a server-side reload
 * This will cause the layout server to re-fetch user data from the database
 */
export const invalidateUserData = async () => {
	try {
		await invalidateAll();
	} catch (error) {
		console.error('Failed to invalidate user data:', error);
	}
};
