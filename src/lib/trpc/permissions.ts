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

// Permission schemas
const createPermissionSchema = z.object({
	name: z.string().min(1, 'نام مجوز الزامی است'),
	description: z.string().optional(),
	resource: z.string().min(1, 'منبع الزامی است'),
	action: z.string().min(1, 'عملیات الزامی است')
});

const updatePermissionSchema = z.object({
	id: z.string().cuid(),
	data: z.object({
		name: z.string().min(1, 'نام مجوز الزامی است').optional(),
		description: z.string().optional(),
		resource: z.string().min(1, 'منبع الزامی است').optional(),
		action: z.string().min(1, 'عملیات الزامی است').optional()
	})
});

const permissionIdSchema = z.object({
	id: z.string().cuid()
});

const permissionListSchema = paginationSchema.extend({
	search: z.string().optional()
});

// RolePermission schemas
const assignPermissionToRoleSchema = z.object({
	roleId: z.string().cuid(),
	permissionId: z.string().cuid()
});

const unassignPermissionFromRoleSchema = z.object({
	roleId: z.string().cuid(),
	permissionId: z.string().cuid()
});

// UserPermission schemas
const assignPermissionToUserSchema = z.object({
	userId: z.string().cuid(),
	permissionId: z.string().cuid()
});

const unassignPermissionFromUserSchema = z.object({
	userId: z.string().cuid(),
	permissionId: z.string().cuid()
});

// Permission middleware for admin operations
const adminOnly = createPermissionMiddleware('user', 'manage');

// Protected procedures
const adminProcedure = t.procedure.use(adminOnly);

export const permissionsRouter = t.router({
	// Permission CRUD operations
	createPermission: adminProcedure.input(createPermissionSchema).mutation(async ({ input }) => {
		try {
			// Check if permission already exists
			const existingPermission = await prisma.permission.findUnique({
				where: {
					name: input.name
				}
			});

			if (existingPermission) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'مجوز با این نام قبلاً وجود دارد'
				});
			}

			// Check if resource-action combination already exists
			const existingResourceAction = await prisma.permission.findUnique({
				where: {
					resource_action: {
						resource: input.resource,
						action: input.action
					}
				}
			});

			if (existingResourceAction) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'مجوز با این ترکیب منبع و عملیات قبلاً وجود دارد'
				});
			}

			// Create permission
			const permission = await prisma.permission.create({
				data: {
					name: input.name,
					description: input.description,
					resource: input.resource,
					action: input.action
				}
			});

			return {
				id: permission.id,
				name: permission.name,
				description: permission.description,
				resource: permission.resource,
				action: permission.action,
				createdAt: permission.createdAt,
				updatedAt: permission.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'ایجاد مجوز با خطا مواجه شد',
				cause: error
			});
		}
	}),

	getPermissionById: adminProcedure.input(permissionIdSchema).query(async ({ input }) => {
		try {
			const permission = await prisma.permission.findUnique({
				where: { id: input.id }
			});

			if (!permission) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'مجوز یافت نشد'
				});
			}

			return {
				id: permission.id,
				name: permission.name,
				description: permission.description,
				resource: permission.resource,
				action: permission.action,
				createdAt: permission.createdAt,
				updatedAt: permission.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'دریافت مجوز با خطا مواجه شد',
				cause: error
			});
		}
	}),

	updatePermission: adminProcedure.input(updatePermissionSchema).mutation(async ({ input }) => {
		try {
			// Check if permission exists
			const existingPermission = await prisma.permission.findUnique({
				where: { id: input.id }
			});

			if (!existingPermission) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'مجوز یافت نشد'
				});
			}

			// Check if name is being changed and if new name already exists
			if (input.data.name && input.data.name !== existingPermission.name) {
				const permissionWithSameName = await prisma.permission.findUnique({
					where: { name: input.data.name }
				});

				if (permissionWithSameName) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'مجوز با این نام قبلاً وجود دارد'
					});
				}
			}

			// Check if resource-action combination is being changed and if it already exists
			if (
				(input.data.resource && input.data.resource !== existingPermission.resource) ||
				(input.data.action && input.data.action !== existingPermission.action)
			) {
				const resource = input.data.resource || existingPermission.resource;
				const action = input.data.action || existingPermission.action;

				const existingResourceAction = await prisma.permission.findUnique({
					where: {
						resource_action: {
							resource,
							action
						}
					}
				});

				if (existingResourceAction && existingResourceAction.id !== input.id) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'مجوز با این ترکیب منبع و عملیات قبلاً وجود دارد'
					});
				}
			}

			// Update permission
			const permission = await prisma.permission.update({
				where: { id: input.id },
				data: {
					name: input.data.name,
					description: input.data.description,
					resource: input.data.resource,
					action: input.data.action
				}
			});

			return {
				id: permission.id,
				name: permission.name,
				description: permission.description,
				resource: permission.resource,
				action: permission.action,
				createdAt: permission.createdAt,
				updatedAt: permission.updatedAt
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'بروزرسانی مجوز با خطا مواجه شد',
				cause: error
			});
		}
	}),

	deletePermission: adminProcedure.input(permissionIdSchema).mutation(async ({ input }) => {
		try {
			// Check if permission exists
			const existingPermission = await prisma.permission.findUnique({
				where: { id: input.id }
			});

			if (!existingPermission) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'مجوز یافت نشد'
				});
			}

			// Delete permission (cascade will handle related records)
			await prisma.permission.delete({
				where: { id: input.id }
			});

			return { success: true };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'حذف مجوز با خطا مواجه شد',
				cause: error
			});
		}
	}),

	listPermissions: adminProcedure.input(permissionListSchema).query(async ({ input }) => {
		try {
			const { page, limit, search } = input;
			const skip = (page - 1) * limit;

			const where = search
				? {
						OR: [
							{ name: { contains: search } },
							{ resource: { contains: search } },
							{ action: { contains: search } }
						]
					}
				: {};

			const [permissions, total] = await Promise.all([
				prisma.permission.findMany({
					where,
					skip,
					take: limit,
					orderBy: { createdAt: 'desc' }
				}),
				prisma.permission.count({ where })
			]);

			return {
				permissions: permissions.map((permission) => ({
					id: permission.id,
					name: permission.name,
					description: permission.description,
					resource: permission.resource,
					action: permission.action,
					createdAt: permission.createdAt,
					updatedAt: permission.updatedAt
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
				message: 'دریافت لیست مجوزها با خطا مواجه شد',
				cause: error
			});
		}
	}),

	// Permission assignment operations
	assignPermissionToRole: adminProcedure
		.input(assignPermissionToRoleSchema)
		.mutation(async ({ input }) => {
			try {
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

				// Check if permission exists
				const permission = await prisma.permission.findUnique({
					where: { id: input.permissionId }
				});

				if (!permission) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'مجوز یافت نشد'
					});
				}

				// Check if assignment already exists
				const existingAssignment = await prisma.rolePermission.findUnique({
					where: {
						roleId_permissionId: {
							roleId: input.roleId,
							permissionId: input.permissionId
						}
					}
				});

				if (existingAssignment) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'این مجوز قبلاً به این نقش اختصاص داده شده است'
					});
				}

				// Create assignment
				const assignment = await prisma.rolePermission.create({
					data: {
						roleId: input.roleId,
						permissionId: input.permissionId
					},
					include: {
						role: true,
						permission: true
					}
				});

				return {
					id: assignment.id,
					roleId: assignment.roleId,
					permissionId: assignment.permissionId,
					role: assignment.role,
					permission: assignment.permission,
					createdAt: assignment.createdAt
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'اختصاص مجوز به نقش با خطا مواجه شد',
					cause: error
				});
			}
		}),

	unassignPermissionFromRole: adminProcedure
		.input(unassignPermissionFromRoleSchema)
		.mutation(async ({ input }) => {
			try {
				// Check if assignment exists
				const existingAssignment = await prisma.rolePermission.findUnique({
					where: {
						roleId_permissionId: {
							roleId: input.roleId,
							permissionId: input.permissionId
						}
					}
				});

				if (!existingAssignment) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'اختصاص مجوز یافت نشد'
					});
				}

				// Delete assignment
				await prisma.rolePermission.delete({
					where: {
						roleId_permissionId: {
							roleId: input.roleId,
							permissionId: input.permissionId
						}
					}
				});

				return { success: true };
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'لغو اختصاص مجوز از نقش با خطا مواجه شد',
					cause: error
				});
			}
		}),

	assignPermissionToUser: adminProcedure
		.input(assignPermissionToUserSchema)
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

				// Check if permission exists
				const permission = await prisma.permission.findUnique({
					where: { id: input.permissionId }
				});

				if (!permission) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'مجوز یافت نشد'
					});
				}

				// Check if assignment already exists
				const existingAssignment = await prisma.userPermission.findUnique({
					where: {
						userId_permissionId: {
							userId: input.userId,
							permissionId: input.permissionId
						}
					}
				});

				if (existingAssignment) {
					throw new TRPCError({
						code: 'CONFLICT',
						message: 'این مجوز قبلاً به این کاربر اختصاص داده شده است'
					});
				}

				// Create assignment
				const assignment = await prisma.userPermission.create({
					data: {
						userId: input.userId,
						permissionId: input.permissionId
					},
					include: {
						user: true,
						permission: true
					}
				});

				return {
					id: assignment.id,
					userId: assignment.userId,
					permissionId: assignment.permissionId,
					user: {
						id: assignment.user.id,
						username: assignment.user.username,
						email: assignment.user.email
					},
					permission: assignment.permission,
					createdAt: assignment.createdAt
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'اختصاص مجوز به کاربر با خطا مواجه شد',
					cause: error
				});
			}
		}),

	unassignPermissionFromUser: adminProcedure
		.input(unassignPermissionFromUserSchema)
		.mutation(async ({ input }) => {
			try {
				// Check if assignment exists
				const existingAssignment = await prisma.userPermission.findUnique({
					where: {
						userId_permissionId: {
							userId: input.userId,
							permissionId: input.permissionId
						}
					}
				});

				if (!existingAssignment) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Permission assignment not found'
					});
				}

				// Delete assignment
				await prisma.userPermission.delete({
					where: {
						userId_permissionId: {
							userId: input.userId,
							permissionId: input.permissionId
						}
					}
				});

				return { success: true };
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'لغو اختصاص مجوز از کاربر با خطا مواجه شد',
					cause: error
				});
			}
		})
});
