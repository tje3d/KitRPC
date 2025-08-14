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
	name: z.string().min(1, 'Permission name is required'),
	description: z.string().optional(),
	resource: z.string().min(1, 'Resource is required'),
	action: z.string().min(1, 'Action is required')
});

const updatePermissionSchema = z.object({
	id: z.string().cuid(),
	data: z.object({
		name: z.string().min(1, 'Permission name is required').optional(),
		description: z.string().optional(),
		resource: z.string().min(1, 'Resource is required').optional(),
		action: z.string().min(1, 'Action is required').optional()
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
					message: 'Permission with this name already exists'
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
					message: 'Permission with this resource-action combination already exists'
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
				message: 'Failed to create permission',
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
					message: 'Permission not found'
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
				message: 'Failed to fetch permission',
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
					message: 'Permission not found'
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
						message: 'Permission with this name already exists'
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
						message: 'Permission with this resource-action combination already exists'
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
				message: 'Failed to update permission',
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
					message: 'Permission not found'
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
				message: 'Failed to delete permission',
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
				message: 'Failed to fetch permissions',
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
						message: 'Role not found'
					});
				}

				// Check if permission exists
				const permission = await prisma.permission.findUnique({
					where: { id: input.permissionId }
				});

				if (!permission) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Permission not found'
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
						message: 'Permission is already assigned to this role'
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
					message: 'Failed to assign permission to role',
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
						message: 'Permission assignment not found'
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
					message: 'Failed to unassign permission from role',
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
						message: 'User not found'
					});
				}

				// Check if permission exists
				const permission = await prisma.permission.findUnique({
					where: { id: input.permissionId }
				});

				if (!permission) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Permission not found'
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
						message: 'Permission is already assigned to this user'
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
					message: 'Failed to assign permission to user',
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
					message: 'Failed to unassign permission from user',
					cause: error
				});
			}
		})
});
