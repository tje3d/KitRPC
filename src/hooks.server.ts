import { validateSession } from '$lib/auth';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';

export const handle: Handle = async ({ event, resolve }) => {
	// Extract token from cookies
	const token = event.cookies.get('session_token');

	// Validate session if token exists
	let user = null;
	if (token) {
		const session = await validateSession(token);
		if (session) {
			user = session.user;
		}
	}

	// Add user to locals
	event.locals.user = user;

	// Check if the route starts with /panel
	if (event.url.pathname.startsWith('/panel')) {
		// If no valid user, redirect to login
		if (!user) {
			throw redirect(302, '/login');
		}
	}

	// Continue with TRPC handle
	return createTRPCHandle({ router, createContext, url: '/api' })({
		event,
		resolve
	});
};
