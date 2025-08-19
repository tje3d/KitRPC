// Zibal Gateway Service
// Provides KYC verification services through Zibal API

// TypeScript interfaces for Zibal API
export interface ZibalCheckMobileRequest {
	mobile: string;
}

export interface ZibalCheckMobileResponse {
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

export interface ZibalCheckNidRequest {
	nationalId: string;
	firstName?: string;
	lastName?: string;
	birthDate?: string;
}

export interface ZibalCheckNidResponse {
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

export interface ZibalGetIbanRequest {
	iban: string;
}

export interface ZibalGetIbanResponse {
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

export interface ZibalServiceConfig {
	token: string;
	baseUrl?: string;
	timeout?: number;
}

class ZibalService {
	private token: string;
	private baseUrl: string;
	private timeout: number;

	constructor(config: ZibalServiceConfig) {
		this.token = config.token;
		this.baseUrl = config.baseUrl || 'https://api.zibal.ir';
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
	 * Make API request to Zibal
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
				throw new Error(`Zibal API request failed: ${error.message}`);
			}
			throw new Error('Unknown error occurred during Zibal API request');
		}
	}

	/**
	 * Check mobile number validity
	 */
	async checkMobile(
		request: ZibalCheckMobileRequest,
		timeout?: number
	): Promise<ZibalCheckMobileResponse> {
		try {
			const response = await this.makeRequest<ZibalCheckMobileResponse>(
				'/kyc/mobile/check',
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
	async checkNid(request: ZibalCheckNidRequest, timeout?: number): Promise<ZibalCheckNidResponse> {
		try {
			const response = await this.makeRequest<ZibalCheckNidResponse>(
				'/kyc/nid/check',
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
	async getIban(request: ZibalGetIbanRequest, timeout?: number): Promise<ZibalGetIbanResponse> {
		try {
			const response = await this.makeRequest<ZibalGetIbanResponse>(
				'/kyc/iban/info',
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

// Factory function to create Zibal service instance
export const createZibalService = (
	token: string,
	config?: Partial<ZibalServiceConfig>
): ZibalService => {
	return new ZibalService({
		token,
		...config
	});
};

// Default export
export default ZibalService;
