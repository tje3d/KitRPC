import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 شروع عملیات پر کردن پایگاه داده...');

	// بررسی وجود نقش‌ها
	const existingRoles = await prisma.role.count();
	if (existingRoles === 0) {
		console.log('👥 ایجاد نقش‌های پیش‌فرض...');

		// ایجاد نقش‌های پیش‌فرض
		const userRole = await prisma.role.create({
			data: {
				name: 'user',
				description: 'نقش کاربر عادی با مجوزهای پایه'
			}
		});

		const adminRole = await prisma.role.create({
			data: {
				name: 'admin',
				description: 'نقش مدیر با مجوزهای کامل'
			}
		});

		console.log('✅ نقش‌های پیش‌فرض ایجاد شدند!');

		// ایجاد مجوزهای پیش‌فرض
		console.log('🔐 ایجاد مجوزهای پیش‌فرض...');

		const permissions = [
				// مجوزهای کاربر
				{ name: 'user:manage', description: 'مدیریت کاربران', resource: 'user', action: 'manage' },

				// مجوزهای کیف پول
				{
					name: 'wallet:manage',
					description: 'مدیریت آدرس‌های کیف پول',
					resource: 'wallet',
					action: 'manage'
				},

				// مجوزهای مدیر
				{
					name: 'admin:manage',
					description: 'دسترسی کامل مدیر',
					resource: 'admin',
					action: 'manage'
				},
				{ name: 'role:manage', description: 'مدیریت نقش‌ها', resource: 'role', action: 'manage' },
				{
					name: 'permission:manage',
					description: 'مدیریت مجوزها',
					resource: 'permission',
					action: 'manage'
				},
				{
					name: 'media:manage',
					description: 'مدیریت فایل‌های رسانه',
					resource: 'media',
					action: 'manage'
				},
				{
					name: 'kyc:manage',
					description: 'مدیریت تأییدیه‌های احراز هویت',
					resource: 'kyc',
					action: 'manage'
				},
				{
					name: 'capacity:manage',
					description: 'مدیریت ظرفیت سیستم',
					resource: 'capacity',
					action: 'manage'
				}
			];

		const createdPermissions = await Promise.all(
			permissions.map((permission) => prisma.permission.create({ data: permission }))
		);

		console.log('✅ مجوزهای پیش‌فرض ایجاد شدند!');

		// اختصاص مجوزها به نقش‌ها
		console.log('🔗 اختصاص مجوزها به نقش‌ها...');

		// نقش مدیر همه مجوزها را دریافت می‌کند
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

		console.log('✅ مجوزها به نقش‌ها اختصاص داده شدند!');
	} else {
		console.log('👥 نقش‌ها قبلاً ایجاد شده‌اند، بررسی مجوزهای جدید...');
	}

	// بررسی وجود کاربران
	const existingUsers = await prisma.user.count();
	if (existingUsers === 0) {
		console.log('👤 ایجاد کاربران نمونه...');

		// دریافت نقش‌های موجود
		const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
		const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

		if (!userRole || !adminRole) {
			throw new Error('نقش‌های مورد نیاز یافت نشدند');
		}

		// هش کردن رمز عبور برای کاربران نمونه
		const hashedPassword = await hashPassword('123456');

		// ایجاد کاربران نمونه
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

		console.log('✅ کاربران نمونه ایجاد و نقش‌ها به آن‌ها اختصاص داده شد!');
		console.log(`   👤 کاربر عادی: ${regularUser.username} (رمز عبور: 123456)`);
		console.log(`   👤 کاربر مدیر: ${adminUser.username} (رمز عبور: 123456)`);
	} else {
		console.log('👤 کاربران قبلاً ایجاد شده‌اند، از ایجاد کاربر جدید صرف نظر شد.');
	}

	// بررسی وجود کارت‌های بانکی
	const existingBankCards = await prisma.bankCard.count();
	if (existingBankCards === 0) {
		console.log('💳 ایجاد کارت‌های بانکی نمونه...');

		// دریافت کاربران برای کارت‌های بانکی
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

			console.log('✅ کارت‌های بانکی نمونه ایجاد شدند!');
		}
	} else {
		console.log('💳 کارت‌های بانکی قبلاً ایجاد شده‌اند، از ایجاد کارت بانکی جدید صرف نظر شد.');
	}

	// بررسی وجود تراکنش‌ها
	const existingTransactions = await prisma.transaction.count();
	if (existingTransactions === 0) {
		console.log('💰 ایجاد تراکنش‌های نمونه...');

		// دریافت کاربران و کارت‌های بانکی برای تراکنش‌ها
		const users = await prisma.user.findMany();
		const bankCards = await prisma.bankCard.findMany();

		if (users.length > 0) {
			const transactionData = [
				// واریزهای ریالی
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 1000000,
					status: 'COMPLETED' as const,
					description: 'واریز اولیه',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 500000,
					status: 'COMPLETED' as const,
					description: 'واریز حقوق ماهانه',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'IRT' as const,
					amount: 250000,
					status: 'PENDING' as const,
					description: 'واریز بانکی در انتظار تأیید',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				// واریزهای تتر
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'USDT' as const,
					amount: 100.5,
					status: 'COMPLETED' as const,
					description: 'واریز تتر از کیف پول خارجی',
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
					description: 'واریز تتر از صرافی',
					transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
					fromAddress: '0x9876543210fedcba9876543210fedcba98765432',
					toAddress: '0x1234567890abcdef1234567890abcdef12345678'
				},
				// برداشت‌های ریالی
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'IRT' as const,
					amount: 200000,
					status: 'COMPLETED' as const,
					description: 'برداشت از خودپرداز',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'IRT' as const,
					amount: 150000,
					status: 'FAILED' as const,
					description: 'برداشت ناموفق - موجودی ناکافی',
					bankCardId: bankCards.length > 0 ? bankCards[0].id : null
				},
				// برداشت‌های تتر
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'USDT' as const,
					amount: 25.75,
					status: 'COMPLETED' as const,
					description: 'برداشت تتر به کیف پول خارجی',
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
					description: 'برداشت تتر در انتظار تأیید',
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
					description: 'واریز بزرگ',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'USDT' as const,
					amount: 200.0,
					status: 'COMPLETED' as const,
					description: 'واریز تتر',
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
					description: 'برداشت عادی',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'TRANSFER' as const,
					currency: 'IRT' as const,
					amount: 100000,
					status: 'COMPLETED' as const,
					description: 'انتقال داخلی',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'TRANSFER' as const,
					currency: 'USDT' as const,
					amount: 50.0,
					status: 'COMPLETED' as const,
					description: 'انتقال داخلی تتر',
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
					description: 'واریز لغو شده',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'USDT' as const,
					amount: 125.5,
					status: 'FAILED' as const,
					description: 'برداشت تتر ناموفق',
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
					description: 'واریز بزرگ در انتظار تأیید',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'WITHDRAWAL' as const,
					currency: 'IRT' as const,
					amount: 450000,
					status: 'COMPLETED' as const,
					description: 'برداشت هزینه‌های ماهانه',
					bankCardId:
						bankCards.length > 2 ? bankCards[2].id : bankCards.length > 0 ? bankCards[0].id : null
				},
				{
					userId: users[1].id,
					type: 'DEPOSIT' as const,
					currency: 'USDT' as const,
					amount: 300.75,
					status: 'COMPLETED' as const,
					description: 'واریز بزرگ تتر',
					transactionHash: '0xffffffffffffffffffffffffffffffffffffff',
					fromAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
					toAddress: '0x1234567890abcdef1234567890abcdef12345678'
				}
			];

			await prisma.transaction.createMany({
				data: transactionData
			});

			console.log('✅ تراکنش‌های نمونه ایجاد شدند!');
		}
	} else {
		console.log('💰 تراکنش‌ها قبلاً ایجاد شده‌اند، از ایجاد تراکنش جدید صرف نظر شد.');
	}

	// بررسی وجود ظرفیت سیستم
	const existingSystemCapacity = await prisma.systemCapacity.count();
	if (existingSystemCapacity === 0) {
		console.log('⚡ ایجاد ظرفیت‌های سیستم...');

		await prisma.systemCapacity.createMany({
			data: [
				{
					currency: 'IRT',
					amount: 1000000 // 1M IRT
				},
				{
					currency: 'USDT',
					amount: 1000 // 1K USDT
				}
			]
		});

		console.log('✅ ظرفیت‌های سیستم ایجاد شدند!');
	} else {
		console.log('⚡ ظرفیت‌های سیستم قبلاً ایجاد شده‌اند، از ایجاد ظرفیت جدید صرف نظر شد.');
	}

	console.log('✅ عملیات پر کردن پایگاه داده با موفقیت انجام شد!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ خطا در عملیات پر کردن پایگاه داده:', e);
		await prisma.$disconnect();
		if (typeof process !== 'undefined') {
			process.exit(1);
		}
	});
