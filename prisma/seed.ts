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
			// User permissions
			{ name: 'user:manage', description: 'Manage users', resource: 'user', action: 'manage' },

			// Wallet permissions
			{
				name: 'wallet:manage',
				description: 'Manage wallet addresses',
				resource: 'wallet',
				action: 'manage'
			},

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
			},
			{
				name: 'media:manage',
				description: 'Manage media files',
				resource: 'media',
				action: 'manage'
			},
			{
				name: 'kyc:manage',
				description: 'Manage KYC verifications',
				resource: 'kyc',
				action: 'manage'
			}
		];

		const createdPermissions = await Promise.all(
			permissions.map((permission) => prisma.permission.create({ data: permission }))
		);

		console.log('✅ Default permissions created!');

		// Assign permissions to roles
		console.log('🔗 Assigning permissions to roles...');

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
		console.log('👥 Roles already exist, checking for new permissions...');

		// Check if media:manage permission exists, if not create it
		let mediaPermission = await prisma.permission.findUnique({
			where: { name: 'media:manage' }
		});

		// Track if the permission existed before
		const permissionExisted = !!mediaPermission;

		if (!mediaPermission) {
			console.log('🔐 Creating media management permission...');

			mediaPermission = await prisma.permission.create({
				data: {
					name: 'media:manage',
					description: 'Manage media files',
					resource: 'media',
					action: 'manage'
				}
			});
		}

		// Ensure the media:manage permission is assigned to the admin role
		if (mediaPermission) {
			const adminRole = await prisma.role.findUnique({
				where: { name: 'admin' }
			});

			if (adminRole) {
				// Check if the permission is already assigned to the admin role
				const existingRolePermission = await prisma.rolePermission.findUnique({
					where: {
						roleId_permissionId: {
							roleId: adminRole.id,
							permissionId: mediaPermission.id
						}
					}
				});

				if (!existingRolePermission) {
					await prisma.rolePermission.create({
						data: {
							roleId: adminRole.id,
							permissionId: mediaPermission.id
						}
					});

					if (!permissionExisted) {
						console.log('✅ Media management permission created and assigned to admin role!');
					} else {
						console.log('✅ Media management permission assigned to admin role!');
					}
				} else {
					console.log('✅ Media management permission already assigned to admin role.');
				}
			}
		}
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

	// Check if bank cards already exist
	const existingBankCards = await prisma.bankCard.count();
	if (existingBankCards === 0) {
		console.log('💳 Creating sample bank cards...');

		// Get users for bank cards
		const users = await prisma.user.findMany();
		if (users.length > 0) {
			await prisma.bankCard.createMany({
				data: [
					{
						cardNumber: '6037991234567890',
						userId: users[1].id,
						isDefault: true
					},
					{
						cardNumber: '6219861234567890',
						userId: users[1].id,
						isDefault: false
					},
					{
						cardNumber: '6274121234567890',
						userId: users.length > 1 ? users[1].id : users[1].id,
						isDefault: false
					}
				]
			});

			console.log('✅ Sample bank cards created!');
		}
	} else {
		console.log('💳 Bank cards already exist, skipping bank card creation.');
	}

	// Check if transactions already exist
	const existingTransactions = await prisma.transaction.count();
	if (existingTransactions === 0) {
		console.log('💰 Creating sample transactions...');

		// Get users and bank cards for transactions
		const users = await prisma.user.findMany();
		const bankCards = await prisma.bankCard.findMany();

		if (users.length > 0) {
			const transactionData = [
				// IRT Deposits
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 1000000,
					status: 'COMPLETED' as const,
					description: 'Initial deposit',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 500000,
					status: 'COMPLETED' as const,
					description: 'Monthly salary deposit',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 250000,
					status: 'PENDING' as const,
					description: 'Bank transfer pending',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				// USDT Deposits
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'USDT' as const,
					amount: 100.5,
					status: 'COMPLETED' as const,
					description: 'USDT deposit from external wallet',
					transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
					fromAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
					toAddress: '0x1234567890abcdef1234567890abcdef12345678'
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'USDT' as const,
					amount: 50.25,
					status: 'COMPLETED' as const,
					description: 'USDT deposit from exchange',
					transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
					fromAddress: '0x9876543210fedcba9876543210fedcba98765432',
					toAddress: '0x1234567890abcdef1234567890abcdef12345678'
				},
				// IRT Withdrawals
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'IRT' as const,
					amount: 200000,
					status: 'COMPLETED' as const,
					description: 'ATM withdrawal',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'IRT' as const,
					amount: 150000,
					status: 'FAILED' as const,
					description: 'Failed withdrawal - insufficient funds',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				// USDT Withdrawals
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'USDT' as const,
					amount: 25.75,
					status: 'COMPLETED' as const,
					description: 'USDT withdrawal to external wallet',
					transactionHash: '0xfedcba0987654321fedcba0987654321fedcba09',
					fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
					toAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
				},
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'USDT' as const,
					amount: 75.0,
					status: 'PENDING' as const,
					description: 'USDT withdrawal pending confirmation',
					transactionHash: '0x1111222233334444555566667777888899990000',
					fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
					toAddress: '0x0000999988887777666655554444333322221111'
				},

				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 2000000,
					status: 'COMPLETED' as const,
					description: 'Large deposit',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'USDT' as const,
					amount: 200.0,
					status: 'COMPLETED' as const,
					description: 'USDT deposit',
					transactionHash: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
					fromAddress: '0xbbbbbbccccccddddddeeeeeeffffffffaaaaaaaa',
					toAddress: '0x1234567890abcdef1234567890abcdef12345678'
				},
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'IRT' as const,
					amount: 300000,
					status: 'COMPLETED' as const,
					description: 'Regular withdrawal',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'TRANSFER' as const,
					currency: 'IRT' as const,
					amount: 100000,
					status: 'COMPLETED' as const,
					description: 'Internal transfer',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'TRANSFER' as const,
					currency: 'USDT' as const,
					amount: 50.0,
					status: 'COMPLETED' as const,
					description: 'USDT internal transfer',
					transactionHash: '0xccccccddddddeeeeeeffffffffaaaaaaaabbbbbb',
					fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
					toAddress: '0xddddddeeeeeeffffffffaaaaaaaabbbbbbcccccc'
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 750000,
					status: 'CANCELLED' as const,
					description: 'Cancelled deposit',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'USDT' as const,
					amount: 125.5,
					status: 'FAILED' as const,
					description: 'Failed USDT withdrawal',
					transactionHash: '0xeeeeeeffffffffaaaaaaaabbbbbbccccccdddddd',
					fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
					toAddress: '0xffffffffaaaaaaaabbbbbbccccccddddddeeeeee'
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 1250000,
					status: 'PENDING' as const,
					description: 'Large pending deposit',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'IRT' as const,
					amount: 450000,
					status: 'COMPLETED' as const,
					description: 'Monthly expenses withdrawal',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'USDT' as const,
					amount: 300.75,
					status: 'COMPLETED' as const,
					description: 'Large USDT deposit',
					transactionHash: '0xffffffffffffffffffffffffffffffffffffff',
					fromAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
					toAddress: '0x1234567890abcdef1234567890abcdef12345678'
				}
			];

			await prisma.transaction.createMany({
				data: transactionData
			});

			console.log('✅ Sample transactions created!');
		}
	} else {
		console.log('💰 Transactions already exist, skipping transaction creation.');
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
