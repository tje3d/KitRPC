// NextPay API Service
// Base URL: https://nextpay.org

import { createApiRequest, NetworkError, ValidationError } from '../helpers/apiRequest.helper.js';

// Environment variables
const NEXTPAY_TOKEN = process.env.NEXTPAY_TOKEN;
const NEXTPAY_BASE_URL = 'https://nextpay.org';
const DEBUG = process.env.NODE_ENV === 'development';

// Debug logging helper
const debugLog = (message: string, data?: any) => {
	if (DEBUG) {
		console.log(`[NextPay Service] ${message}`, data ? JSON.stringify(data, null, 2) : '');
	}
};

// Custom error types
export class NextPayNetworkError extends NetworkError {
	constructor(message: string) {
		super(message);
		this.name = 'NextPayNetworkError';
	}
}

export class NextPayValidationError extends ValidationError {
	constructor(message: string) {
		super(message);
		this.name = 'NextPayValidationError';
	}
}

// Base response interface
interface NextPayBaseResponse {
	code: number;
	error: string | null;
	fee: number;
	fee_irr: number;
	inq_balance: number;
	inq_balance_irr: number;
}

// Shahkar Inquiry Types
interface ShahkarInquiryRequest {
	national_id: string;
	mobile: string;
}

interface ShahkarInquiryData {
	inq: string;
	inq_desc: string;
	inq_id: number;
	national_id: string;
	mobile: string;
	match: boolean;
}

interface ShahkarInquiryResponse extends NextPayBaseResponse {
	data: ShahkarInquiryData;
}

// Sabtahval Inquiry Types
interface SabtahvalInquiryRequest {
	national_id: string;
	birth_year: string;
	birth_month: string;
	birth_day: string;
}

interface SabtahvalInquiryData {
	inq: string;
	inq_desc: string;
	inq_id: number;
	national_id: string;
	jalali_birth: string;
	match: boolean;
	first_name: string;
	last_name: string;
	father_name: string;
	is_alive: number;
}

interface SabtahvalInquiryResponse extends NextPayBaseResponse {
	data: SabtahvalInquiryData;
}

// Create NextPay API request function
const makeNextPayRequest = createApiRequest({
	baseUrl: NEXTPAY_BASE_URL,
	token: NEXTPAY_TOKEN,
	tokenField: 'inquiry_api',
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
		const response = await makeNextPayRequest<ShahkarInquiryResponse>(
			'/nx/inquiry/shahkar',
			request,
			timeoutMs
		);

		debugLog('Shahkar inquiry response received', response);

		// Check if matched is true
		if (response?.data?.match === true) {
			debugLog('Shahkar inquiry successful - match found');
			return true;
		} else {
			debugLog('Shahkar inquiry failed - no match');
			throw new NextPayValidationError('اطلاعات کد ملی و شماره موبایل تطابق ندارد');
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
 * Sabtahval Inquiry - Get information using nationalCode + birthDate
 * Returns user information if matched, otherwise throws error
 */
export const sabtahvalInquiry = async (
	request: SabtahvalInquiryRequest,
	timeoutMs: number = 30000
): Promise<{
	firstName: string;
	lastName: string;
	fatherName: string;
	alive: boolean;
}> => {
	debugLog('Sabtahval inquiry started', { request, timeoutMs });
	
	try {
		const response = await makeNextPayRequest<SabtahvalInquiryResponse>(
			'/nx/inquiry/sabtahval',
			request,
			timeoutMs
		);

		debugLog('Sabtahval inquiry response received', response);

		// Check if matched is true
		if (response?.data?.match === true) {
			const result = {
				firstName: response.data.first_name,
				lastName: response.data.last_name,
				fatherName: response.data.father_name,
				alive: response.data.is_alive === 1
			};
			debugLog('Sabtahval inquiry successful', result);
			return result;
		} else {
			debugLog('Sabtahval inquiry failed - no match');
			throw new NextPayValidationError('اطلاعات کد ملی و تاریخ تولد تطابق ندارد');
		}
	} catch (error) {
		debugLog('Sabtahval inquiry error', { error: error instanceof Error ? error.message : error });
		
		// Re-throw network errors and validation errors
		if (error instanceof NetworkError || error instanceof ValidationError) {
			throw error;
		}
		// Handle unexpected errors
		throw new Error(
			`Sabtahval inquiry failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
};

// Export default service object
export default {
	shahkarInquiry,
	sabtahvalInquiry
};
