import { Prisma, CurrencyType } from '@prisma/client';
import { prisma as defaultPrisma } from '../prisma';
import { validateAmount } from './validation.utils';

// Create a type for our prisma client instance
type PrismaClientType = typeof defaultPrisma;
type TransactionClientType = Parameters<Parameters<typeof defaultPrisma.$transaction>[0]>[0];

// Get user balances
export const getUserBalances = async (userId: string) => {
	const user = await defaultPrisma.user.findUnique({
		where: { id: userId },
		select: {
			balanceIRT: true,
			balanceUSDT: true
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	return {
		balanceIRT: user.balanceIRT,
		balanceUSDT: user.balanceUSDT
	};
};

// Update user balances (internal function, should be used within transactions)
export const updateUserBalance = async (
	prisma: PrismaClientType | TransactionClientType,
	userId: string,
	currency: CurrencyType,
	amount: number,
	type: 'add' | 'subtract'
) => {
	// Validate amount
	if (!validateAmount(amount, currency)) {
		throw new Error('Invalid amount');
	}

	// Determine the field to update based on currency
	const balanceField = currency === CurrencyType.IRT ? 'balanceIRT' : 'balanceUSDT';

	// Calculate the new balance
	const updateData: any = {};
	if (type === 'add') {
		updateData[balanceField] = {
			increment: amount
		};
	} else {
		updateData[balanceField] = {
			decrement: amount
		};
	}

	// Update the user's balance atomically
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: updateData,
		select: {
			balanceIRT: true,
			balanceUSDT: true
		}
	});

	return updatedUser;
};

// Process a deposit transaction atomically
export const processDeposit = async (
	userId: string,
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

	// For IRT deposits, bank card is required
	if (currency === CurrencyType.IRT && !bankCardId) {
		throw new Error('Bank card is required for IRT deposits');
	}

	// For USDT deposits, transaction hash is required
	if (currency === CurrencyType.USDT && !transactionHash) {
		throw new Error('Transaction hash is required for USDT deposits');
	}

	// Use a transaction to ensure atomicity between creating the transaction and updating the balance
	return await defaultPrisma.$transaction(async (prisma) => {
		// Create the transaction record
		const transaction = await prisma.transaction.create({
			data: {
				userId,
				type: 'DEPOSIT',
				currency,
				amount,
				status: 'COMPLETED',
				description,
				bankCardId: currency === CurrencyType.IRT ? bankCardId : undefined,
				transactionHash: currency === CurrencyType.USDT ? transactionHash : undefined,
				fromAddress: currency === CurrencyType.USDT ? fromAddress : undefined,
				toAddress: currency === CurrencyType.USDT ? toAddress : undefined
			}
		});

		// Update the user's balance
		await updateUserBalance(prisma, userId, currency, amount, 'add');

		return transaction;
	});
};

// Process a withdrawal transaction atomically
export const processWithdrawal = async (
	userId: string,
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

	// For IRT withdrawals, bank card is required
	if (currency === CurrencyType.IRT && !bankCardId) {
		throw new Error('Bank card is required for IRT withdrawals');
	}

	// For USDT withdrawals, transaction hash is required
	if (currency === CurrencyType.USDT && !transactionHash) {
		throw new Error('Transaction hash is required for USDT withdrawals');
	}

	// Check if the user has sufficient balance
	const user = await defaultPrisma.user.findUnique({
		where: { id: userId },
		select: {
			balanceIRT: true,
			balanceUSDT: true
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	const balance = currency === CurrencyType.IRT ? user.balanceIRT : user.balanceUSDT;
	if (balance < amount) {
		throw new Error('Insufficient balance');
	}

	// Use a transaction to ensure atomicity between creating the transaction and updating the balance
	return await defaultPrisma.$transaction(async (prisma) => {
		// Create the transaction record
		const transaction = await prisma.transaction.create({
			data: {
				userId,
				type: 'WITHDRAWAL',
				currency,
				amount,
				status: 'COMPLETED',
				description,
				bankCardId: currency === CurrencyType.IRT ? bankCardId : undefined,
				transactionHash: currency === CurrencyType.USDT ? transactionHash : undefined,
				fromAddress: currency === CurrencyType.USDT ? fromAddress : undefined,
				toAddress: currency === CurrencyType.USDT ? toAddress : undefined
			}
		});

		// Update the user's balance
		await updateUserBalance(prisma, userId, currency, amount, 'subtract');

		return transaction;
	});
};

// Export validation functions for potential reuse
export { validateAmount };
