import { CurrencyType } from '@prisma/client';

// Validation function for transaction amounts
export const validateAmount = (amount: number, currency?: CurrencyType): boolean => {
	// Amount must be positive
	if (amount <= 0) return false;

	// For IRT, amount should be in whole numbers (no decimals)
	if (currency === CurrencyType.IRT) {
		return Number.isInteger(amount);
	}

	// For USDT, up to 6 decimal places are acceptable
	if (currency === CurrencyType.USDT) {
		// Convert to string and check decimal places
		const parts = amount.toString().split('.');
		if (parts.length > 1) {
			return parts[1].length <= 6;
		}
		return true;
	}

	// If currency is not specified, allow any positive amount
	return true;
};

// Validation function for USDT transaction hash (TRC20 format)
export const validateTransactionHash = (hash: string): boolean => {
	// TRC20 transaction hashes are 64 characters long and start with '0x'
	if (hash.length !== 66) return false; // 0x + 64 hex chars
	if (!hash.startsWith('0x')) return false;

	// Check if the rest are valid hex characters
	const hexPart = hash.substring(2);
	return /^[0-9a-fA-F]+$/.test(hexPart);
};
