import { base } from '$app/paths';
import { validateSession } from '$lib/auth';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import SuperJSON from 'superjson';
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
	if (event.url.pathname.startsWith(base + '/panel')) {
		// If no valid user, redirect to login
		if (!user) {
			throw redirect(302, base + '/login');
		}
	}

	// Handle multipart form data for media uploads
	if (event.url.pathname === base + '/api/media.upload' && event.request.method === 'POST') {
		const req = event.request.clone();
		const contentType = req.headers.get('content-type');
		if (contentType && contentType.includes('multipart/form-data')) {
			try {
				// Use SvelteKit's built-in formData parsing
				const formData = await req.formData();

				// Process form fields and file
				const fields: Record<string, string> = {};
				let fileData: {
					filename: string;
					mimeType: string;
					encoding: string;
					buffer: Buffer;
				} | null = null;

				// Extract form fields
				for (const [key, value] of formData.entries()) {
					if (typeof value === 'string') {
						fields[key] = value;
					} else {
						// Process file (Blob) - type assertion since TypeScript isn't recognizing File type
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
				console.error('Error parsing multipart form data:', error);
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
