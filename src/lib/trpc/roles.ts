import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '$lib/prisma';
import { createPermissionMiddleware } from './middleware';
import { t } from './trpc';

// Input validation schemas
const paginationSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10)
});

// Role schemas
const createRoleSchema = z.object({
	name: z.string().min(1, 'نام نقش الزامی است'),
	description: z.string().optional()
});

const updateRoleSchema = z.object({
	id: z.string().cuid(),
	data: z.object({
		name: z.string().min(1, 'نام نقش الزامی است').optional(),
		description: z.string().optional()
	})
});

const roleIdSchema = z.object({
	id: z.string().cuid()
});

const roleListSchema = paginationSchema.extend({
	search: z.string().optional()
});

// UserRole schemas
const assignRoleToUserSchema = z.object({
	userId: z.string().cuid(),
	roleId: z.string().cuid()
});

const unassignRoleFromUserSchema = z.object({
	userId: z.string().cuid(),
	roleId: z.string().cuid()
});

// Permission middleware for admin operations
const adminOnly = createPermissionMiddleware('user', 'manage');

// Protected procedures
const adminProcedure = t.procedure.use(adminOnly);

export const rolesRouter = t.router({
	// Role CRUD operations
	createRole: adminProcedure.input(createRoleSchema).mutation(async ({ input }) => {
		try {
			// Check if role already exists
			const existingRole = await prisma.role.findUnique({
				where: {
					name: input.name
				}
			});

			if (existingRole) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'نقش با این نام قبلاً وجود دارد'
				});
			}

			// Create role
			const role = await prisma.role.create({
				data: {
					name: input.name,
					description: input.description
				},
				include: {
					permissions: {
						include: {
							permission: true
						}
					}
				}
			});

			return {
				id: role.id,
				name: role.name,
				description: role.description,
				permissions: role.permissions.map((rp) => ({
					id: rp.id,
					permissionId: rp.permissionId,
					permission: rp.permission,
					createdAt: rp.createdAt
				})),
				createdAt: role.createdAt,
				updatedAt: role.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'ایجاد نقش با خطا مواجه شد',
				cause: error
			});
		}
	}),

	getRoleById: adminProcedure.input(roleIdSchema).query(async ({ input }) => {
		try {
			const role = await prisma.role.findUnique({
				where: { id: input.id },
				include: {
					permissions: {
						include: {
							permission: true
						}
					}
				}
			});

			if (!role) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'نقش یافت نشد'
				});
			}

			return {
				id: role.id,
				name: role.name,
				description: role.description,
				permissions: role.permissions.map((rp) => ({
					id: rp.id,
					permissionId: rp.permissionId,
					permission: rp.permission,
					createdAt: rp.createdAt
				})),
				createdAt: role.createdAt,
				updatedAt: role.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'دریافت نقش با خطا مواجه شد',
				cause: error
			});
		}
	}),

	updateRole: adminProcedure.input(updateRoleSchema).mutation(async ({ input }) => {
		try {
			// Check if role exists
			const existingRole = await prisma.role.findUnique({
				where: { id: input.id }
			});

			if (!existingRole) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'نقش یافت نشد'
				});
			}

			// Check if name is being changed and if new name already exists
			if (input.data.name && input.data.name !== existingRole.name) {
				const roleWithSameName = await prisma.role.findUnique({
					where: { name: input.data.name }
				});

				if (roleWithSameName) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'نقش با این نام قبلاً وجود دارد'
					});
				}
			}

			// Update role
			const role = await prisma.role.update({
				where: { id: input.id },
				data: {
					name: input.data.name,
					description: input.data.description
				},
				include: {
					permissions: {
						include: {
							permission: true
						}
					}
				}
			});

			return {
				id: role.id,
				name: role.name,
				description: role.description,
				permissions: role.permissions.map((rp) => ({
					id: rp.id,
					permissionId: rp.permissionId,
					permission: rp.permission,
					createdAt: rp.createdAt
				})),
				createdAt: role.createdAt,
				updatedAt: role.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'بروزرسانی نقش با خطا مواجه شد',
				cause: error
			});
		}
	}),

	deleteRole: adminProcedure.input(roleIdSchema).mutation(async ({ input }) => {
		try {
			// Check if role exists
			const existingRole = await prisma.role.findUnique({
				where: { id: input.id }
			});

			if (!existingRole) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'نقش یافت نشد'
				});
			}

			// Prevent deletion of default roles
			if (existingRole.name === 'user' || existingRole.name === 'admin') {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'امکان حذف نقش‌های پیش‌فرض وجود ندارد'
				});
			}

			// Delete role (cascade will handle related records)
			await prisma.role.delete({
				where: { id: input.id }
			});

			return { success: true };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'حذف نقش با خطا مواجه شد',
				cause: error
			});
		}
	}),

	listRoles: adminProcedure.input(roleListSchema).query(async ({ input }) => {
		try {
			const { page, limit, search } = input;
			const skip = (page - 1) * limit;

			const where = search
				? {
						name: { contains: search }
					}
				: {};

			const [roles, total] = await Promise.all([
				prisma.role.findMany({
					where,
					skip,
					take: limit,
					orderBy: { createdAt: 'desc' },
					include: {
						permissions: {
							include: {
								permission: true
							}
						}
					}
				}),
				prisma.role.count({ where })
			]);

			return {
				roles: roles.map((role) => ({
					id: role.id,
					name: role.name,
					description: role.description,
					permissions: role.permissions.map((rp) => ({
						id: rp.id,
						permissionId: rp.permissionId,
						permission: rp.permission,
						createdAt: rp.createdAt
					})),
					createdAt: role.createdAt,
					updatedAt: role.updatedAt
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
				message: 'دریافت لیست نقش‌ها با خطا مواجه شد',
				cause: error
			});
		}
	}),

	// Role assignment operations
	assignRoleToUser: adminProcedure.input(assignRoleToUserSchema).mutation(async ({ input }) => {
		try {
			// Check if user exists
			const user = await prisma.user.findUnique({
				where: { id: input.userId }
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'کاربر یافت نشد'
				});
			}

			// Check if role exists
			const role = await prisma.role.findUnique({
				where: { id: input.roleId }
			});

			if (!role) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'نقش یافت نشد'
				});
			}

			// Update user's role
			const updatedUser = await prisma.user.update({
				where: { id: input.userId },
				data: { roleId: input.roleId },
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
				id: updatedUser.id,
				username: updatedUser.username,
				email: updatedUser.email,
				roleId: updatedUser.roleId,
				role: updatedUser.role
					? {
							id: updatedUser.role.id,
							name: updatedUser.role.name,
							description: updatedUser.role.description,
							createdAt: updatedUser.role.createdAt,
							updatedAt: updatedUser.role.updatedAt,
							permissions: updatedUser.role.permissions.map((rp) => ({
								id: rp.id,
								permissionId: rp.permissionId,
								permission: rp.permission,
								createdAt: rp.createdAt
							}))
						}
					: null,
				permissions: updatedUser.permissions.map((up) => ({
					id: up.id,
					permissionId: up.permissionId,
					permission: up.permission,
					createdAt: up.createdAt
				})),
				createdAt: updatedUser.createdAt,
				updatedAt: updatedUser.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'اختصاص نقش به کاربر با خطا مواجه شد',
				cause: error
			});
		}
	}),

	unassignRoleFromUser: adminProcedure
		.input(unassignRoleFromUserSchema)
		.mutation(async ({ input }) => {
			try {
				// Check if user exists
			const user = await prisma.user.findUnique({
				where: { id: input.userId }
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'کاربر یافت نشد'
				});
			}

			// Check if user has the role
			if (user.roleId !== input.roleId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'کاربر این نقش را ندارد'
				});
			}

			// Get default role
			const defaultRole = await prisma.role.findUnique({
				where: { name: 'user' }
			});

			if (!defaultRole) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'نقش پیش‌فرض یافت نشد'
				});
			}

				// Update user's role to default
				const updatedUser = await prisma.user.update({
					where: { id: input.userId },
					data: { roleId: defaultRole.id },
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
					id: updatedUser.id,
					username: updatedUser.username,
					email: updatedUser.email,
					roleId: updatedUser.roleId,
					role: updatedUser.role
						? {
								id: updatedUser.role.id,
								name: updatedUser.role.name,
								description: updatedUser.role.description,
								createdAt: updatedUser.role.createdAt,
								updatedAt: updatedUser.role.updatedAt,
								permissions: updatedUser.role.permissions.map((rp) => ({
									id: rp.id,
									permissionId: rp.permissionId,
									permission: rp.permission,
									createdAt: rp.createdAt
								}))
							}
						: null,
					permissions: updatedUser.permissions.map((up) => ({
						id: up.id,
						permissionId: up.permissionId,
						permission: up.permission,
						createdAt: up.createdAt
					})),
					createdAt: updatedUser.createdAt,
					updatedAt: updatedUser.updatedAt
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'لغو اختصاص نقش از کاربر با خطا مواجه شد',
					cause: error
				});
			}
		})
});
