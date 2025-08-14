import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createWalletAddress,
	getWalletAddresses,
	getActiveWalletAddressByNetwork,
	updateWalletAddress,
	deleteWalletAddress,
	activateWalletAddress
} from '$lib/services/wallet.service';
import { isAuthenticated, createPermissionMiddleware } from './middleware';
import { t } from './trpc';

// Input validation schemas
const createWalletAddressSchema = z.object({
	network: z.string().min(1, 'Network is required'),
	address: z.string().min(1, 'Address is required'),
	isActive: z.boolean().default(true)
});

const getWalletAddressesSchema = z.object({
	network: z.string().optional(),
	isActive: z.boolean().optional()
});

const getActiveWalletAddressByNetworkSchema = z.object({
	network: z.string().min(1, 'Network is required')
});

const updateWalletAddressSchema = z.object({
	id: z.string().min(1, 'Wallet address ID is required'),
	data: z
		.object({
			network: z.string().optional(),
			address: z.string().optional(),
			isActive: z.boolean().optional()
		})
		.partial()
});

const deleteWalletAddressSchema = z.object({
	id: z.string().min(1, 'Wallet address ID is required')
});

const activateWalletAddressSchema = z.object({
	id: z.string().min(1, 'Wallet address ID is required')
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
				const walletAddress = await createWalletAddress(
					input.network,
					input.address,
					input.isActive
				);

				return {
					...walletAddress,
					createdAt: walletAddress.createdAt.toISOString(),
					updatedAt: walletAddress.updatedAt.toISOString()
				};
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'Failed to create wallet address',
					cause: error
				});
			}
		}),

	// Get all wallet addresses with optional filtering - admin only
	getWalletAddresses: adminProcedure.input(getWalletAddressesSchema).query(async ({ input }) => {
		try {
			const walletAddresses = await getWalletAddresses({
				network: input.network,
				isActive: input.isActive
			});

			return walletAddresses.map((address) => ({
				...address,
				createdAt: address.createdAt.toISOString(),
				updatedAt: address.updatedAt.toISOString()
			}));
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: error.message || 'Failed to fetch wallet addresses',
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
						message: 'No active wallet address found for this network'
					});
				}

				return {
					...walletAddress,
					createdAt: walletAddress.createdAt.toISOString(),
					updatedAt: walletAddress.updatedAt.toISOString()
				};
			} catch (error: any) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'Failed to fetch active wallet address',
					cause: error
				});
			}
		}),

	// Update an existing wallet address - admin only
	updateWalletAddress: adminProcedure
		.input(updateWalletAddressSchema)
		.mutation(async ({ input }) => {
			try {
				const updatedWallet = await updateWalletAddress(input.id, input.data);

				return {
					...updatedWallet,
					createdAt: updatedWallet.createdAt.toISOString(),
					updatedAt: updatedWallet.updatedAt.toISOString()
				};
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'Failed to update wallet address',
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
					message: error.message || 'Failed to delete wallet address',
					cause: error
				});
			}
		}),

	// Activate a wallet address and deactivate others in the same network - admin only
	activateWalletAddress: adminProcedure
		.input(activateWalletAddressSchema)
		.mutation(async ({ input }) => {
			try {
				const activatedWallet = await activateWalletAddress(input.id);

				return {
					...activatedWallet,
					createdAt: activatedWallet.createdAt.toISOString(),
					updatedAt: activatedWallet.updatedAt.toISOString()
				};
			} catch (error: any) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error.message || 'Failed to activate wallet address',
					cause: error
				});
			}
		})
});

// Export types
export type WalletRouter = typeof walletRouter;
