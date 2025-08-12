import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createCard,
	getCards,
	getCardById,
	updateCard,
	deleteCard
} from '$lib/services/bankCard.service';
import { isAuthenticated } from './middleware';
import { t } from './trpc';

// Input validation schemas
const cardNumberSchema = z
	.string()
	.regex(/^\d{16}$/, 'Card number must be exactly 16 digits and contain only numeric characters');

const createCardSchema = z.object({
	cardNumber: cardNumberSchema,
	isDefault: z.boolean().optional()
});

const cardIdSchema = z.object({
	cardId: z.string().cuid('Invalid card ID')
});

const updateCardSchema = z.object({
	cardId: z.string().cuid('Invalid card ID'),
	data: z
		.object({
			cardNumber: cardNumberSchema.optional(),
			isDefault: z.boolean().optional()
		})
		.strict()
});

const setDefaultCardSchema = z.object({
	cardId: z.string().cuid('Invalid card ID')
});

// Protected procedure for authenticated users
const authenticatedProcedure = t.procedure.use(isAuthenticated);

export const bankCardsRouter = t.router({
	// Create a new bank card
	createCard: authenticatedProcedure.input(createCardSchema).mutation(async ({ input, ctx }) => {
		try {
			const newCard = await createCard(ctx.user.id, input.cardNumber, input.isDefault);
			return {
				...newCard,
				createdAt: newCard.createdAt.toISOString(),
				updatedAt: newCard.updatedAt.toISOString()
			};
		} catch (error: any) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: error.message || 'Failed to create card',
				cause: error
			});
		}
	}),

	// Get all bank cards for the authenticated user
	getCards: authenticatedProcedure.query(async ({ ctx }) => {
		try {
			const cards = await getCards(ctx.user.id);
			return cards.map((card) => ({
				...card,
				createdAt: card.createdAt.toISOString(),
				updatedAt: card.updatedAt.toISOString()
			}));
		} catch (error: any) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch cards',
				cause: error
			});
		}
	}),

	// Get a specific bank card by ID
	getCardById: authenticatedProcedure.input(cardIdSchema).query(async ({ input, ctx }) => {
		try {
			const card = await getCardById(input.cardId, ctx.user.id);
			return {
				...card,
				createdAt: card.createdAt.toISOString(),
				updatedAt: card.updatedAt.toISOString()
			};
		} catch (error: any) {
			if (error.message === 'Card not found') {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Card not found'
				});
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch card',
				cause: error
			});
		}
	}),

	// Update a bank card
	updateCard: authenticatedProcedure.input(updateCardSchema).mutation(async ({ input, ctx }) => {
		try {
			const updatedCard = await updateCard(input.cardId, ctx.user.id, input.data);
			return {
				...updatedCard,
				createdAt: updatedCard.createdAt.toISOString(),
				updatedAt: updatedCard.updatedAt.toISOString()
			};
		} catch (error: any) {
			if (error.message === 'Card not found') {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Card not found'
				});
			}
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: error.message || 'Failed to update card',
				cause: error
			});
		}
	}),

	// Delete a bank card
	deleteCard: authenticatedProcedure.input(cardIdSchema).mutation(async ({ input, ctx }) => {
		try {
			const result = await deleteCard(input.cardId, ctx.user.id);
			return result;
		} catch (error: any) {
			if (error.message === 'Card not found') {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Card not found'
				});
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to delete card',
				cause: error
			});
		}
	}),

	// Set a specific card as the default card
	setDefaultCard: authenticatedProcedure
		.input(setDefaultCardSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				// First verify the card exists and belongs to the user
				const card = await getCardById(input.cardId, ctx.user.id);

				// If it's already the default card, return success
				if (card.isDefault) {
					return { success: true };
				}

				// Update the card to be the default
				const updatedCard = await updateCard(input.cardId, ctx.user.id, { isDefault: true });
				return { success: true };
			} catch (error: any) {
				if (error.message === 'Card not found') {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Card not found'
					});
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to set default card',
					cause: error
				});
			}
		})
});
