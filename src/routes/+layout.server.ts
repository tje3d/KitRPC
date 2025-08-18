import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user
			? ({
					...locals.user,
					password: null
				} as App.AuthUser)
			: undefined
	};
};
