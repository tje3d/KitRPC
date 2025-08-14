import type { RequestEvent } from '@sveltejs/kit';

export async function createContext(event: RequestEvent) {
	return {
		user: event.locals.user,
		request: event.request,
		cookies: event.cookies,
		fileData: event.locals.fileData || null,
		formData: event.locals.formData || null
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
