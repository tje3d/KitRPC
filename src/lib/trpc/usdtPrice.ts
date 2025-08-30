import { prisma } from '$lib/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createPermissionMiddleware } from './middleware';
import { t } from './trpc';

// Validation schemas
const createUsdtPriceSchema = z.object({
	buyPrice: z.number().positive(),
	sellPrice: z.number().positive()
});

const getUsdtPriceHistorySchema = z.object({
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0)
});

// Admin-only middleware for USDT price management
const adminOnly = createPermissionMiddleware('usdtprice', 'manage');

// Protected procedure for admin operations
const adminProcedure = t.procedure.use(adminOnly);

export const usdtPriceRouter = t.router({
	// Create a new USDT price record
	createUsdtPrice: adminProcedure.input(createUsdtPriceSchema).mutation(async ({ input }) => {
		try {
			const newPrice = await prisma.usdtPrice.create({
				data: {
					buyPrice: input.buyPrice,
					sellPrice: input.sellPrice
				}
			});

			return newPrice;
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'خطا در ایجاد قیمت جدید USDT',
				cause: error
			});
		}
	}),

	// Get USDT price history with pagination
	getUsdtPriceHistory: adminProcedure.input(getUsdtPriceHistorySchema).query(async ({ input }) => {
		try {
			const [prices, totalCount] = await Promise.all([
				prisma.usdtPrice.findMany({
					orderBy: {
						createdAt: 'desc'
					},
					take: input.limit,
					skip: input.offset
				}),
				prisma.usdtPrice.count()
			]);

			return {
				prices,
				totalCount
			};
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'خطا در دریافت تاریخچه قیمت‌ها',
				cause: error
			});
		}
	}),

	// Get current USDT prices (latest record)
	getCurrentUsdtPrice: adminProcedure.query(async () => {
		try {
			const currentPrice = await prisma.usdtPrice.findFirst({
				orderBy: {
					createdAt: 'desc'
				}
			});

			return currentPrice;
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'خطا در دریافت قیمت فعلی USDT',
				cause: error
			});
		}
	})
});
