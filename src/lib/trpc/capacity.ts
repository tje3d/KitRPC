import { prisma } from '$lib/prisma';
import { CurrencyType, TransactionType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createPermissionMiddleware } from './middleware';
import { t } from './trpc';

// Input validation schemas
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

// Admin middleware for capacity management
const adminOnly = createPermissionMiddleware('capacity', 'manage');

// Protected procedure for admin operations
const adminProcedure = t.procedure.use(adminOnly);

export const capacityRouter = t.router({
	// Get current system capacity stats
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
				message: 'Failed to fetch capacity stats',
				cause: error
			});
		}
	}),

	// Create capacity transaction to increase system capacity
	createCapacityTransaction: adminProcedure
		.input(createCapacityTransactionSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				// Start transaction to ensure atomicity
				const result = await prisma.$transaction(async (tx) => {
					// Create the capacity transaction
					const transaction = await tx.transaction.create({
						data: {
							userId: ctx.user.id,
							type: TransactionType.CAPACITY,
							currency: input.currency,
							amount: input.amount,
							status: 'COMPLETED',
							description: input.description || `Admin capacity increase for ${input.currency}`
						}
					});

					// Update or create system capacity
					const existingCapacity = await tx.systemCapacity.findUnique({
						where: { currency: input.currency }
					});

					let updatedCapacity;
					if (existingCapacity) {
						// Update existing capacity
						updatedCapacity = await tx.systemCapacity.update({
							where: { currency: input.currency },
							data: {
								amount: existingCapacity.amount + input.amount
							}
						});
					} else {
						// Create new capacity record
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
					message: 'Failed to create capacity transaction',
					cause: error
				});
			}
		}),

	// Get latest capacity transactions
	getCapacityTransactions: adminProcedure
		.input(getCapacityTransactionsSchema)
		.query(async ({ input }) => {
			try {
				// Build filters
				const where: any = {
					type: TransactionType.CAPACITY
				};

				if (input.currency) {
					where.currency = input.currency;
				}

				// Get transactions with user info
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
					message: 'Failed to fetch capacity transactions',
					cause: error
				});
			}
		})
});
