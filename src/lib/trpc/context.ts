import type { RequestEvent } from '@sveltejs/kit';

// Type for file data (now always a single file or null)
type FileData = App.SingleFileData | null;

export async function createContext(event: RequestEvent) {
	return {
		user: event.locals.user,
		request: event.request,
		cookies: event.cookies,
		fileData: (event.locals.fileData as FileData) || null,
		formData: event.locals.formData || null
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
