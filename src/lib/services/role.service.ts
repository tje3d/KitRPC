import { Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';

// Create a type for our prisma client instance
type PrismaClientType = typeof defaultPrisma;

// Role creation data type
type CreateRoleInput = {
	name: string;
	description?: string;
};

// Role update data type
type UpdateRoleInput = {
	name?: string;
	description?: string;
};

// Create a new role
export const createRole = async (data: CreateRoleInput) => {
	// Validate required fields
	if (!data.name) {
		throw new Error('Role name is required');
	}

	// Check if role with this name already exists
	const existingRole = await defaultPrisma.role.findUnique({
		where: { name: data.name }
	});

	if (existingRole) {
		throw new Error('Role with this name already exists');
	}

	// Create the role
	const role = await defaultPrisma.role.create({
		data: {
			name: data.name,
			description: data.description
		},
		select: {
			id: true,
			name: true,
			description: true,
			createdAt: true,
			updatedAt: true
		}
	});

	return role;
};

// Get a role by ID
export const getRoleById = async (id: string) => {
	if (!id) {
		throw new Error('Role ID is required');
	}

	const role = await defaultPrisma.role.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			description: true,
			createdAt: true,
			updatedAt: true
		}
	});

	if (!role) {
		throw new Error('Role not found');
	}

	return role;
};

// Get a role by name
export const getRoleByName = async (name: string) => {
	if (!name) {
		throw new Error('Role name is required');
	}

	const role = await defaultPrisma.role.findUnique({
		where: { name },
		select: {
			id: true,
			name: true,
			description: true,
			createdAt: true,
			updatedAt: true
		}
	});

	if (!role) {
		throw new Error('Role not found');
	}

	return role;
};

// Get all roles with pagination
export const getRoles = async (
	filters?: {
		name?: string;
	},
	limit: number = 10,
	offset: number = 0
) => {
	const whereClause = {
		...(filters?.name && { name: { contains: filters.name } })
	};

	// Get roles and total count in parallel
	const [roles, totalCount] = await Promise.all([
		defaultPrisma.role.findMany({
			where: whereClause,
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: limit,
			skip: offset
		}),
		defaultPrisma.role.count({
			where: whereClause
		})
	]);

	return {
		roles,
		totalCount,
		hasNextPage: offset + roles.length < totalCount,
		hasPreviousPage: offset > 0
	};
};

// Update a role
export const updateRole = async (id: string, data: UpdateRoleInput) => {
	// Validate role ID
	if (!id) {
		throw new Error('Role ID is required');
	}

	// Check if role exists
	const existingRole = await defaultPrisma.role.findUnique({
		where: { id }
	});

	if (!existingRole) {
		throw new Error('Role not found');
	}

	// Check if name is being updated and already exists
	if (data.name && data.name !== existingRole.name) {
		const existingRoleWithName = await defaultPrisma.role.findUnique({
			where: { name: data.name }
		});

		if (existingRoleWithName) {
			throw new Error('Role with this name already exists');
		}
	}

	// Update the role
	const updatedRole = await defaultPrisma.role.update({
		where: { id },
		data: {
			...(data.name !== undefined && { name: data.name }),
			...(data.description !== undefined && { description: data.description }),
			updatedAt: new Date()
		},
		select: {
			id: true,
			name: true,
			description: true,
			createdAt: true,
			updatedAt: true
		}
	});

	return updatedRole;
};

// Delete a role
export const deleteRole = async (id: string) => {
	// Validate role ID
	if (!id) {
		throw new Error('Role ID is required');
	}

	// Check if role exists
	const existingRole = await defaultPrisma.role.findUnique({
		where: { id }
	});

	if (!existingRole) {
		throw new Error('Role not found');
	}

	// Check if role is assigned to any users
	const usersWithRole = await defaultPrisma.user.findFirst({
		where: { roleId: id }
	});

	if (usersWithRole) {
		throw new Error('Cannot delete role that is assigned to users');
	}

	// Delete the role (cascade delete will handle related role-permission assignments)
	await defaultPrisma.role.delete({
		where: { id }
	});

	return { success: true };
};

// Get role permissions
export const getRolePermissions = async (roleId: string) => {
	if (!roleId) {
		throw new Error('Role ID is required');
	}

	// Check if role exists
	const role = await defaultPrisma.role.findUnique({
		where: { id: roleId }
	});

	if (!role) {
		throw new Error('Role not found');
	}

	// Get role permissions
	const rolePermissions = await defaultPrisma.rolePermission.findMany({
		where: {
			roleId
		},
		include: {
			permission: true
		}
	});

	return rolePermissions.map((rp) => rp.permission);
};

// Assign a permission to a role
export const assignPermissionToRole = async (roleId: string, permissionId: string) => {
	if (!roleId || !permissionId) {
		throw new Error('Role ID and Permission ID are required');
	}

	// Check if role exists
	const role = await defaultPrisma.role.findUnique({
		where: { id: roleId }
	});

	if (!role) {
		throw new Error('Role not found');
	}

	// Check if permission exists
	const permission = await defaultPrisma.permission.findUnique({
		where: { id: permissionId }
	});

	if (!permission) {
		throw new Error('Permission not found');
	}

	// Check if the permission is already assigned to the role
	const existingRolePermission = await defaultPrisma.rolePermission.findUnique({
		where: {
			roleId_permissionId: {
				roleId,
				permissionId
			}
		}
	});

	if (existingRolePermission) {
		throw new Error('Permission is already assigned to this role');
	}

	// Assign the permission to the role
	const rolePermission = await defaultPrisma.rolePermission.create({
		data: {
			roleId,
			permissionId
		},
		include: {
			permission: true
		}
	});

	return rolePermission;
};

// Remove a permission from a role
export const removePermissionFromRole = async (roleId: string, permissionId: string) => {
	if (!roleId || !permissionId) {
		throw new Error('Role ID and Permission ID are required');
	}

	// Check if the permission is assigned to the role
	const existingRolePermission = await defaultPrisma.rolePermission.findUnique({
		where: {
			roleId_permissionId: {
				roleId,
				permissionId
			}
		}
	});

	if (!existingRolePermission) {
		throw new Error('Permission is not assigned to this role');
	}

	// Remove the permission from the role
	await defaultPrisma.rolePermission.delete({
		where: {
			roleId_permissionId: {
				roleId,
				permissionId
			}
		}
	});

	return { success: true };
};

// Factory function to create a service with a custom prisma client instance
export const createRoleService = (prisma: PrismaClientType) => {
	// Create a new role
	const createRole = async (data: CreateRoleInput) => {
		// Validate required fields
		if (!data.name) {
			throw new Error('Role name is required');
		}

		// Check if role with this name already exists
		const existingRole = await prisma.role.findUnique({
			where: { name: data.name }
		});

		if (existingRole) {
			throw new Error('Role with this name already exists');
		}

		// Create the role
		const role = await prisma.role.create({
			data: {
				name: data.name,
				description: data.description
			},
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true
			}
		});

		return role;
	};

	// Get a role by ID
	const getRoleById = async (id: string) => {
		if (!id) {
			throw new Error('Role ID is required');
		}

		const role = await prisma.role.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true
			}
		});

		if (!role) {
			throw new Error('Role not found');
		}

		return role;
	};

	// Get a role by name
	const getRoleByName = async (name: string) => {
		if (!name) {
			throw new Error('Role name is required');
		}

		const role = await prisma.role.findUnique({
			where: { name },
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true
			}
		});

		if (!role) {
			throw new Error('Role not found');
		}

		return role;
	};

	// Get all roles with pagination
	const getRoles = async (
		filters?: {
			name?: string;
		},
		limit: number = 10,
		offset: number = 0
	) => {
		const whereClause = {
			...(filters?.name && { name: { contains: filters.name } })
		};

		// Get roles and total count in parallel
		const [roles, totalCount] = await Promise.all([
			prisma.role.findMany({
				where: whereClause,
				select: {
					id: true,
					name: true,
					description: true,
					createdAt: true,
					updatedAt: true
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: limit,
				skip: offset
			}),
			prisma.role.count({
				where: whereClause
			})
		]);

		return {
			roles,
			totalCount,
			hasNextPage: offset + roles.length < totalCount,
			hasPreviousPage: offset > 0
		};
	};

	// Update a role
	const updateRole = async (id: string, data: UpdateRoleInput) => {
		// Validate role ID
		if (!id) {
			throw new Error('Role ID is required');
		}

		// Check if role exists
		const existingRole = await prisma.role.findUnique({
			where: { id }
		});

		if (!existingRole) {
			throw new Error('Role not found');
		}

		// Check if name is being updated and already exists
		if (data.name && data.name !== existingRole.name) {
			const existingRoleWithName = await prisma.role.findUnique({
				where: { name: data.name }
			});

			if (existingRoleWithName) {
				throw new Error('Role with this name already exists');
			}
		}

		// Update the role
		const updatedRole = await prisma.role.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name }),
				...(data.description !== undefined && { description: data.description }),
				updatedAt: new Date()
			},
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true
			}
		});

		return updatedRole;
	};

	// Delete a role
	const deleteRole = async (id: string) => {
		// Validate role ID
		if (!id) {
			throw new Error('Role ID is required');
		}

		// Check if role exists
		const existingRole = await prisma.role.findUnique({
			where: { id }
		});

		if (!existingRole) {
			throw new Error('Role not found');
		}

		// Check if role is assigned to any users
		const usersWithRole = await prisma.user.findFirst({
			where: { roleId: id }
		});

		if (usersWithRole) {
			throw new Error('Cannot delete role that is assigned to users');
		}

		// Delete the role (cascade delete will handle related role-permission assignments)
		await prisma.role.delete({
			where: { id }
		});

		return { success: true };
	};

	// Get role permissions
	const getRolePermissions = async (roleId: string) => {
		if (!roleId) {
			throw new Error('Role ID is required');
		}

		// Check if role exists
		const role = await prisma.role.findUnique({
			where: { id: roleId }
		});

		if (!role) {
			throw new Error('Role not found');
		}

		// Get role permissions
		const rolePermissions = await prisma.rolePermission.findMany({
			where: {
				roleId
			},
			include: {
				permission: true
			}
		});

		return rolePermissions.map((rp) => rp.permission);
	};

	// Assign a permission to a role
	const assignPermissionToRole = async (roleId: string, permissionId: string) => {
		if (!roleId || !permissionId) {
			throw new Error('Role ID and Permission ID are required');
		}

		// Check if role exists
		const role = await prisma.role.findUnique({
			where: { id: roleId }
		});

		if (!role) {
			throw new Error('Role not found');
		}

		// Check if permission exists
		const permission = await prisma.permission.findUnique({
			where: { id: permissionId }
		});

		if (!permission) {
			throw new Error('Permission not found');
		}

		// Check if the permission is already assigned to the role
		const existingRolePermission = await prisma.rolePermission.findUnique({
			where: {
				roleId_permissionId: {
					roleId,
					permissionId
				}
			}
		});

		if (existingRolePermission) {
			throw new Error('Permission is already assigned to this role');
		}

		// Assign the permission to the role
		const rolePermission = await prisma.rolePermission.create({
			data: {
				roleId,
				permissionId
			},
			include: {
				permission: true
			}
		});

		return rolePermission;
	};

	// Remove a permission from a role
	const removePermissionFromRole = async (roleId: string, permissionId: string) => {
		if (!roleId || !permissionId) {
			throw new Error('Role ID and Permission ID are required');
		}

		// Check if the permission is assigned to the role
		const existingRolePermission = await prisma.rolePermission.findUnique({
			where: {
				roleId_permissionId: {
					roleId,
					permissionId
				}
			}
		});

		if (!existingRolePermission) {
			throw new Error('Permission is not assigned to this role');
		}

		// Remove the permission from the role
		await prisma.rolePermission.delete({
			where: {
				roleId_permissionId: {
					roleId,
					permissionId
				}
			}
		});

		return { success: true };
	};

	return {
		createRole,
		getRoleById,
		getRoleByName,
		getRoles,
		updateRole,
		deleteRole,
		getRolePermissions,
		assignPermissionToRole,
		removePermissionFromRole
	};
};

export default {
	createRole,
	getRoleById,
	getRoleByName,
	getRoles,
	updateRole,
	deleteRole,
	getRolePermissions,
	assignPermissionToRole,
	removePermissionFromRole,
	createRoleService
};
