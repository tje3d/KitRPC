// Verification Service Wrapper
// Combines Zibal and NextPay services with random selection and failover

import * as zibalService from './zibal.service.js';
import * as nextpayService from './nextpay.service.js';
import { NetworkError, ValidationError } from '../helpers/apiRequest.helper.js';

// Custom error types
export class VerificationNetworkError extends NetworkError {
	constructor(message: string) {
		super(message);
		this.name = 'VerificationNetworkError';
	}
}

export class VerificationValidationError extends ValidationError {
	constructor(message: string) {
		super(message);
		this.name = 'VerificationValidationError';
	}
}

// Types
interface ShahkarRequest {
	nationalCode: string;
	mobile: string;
}

interface IdentityRequest {
	nationalCode: string;
	birthDate: string; // Format: YYYY-MM-DD
}

interface UserInfo {
	firstName: string;
	lastName: string;
	fatherName: string;
	alive: boolean;
}

// Gateway providers
type Gateway = 'zibal' | 'nextpay';

/**
 * Randomly shuffle array elements
 */
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Convert birth date format for NextPay (YYYY-MM-DD to separate fields)
 */
function convertBirthDateForNextPay(birthDate: string) {
	const [year, month, day] = birthDate.split('-');
	return {
		birth_year: year,
		birth_month: month,
		birth_day: day
	};
}

/**
 * Shahkar Inquiry - Verify national code + mobile number
 * Uses random gateway selection with failover
 */
export const shahkarInquiry = async (
	request: ShahkarRequest,
	timeoutMs: number = 30000
): Promise<boolean> => {
	const gateways: Gateway[] = shuffleArray(['zibal', 'nextpay']);
	const errors: Error[] = [];

	for (const gateway of gateways) {
		try {
			if (gateway === 'zibal') {
				return await zibalService.shahkarInquiry(
					{
						mobile: request.mobile,
						nationalCode: request.nationalCode
					},
					timeoutMs
				);
			} else {
				return await nextpayService.shahkarInquiry(
					{
						national_id: request.nationalCode,
						mobile: request.mobile
					},
					timeoutMs
				);
			}
		} catch (error) {
			// If it's a validation error, throw immediately (no point trying other gateway)
			if (error instanceof ValidationError) {
				throw new VerificationValidationError(error.message);
			}

			// If it's a network error, store it and try next gateway
			if (error instanceof NetworkError) {
				errors.push(error);
				continue;
			}

			// For other errors, store and continue
			errors.push(error instanceof Error ? error : new Error('Unknown error'));
		}
	}

	// All gateways failed
	throw new VerificationNetworkError(
		`All gateways failed for Shahkar inquiry. Errors: ${errors.map((e) => e.message).join(', ')}`
	);
};

/**
 * Identity Inquiry - Get user information using national code + birth date
 * Uses random gateway selection with failover
 */
export const identityInquiry = async (
	request: IdentityRequest,
	timeoutMs: number = 30000
): Promise<UserInfo> => {
	const gateways: Gateway[] = shuffleArray(['zibal', 'nextpay']);
	const errors: Error[] = [];

	for (const gateway of gateways) {
		try {
			if (gateway === 'zibal') {
				return await zibalService.nationalIdentityInquiry(
					{
						nationalCode: request.nationalCode,
						birthDate: request.birthDate
					},
					timeoutMs
				);
			} else {
				const birthDateFields = convertBirthDateForNextPay(request.birthDate);
				return await nextpayService.sabtahvalInquiry(
					{
						national_id: request.nationalCode,
						...birthDateFields
					},
					timeoutMs
				);
			}
		} catch (error) {
			// If it's a validation error, throw immediately (no point trying other gateway)
			if (error instanceof ValidationError) {
				throw new VerificationValidationError(error.message);
			}

			// If it's a network error, store it and try next gateway
			if (error instanceof NetworkError) {
				errors.push(error);
				continue;
			}

			// For other errors, store and continue
			errors.push(error instanceof Error ? error : new Error('Unknown error'));
		}
	}

	// All gateways failed
	throw new VerificationNetworkError(
		`All gateways failed for identity inquiry. Errors: ${errors.map((e) => e.message).join(', ')}`
	);
};

// Export default service object
export default {
	shahkarInquiry,
	identityInquiry
};
