import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from './trpc';
import { isAuthenticated, createPermissionMiddleware } from './middleware';
import {
	getMediaById,
	getMediaByUser,
	deleteMedia,
	getMediaForAdmin,
	saveMediaFile,
	createMediaRecord,
	getMediaStatistics
} from '$lib/services/media.service';
import { MediaReason, MediaVisibility } from '@prisma/client';

// Input validation schemas
const uploadSchema = z.object({
	reason: z.nativeEnum(MediaReason),
	visibility: z.nativeEnum(MediaVisibility).optional()
	// Note: File data will be processed in hooks.server.ts and available in context
});

const getByIdSchema = z.object({
	id: z.string().cuid()
});

const listSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10)
});

const deleteSchema = z.object({
	id: z.string().cuid()
});

const adminListSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10),
	filename: z.string().optional(),
	reason: z.nativeEnum(MediaReason).optional(),
	visibility: z.nativeEnum(MediaVisibility).optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional()
});

// Permission middleware for admin operations
const adminOnly = createPermissionMiddleware('media', 'manage');

// Protected procedures
const protectedProcedure = t.procedure.use(isAuthenticated);
const adminProcedure = t.procedure.use(adminOnly);

export const mediaRouter = t.router({
	// Upload media file
	upload: protectedProcedure.input(uploadSchema).mutation(async ({ input, ctx }) => {
		try {
			// File data should be available in ctx after being processed in hooks.server.ts
			const fileData = ctx.fileData;

			if (!fileData) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'No file data provided'
				});
			}

			// Validate file size (max 10MB)
			const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
			if (fileData.buffer.length > maxFileSize) {
				throw new TRPCError({
					code: 'PAYLOAD_TOO_LARGE',
					message: 'File size exceeds 10MB limit'
				});
			}

			// Validate file type
			const allowedMimeTypes = [
				'image/jpeg',
				'image/png',
				'image/gif',
				'image/webp',
				'application/pdf',
				'application/msword', // .doc
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
			];

			if (!allowedMimeTypes.includes(fileData.mimeType)) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'File type not allowed'
				});
			}

			// Save the file using the media service
			const savedFile = await saveMediaFile(fileData.buffer, ctx.user.id, fileData.filename);

			// Create a media record in the database
			const mediaRecord = await createMediaRecord({
				reason: input.reason,
				visibility: input.visibility || MediaVisibility.PRIVATE,
				filename: savedFile.fileName,
				originalName: fileData.filename,
				fileSize: fileData.buffer.length,
				mimeType: fileData.mimeType,
				storagePath: savedFile.filePath,
				ownerId: ctx.user.id
			});

			// Return the created media record
			return {
				...mediaRecord,
				createdAt: mediaRecord.createdAt.toISOString(),
				updatedAt: mediaRecord.updatedAt.toISOString()
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to upload media',
				cause: error
			});
		}
	}),

	// Get media by ID
	getById: protectedProcedure.input(getByIdSchema).query(async ({ input, ctx }) => {
		try {
			const media = await getMediaById(input.id, ctx.user.id);

			return {
				...media,
				createdAt: media.createdAt.toISOString(),
				updatedAt: media.updatedAt.toISOString()
			};
		} catch (error: any) {
			if (error.message && error.message.includes('Access denied')) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: error.message
				});
			}

			if (error.message && error.message.includes('not found')) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Media not found'
				});
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch media',
				cause: error
			});
		}
	}),

	// List user's media
	list: protectedProcedure.input(listSchema).query(async ({ input, ctx }) => {
		try {
			const { page, limit } = input;
			const offset = (page - 1) * limit;

			const result = await getMediaByUser(ctx.user.id, limit, offset);

			return {
				media: result.media.map((media) => ({
					...media,
					createdAt: media.createdAt.toISOString(),
					updatedAt: media.updatedAt.toISOString()
				})),
				pagination: {
					page,
					limit,
					total: result.totalCount,
					hasNextPage: result.hasNextPage,
					hasPreviousPage: result.hasPreviousPage
				}
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch media list',
				cause: error
			});
		}
	}),

	// Delete media
	delete: protectedProcedure.input(deleteSchema).mutation(async ({ input, ctx }) => {
		try {
			const result = await deleteMedia(input.id, ctx.user.id);
			return result;
		} catch (error: any) {
			if (error.message && error.message.includes('Access denied')) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: error.message
				});
			}

			if (error.message && error.message.includes('not found')) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Media not found'
				});
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to delete media',
				cause: error
			});
		}
	}),

	// Admin list all media
	adminList: adminProcedure.input(adminListSchema).query(async ({ input }) => {
		try {
			const { page, limit, filename, reason, visibility, startDate, endDate } = input;
			const offset = (page - 1) * limit;

			const filters = {
				...(filename && { filename }),
				...(reason && { reason }),
				...(visibility && { visibility }),
				...(startDate && { startDate }),
				...(endDate && { endDate })
			};

			const result = await getMediaForAdmin(
				Object.keys(filters).length > 0 ? filters : undefined,
				limit,
				offset
			);

			return {
				media: result.media.map((media) => ({
					...media,
					createdAt: media.createdAt.toISOString(),
					updatedAt: media.updatedAt.toISOString(),
					owner: media.owner
						? {
								id: media.owner.id,
								username: media.owner.username
							}
						: undefined
				})),
				pagination: {
					page,
					limit,
					total: result.totalCount,
					hasNextPage: result.hasNextPage,
					hasPreviousPage: result.hasPreviousPage
				}
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch media list for admin',
				cause: error
			});
		}
	}),

	// Admin statistics
	adminStats: adminProcedure.query(async () => {
		try {
			const stats = await getMediaStatistics();
			return stats;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch media statistics',
				cause: error
			});
		}
	})
});
