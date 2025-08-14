import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '$lib/prisma';
import { createPermissionMiddleware, isAuthenticated } from './middleware';
import { t } from './trpc';

// Input validation schemas
const paginationSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10)
});

// User schemas
const createUserSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	email: z.string().email().optional(),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	roleId: z.string().optional()
});

const updateUserSchema = z.object({
	id: z.string().cuid(),
	data: z.object({
		username: z.string().min(1, 'Username is required').optional(),
		email: z.string().email().optional().optional(),
		roleId: z.string().optional()
	})
});

const userIdSchema = z.object({
	id: z.string().cuid()
});

const userListSchema = paginationSchema.extend({
	search: z.string().optional()
});

// Password change schema
const changePasswordSchema = z.object({
	userId: z.string().cuid(),
	newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

// Own password change schema
const changeOwnPasswordSchema = z.object({
	currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
	newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

// Permission middleware for admin operations
const adminOnly = createPermissionMiddleware('user', 'manage');

// Protected procedures
const adminProcedure = t.procedure.use(adminOnly);
const protectedProcedure = t.procedure.use(isAuthenticated);

export const usersRouter = t.router({
	// User CRUD operations
	createUser: adminProcedure.input(createUserSchema).mutation(async ({ input }) => {
		try {
			// Check if user already exists
			const existingUser = await prisma.user.findUnique({
				where: {
					username: input.username
				}
			});

			if (existingUser) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'User with this username already exists'
				});
			}

			// Hash password
			const hashedPassword = await Bun.password.hash(input.password);

			// Get default role if not provided
			let roleId = input.roleId;
			if (!roleId) {
				const defaultRole = await prisma.role.findUnique({
					where: { name: 'user' }
				});
				roleId = defaultRole?.id;
			}

			// Create user
			const user = await prisma.user.create({
				data: {
					username: input.username,
					email: input.email,
					password: hashedPassword,
					roleId: roleId || ''
				},
				include: {
					role: {
						include: {
							permissions: {
								include: {
									permission: true
								}
							}
						}
					},
					permissions: {
						include: {
							permission: true
						}
					}
				}
			});

			return {
				id: user.id,
				username: user.username,
				email: user.email,
				roleId: user.roleId,
				role: user.role
					? {
							id: user.role.id,
							name: user.role.name,
							description: user.role.description,
							createdAt: user.role.createdAt,
							updatedAt: user.role.updatedAt,
							permissions: user.role.permissions.map((rp) => ({
								id: rp.id,
								permissionId: rp.permissionId,
								permission: rp.permission,
								createdAt: rp.createdAt
							}))
						}
					: null,
				permissions: user.permissions.map((up) => ({
					id: up.id,
					permissionId: up.permissionId,
					permission: up.permission,
					createdAt: up.createdAt
				})),
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to create user',
				cause: error
			});
		}
	}),

	getUserById: adminProcedure.input(userIdSchema).query(async ({ input }) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: input.id },
				include: {
					role: {
						include: {
							permissions: {
								include: {
									permission: true
								}
							}
						}
					},
					permissions: {
						include: {
							permission: true
						}
					}
				}
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			}

			return {
				id: user.id,
				username: user.username,
				email: user.email,
				roleId: user.roleId,
				role: user.role
					? {
							id: user.role.id,
							name: user.role.name,
							description: user.role.description,
							createdAt: user.role.createdAt,
							updatedAt: user.role.updatedAt,
							permissions: user.role.permissions.map((rp) => ({
								id: rp.id,
								permissionId: rp.permissionId,
								permission: rp.permission,
								createdAt: rp.createdAt
							}))
						}
					: null,
				permissions: user.permissions.map((up) => ({
					id: up.id,
					permissionId: up.permissionId,
					permission: up.permission,
					createdAt: up.createdAt
				})),
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch user',
				cause: error
			});
		}
	}),

	updateUser: adminProcedure.input(updateUserSchema).mutation(async ({ input }) => {
		try {
			// Check if user exists
			const existingUser = await prisma.user.findUnique({
				where: { id: input.id }
			});

			if (!existingUser) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			}

			// Check if username is being changed and if new username already exists
			if (input.data.username && input.data.username !== existingUser.username) {
				const userWithSameUsername = await prisma.user.findUnique({
					where: { username: input.data.username }
				});

				if (userWithSameUsername) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'User with this username already exists'
					});
				}
			}

			// Update user
			const user = await prisma.user.update({
				where: { id: input.id },
				data: {
					username: input.data.username,
					email: input.data.email,
					roleId: input.data.roleId
				},
				include: {
					role: {
						include: {
							permissions: {
								include: {
									permission: true
								}
							}
						}
					},
					permissions: {
						include: {
							permission: true
						}
					}
				}
			});

			return {
				id: user.id,
				username: user.username,
				email: user.email,
				roleId: user.roleId,
				role: user.role
					? {
							id: user.role.id,
							name: user.role.name,
							description: user.role.description,
							createdAt: user.role.createdAt,
							updatedAt: user.role.updatedAt,
							permissions: user.role.permissions.map((rp) => ({
								id: rp.id,
								permissionId: rp.permissionId,
								permission: rp.permission,
								createdAt: rp.createdAt
							}))
						}
					: null,
				permissions: user.permissions.map((up) => ({
					id: up.id,
					permissionId: up.permissionId,
					permission: up.permission,
					createdAt: up.createdAt
				})),
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to update user',
				cause: error
			});
		}
	}),

	changePassword: adminProcedure.input(changePasswordSchema).mutation(async ({ input }) => {
		try {
			// Check if user exists
			const existingUser = await prisma.user.findUnique({
				where: { id: input.userId }
			});

			if (!existingUser) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			}

			// Check if new password is the same as current password
			const isNewPasswordSame = await Bun.password.verify(input.newPassword, existingUser.password);

			if (isNewPasswordSame) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'New password cannot be the same as current password'
				});
			}

			// Hash new password
			const hashedNewPassword = await Bun.password.hash(input.newPassword);

			// Update user's password
			await prisma.user.update({
				where: { id: input.userId },
				data: { password: hashedNewPassword }
			});

			return { success: true, message: 'Password changed successfully' };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to change password',
				cause: error
			});
		}
	}),

	changeOwnPassword: protectedProcedure
		.input(changeOwnPasswordSchema)
		.mutation(
			async ({ input, ctx }: { input: z.infer<typeof changeOwnPasswordSchema>; ctx: any }) => {
				try {
					// Get the authenticated user
					const userId = ctx.user.id;

					// Check if user exists
					const existingUser = await prisma.user.findUnique({
						where: { id: userId }
					});

					if (!existingUser) {
						throw new TRPCError({
							code: 'NOT_FOUND',
							message: 'User not found'
						});
					}

					// Verify current password
					const isCurrentPasswordValid = await Bun.password.verify(
						input.currentPassword,
						existingUser.password
					);
					if (!isCurrentPasswordValid) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Current password is incorrect'
						});
					}

					// Check if new password is the same as current password
					const isNewPasswordSame = await Bun.password.verify(
						input.newPassword,
						existingUser.password
					);
					if (isNewPasswordSame) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'New password cannot be the same as current password'
						});
					}

					// Hash new password
					const hashedNewPassword = await Bun.password.hash(input.newPassword);

					// Update user's password
					await prisma.user.update({
						where: { id: userId },
						data: { password: hashedNewPassword }
					});

					return { success: true, message: 'Password changed successfully' };
				} catch (error) {
					if (error instanceof TRPCError) {
						throw error;
					}
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Failed to change password',
						cause: error
					});
				}
			}
		),

	deleteUser: adminProcedure.input(userIdSchema).mutation(async ({ input }) => {
		try {
			// Check if user exists
			const existingUser = await prisma.user.findUnique({
				where: { id: input.id }
			});

			if (!existingUser) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			}

			// Delete user (cascade will handle related records)
			await prisma.user.delete({
				where: { id: input.id }
			});

			return { success: true };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to delete user',
				cause: error
			});
		}
	}),

	listUsers: adminProcedure.input(userListSchema).query(async ({ input }) => {
		try {
			const { page, limit, search } = input;
			const skip = (page - 1) * limit;

			const where = search
				? {
						OR: [{ username: { contains: search } }, { email: { contains: search } }]
					}
				: {};

			const [users, total] = await Promise.all([
				prisma.user.findMany({
					where,
					skip,
					take: limit,
					orderBy: { createdAt: 'desc' },
					include: {
						role: {
							include: {
								permissions: {
									include: {
										permission: true
									}
								}
							}
						},
						permissions: {
							include: {
								permission: true
							}
						}
					}
				}),
				prisma.user.count({ where })
			]);

			return {
				users: users.map((user) => ({
					id: user.id,
					username: user.username,
					email: user.email,
					roleId: user.roleId,
					role: user.role
						? {
								id: user.role.id,
								name: user.role.name,
								description: user.role.description,
								createdAt: user.role.createdAt,
								updatedAt: user.role.updatedAt,
								permissions: user.role.permissions.map((rp) => ({
									id: rp.id,
									permissionId: rp.permissionId,
									permission: rp.permission,
									createdAt: rp.createdAt
								}))
							}
						: null,
					permissions: user.permissions.map((up) => ({
						id: up.id,
						permissionId: up.permissionId,
						permission: up.permission,
						createdAt: up.createdAt
					})),
					createdAt: user.createdAt,
					updatedAt: user.updatedAt
				})),
				pagination: {
					page,
					limit,
					total,
					hasNext: skip + limit < total,
					hasPrev: page > 1
				}
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch users',
				cause: error
			});
		}
	})
});
