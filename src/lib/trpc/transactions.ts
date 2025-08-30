import {
	getTransactions,
	processBuyUsdt,
	processSellUsdt
} from '$lib/services/transaction.service';
import { CurrencyType, TransactionStatus, TransactionType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { isAuthenticated } from './middleware';
import { t } from './trpc';

// Input validation schemas
const getHistorySchema = z.object({
	type: z.nativeEnum(TransactionType).optional(),
	currency: z.nativeEnum(CurrencyType).optional(),
	status: z.nativeEnum(TransactionStatus).optional(),
	fromDate: z.date().optional(),
	toDate: z.date().optional(),
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0)
});

// Input validation schemas for buy/sell USDT
const buyUsdtSchema = z.object({
	amountUsdt: z.number().positive()
});

const sellUsdtSchema = z.object({
	amountUsdt: z.number().positive()
});

// Protected procedure for authenticated users
const authenticatedProcedure = t.procedure.use(isAuthenticated);

export const transactionsRouter = t.router({
	// Get transaction history with filtering capabilities
	getHistory: authenticatedProcedure.input(getHistorySchema).query(async ({ input, ctx }) => {
		try {
			// Build filters object
			const filters: {
				type?: TransactionType;
				currency?: CurrencyType;
				status?: TransactionStatus;
				createdAt?: {
					gte?: Date;
					lte?: Date;
				};
			} = {};

			// Add filters if provided
			if (input.type) filters.type = input.type;
			if (input.currency) filters.currency = input.currency;
			if (input.status) filters.status = input.status;

			// Add date range filters
			if (input.fromDate || input.toDate) {
				filters.createdAt = {};
				if (input.fromDate) filters.createdAt.gte = input.fromDate;
				if (input.toDate) filters.createdAt.lte = input.toDate;
			}

			// Get transactions using the service
			const result = await getTransactions(ctx.user.id, filters, input.limit, input.offset);

			// Format dates for client
			return {
				success: true,
				transactions: result.transactions.map((transaction) => ({
					...transaction,
					createdAt: transaction.createdAt.toISOString(),
					updatedAt: transaction.updatedAt.toISOString()
				})),
				totalCount: result.totalCount
			};
		} catch (error: any) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: error.message || 'Failed to fetch transaction history'
			});
		}
	}),

	// Buy USDT
	buyUsdt: authenticatedProcedure.input(buyUsdtSchema).mutation(async ({ input, ctx }) => {
		try {
			const transaction = await processBuyUsdt(ctx.user.id, input.amountUsdt);
			return {
				success: true,
				transaction
			};
		} catch (error: any) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: error.message || 'خطا در خرید USDT'
			});
		}
	}),

	// Sell USDT
	sellUsdt: authenticatedProcedure.input(sellUsdtSchema).mutation(async ({ input, ctx }) => {
		try {
			const transaction = await processSellUsdt(ctx.user.id, input.amountUsdt);
			return {
				success: true,
				transaction
			};
		} catch (error: any) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: error.message || 'خطا در فروش USDT'
			});
		}
	})
});
