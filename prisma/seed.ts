import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Check if roles already exist
	const existingRoles = await prisma.role.count();
	if (existingRoles === 0) {
		console.log('👥 Creating default roles...');

		// Create default roles
		const userRole = await prisma.role.create({
			data: {
				name: 'user',
				description: 'Default user role with basic permissions'
			}
		});

		const adminRole = await prisma.role.create({
			data: {
				name: 'admin',
				description: 'Administrator role with full permissions'
			}
		});

		console.log('✅ Default roles created!');

		// Create default permissions
		console.log('🔐 Creating default permissions...');

		const permissions = [
			// Todo permissions
			{ name: 'todo:create', description: 'Create todos', resource: 'todo', action: 'create' },
			{ name: 'todo:read', description: 'Read todos', resource: 'todo', action: 'read' },
			{ name: 'todo:update', description: 'Update todos', resource: 'todo', action: 'update' },
			{ name: 'todo:delete', description: 'Delete todos', resource: 'todo', action: 'delete' },

			// User permissions
			{ name: 'user:read', description: 'Read user profiles', resource: 'user', action: 'read' },
			{
				name: 'user:update',
				description: 'Update user profiles',
				resource: 'user',
				action: 'update'
			},
			{ name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },

			// Admin permissions
			{
				name: 'admin:manage',
				description: 'Full admin access',
				resource: 'admin',
				action: 'manage'
			},
			{ name: 'role:manage', description: 'Manage roles', resource: 'role', action: 'manage' },
			{
				name: 'permission:manage',
				description: 'Manage permissions',
				resource: 'permission',
				action: 'manage'
			}
		];

		const createdPermissions = await Promise.all(
			permissions.map((permission) => prisma.permission.create({ data: permission }))
		);

		console.log('✅ Default permissions created!');

		// Assign permissions to roles
		console.log('🔗 Assigning permissions to roles...');

		// User role gets basic todo permissions
		const userPermissions = createdPermissions.filter(
			(p) =>
				p.resource === 'todo' || (p.resource === 'user' && ['read', 'update'].includes(p.action))
		);

		await Promise.all(
			userPermissions.map((permission) =>
				prisma.rolePermission.create({
					data: {
						roleId: userRole.id,
						permissionId: permission.id
					}
				})
			)
		);

		// Admin role gets all permissions
		await Promise.all(
			createdPermissions.map((permission) =>
				prisma.rolePermission.create({
					data: {
						roleId: adminRole.id,
						permissionId: permission.id
					}
				})
			)
		);

		console.log('✅ Permissions assigned to roles!');
	} else {
		console.log('👥 Roles already exist, skipping role creation.');
	}

	// Check if users already exist
	const existingUsers = await prisma.user.count();
	if (existingUsers === 0) {
		console.log('👤 Creating sample users...');

		// Get existing roles
		const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
		const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

		if (!userRole || !adminRole) {
			throw new Error('Required roles not found');
		}

		// Hash passwords for sample users
		const hashedPassword = await hashPassword('123456');

		// Create sample users
		const regularUser = await prisma.user.create({
			data: {
				username: 'user',
				password: hashedPassword,
				roleId: userRole.id
			}
		});

		const adminUser = await prisma.user.create({
			data: {
				username: 'admin',
				password: hashedPassword,
				roleId: adminRole.id
			}
		});

		console.log('✅ Sample users created and assigned roles!');
		console.log(`   👤 Regular user: ${regularUser.username} (password: 123456)`);
		console.log(`   👤 Admin user: ${adminUser.username} (password: 123456)`);
	} else {
		console.log('👤 Users already exist, skipping user creation.');
	}

	// Check if todos already exist
	const existingTodos = await prisma.todo.count();
	if (existingTodos === 0) {
		console.log('📋 Creating sample todos...');

		// Create initial todos
		await prisma.todo.createMany({
			data: [
				{
					text: 'Learn SvelteKit',
					completed: false
				},
				{
					text: 'Build a todo app',
					completed: true
				},
				{
					text: 'Deploy to production',
					completed: false
				}
			]
		});

		console.log('✅ Sample todos created!');
	} else {
		console.log('📋 Todos already exist, skipping todo creation.');
	}

	console.log('✅ Database seeded successfully!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ Error seeding database:', e);
		await prisma.$disconnect();
		if (typeof process !== 'undefined') {
			process.exit(1);
		}
	});
