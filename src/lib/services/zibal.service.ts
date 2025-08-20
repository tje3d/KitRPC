// Zibal API Service
// Base URL: https://api.zibal.ir

import { createApiRequest, NetworkError, ValidationError } from '../helpers/apiRequest.helper.js';

// Environment variables
const ZIBAL_TOKEN = process.env.ZIBAL_TOKEN;
const ZIBAL_BASE_URL = 'https://api.zibal.ir';
const DEBUG = process.env.NODE_ENV === 'development';

// Debug logging helper
const debugLog = (message: string, data?: any) => {
	if (DEBUG) {
		console.log(`[Zibal Service] ${message}`, data ? JSON.stringify(data, null, 2) : '');
	}
};

// Custom error types
export class ZibalNetworkError extends NetworkError {
	constructor(message: string) {
		super(message);
		this.name = 'ZibalNetworkError';
	}
}

export class ZibalValidationError extends ValidationError {
	constructor(message: string) {
		super(message);
		this.name = 'ZibalValidationError';
	}
}

// Base response interface
interface ZibalBaseResponse {
	message: string;
	result: number;
}

// Shahkar Inquiry Types
interface ShahkarInquiryRequest {
	mobile: string;
	nationalCode: string;
}

interface ShahkarInquiryData {
	matched: boolean;
}

interface ShahkarInquiryResponse extends ZibalBaseResponse {
	data: ShahkarInquiryData;
}

// National Identity Inquiry Types
interface NationalIdentityInquiryRequest {
	nationalCode: string;
	birthDate: string;
}

interface NationalIdentityInquiryData {
	matched: boolean;
	firstName: string;
	lastName: string;
	fatherName: string;
	alive: boolean;
}

interface NationalIdentityInquiryResponse extends ZibalBaseResponse {
	data: NationalIdentityInquiryData;
}

// Create Zibal API request function
const makeZibalRequest = createApiRequest({
	baseUrl: ZIBAL_BASE_URL,
	token: ZIBAL_TOKEN,
	tokenType: 'Bearer',
	defaultTimeout: 30000
});

/**
 * Shahkar Inquiry - Compare nationalCode + mobile
 * Returns true if nationalCode and mobile number match, otherwise throws error
 */
export const shahkarInquiry = async (
	request: ShahkarInquiryRequest,
	timeoutMs: number = 30000
): Promise<boolean> => {
	debugLog('Shahkar inquiry started', { request, timeoutMs });
	
	try {
		const response = await makeZibalRequest<ShahkarInquiryResponse>(
			'/v1/facility/shahkarInquiry',
			request,
			timeoutMs
		);

		debugLog('Shahkar inquiry response received', response);

		// Check if matched is true
		if (response.data.matched === true) {
			debugLog('Shahkar inquiry successful - match found');
			return true;
		} else {
			debugLog('Shahkar inquiry failed - no match');
			throw new ZibalValidationError('اطلاعات کد ملی و شماره موبایل تطابق ندارد');
		}
	} catch (error) {
		debugLog('Shahkar inquiry error', { error: error instanceof Error ? error.message : error });
		
		// Re-throw network errors and validation errors
		if (error instanceof NetworkError || error instanceof ValidationError) {
			throw error;
		}
		// Handle unexpected errors
		throw new Error(
			`Shahkar inquiry failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
};

/**
 * National Identity Inquiry - Get information using nationalCode + birthDate
 * Returns user information if matched, otherwise throws error
 */
export const nationalIdentityInquiry = async (
	request: NationalIdentityInquiryRequest,
	timeoutMs: number = 30000
): Promise<{
	firstName: string;
	lastName: string;
	fatherName: string;
	alive: boolean;
}> => {
	debugLog('National identity inquiry started', { request, timeoutMs });
	
	try {
		const response = await makeZibalRequest<NationalIdentityInquiryResponse>(
			'/v1/facility/nationalIdentityInquiry',
			request,
			timeoutMs
		);

		debugLog('National identity inquiry response received', response);

		// Check if matched is true
		if (response.data.matched === true) {
			const result = {
				firstName: response.data.firstName,
				lastName: response.data.lastName,
				fatherName: response.data.fatherName,
				alive: response.data.alive
			};
			debugLog('National identity inquiry successful', result);
			return result;
		} else {
			debugLog('National identity inquiry failed - no match');
			throw new ZibalValidationError('اطلاعات کد ملی و تاریخ تولد تطابق ندارد');
		}
	} catch (error) {
		debugLog('National identity inquiry error', { error: error instanceof Error ? error.message : error });
		
		// Re-throw network errors and validation errors
		if (error instanceof NetworkError || error instanceof ValidationError) {
			throw error;
		}
		// Handle unexpected errors
		throw new Error(
			`National identity inquiry failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
};

// Export default service object
export default {
	shahkarInquiry,
	nationalIdentityInquiry
};
