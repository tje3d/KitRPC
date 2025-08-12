import { Prisma, TransactionType, CurrencyType, TransactionStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';
import { validateAmount, validateTransactionHash } from './validation.utils';

// Create a type for our prisma client instance
type PrismaClientType = typeof defaultPrisma;

// Create a new transaction
export const createTransaction = async (
	userId: string,
	type: TransactionType,
	currency: CurrencyType,
	amount: number,
	description?: string,
	bankCardId?: string,
	transactionHash?: string,
	fromAddress?: string,
	toAddress?: string
) => {
	// Validate amount
	if (!validateAmount(amount, currency)) {
		throw new Error('Invalid amount');
	}

	// Validate currency-specific data
	if (currency === CurrencyType.IRT) {
		// For IRT transactions, bank card is required
		if (!bankCardId) {
			throw new Error('Bank card is required for IRT transactions');
		}
		// Validate bank card
		const bankCard = await defaultPrisma.bankCard.findUnique({
			where: { id: bankCardId }
		});

		if (!bankCard || bankCard.userId !== userId) {
			throw new Error('Invalid bank card for this user');
		}
	} else if (currency === CurrencyType.USDT) {
		// For USDT transactions, transaction hash is required
		if (!transactionHash) {
			throw new Error('Transaction hash is required for USDT transactions');
		}
		// Validate transaction hash
		if (!validateTransactionHash(transactionHash)) {
			throw new Error('Invalid USDT transaction hash format');
		}
	}

	// Create the transaction
	const transaction = await defaultPrisma.transaction.create({
		data: {
			userId,
			type,
			currency,
			amount,
			status: TransactionStatus.PENDING,
			description,
			bankCardId: currency === CurrencyType.IRT ? bankCardId : undefined,
			transactionHash: currency === CurrencyType.USDT ? transactionHash : undefined,
			fromAddress: currency === CurrencyType.USDT ? fromAddress : undefined,
			toAddress: currency === CurrencyType.USDT ? toAddress : undefined
		}
	});

	return transaction;
};

// Get a specific transaction by ID for a user
export const getTransactionById = async (transactionId: string, userId: string) => {
	const transaction = await defaultPrisma.transaction.findUnique({
		where: { id: transactionId }
	});

	// Ensure the transaction belongs to the user
	if (!transaction || transaction.userId !== userId) {
		throw new Error('Transaction not found');
	}

	return transaction;
};

// Get all transactions for a user
export const getTransactions = async (
	userId: string,
	filters?: {
		type?: TransactionType;
		currency?: CurrencyType;
		status?: TransactionStatus;
	},
	limit: number = 10,
	offset: number = 0
) => {
	const transactions = await defaultPrisma.transaction.findMany({
		where: {
			userId,
			...(filters?.type && { type: filters.type }),
			...(filters?.currency && { currency: filters.currency }),
			...(filters?.status && { status: filters.status })
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: limit,
		skip: offset
	});

	return transactions;
};

// Update transaction status
export const updateTransactionStatus = async (
	transactionId: string,
	userId: string,
	status: TransactionStatus,
	notes?: string
) => {
	// Check if the transaction exists and belongs to the user
	const existingTransaction = await getTransactionById(transactionId, userId);

	// Update the transaction status
	const updatedTransaction = await defaultPrisma.transaction.update({
		where: { id: transactionId },
		data: {
			status,
			...(notes && {
				description: `${existingTransaction.description ? existingTransaction.description + ' ' : ''}${notes}`
			}),
			updatedAt: new Date()
		}
	});

	return updatedTransaction;
};

// Cancel a transaction
export const cancelTransaction = async (transactionId: string, userId: string) => {
	// Check if the transaction exists and belongs to the user
	const transaction = await getTransactionById(transactionId, userId);

	// Check if transaction can be cancelled (only PENDING transactions can be cancelled)
	if (transaction.status !== TransactionStatus.PENDING) {
		throw new Error('Only pending transactions can be cancelled');
	}

	// Update the transaction status to CANCELLED
	const updatedTransaction = await defaultPrisma.transaction.update({
		where: { id: transactionId },
		data: {
			status: TransactionStatus.CANCELLED,
			updatedAt: new Date()
		}
	});

	return updatedTransaction;
};

// Export validation functions for potential reuse
export { validateTransactionHash, validateAmount };
