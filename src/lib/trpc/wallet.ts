import {
	activateWalletAddress,
	createWalletAddress,
	deleteWalletAddress,
	getActiveWalletAddressByNetwork,
	getWalletAddresses,
	updateWalletAddress
} from '$lib/services/wallet.service';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createPermissionMiddleware } from './middleware';
import { t } from './trpc';

// Input validation schemas
const createWalletAddressSchema = z.object({
	network: z.string().min(1, 'شبکه الزامی است'),
	address: z.string().min(1, 'آدرس الزامی است'),
	isActive: z.boolean().default(true)
});

const getWalletAddressesSchema = z.object({
	network: z.string().optional(),
	isActive: z.boolean().optional()
});

const getActiveWalletAddressByNetworkSchema = z.object({
	network: z.string().min(1, 'شبکه الزامی است')
});

const updateWalletAddressSchema = z.object({
	id: z.string().min(1, 'شناسه آدرس کیف پول الزامی است'),
	data: z
		.object({
			network: z.string().optional(),
			address: z.string().optional(),
			isActive: z.boolean().optional()
		})
		.partial()
});

const deleteWalletAddressSchema = z.object({
	id: z.string().min(1, 'شناسه آدرس کیف پول الزامی است')
});

const activateWalletAddressSchema = z.object({
	id: z.string().min(1, 'شناسه آدرس کیف پول الزامی است')
});

// Protected procedures
const adminProcedure = t.procedure.use(createPermissionMiddleware('wallet', 'manage'));

// Public procedure
const publicProcedure = t.procedure;

export const walletRouter = t.router({
	// Create a new wallet address - admin only
	createWalletAddress: adminProcedure
		.input(createWalletAddressSchema)
		.mutation(async ({ input }) => {
			try {
				return await createWalletAddress(input.network, input.address, input.isActive);
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'ایجاد آدرس کیف پول ناموفق بود',
					cause: error
				});
			}
		}),

	// Get all wallet addresses with optional filtering - admin only
	getWalletAddresses: adminProcedure.input(getWalletAddressesSchema).query(async ({ input }) => {
		try {
			return await getWalletAddresses({
				network: input.network,
				isActive: input.isActive
			});
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: error.message || 'دریافت آدرس‌های کیف پول ناموفق بود',
				cause: error
			});
		}
	}),

	// Get the active wallet address for a specific network - public
	getActiveWalletAddressByNetwork: publicProcedure
		.input(getActiveWalletAddressByNetworkSchema)
		.query(async ({ input }) => {
			try {
				const walletAddress = await getActiveWalletAddressByNetwork(input.network);

				if (!walletAddress) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'هیچ آدرس کیف پول فعالی برای این شبکه یافت نشد'
					});
				}

				return walletAddress;
			} catch (error: any) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'دریافت آدرس کیف پول فعال ناموفق بود',
					cause: error
				});
			}
		}),

	// Update an existing wallet address - admin only
	updateWalletAddress: adminProcedure
		.input(updateWalletAddressSchema)
		.mutation(async ({ input }) => {
			try {
				return await updateWalletAddress(input.id, input.data);
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'بروزرسانی آدرس کیف پول ناموفق بود',
					cause: error
				});
			}
		}),

	// Delete a wallet address - admin only
	deleteWalletAddress: adminProcedure
		.input(deleteWalletAddressSchema)
		.mutation(async ({ input }) => {
			try {
				const result = await deleteWalletAddress(input.id);
				return result;
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'حذف آدرس کیف پول ناموفق بود',
					cause: error
				});
			}
		}),

	// Activate a wallet address and deactivate others in the same network - admin only
	activateWalletAddress: adminProcedure
		.input(activateWalletAddressSchema)
		.mutation(async ({ input }) => {
			try {
				return await activateWalletAddress(input.id);
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'فعال‌سازی آدرس کیف پول ناموفق بود',
					cause: error
				});
			}
		})
});

// Export types
export type WalletRouter = typeof walletRouter;
