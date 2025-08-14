import { Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';

// Create a type for our prisma client instance
type PrismaClientType = typeof defaultPrisma;

// Permission creation data type
type CreatePermissionInput = {
	name: string;
	description?: string;
	resource: string;
	action: string;
};

// Permission update data type
type UpdatePermissionInput = {
	name?: string;
	description?: string;
	resource?: string;
	action?: string;
};

// Create a new permission
export const createPermission = async (data: CreatePermissionInput) => {
	// Validate required fields
	if (!data.name || !data.resource || !data.action) {
		throw new Error('Permission name, resource, and action are required');
	}

	// Check if permission with this name already exists
	const existingPermission = await defaultPrisma.permission.findUnique({
		where: { name: data.name }
	});

	if (existingPermission) {
		throw new Error('Permission with this name already exists');
	}

	// Check if permission with this resource-action combination already exists
	const existingPermissionByResourceAction = await defaultPrisma.permission.findUnique({
		where: {
			resource_action: {
				resource: data.resource,
				action: data.action
			}
		}
	});

	if (existingPermissionByResourceAction) {
		throw new Error('Permission with this resource-action combination already exists');
	}

	// Create the permission
	const permission = await defaultPrisma.permission.create({
		data: {
			name: data.name,
			description: data.description,
			resource: data.resource,
			action: data.action
		},
		select: {
			id: true,
			name: true,
			description: true,
			resource: true,
			action: true,
			createdAt: true,
			updatedAt: true
		}
	});

	return permission;
};

// Get a permission by ID
export const getPermissionById = async (id: string) => {
	if (!id) {
		throw new Error('Permission ID is required');
	}

	const permission = await defaultPrisma.permission.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			description: true,
			resource: true,
			action: true,
			createdAt: true,
			updatedAt: true
		}
	});

	if (!permission) {
		throw new Error('Permission not found');
	}

	return permission;
};

// Get a permission by name
export const getPermissionByName = async (name: string) => {
	if (!name) {
		throw new Error('Permission name is required');
	}

	const permission = await defaultPrisma.permission.findUnique({
		where: { name },
		select: {
			id: true,
			name: true,
			description: true,
			resource: true,
			action: true,
			createdAt: true,
			updatedAt: true
		}
	});

	if (!permission) {
		throw new Error('Permission not found');
	}

	return permission;
};

// Get all permissions with pagination
export const getPermissions = async (
	filters?: {
		resource?: string;
		action?: string;
		name?: string;
	},
	limit: number = 10,
	offset: number = 0
) => {
	const whereClause = {
		...(filters?.resource && { resource: filters.resource }),
		...(filters?.action && { action: filters.action }),
		...(filters?.name && { name: { contains: filters.name } })
	};

	// Get permissions and total count in parallel
	const [permissions, totalCount] = await Promise.all([
		defaultPrisma.permission.findMany({
			where: whereClause,
			select: {
				id: true,
				name: true,
				description: true,
				resource: true,
				action: true,
				createdAt: true,
				updatedAt: true
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: limit,
			skip: offset
		}),
		defaultPrisma.permission.count({
			where: whereClause
		})
	]);

	return {
		permissions,
		totalCount,
		hasNextPage: offset + permissions.length < totalCount,
		hasPreviousPage: offset > 0
	};
};

// Update a permission
export const updatePermission = async (id: string, data: UpdatePermissionInput) => {
	// Validate permission ID
	if (!id) {
		throw new Error('Permission ID is required');
	}

	// Check if permission exists
	const existingPermission = await defaultPrisma.permission.findUnique({
		where: { id }
	});

	if (!existingPermission) {
		throw new Error('Permission not found');
	}

	// Check if name is being updated and already exists
	if (data.name && data.name !== existingPermission.name) {
		const existingPermissionWithName = await defaultPrisma.permission.findUnique({
			where: { name: data.name }
		});

		if (existingPermissionWithName) {
			throw new Error('Permission with this name already exists');
		}
	}

	// Check if resource-action combination is being updated and already exists
	if (
		(data.resource && data.resource !== existingPermission.resource) ||
		(data.action && data.action !== existingPermission.action)
	) {
		const resource = data.resource || existingPermission.resource;
		const action = data.action || existingPermission.action;

		// Don't check if we're not actually changing the combination
		if (resource !== existingPermission.resource || action !== existingPermission.action) {
			const existingPermissionByResourceAction = await defaultPrisma.permission.findUnique({
				where: {
					resource_action: {
						resource,
						action
					}
				}
			});

			if (existingPermissionByResourceAction) {
				throw new Error('Permission with this resource-action combination already exists');
			}
		}
	}

	// Update the permission
	const updatedPermission = await defaultPrisma.permission.update({
		where: { id },
		data: {
			...(data.name !== undefined && { name: data.name }),
			...(data.description !== undefined && { description: data.description }),
			...(data.resource !== undefined && { resource: data.resource }),
			...(data.action !== undefined && { action: data.action }),
			updatedAt: new Date()
		},
		select: {
			id: true,
			name: true,
			description: true,
			resource: true,
			action: true,
			createdAt: true,
			updatedAt: true
		}
	});

	return updatedPermission;
};

// Delete a permission
export const deletePermission = async (id: string) => {
	// Validate permission ID
	if (!id) {
		throw new Error('Permission ID is required');
	}

	// Check if permission exists
	const existingPermission = await defaultPrisma.permission.findUnique({
		where: { id }
	});

	if (!existingPermission) {
		throw new Error('Permission not found');
	}

	// Delete the permission (cascade delete will handle related role-permission and user-permission assignments)
	await defaultPrisma.permission.delete({
		where: { id }
	});

	return { success: true };
};

// Get roles that have this permission
export const getPermissionRoles = async (permissionId: string) => {
	if (!permissionId) {
		throw new Error('Permission ID is required');
	}

	// Check if permission exists
	const permission = await defaultPrisma.permission.findUnique({
		where: { id: permissionId }
	});

	if (!permission) {
		throw new Error('Permission not found');
	}

	// Get roles that have this permission
	const rolePermissions = await defaultPrisma.rolePermission.findMany({
		where: {
			permissionId
		},
		include: {
			role: true
		}
	});

	return rolePermissions.map((rp) => rp.role);
};

// Get users that have this permission (directly assigned, not through roles)
export const getPermissionUsers = async (permissionId: string) => {
	if (!permissionId) {
		throw new Error('Permission ID is required');
	}

	// Check if permission exists
	const permission = await defaultPrisma.permission.findUnique({
		where: { id: permissionId }
	});

	if (!permission) {
		throw new Error('Permission not found');
	}

	// Get users that have this permission directly assigned
	const userPermissions = await defaultPrisma.userPermission.findMany({
		where: {
			permissionId
		},
		include: {
			user: true
		}
	});

	return userPermissions.map((up) => up.user);
};

// Factory function to create a service with a custom prisma client instance
export const createPermissionService = (prisma: PrismaClientType) => {
	// Create a new permission
	const createPermission = async (data: CreatePermissionInput) => {
		// Validate required fields
		if (!data.name || !data.resource || !data.action) {
			throw new Error('Permission name, resource, and action are required');
		}

		// Check if permission with this name already exists
		const existingPermission = await prisma.permission.findUnique({
			where: { name: data.name }
		});

		if (existingPermission) {
			throw new Error('Permission with this name already exists');
		}

		// Check if permission with this resource-action combination already exists
		const existingPermissionByResourceAction = await prisma.permission.findUnique({
			where: {
				resource_action: {
					resource: data.resource,
					action: data.action
				}
			}
		});

		if (existingPermissionByResourceAction) {
			throw new Error('Permission with this resource-action combination already exists');
		}

		// Create the permission
		const permission = await prisma.permission.create({
			data: {
				name: data.name,
				description: data.description,
				resource: data.resource,
				action: data.action
			},
			select: {
				id: true,
				name: true,
				description: true,
				resource: true,
				action: true,
				createdAt: true,
				updatedAt: true
			}
		});

		return permission;
	};

	// Get a permission by ID
	const getPermissionById = async (id: string) => {
		if (!id) {
			throw new Error('Permission ID is required');
		}

		const permission = await prisma.permission.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				description: true,
				resource: true,
				action: true,
				createdAt: true,
				updatedAt: true
			}
		});

		if (!permission) {
			throw new Error('Permission not found');
		}

		return permission;
	};

	// Get a permission by name
	const getPermissionByName = async (name: string) => {
		if (!name) {
			throw new Error('Permission name is required');
		}

		const permission = await prisma.permission.findUnique({
			where: { name },
			select: {
				id: true,
				name: true,
				description: true,
				resource: true,
				action: true,
				createdAt: true,
				updatedAt: true
			}
		});

		if (!permission) {
			throw new Error('Permission not found');
		}

		return permission;
	};

	// Get all permissions with pagination
	const getPermissions = async (
		filters?: {
			resource?: string;
			action?: string;
			name?: string;
		},
		limit: number = 10,
		offset: number = 0
	) => {
		const whereClause = {
			...(filters?.resource && { resource: filters.resource }),
			...(filters?.action && { action: filters.action }),
			...(filters?.name && { name: { contains: filters.name } })
		};

		// Get permissions and total count in parallel
		const [permissions, totalCount] = await Promise.all([
			prisma.permission.findMany({
				where: whereClause,
				select: {
					id: true,
					name: true,
					description: true,
					resource: true,
					action: true,
					createdAt: true,
					updatedAt: true
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: limit,
				skip: offset
			}),
			prisma.permission.count({
				where: whereClause
			})
		]);

		return {
			permissions,
			totalCount,
			hasNextPage: offset + permissions.length < totalCount,
			hasPreviousPage: offset > 0
		};
	};

	// Update a permission
	const updatePermission = async (id: string, data: UpdatePermissionInput) => {
		// Validate permission ID
		if (!id) {
			throw new Error('Permission ID is required');
		}

		// Check if permission exists
		const existingPermission = await prisma.permission.findUnique({
			where: { id }
		});

		if (!existingPermission) {
			throw new Error('Permission not found');
		}

		// Check if name is being updated and already exists
		if (data.name && data.name !== existingPermission.name) {
			const existingPermissionWithName = await prisma.permission.findUnique({
				where: { name: data.name }
			});

			if (existingPermissionWithName) {
				throw new Error('Permission with this name already exists');
			}
		}

		// Check if resource-action combination is being updated and already exists
		if (
			(data.resource && data.resource !== existingPermission.resource) ||
			(data.action && data.action !== existingPermission.action)
		) {
			const resource = data.resource || existingPermission.resource;
			const action = data.action || existingPermission.action;

			// Don't check if we're not actually changing the combination
			if (resource !== existingPermission.resource || action !== existingPermission.action) {
				const existingPermissionByResourceAction = await prisma.permission.findUnique({
					where: {
						resource_action: {
							resource,
							action
						}
					}
				});

				if (existingPermissionByResourceAction) {
					throw new Error('Permission with this resource-action combination already exists');
				}
			}
		}

		// Update the permission
		const updatedPermission = await prisma.permission.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name }),
				...(data.description !== undefined && { description: data.description }),
				...(data.resource !== undefined && { resource: data.resource }),
				...(data.action !== undefined && { action: data.action }),
				updatedAt: new Date()
			},
			select: {
				id: true,
				name: true,
				description: true,
				resource: true,
				action: true,
				createdAt: true,
				updatedAt: true
			}
		});

		return updatedPermission;
	};

	// Delete a permission
	const deletePermission = async (id: string) => {
		// Validate permission ID
		if (!id) {
			throw new Error('Permission ID is required');
		}

		// Check if permission exists
		const existingPermission = await prisma.permission.findUnique({
			where: { id }
		});

		if (!existingPermission) {
			throw new Error('Permission not found');
		}

		// Delete the permission (cascade delete will handle related role-permission and user-permission assignments)
		await prisma.permission.delete({
			where: { id }
		});

		return { success: true };
	};

	// Get roles that have this permission
	const getPermissionRoles = async (permissionId: string) => {
		if (!permissionId) {
			throw new Error('Permission ID is required');
		}

		// Check if permission exists
		const permission = await prisma.permission.findUnique({
			where: { id: permissionId }
		});

		if (!permission) {
			throw new Error('Permission not found');
		}

		// Get roles that have this permission
		const rolePermissions = await prisma.rolePermission.findMany({
			where: {
				permissionId
			},
			include: {
				role: true
			}
		});

		return rolePermissions.map((rp) => rp.role);
	};

	// Get users that have this permission (directly assigned, not through roles)
	const getPermissionUsers = async (permissionId: string) => {
		if (!permissionId) {
			throw new Error('Permission ID is required');
		}

		// Check if permission exists
		const permission = await prisma.permission.findUnique({
			where: { id: permissionId }
		});

		if (!permission) {
			throw new Error('Permission not found');
		}

		// Get users that have this permission directly assigned
		const userPermissions = await prisma.userPermission.findMany({
			where: {
				permissionId
			},
			include: {
				user: true
			}
		});

		return userPermissions.map((up) => up.user);
	};

	return {
		createPermission,
		getPermissionById,
		getPermissionByName,
		getPermissions,
		updatePermission,
		deletePermission,
		getPermissionRoles,
		getPermissionUsers
	};
};

export default {
	createPermission,
	getPermissionById,
	getPermissionByName,
	getPermissions,
	updatePermission,
	deletePermission,
	getPermissionRoles,
	getPermissionUsers,
	createPermissionService
};
