import { hasPermission } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user exists
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Check if user has admin permissions for wallet management
	const hasWalletManagePermission = hasPermission(locals.user, 'wallet', 'manage');

	if (!hasWalletManagePermission) {
		// Redirect to appropriate page if user doesn't have permission
		throw redirect(302, '/panel');
	}

	// User is authorized, continue with page load
	return {};
};
