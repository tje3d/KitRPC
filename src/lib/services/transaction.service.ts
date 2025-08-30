import { CurrencyType, TransactionStatus, TransactionType } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';
import { updateUserBalance } from './balance.service';
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
		throw new Error('مبلغ نامعتبر');
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

// Get all transactions for a user with pagination support
export const getTransactions = async (
	userId: string,
	filters?: {
		type?: TransactionType;
		currency?: CurrencyType;
		status?: TransactionStatus;
		createdAt?: {
			gte?: Date;
			lte?: Date;
		};
	},
	limit: number = 10,
	offset: number = 0
) => {
	const whereClause = {
		userId,
		...(filters?.type && { type: filters.type }),
		...(filters?.currency && { currency: filters.currency }),
		...(filters?.status && { status: filters.status }),
		...(filters?.createdAt && {
			createdAt: {
				...(filters.createdAt.gte && { gte: filters.createdAt.gte }),
				...(filters.createdAt.lte && { lte: filters.createdAt.lte })
			}
		})
	};

	// Get transactions and total count in parallel
	const [transactions, totalCount] = await Promise.all([
		defaultPrisma.transaction.findMany({
			where: whereClause,
			orderBy: {
				createdAt: 'desc'
			},
			take: limit,
			skip: offset
		}),
		defaultPrisma.transaction.count({
			where: whereClause
		})
	]);

	return {
		transactions,
		totalCount
	};
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
export { validateAmount, validateTransactionHash };

// Process a BUY_USDT transaction atomically
export const processBuyUsdt = async (
	userId: string,
	amountUsdt: number, // Amount of USDT to buy
	description?: string
) => {
	// Validate amount
	if (!validateAmount(amountUsdt, CurrencyType.USDT)) {
		throw new Error('مبلغ USDT نامعتبر');
	}

	// Get current USDT price
	const currentPrice = await defaultPrisma.usdtPrice.findFirst({
		orderBy: {
			createdAt: 'desc'
		}
	});

	if (!currentPrice) {
		throw new Error('قیمت USDT یافت نشد');
	}

	// Calculate IRT amount needed
	const amountIrt = amountUsdt * currentPrice.buyPrice;

	// Check if the user has sufficient IRT balance
	const user = await defaultPrisma.user.findUnique({
		where: { id: userId },
		select: {
			balanceIRT: true,
			balanceUSDT: true
		}
	});

	if (!user) {
		throw new Error('کاربر یافت نشد');
	}

	if (user.balanceIRT < amountIrt) {
		throw new Error('موجودی تومان کافی نیست');
	}

	// Use a transaction to ensure atomicity between:
	// 1. Creating the transaction record
	// 2. Updating the user's IRT balance (decrease)
	// 3. Updating the user's USDT balance (increase)
	return await defaultPrisma.$transaction(async (prisma) => {
		// Create the transaction record
		const transaction = await prisma.transaction.create({
			data: {
				userId,
				type: TransactionType.BUY_USDT,
				currency: CurrencyType.USDT,
				amount: amountUsdt,
				status: TransactionStatus.COMPLETED,
				description: description || `خرید ${amountUsdt} USDT به قیمت ${currentPrice.buyPrice} تومان`
				// Store additional info in description
				// We could also add a separate field if needed
			}
		});

		// Update the user's IRT balance (decrease)
		await updateUserBalance(prisma, userId, CurrencyType.IRT, amountIrt, 'subtract');

		// Update the user's USDT balance (increase)
		await updateUserBalance(prisma, userId, CurrencyType.USDT, amountUsdt, 'add');

		return transaction;
	});
};

// Process a SELL_USDT transaction atomically
export const processSellUsdt = async (
	userId: string,
	amountUsdt: number, // Amount of USDT to sell
	description?: string
) => {
	// Validate amount
	if (!validateAmount(amountUsdt, CurrencyType.USDT)) {
		throw new Error('مبلغ USDT نامعتبر');
	}

	// Get current USDT price
	const currentPrice = await defaultPrisma.usdtPrice.findFirst({
		orderBy: {
			createdAt: 'desc'
		}
	});

	if (!currentPrice) {
		throw new Error('قیمت USDT یافت نشد');
	}

	// Calculate IRT amount to receive
	const amountIrt = amountUsdt * currentPrice.sellPrice;

	// Check if the user has sufficient USDT balance
	const user = await defaultPrisma.user.findUnique({
		where: { id: userId },
		select: {
			balanceIRT: true,
			balanceUSDT: true
		}
	});

	if (!user) {
		throw new Error('کاربر یافت نشد');
	}

	if (user.balanceUSDT < amountUsdt) {
		throw new Error('موجودی USDT کافی نیست');
	}

	// Use a transaction to ensure atomicity between:
	// 1. Creating the transaction record
	// 2. Updating the user's USDT balance (decrease)
	// 3. Updating the user's IRT balance (increase)
	return await defaultPrisma.$transaction(async (prisma) => {
		// Create the transaction record
		const transaction = await prisma.transaction.create({
			data: {
				userId,
				type: TransactionType.SELL_USDT,
				currency: CurrencyType.USDT,
				amount: amountUsdt,
				status: TransactionStatus.COMPLETED,
				description:
					description || `فروش ${amountUsdt} USDT به قیمت ${currentPrice.sellPrice} تومان`
				// Store additional info in description
				// We could also add a separate field if needed
			}
		});

		// Update the user's USDT balance (decrease)
		await updateUserBalance(prisma, userId, CurrencyType.USDT, amountUsdt, 'subtract');

		// Update the user's IRT balance (increase)
		await updateUserBalance(prisma, userId, CurrencyType.IRT, amountIrt, 'add');

		return transaction;
	});
};
