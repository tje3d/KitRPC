import { Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';

// Create a type for our prisma client instance
type PrismaClientType = typeof defaultPrisma;

// Validation function for Iranian bank card numbers
const validateCardNumber = (cardNumber: string): boolean => {
	// Check if card number is exactly 16 digits
	if (cardNumber.length !== 16) {
		return false;
	}

	// Check if card number contains only numeric characters
	if (!/^\d+$/.test(cardNumber)) {
		return false;
	}

	return true;
};

// Create a new bank card
export const createCard = async (
	userId: string,
	cardNumber: string,
	isDefault: boolean = false
) => {
	// Validate card number
	if (!validateCardNumber(cardNumber)) {
		throw new Error('Card number must be exactly 16 digits and contain only numeric characters');
	}

	// Check if user already has this card
	const existingCard = await defaultPrisma.bankCard.findUnique({
		where: {
			userId_cardNumber: {
				userId,
				cardNumber
			}
		}
	});

	if (existingCard) {
		throw new Error('Card already exists for this user');
	}

	// Check if this is the user's first card
	const userCards = await defaultPrisma.bankCard.findMany({
		where: { userId }
	});

	const isFirstCard = userCards.length === 0;

	// If it's the first card, it should be default regardless of the isDefault parameter
	if (isFirstCard) {
		isDefault = true;
	}

	// If isDefault is true, unset the current default card
	if (isDefault) {
		await defaultPrisma.bankCard.updateMany({
			where: { userId, isDefault: true },
			data: { isDefault: false }
		});
	}

	// Create the new card
	const newCard = await defaultPrisma.bankCard.create({
		data: {
			userId,
			cardNumber,
			isDefault
		}
	});

	return newCard;
};

// Get all cards for a user
export const getCards = async (userId: string) => {
	return await defaultPrisma.bankCard.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' }
	});
};

// Get a specific card by ID for a user
export const getCardById = async (cardId: string, userId: string) => {
	const card = await defaultPrisma.bankCard.findUnique({
		where: { id: cardId }
	});

	// Ensure the card belongs to the user
	if (!card || card.userId !== userId) {
		throw new Error('Card not found');
	}

	return card;
};

// Update a card
export const updateCard = async (
	cardId: string,
	userId: string,
	data: { cardNumber?: string; isDefault?: boolean }
) => {
	// Validate card number if provided
	if (data.cardNumber && !validateCardNumber(data.cardNumber)) {
		throw new Error('Card number must be exactly 16 digits and contain only numeric characters');
	}

	// Check if the card exists and belongs to the user
	const existingCard = await getCardById(cardId, userId);

	// Check if a different card with the same number already exists for this user
	if (data.cardNumber && data.cardNumber !== existingCard.cardNumber) {
		const duplicateCard = await defaultPrisma.bankCard.findUnique({
			where: {
				userId_cardNumber: {
					userId,
					cardNumber: data.cardNumber
				}
			}
		});

		if (duplicateCard) {
			throw new Error('Card with this number already exists for this user');
		}
	}

	// If isDefault is being set to true, unset the current default card
	if (data.isDefault === true) {
		await defaultPrisma.bankCard.updateMany({
			where: { userId, isDefault: true },
			data: { isDefault: false }
		});
	}

	// Update the card
	const updatedCard = await defaultPrisma.bankCard.update({
		where: { id: cardId },
		data: {
			...(data.cardNumber && { cardNumber: data.cardNumber }),
			...(data.isDefault !== undefined && { isDefault: data.isDefault }),
			updatedAt: new Date()
		}
	});

	return updatedCard;
};

// Delete a card
export const deleteCard = async (cardId: string, userId: string) => {
	// Check if the card exists and belongs to the user
	const card = await getCardById(cardId, userId);

	// Check if this is the default card
	const isDefaultCard = card.isDefault;

	// Delete the card
	await defaultPrisma.bankCard.delete({
		where: { id: cardId }
	});

	// If the deleted card was the default card and the user has other cards,
	// set the most recently created card as the new default
	if (isDefaultCard) {
		const remainingCards = await defaultPrisma.bankCard.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: 1
		});

		if (remainingCards.length > 0) {
			await defaultPrisma.bankCard.update({
				where: { id: remainingCards[0].id },
				data: { isDefault: true }
			});
		}
	}

	return { success: true };
};

// Export the validation function for potential reuse
export { validateCardNumber };

// Factory function to create a service with a custom prisma client instance
export const createBankCardService = (prisma: PrismaClientType) => {
	// Create a new bank card
	const createCard = async (userId: string, cardNumber: string, isDefault: boolean = false) => {
		// Validate card number
		if (!validateCardNumber(cardNumber)) {
			throw new Error('Card number must be exactly 16 digits and contain only numeric characters');
		}

		// Check if user already has this card
		const existingCard = await prisma.bankCard.findUnique({
			where: {
				userId_cardNumber: {
					userId,
					cardNumber
				}
			}
		});

		if (existingCard) {
			throw new Error('Card already exists for this user');
		}

		// Check if this is the user's first card
		const userCards = await prisma.bankCard.findMany({
			where: { userId }
		});

		const isFirstCard = userCards.length === 0;

		// If it's the first card, it should be default regardless of the isDefault parameter
		if (isFirstCard) {
			isDefault = true;
		}

		// If isDefault is true, unset the current default card
		if (isDefault) {
			await prisma.bankCard.updateMany({
				where: { userId, isDefault: true },
				data: { isDefault: false }
			});
		}

		// Create the new card
		const newCard = await prisma.bankCard.create({
			data: {
				userId,
				cardNumber,
				isDefault
			}
		});

		return newCard;
	};

	// Get all cards for a user
	const getCards = async (userId: string) => {
		return await prisma.bankCard.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' }
		});
	};

	// Get a specific card by ID for a user
	const getCardById = async (cardId: string, userId: string) => {
		const card = await prisma.bankCard.findUnique({
			where: { id: cardId }
		});

		// Ensure the card belongs to the user
		if (!card || card.userId !== userId) {
			throw new Error('Card not found');
		}

		return card;
	};

	// Update a card
	const updateCard = async (
		cardId: string,
		userId: string,
		data: { cardNumber?: string; isDefault?: boolean }
	) => {
		// Validate card number if provided
		if (data.cardNumber && !validateCardNumber(data.cardNumber)) {
			throw new Error('Card number must be exactly 16 digits and contain only numeric characters');
		}

		// Check if the card exists and belongs to the user
		const existingCard = await getCardById(cardId, userId);

		// Check if a different card with the same number already exists for this user
		if (data.cardNumber && data.cardNumber !== existingCard.cardNumber) {
			const duplicateCard = await prisma.bankCard.findUnique({
				where: {
					userId_cardNumber: {
						userId,
						cardNumber: data.cardNumber
					}
				}
			});

			if (duplicateCard) {
				throw new Error('Card with this number already exists for this user');
			}
		}

		// If isDefault is being set to true, unset the current default card
		if (data.isDefault === true) {
			await prisma.bankCard.updateMany({
				where: { userId, isDefault: true },
				data: { isDefault: false }
			});
		}

		// Update the card
		const updatedCard = await prisma.bankCard.update({
			where: { id: cardId },
			data: {
				...(data.cardNumber && { cardNumber: data.cardNumber }),
				...(data.isDefault !== undefined && { isDefault: data.isDefault }),
				updatedAt: new Date()
			}
		});

		return updatedCard;
	};

	// Delete a card
	const deleteCard = async (cardId: string, userId: string) => {
		// Check if the card exists and belongs to the user
		const card = await getCardById(cardId, userId);

		// Check if this is the default card
		const isDefaultCard = card.isDefault;

		// Delete the card
		await prisma.bankCard.delete({
			where: { id: cardId }
		});

		// If the deleted card was the default card and the user has other cards,
		// set the most recently created card as the new default
		if (isDefaultCard) {
			const remainingCards = await prisma.bankCard.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				take: 1
			});

			if (remainingCards.length > 0) {
				await prisma.bankCard.update({
					where: { id: remainingCards[0].id },
					data: { isDefault: true }
				});
			}
		}

		return { success: true };
	};

	return {
		createCard,
		getCards,
		getCardById,
		updateCard,
		deleteCard,
		validateCardNumber
	};
};
