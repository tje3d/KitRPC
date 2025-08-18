import { base } from '$app/paths';
import { validateSession } from '$lib/auth';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import SuperJSON from 'superjson';
import { createTRPCHandle } from 'trpc-sveltekit';

// Generic function to process multipart form data and extract the first file
async function processMultipartFormData(request: Request): Promise<{
	fields: Record<string, string>;
	fileData: App.SingleFileData | null;
}> {
	const formData = await request.formData();

	// Process form fields and files
	const fields: Record<string, string> = {};
	let fileData: App.SingleFileData | null = null;

	// Extract form fields and process the first file found
	for (const [key, value] of formData.entries()) {
		if (typeof value === 'string') {
			fields[key] = value;
		} else if (fileData === null) {
			// Process only the first file found
			const file = value as File;
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			fileData = {
				filename: file.name || 'unnamed-file',
				mimeType: file.type || 'application/octet-stream',
				encoding: '7bit', // Default encoding for web uploads
				buffer
			};
		}
	}

	return { fields, fileData };
}

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
	if (event.url.pathname.startsWith(base + '/panel')) {
		// If no valid user, redirect to login
		if (!user) {
			throw redirect(302, base + '/login');
		}
	}

	// Handle multipart form data for any POST request
	if (event.request.method === 'POST') {
		const contentType = event.request.headers.get('content-type');
		if (contentType && contentType.includes('multipart/form-data')) {
			try {
				// Process form data using generic function
				const { fields, fileData } = await processMultipartFormData(event.request.clone());

				// Add file data to locals for use in tRPC context
				event.locals.fileData = fileData;
				event.locals.formData = fields;

				// create a new JSON request that trpc will accept
				event.request = new Request(event.request, {
					headers: {
						...Object.fromEntries(event.request.headers.entries()),
						'content-type': 'application/json'
					},
					body: SuperJSON.stringify(fields)
				});
			} catch (error) {
				console.error('خطا در تجزیه داده‌های فرم چند بخشی:', error);
				// Continue with normal processing even if parsing fails
			}
		}
	}

	// Continue with TRPC handle
	return createTRPCHandle({ router, createContext, url: `${base}/api` })({
		event,
		resolve
	});
};
