import { prisma } from '$lib/prisma';
import { MediaVisibility } from '@prisma/client';
import { error, type RequestHandler } from '@sveltejs/kit';
import * as fs from 'fs';
import * as path from 'path';

export const GET: RequestHandler = async ({ params, locals, cookies }) => {
	// Validate media ID format
	const { id } = params;
	if (!id || typeof id !== 'string') {
		throw error(400, 'Invalid media ID');
	}

	let user = locals.user;

	try {
		// Get media record from database
		const media = await prisma.media.findUnique({
			where: { id },
			select: {
				id: true,
				reason: true,
				visibility: true,
				filename: true,
				originalName: true,
				fileSize: true,
				mimeType: true,
				storagePath: true,
				metadata: true,
				ownerId: true,
				createdAt: true,
				updatedAt: true
			}
		});

		if (!media) {
			throw error(404, 'Media not found');
		}

		// Access control: Check if user can access this media
		if (media.visibility === MediaVisibility.PRIVATE) {
			// Private files require authentication
			if (!user) {
				throw error(401, 'Authentication required');
			}

			// Only owner or users with media:manage permission can access private files
			if (user.id !== media.ownerId) {
				// Check if user has media:manage permission
				const hasMediaManagePermission =
					user.role?.permissions.some(
						(rp) => rp.permission.resource === 'media' && rp.permission.action === 'manage'
					) ||
					user.permissions?.some(
						(up) => up.permission.resource === 'media' && up.permission.action === 'manage'
					);

				// Also check for admin:manage permission for backward compatibility
				const hasAdminManagePermission =
					user.role?.permissions.some(
						(rp) => rp.permission.resource === 'admin' && rp.permission.action === 'manage'
					) ||
					user.permissions?.some(
						(up) => up.permission.resource === 'admin' && up.permission.action === 'manage'
					);

				if (!hasMediaManagePermission && !hasAdminManagePermission) {
					throw error(403, 'Access denied');
				}
			}
		}
		// Public files can be accessed without authentication

		// Check if file exists
		const fullPath = path.join('static', media.storagePath);
		if (!fs.existsSync(fullPath)) {
			throw error(404, 'File not found');
		}

		// Read file
		const fileBuffer = fs.readFileSync(fullPath);

		// Determine content disposition
		// For images, serve directly
		// For other files, force download
		const isImage = media.mimeType.startsWith('image/');
		const headers: Record<string, string> = {
			'Content-Type': media.mimeType,
			'Content-Length': fileBuffer.length.toString()
		};

		if (!isImage) {
			headers['Content-Disposition'] = `attachment; filename="${media.originalName}"`;
		}

		// Return response with file content
		return new Response(fileBuffer, {
			status: 200,
			headers
		});
	} catch (err: any) {
		// Handle specific error cases
		if (err.message && err.message.includes('Access denied')) {
			throw error(403, 'Access denied');
		}

		if (err.message && err.message.includes('not found')) {
			throw error(404, 'Media not found');
		}

		// Generic error
		throw error(500, 'Failed to serve media');
	}
};
