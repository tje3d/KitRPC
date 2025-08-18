import { MediaReason, MediaVisibility, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { prisma as defaultPrisma } from '../prisma';

// Media creation data type
type CreateMediaInput = {
	reason: MediaReason;
	visibility?: MediaVisibility;
	filename: string;
	originalName: string;
	fileSize: number;
	mimeType: string;
	storagePath: string;
	metadata?: Prisma.InputJsonValue;
	ownerId: string;
};

// Media update data type
type UpdateMediaInput = {
	reason?: MediaReason;
	visibility?: MediaVisibility;
	filename?: string;
	originalName?: string;
	fileSize?: number;
	mimeType?: string;
	storagePath?: string;
	metadata?: Prisma.InputJsonValue;
};

// Filter type for admin media listing
type MediaFilters = {
	ownerId?: string;
	reason?: MediaReason;
	visibility?: MediaVisibility;
};

// Save a media file to the file system
export const saveMediaFile = async (
	fileBuffer: Buffer,
	userId: string,
	originalName: string
): Promise<{ filePath: string; fileName: string }> => {
	// Validate required fields
	if (!fileBuffer || !userId || !originalName) {
		throw new Error('بافر فایل، شناسه کاربر و نام اصلی الزامی هستند');
	}

	try {
		// Create user-specific directory structure: static/media/{userId}/{date}
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		const userDir = path.join('static', 'media', userId, `${year}`, `${month}`, `${day}`);

		// Ensure directory exists
		if (!fs.existsSync(userDir)) {
			fs.mkdirSync(userDir, { recursive: true });
		}

		// Generate unique filename to prevent conflicts
		const timestamp = Date.now();
		const randomSuffix = Math.random().toString(36).substring(2, 8);
		const fileExtension = path.extname(originalName);
		const fileName = `${timestamp}-${randomSuffix}${fileExtension}`;
		const filePath = path.join(userDir, fileName);

		// Write file to disk
		fs.writeFileSync(filePath, fileBuffer);

		// Return relative path for storage in database
		const relativePath = path.relative('static', filePath).replace(/\\/g, '/');

		return {
			filePath: relativePath,
			fileName
		};
	} catch (error: any) {
		throw new Error(`Failed to save media file: ${error.message}`);
	}
};

// Create a media record in the database
export const createMediaRecord = async (data: CreateMediaInput) => {
	// Validate required fields
	if (!data.reason || !data.filename || !data.originalName || !data.ownerId) {
		throw new Error('Reason, filename, originalName, and ownerId are required');
	}

	try {
		// Check if owner exists
		const owner = await defaultPrisma.user.findUnique({
			where: { id: data.ownerId }
		});

		if (!owner) {
			throw new Error('Owner not found');
		}

		// Create the media record
		const media = await defaultPrisma.media.create({
			data: {
				reason: data.reason,
				visibility: data.visibility,
				filename: data.filename,
				originalName: data.originalName,
				fileSize: data.fileSize,
				mimeType: data.mimeType,
				storagePath: data.storagePath,
				metadata: data.metadata,
				ownerId: data.ownerId
			},
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

		return media;
	} catch (error: any) {
		throw new Error(`Failed to create media record: ${error.message}`);
	}
};

// Get a media by ID with access control
export const getMediaById = async (id: string, requestingUserId?: string) => {
	if (!id) {
		throw new Error('Media ID is required');
	}

	try {
		const media = await defaultPrisma.media.findUnique({
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
			throw new Error('Media not found');
		}

		// Access control: Check if user can access this media
		if (media.visibility === MediaVisibility.PRIVATE && requestingUserId !== media.ownerId) {
			// Check if requesting user is admin
			const requestingUser = await defaultPrisma.user.findUnique({
				where: { id: requestingUserId },
				include: {
					role: {
						include: {
							permissions: {
								include: {
									permission: true
								}
							}
						}
					}
				}
			});

			const hasMediaManagePermission =
				requestingUser?.role?.permissions?.some(
					(rp) => rp.permission.resource === 'media' && rp.permission.action === 'manage'
				) || false;

			const hasAdminManagePermission =
				requestingUser?.role?.permissions?.some(
					(rp) => rp.permission.resource === 'admin' && rp.permission.action === 'manage'
				) || false;

			if (!hasMediaManagePermission && !hasAdminManagePermission) {
				throw new Error('Access denied: You do not have permission to access this media');
			}
		}

		return media;
	} catch (error: any) {
		if (error.message && error.message.includes('Access denied')) {
			throw error;
		}
		throw new Error(`Failed to get media: ${error.message}`);
	}
};

// Delete media file and database record
export const deleteMedia = async (id: string, requestingUserId?: string) => {
	// Validate media ID
	if (!id) {
		throw new Error('Media ID is required');
	}

	try {
		// Check if media exists
		const existingMedia = await defaultPrisma.media.findUnique({
			where: { id }
		});

		if (!existingMedia) {
			throw new Error('Media not found');
		}

		// Access control: Check if user can delete this media
		if (requestingUserId !== existingMedia.ownerId) {
			// Check if requesting user is admin
			const requestingUser = await defaultPrisma.user.findUnique({
				where: { id: requestingUserId },
				include: {
					role: {
						include: {
							permissions: {
								include: {
									permission: true
								}
							}
						}
					}
				}
			});

			const hasMediaManagePermission =
				requestingUser?.role?.permissions?.some(
					(rp) => rp.permission.resource === 'media' && rp.permission.action === 'manage'
				) || false;

			const hasAdminManagePermission =
				requestingUser?.role?.permissions?.some(
					(rp) => rp.permission.resource === 'admin' && rp.permission.action === 'manage'
				) || false;

			if (!hasMediaManagePermission && !hasAdminManagePermission) {
				throw new Error('Access denied: You do not have permission to delete this media');
			}
		}

		// Delete the file from storage
		const fullPath = path.join('static', existingMedia.storagePath);
		if (fs.existsSync(fullPath)) {
			fs.unlinkSync(fullPath);
		}

		// Delete the media record from database
		await defaultPrisma.media.delete({
			where: { id }
		});

		return { success: true };
	} catch (error: any) {
		if (error.message && error.message.includes('Access denied')) {
			throw error;
		}
		throw new Error(`Failed to delete media: ${error.message}`);
	}
};

// Get user's media with pagination
export const getMediaByUser = async (userId: string, limit: number = 10, offset: number = 0) => {
	if (!userId) {
		throw new Error('User ID is required');
	}

	try {
		// Check if user exists
		const user = await defaultPrisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Get media and total count in parallel
		const [media, totalCount] = await Promise.all([
			defaultPrisma.media.findMany({
				where: { ownerId: userId },
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
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: limit,
				skip: offset
			}),
			defaultPrisma.media.count({
				where: { ownerId: userId }
			})
		]);

		return {
			media,
			totalCount,
			hasNextPage: offset + media.length < totalCount,
			hasPreviousPage: offset > 0
		};
	} catch (error: any) {
		throw new Error(`Failed to get user media: ${error.message}`);
	}
};

// Get all media for admin users with filtering capabilities
export const getMediaForAdmin = async (
	filters?: MediaFilters,
	limit: number = 10,
	offset: number = 0
) => {
	try {
		const whereClause: Prisma.MediaWhereInput = {
			...(filters?.ownerId && { ownerId: filters.ownerId }),
			...(filters?.reason && { reason: filters.reason }),
			...(filters?.visibility && { visibility: filters.visibility })
		};

		// Get media and total count in parallel
		const [media, totalCount] = await Promise.all([
			defaultPrisma.media.findMany({
				where: whereClause,
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
					updatedAt: true,
					owner: {
						select: {
							id: true,
							username: true
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: limit,
				skip: offset
			}),
			defaultPrisma.media.count({
				where: whereClause
			})
		]);

		return {
			media,
			totalCount,
			hasNextPage: offset + media.length < totalCount,
			hasPreviousPage: offset > 0
		};
	} catch (error: any) {
		throw new Error(`Failed to get media for admin: ${error.message}`);
	}
};

// Get media statistics for admin dashboard
export const getMediaStatistics = async () => {
	try {
		// Execute all queries in parallel for better performance
		const [
			totalCount,
			totalFileSize,
			visibilityDistribution,
			reasonDistribution,
			fileTypeDistribution,
			topUsers
		] = await Promise.all([
			// Total media count
			defaultPrisma.media.count(),

			// Total file size
			defaultPrisma.media
				.aggregate({
					_sum: {
						fileSize: true
					}
				})
				.then((result) => result._sum.fileSize || 0),

			// Visibility distribution
			defaultPrisma.media.groupBy({
				by: ['visibility'],
				_count: {
					visibility: true
				}
			}),

			// Reason distribution
			defaultPrisma.media.groupBy({
				by: ['reason'],
				_count: {
					reason: true
				}
			}),

			// File type distribution (grouped by mimeType)
			defaultPrisma.media.groupBy({
				by: ['mimeType'],
				_count: {
					mimeType: true
				}
			}),

			// Top users by media count
			defaultPrisma.media
				.groupBy({
					by: ['ownerId'],
					_count: {
						ownerId: true
					},
					orderBy: {
						_count: {
							ownerId: 'desc'
						}
					},
					take: 10
				})
				.then(async (userGroups) => {
					// Get user details for the top users
					const userIds = userGroups.map((group) => group.ownerId);
					const users = await defaultPrisma.user.findMany({
						where: {
							id: {
								in: userIds
							}
						},
						select: {
							id: true,
							username: true
						}
					});

					// Map user details to the counts
					return userGroups.map((group) => {
						const user = users.find((u) => u.id === group.ownerId);
						return {
							userId: group.ownerId,
							username: user?.username || 'Unknown',
							count: group._count.ownerId
						};
					});
				})
		]);

		// Format the results
		return {
			totalCount,
			totalFileSize,
			visibilityDistribution: visibilityDistribution.reduce(
				(acc, item) => {
					acc[item.visibility] = item._count.visibility;
					return acc;
				},
				{} as Record<string, number>
			),
			reasonDistribution: reasonDistribution.reduce(
				(acc, item) => {
					acc[item.reason] = item._count.reason;
					return acc;
				},
				{} as Record<string, number>
			),
			fileTypeDistribution: fileTypeDistribution.reduce(
				(acc, item) => {
					acc[item.mimeType] = item._count.mimeType;
					return acc;
				},
				{} as Record<string, number>
			),
			topUsers
		};
	} catch (error: any) {
		throw new Error(`Failed to get media statistics: ${error.message}`);
	}
};

export default {
	saveMediaFile,
	createMediaRecord,
	getMediaById,
	deleteMedia,
	getMediaByUser,
	getMediaForAdmin,
	getMediaStatistics
};
