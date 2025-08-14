import { validateSession } from '$lib/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const sessionToken = cookies.get('session_token');

	if (!sessionToken) {
		return {
			user: null
		};
	}

	try {
		const session = await validateSession(sessionToken);

		if (!session) {
			// Clear invalid session cookie
			cookies.delete('session_token', { path: '/' });
			return {
				user: null
			};
		}

		// Return user data in the format expected by the client
		const user: App.AuthUser = {
			id: session.user.id,
			username: session.user.username,
			email: session.user.email,
			balanceIRT: session.user.balanceIRT,
			balanceUSDT: session.user.balanceUSDT,
			role: session.user.role
				? {
						id: session.user.role.id,
						name: session.user.role.name,
						description: session.user.role.description,
						permissions: session.user.role.permissions
					}
				: undefined,
			permissions: session.user.permissions
		};

		return {
			user
		};
	} catch (error) {
		console.error('Error validating session:', error);
		// Clear potentially corrupted session cookie
		cookies.delete('session_token', { path: '/' });
		return {
			user: null
		};
	}
};
