// NextPay Gateway Service
// Provides KYC verification services through NextPay API

// TypeScript interfaces for NextPay API
export interface NextPayCheckMobileRequest {
	mobile: string;
}

export interface NextPayCheckMobileResponse {
	success: boolean;
	data?: {
		valid: boolean;
		operator?: string;
		province?: string;
		city?: string;
	};
	error?: string;
	message?: string;
}

export interface NextPayCheckNidRequest {
	nationalId: string;
	firstName?: string;
	lastName?: string;
	birthDate?: string;
}

export interface NextPayCheckNidResponse {
	success: boolean;
	data?: {
		valid: boolean;
		firstName?: string;
		lastName?: string;
		birthDate?: string;
		gender?: string;
	};
	error?: string;
	message?: string;
}

export interface NextPayGetIbanRequest {
	iban: string;
}

export interface NextPayGetIbanResponse {
	success: boolean;
	data?: {
		valid: boolean;
		bankName?: string;
		bankCode?: string;
		accountNumber?: string;
		ownerName?: string;
	};
	error?: string;
	message?: string;
}

export interface NextPayServiceConfig {
	token: string;
	baseUrl?: string;
	timeout?: number;
}

class NextPayService {
	private token: string;
	private baseUrl: string;
	private timeout: number;

	constructor(config: NextPayServiceConfig) {
		this.token = config.token;
		this.baseUrl = config.baseUrl || 'https://api.nextpay.org';
		this.timeout = config.timeout || 30000; // 30 seconds default
	}

	/**
	 * Create fetch request with timeout
	 */
	private async fetchWithTimeout(
		url: string,
		options: RequestInit,
		timeout: number = this.timeout
	): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error(`Request timeout after ${timeout}ms`);
			}
			throw error;
		}
	}

	/**
	 * Make API request to NextPay
	 */
	private async makeRequest<T>(endpoint: string, data: any, timeout?: number): Promise<T> {
		try {
			const url = `${this.baseUrl}${endpoint}`;
			const response = await this.fetchWithTimeout(
				url,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${this.token}`
					},
					body: JSON.stringify(data)
				},
				timeout
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			return result as T;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`NextPay API request failed: ${error.message}`);
			}
			throw new Error('Unknown error occurred during NextPay API request');
		}
	}

	/**
	 * Check mobile number validity
	 */
	async checkMobile(
		request: NextPayCheckMobileRequest,
		timeout?: number
	): Promise<NextPayCheckMobileResponse> {
		try {
			const response = await this.makeRequest<NextPayCheckMobileResponse>(
				'/kyc/mobile/verify',
				request,
				timeout
			);
			return response;
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				message: 'Failed to check mobile number'
			};
		}
	}

	/**
	 * Check national ID validity
	 */
	async checkNid(
		request: NextPayCheckNidRequest,
		timeout?: number
	): Promise<NextPayCheckNidResponse> {
		try {
			const response = await this.makeRequest<NextPayCheckNidResponse>(
				'/kyc/nationalid/verify',
				request,
				timeout
			);
			return response;
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				message: 'Failed to check national ID'
			};
		}
	}

	/**
	 * Get IBAN information
	 */
	async getIban(request: NextPayGetIbanRequest, timeout?: number): Promise<NextPayGetIbanResponse> {
		try {
			const response = await this.makeRequest<NextPayGetIbanResponse>(
				'/kyc/iban/validate',
				request,
				timeout
			);
			return response;
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				message: 'Failed to get IBAN information'
			};
		}
	}
}

// Factory function to create NextPay service instance
export const createNextPayService = (
	token: string,
	config?: Partial<NextPayServiceConfig>
): NextPayService => {
	return new NextPayService({
		token,
		...config
	});
};

// Default export
export default NextPayService;
