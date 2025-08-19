import { prisma } from '$lib/prisma';
import { CurrencyType, TransactionType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createPermissionMiddleware } from './middleware';
import { t } from './trpc';

// اسکیماهای اعتبارسنجی ورودی
const createCapacityTransactionSchema = z.object({
	currency: z.nativeEnum(CurrencyType),
	amount: z.number(),
	description: z.string().optional()
});

const getCapacityTransactionsSchema = z.object({
	currency: z.nativeEnum(CurrencyType).optional(),
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0)
});

// میدل‌ویر ادمین برای مدیریت ظرفیت
const adminOnly = createPermissionMiddleware('capacity', 'manage');

// پروسیجر محافظت شده برای عملیات ادمین
const adminProcedure = t.procedure.use(adminOnly);

export const capacityRouter = t.router({
	// دریافت آمار ظرفیت فعلی سیستم
	getStats: adminProcedure.query(async () => {
		try {
			return await prisma.systemCapacity.findMany({
				orderBy: {
					currency: 'asc'
				}
			});
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'خطا در دریافت آمار ظرفیت',
				cause: error
			});
		}
	}),

	// ایجاد تراکنش ظرفیت برای افزایش ظرفیت سیستم
	createCapacityTransaction: adminProcedure
		.input(createCapacityTransactionSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				// شروع تراکنش برای اطمینان از یکپارچگی
				const result = await prisma.$transaction(async (tx) => {
					// ایجاد تراکنش ظرفیت
					const transaction = await tx.transaction.create({
						data: {
							userId: ctx.user.id,
							type: TransactionType.CAPACITY,
							currency: input.currency,
							amount: input.amount,
							status: 'COMPLETED',
							description: input.description || `افزایش ظرفیت ادمین برای ${input.currency}`
						}
					});

					// به‌روزرسانی یا ایجاد ظرفیت سیستم
					const existingCapacity = await tx.systemCapacity.findUnique({
						where: { currency: input.currency }
					});

					let updatedCapacity;
					if (existingCapacity) {
						// به‌روزرسانی ظرفیت موجود
						updatedCapacity = await tx.systemCapacity.update({
							where: { currency: input.currency },
							data: {
								amount: existingCapacity.amount + input.amount
							}
						});
					} else {
						// ایجاد رکورد ظرفیت جدید
						updatedCapacity = await tx.systemCapacity.create({
							data: {
								currency: input.currency,
								amount: input.amount
							}
						});
					}

					return { transaction, capacity: updatedCapacity };
				});

				return {
					transaction: result.transaction,
					capacity: result.capacity
				};
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'خطا در ایجاد تراکنش ظرفیت',
					cause: error
				});
			}
		}),

	// دریافت آخرین تراکنش‌های ظرفیت
	getCapacityTransactions: adminProcedure
		.input(getCapacityTransactionsSchema)
		.query(async ({ input }) => {
			try {
				// ساخت فیلترها
				const where: any = {
					type: TransactionType.CAPACITY
				};

				if (input.currency) {
					where.currency = input.currency;
				}

				// دریافت تراکنش‌ها با اطلاعات کاربر
				const [transactions, totalCount] = await Promise.all([
					prisma.transaction.findMany({
						where,
						include: {
							user: {
								select: {
									id: true,
									username: true
								}
							}
						},
						orderBy: {
							createdAt: 'desc'
						},
						take: input.limit,
						skip: input.offset
					}),
					prisma.transaction.count({ where })
				]);

				return {
					transactions,
					totalCount
				};
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'خطا در دریافت تراکنش‌های ظرفیت',
					cause: error
				});
			}
		})
});
