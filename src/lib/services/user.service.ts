import { Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';

// Create a type for our prisma client instance
type PrismaClientType = typeof defaultPrisma;

// User creation data type
type CreateUserInput = {
	username: string;
	email?: string;
	password: string;
	roleId: string;
};

// User update data type
type UpdateUserInput = {
	username?: string;
	email?: string;
	password?: string;
	roleId?: string;
	balanceIRT?: number;
	balanceUSDT?: number;
};

// Create a new user
export const createUser = async (data: CreateUserInput) => {
	// Validate required fields
	if (!data.username || !data.password || !data.roleId) {
		throw new Error('Username, password, and roleId are required');
	}

	// Check if username already exists
	const existingUser = await defaultPrisma.user.findUnique({
		where: { username: data.username }
	});

	if (existingUser) {
		throw new Error('User with this username already exists');
	}

	// Check if email is provided and already exists
	if (data.email) {
		const existingUserWithEmail = await defaultPrisma.user.findFirst({
			where: { email: data.email }
		});

		if (existingUserWithEmail) {
			throw new Error('User with this email already exists');
		}
	}

	// Check if role exists
	const role = await defaultPrisma.role.findUnique({
		where: { id: data.roleId }
	});

	if (!role) {
		throw new Error('Role not found');
	}

	// Create the user
	const user = await defaultPrisma.user.create({
		data: {
			username: data.username,
			email: data.email,
			password: data.password,
			roleId: data.roleId
		},
		select: {
			id: true,
			username: true,
			email: true,
			roleId: true,
			createdAt: true,
			updatedAt: true
		}
	});

	return user;
};

// Get a user by ID
export const getUserById = async (id: string) => {
	if (!id) {
		throw new Error('User ID is required');
	}

	const user = await defaultPrisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			username: true,
			email: true,
			roleId: true,
			balanceIRT: true,
			balanceUSDT: true,
			createdAt: true,
			updatedAt: true,
			role: {
				select: {
					id: true,
					name: true,
					description: true
				}
			}
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	return user;
};

// Get a user by username
export const getUserByUsername = async (username: string) => {
	if (!username) {
		throw new Error('Username is required');
	}

	const user = await defaultPrisma.user.findUnique({
		where: { username },
		select: {
			id: true,
			username: true,
			email: true,
			password: true,
			roleId: true,
			balanceIRT: true,
			balanceUSDT: true,
			createdAt: true,
			updatedAt: true,
			role: {
				select: {
					id: true,
					name: true,
					description: true
				}
			}
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	return user;
};

// Get all users with pagination
export const getUsers = async (
	filters?: {
		roleId?: string;
		username?: string;
	},
	limit: number = 10,
	offset: number = 0
) => {
	const whereClause = {
		...(filters?.roleId && { roleId: filters.roleId }),
		...(filters?.username && { username: { contains: filters.username } })
	};

	// Get users and total count in parallel
	const [users, totalCount] = await Promise.all([
		defaultPrisma.user.findMany({
			where: whereClause,
			select: {
				id: true,
				username: true,
				email: true,
				roleId: true,
				balanceIRT: true,
				balanceUSDT: true,
				createdAt: true,
				updatedAt: true,
				role: {
					select: {
						id: true,
						name: true,
						description: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: limit,
			skip: offset
		}),
		defaultPrisma.user.count({
			where: whereClause
		})
	]);

	return {
		users,
		totalCount,
		hasNextPage: offset + users.length < totalCount,
		hasPreviousPage: offset > 0
	};
};

// Update a user
export const updateUser = async (id: string, data: UpdateUserInput) => {
	// Validate user ID
	if (!id) {
		throw new Error('User ID is required');
	}

	// Check if user exists
	const existingUser = await defaultPrisma.user.findUnique({
		where: { id }
	});

	if (!existingUser) {
		throw new Error('User not found');
	}

	// Check if username is being updated and already exists
	if (data.username && data.username !== existingUser.username) {
		const existingUserWithUsername = await defaultPrisma.user.findUnique({
			where: { username: data.username }
		});

		if (existingUserWithUsername) {
			throw new Error('User with this username already exists');
		}
	}

	// Check if email is being updated and already exists
	if (data.email && data.email !== existingUser.email) {
		const existingUserWithEmail = await defaultPrisma.user.findFirst({
			where: { email: data.email }
		});

		if (existingUserWithEmail) {
			throw new Error('User with this email already exists');
		}
	}

	// Check if role exists if roleId is being updated
	if (data.roleId && data.roleId !== existingUser.roleId) {
		const role = await defaultPrisma.role.findUnique({
			where: { id: data.roleId }
		});

		if (!role) {
			throw new Error('Role not found');
		}
	}

	// Update the user
	const updatedUser = await defaultPrisma.user.update({
		where: { id },
		data: {
			...(data.username !== undefined && { username: data.username }),
			...(data.email !== undefined && { email: data.email }),
			...(data.password !== undefined && { password: data.password }),
			...(data.roleId !== undefined && { roleId: data.roleId }),
			...(data.balanceIRT !== undefined && { balanceIRT: data.balanceIRT }),
			...(data.balanceUSDT !== undefined && { balanceUSDT: data.balanceUSDT }),
			updatedAt: new Date()
		},
		select: {
			id: true,
			username: true,
			email: true,
			roleId: true,
			balanceIRT: true,
			balanceUSDT: true,
			createdAt: true,
			updatedAt: true,
			role: {
				select: {
					id: true,
					name: true,
					description: true
				}
			}
		}
	});

	return updatedUser;
};

// Delete a user
export const deleteUser = async (id: string) => {
	// Validate user ID
	if (!id) {
		throw new Error('User ID is required');
	}

	// Check if user exists
	const existingUser = await defaultPrisma.user.findUnique({
		where: { id }
	});

	if (!existingUser) {
		throw new Error('User not found');
	}

	// Delete the user (cascade delete will handle related records)
	await defaultPrisma.user.delete({
		where: { id }
	});

	return { success: true };
};

// Get user permissions (from both role and user-specific permissions)
export const getUserPermissions = async (userId: string) => {
	if (!userId) {
		throw new Error('User ID is required');
	}

	// Check if user exists
	const user = await defaultPrisma.user.findUnique({
		where: { id: userId }
	});

	if (!user) {
		throw new Error('User not found');
	}

	// Get role permissions
	const rolePermissions = await defaultPrisma.rolePermission.findMany({
		where: {
			roleId: user.roleId
		},
		include: {
			permission: true
		}
	});

	// Get user-specific permissions
	const userPermissions = await defaultPrisma.userPermission.findMany({
		where: {
			userId
		},
		include: {
			permission: true
		}
	});

	// Combine permissions, with user-specific permissions taking precedence
	const allPermissions = [...rolePermissions, ...userPermissions].map((rp) => rp.permission);

	// Remove duplicates by permission ID
	const uniquePermissions = allPermissions.filter(
		(permission, index, self) => index === self.findIndex((p) => p.id === permission.id)
	);

	return uniquePermissions;
};

// Assign a role to a user
export const assignRoleToUser = async (userId: string, roleId: string) => {
	if (!userId || !roleId) {
		throw new Error('User ID and Role ID are required');
	}

	// Check if user exists
	const user = await defaultPrisma.user.findUnique({
		where: { id: userId }
	});

	if (!user) {
		throw new Error('User not found');
	}

	// Check if role exists
	const role = await defaultPrisma.role.findUnique({
		where: { id: roleId }
	});

	if (!role) {
		throw new Error('Role not found');
	}

	// Update user's role
	const updatedUser = await defaultPrisma.user.update({
		where: { id: userId },
		data: {
			roleId
		},
		select: {
			id: true,
			username: true,
			email: true,
			roleId: true,
			createdAt: true,
			updatedAt: true,
			role: {
				select: {
					id: true,
					name: true,
					description: true
				}
			}
		}
	});

	return updatedUser;
};

// Assign a specific permission to a user
export const assignPermissionToUser = async (userId: string, permissionId: string) => {
	if (!userId || !permissionId) {
		throw new Error('User ID and Permission ID are required');
	}

	// Check if user exists
	const user = await defaultPrisma.user.findUnique({
		where: { id: userId }
	});

	if (!user) {
		throw new Error('User not found');
	}

	// Check if permission exists
	const permission = await defaultPrisma.permission.findUnique({
		where: { id: permissionId }
	});

	if (!permission) {
		throw new Error('Permission not found');
	}

	// Check if the permission is already assigned to the user
	const existingUserPermission = await defaultPrisma.userPermission.findUnique({
		where: {
			userId_permissionId: {
				userId,
				permissionId
			}
		}
	});

	if (existingUserPermission) {
		throw new Error('Permission is already assigned to this user');
	}

	// Assign the permission to the user
	const userPermission = await defaultPrisma.userPermission.create({
		data: {
			userId,
			permissionId
		},
		include: {
			permission: true
		}
	});

	return userPermission;
};

// Remove a specific permission from a user
export const removePermissionFromUser = async (userId: string, permissionId: string) => {
	if (!userId || !permissionId) {
		throw new Error('User ID and Permission ID are required');
	}

	// Check if the permission is assigned to the user
	const existingUserPermission = await defaultPrisma.userPermission.findUnique({
		where: {
			userId_permissionId: {
				userId,
				permissionId
			}
		}
	});

	if (!existingUserPermission) {
		throw new Error('Permission is not assigned to this user');
	}

	// Remove the permission from the user
	await defaultPrisma.userPermission.delete({
		where: {
			userId_permissionId: {
				userId,
				permissionId
			}
		}
	});

	return { success: true };
};

// Factory function to create a service with a custom prisma client instance
export const createUserService = (prisma: PrismaClientType) => {
	// Create a new user
	const createUser = async (data: CreateUserInput) => {
		// Validate required fields
		if (!data.username || !data.password || !data.roleId) {
			throw new Error('Username, password, and roleId are required');
		}

		// Check if username already exists
		const existingUser = await prisma.user.findUnique({
			where: { username: data.username }
		});

		if (existingUser) {
			throw new Error('User with this username already exists');
		}

		// Check if email is provided and already exists
		if (data.email) {
			const existingUserWithEmail = await prisma.user.findFirst({
				where: { email: data.email }
			});

			if (existingUserWithEmail) {
				throw new Error('User with this email already exists');
			}
		}

		// Check if role exists
		const role = await prisma.role.findUnique({
			where: { id: data.roleId }
		});

		if (!role) {
			throw new Error('Role not found');
		}

		// Create the user
		const user = await prisma.user.create({
			data: {
				username: data.username,
				email: data.email,
				password: data.password,
				roleId: data.roleId
			},
			select: {
				id: true,
				username: true,
				email: true,
				roleId: true,
				createdAt: true,
				updatedAt: true
			}
		});

		return user;
	};

	// Get a user by ID
	const getUserById = async (id: string) => {
		if (!id) {
			throw new Error('User ID is required');
		}

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				username: true,
				email: true,
				roleId: true,
				balanceIRT: true,
				balanceUSDT: true,
				createdAt: true,
				updatedAt: true,
				role: {
					select: {
						id: true,
						name: true,
						description: true
					}
				}
			}
		});

		if (!user) {
			throw new Error('User not found');
		}

		return user;
	};

	// Get a user by username
	const getUserByUsername = async (username: string) => {
		if (!username) {
			throw new Error('Username is required');
		}

		const user = await prisma.user.findUnique({
			where: { username },
			select: {
				id: true,
				username: true,
				email: true,
				password: true,
				roleId: true,
				balanceIRT: true,
				balanceUSDT: true,
				createdAt: true,
				updatedAt: true,
				role: {
					select: {
						id: true,
						name: true,
						description: true
					}
				}
			}
		});

		if (!user) {
			throw new Error('User not found');
		}

		return user;
	};

	// Get all users with pagination
	const getUsers = async (
		filters?: {
			roleId?: string;
			username?: string;
		},
		limit: number = 10,
		offset: number = 0
	) => {
		const whereClause = {
			...(filters?.roleId && { roleId: filters.roleId }),
			...(filters?.username && { username: { contains: filters.username } })
		};

		// Get users and total count in parallel
		const [users, totalCount] = await Promise.all([
			prisma.user.findMany({
				where: whereClause,
				select: {
					id: true,
					username: true,
					email: true,
					roleId: true,
					balanceIRT: true,
					balanceUSDT: true,
					createdAt: true,
					updatedAt: true,
					role: {
						select: {
							id: true,
							name: true,
							description: true
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				},
				take: limit,
				skip: offset
			}),
			prisma.user.count({
				where: whereClause
			})
		]);

		return {
			users,
			totalCount,
			hasNextPage: offset + users.length < totalCount,
			hasPreviousPage: offset > 0
		};
	};

	// Update a user
	const updateUser = async (id: string, data: UpdateUserInput) => {
		// Validate user ID
		if (!id) {
			throw new Error('User ID is required');
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id }
		});

		if (!existingUser) {
			throw new Error('User not found');
		}

		// Check if username is being updated and already exists
		if (data.username && data.username !== existingUser.username) {
			const existingUserWithUsername = await prisma.user.findUnique({
				where: { username: data.username }
			});

			if (existingUserWithUsername) {
				throw new Error('User with this username already exists');
			}
		}

		// Check if email is being updated and already exists
		if (data.email && data.email !== existingUser.email) {
			const existingUserWithEmail = await prisma.user.findFirst({
				where: { email: data.email }
			});

			if (existingUserWithEmail) {
				throw new Error('User with this email already exists');
			}
		}

		// Check if role exists if roleId is being updated
		if (data.roleId && data.roleId !== existingUser.roleId) {
			const role = await prisma.role.findUnique({
				where: { id: data.roleId }
			});

			if (!role) {
				throw new Error('Role not found');
			}
		}

		// Update the user
		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				...(data.username !== undefined && { username: data.username }),
				...(data.email !== undefined && { email: data.email }),
				...(data.password !== undefined && { password: data.password }),
				...(data.roleId !== undefined && { roleId: data.roleId }),
				...(data.balanceIRT !== undefined && { balanceIRT: data.balanceIRT }),
				...(data.balanceUSDT !== undefined && { balanceUSDT: data.balanceUSDT }),
				updatedAt: new Date()
			},
			select: {
				id: true,
				username: true,
				email: true,
				roleId: true,
				balanceIRT: true,
				balanceUSDT: true,
				createdAt: true,
				updatedAt: true,
				role: {
					select: {
						id: true,
						name: true,
						description: true
					}
				}
			}
		});

		return updatedUser;
	};

	// Delete a user
	const deleteUser = async (id: string) => {
		// Validate user ID
		if (!id) {
			throw new Error('User ID is required');
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id }
		});

		if (!existingUser) {
			throw new Error('User not found');
		}

		// Delete the user (cascade delete will handle related records)
		await prisma.user.delete({
			where: { id }
		});

		return { success: true };
	};

	// Get user permissions (from both role and user-specific permissions)
	const getUserPermissions = async (userId: string) => {
		if (!userId) {
			throw new Error('User ID is required');
		}

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Get role permissions
		const rolePermissions = await prisma.rolePermission.findMany({
			where: {
				roleId: user.roleId
			},
			include: {
				permission: true
			}
		});

		// Get user-specific permissions
		const userPermissions = await prisma.userPermission.findMany({
			where: {
				userId
			},
			include: {
				permission: true
			}
		});

		// Combine permissions, with user-specific permissions taking precedence
		const allPermissions = [...rolePermissions, ...userPermissions].map((rp) => rp.permission);

		// Remove duplicates by permission ID
		const uniquePermissions = allPermissions.filter(
			(permission, index, self) => index === self.findIndex((p) => p.id === permission.id)
		);

		return uniquePermissions;
	};

	// Assign a role to a user
	const assignRoleToUser = async (userId: string, roleId: string) => {
		if (!userId || !roleId) {
			throw new Error('User ID and Role ID are required');
		}

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Check if role exists
		const role = await prisma.role.findUnique({
			where: { id: roleId }
		});

		if (!role) {
			throw new Error('Role not found');
		}

		// Update user's role
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				roleId
			},
			select: {
				id: true,
				username: true,
				email: true,
				roleId: true,
				createdAt: true,
				updatedAt: true,
				role: {
					select: {
						id: true,
						name: true,
						description: true
					}
				}
			}
		});

		return updatedUser;
	};

	// Assign a specific permission to a user
	const assignPermissionToUser = async (userId: string, permissionId: string) => {
		if (!userId || !permissionId) {
			throw new Error('User ID and Permission ID are required');
		}

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Check if permission exists
		const permission = await prisma.permission.findUnique({
			where: { id: permissionId }
		});

		if (!permission) {
			throw new Error('Permission not found');
		}

		// Check if the permission is already assigned to the user
		const existingUserPermission = await prisma.userPermission.findUnique({
			where: {
				userId_permissionId: {
					userId,
					permissionId
				}
			}
		});

		if (existingUserPermission) {
			throw new Error('Permission is already assigned to this user');
		}

		// Assign the permission to the user
		const userPermission = await prisma.userPermission.create({
			data: {
				userId,
				permissionId
			},
			include: {
				permission: true
			}
		});

		return userPermission;
	};

	// Remove a specific permission from a user
	const removePermissionFromUser = async (userId: string, permissionId: string) => {
		if (!userId || !permissionId) {
			throw new Error('User ID and Permission ID are required');
		}

		// Check if the permission is assigned to the user
		const existingUserPermission = await prisma.userPermission.findUnique({
			where: {
				userId_permissionId: {
					userId,
					permissionId
				}
			}
		});

		if (!existingUserPermission) {
			throw new Error('Permission is not assigned to this user');
		}

		// Remove the permission from the user
		await prisma.userPermission.delete({
			where: {
				userId_permissionId: {
					userId,
					permissionId
				}
			}
		});

		return { success: true };
	};

	return {
		createUser,
		getUserById,
		getUserByUsername,
		getUsers,
		updateUser,
		deleteUser,
		getUserPermissions,
		assignRoleToUser,
		assignPermissionToUser,
		removePermissionFromUser
	};
};

export default {
	createUser,
	getUserById,
	getUserByUsername,
	getUsers,
	updateUser,
	deleteUser,
	getUserPermissions,
	assignRoleToUser,
	assignPermissionToUser,
	removePermissionFromUser,
	createUserService
};
