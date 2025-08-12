import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getTransactions } from '$lib/services/transaction.service';
import { isAuthenticated } from './middleware';
import { t } from './trpc';
import { TransactionType, CurrencyType, TransactionStatus } from '@prisma/client';

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
				transactions: result.transactions.map((transaction) => ({
					...transaction,
					createdAt: transaction.createdAt.toISOString(),
					updatedAt: transaction.updatedAt.toISOString()
				})),
				totalCount: result.totalCount
			};
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch transaction history',
				cause: error
			});
		}
	})
});
