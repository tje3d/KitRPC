// KYC Gateway Wrapper Service
// Provides failover functionality between Zibal and NextPay gateways

import { createNextPayService } from './nextpay.service';
import { createZibalService } from './zibal.service';

// Unified interfaces for the wrapper
export interface KycCheckMobileRequest {
	mobile: string;
}

export interface KycCheckMobileResponse {
	success: boolean;
	data?: {
		valid: boolean;
		operator?: string;
		province?: string;
		city?: string;
	};
	error?: string;
	message?: string;
	gateway?: 'zibal' | 'nextpay';
}

export interface KycCheckNidRequest {
	nationalId: string;
	firstName?: string;
	lastName?: string;
	birthDate?: string;
}

export interface KycCheckNidResponse {
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
	gateway?: 'zibal' | 'nextpay';
}

export interface KycGetIbanRequest {
	iban: string;
}

export interface KycGetIbanResponse {
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
	gateway?: 'zibal' | 'nextpay';
}

export interface KycGatewayConfig {
	zibalToken: string;
	nextPayToken: string;
	timeout?: number;
	preferredGateway?: 'zibal' | 'nextpay' | 'random';
}

type GatewayType = 'zibal' | 'nextpay';

class KycGatewayService {
	private zibalService: ReturnType<typeof createZibalService>;
	private nextPayService: ReturnType<typeof createNextPayService>;
	private preferredGateway: 'zibal' | 'nextpay' | 'random';

	constructor(config: KycGatewayConfig) {
		this.zibalService = createZibalService(config.zibalToken, {
			timeout: config.timeout
		});
		this.nextPayService = createNextPayService(config.nextPayToken, {
			timeout: config.timeout
		});
		this.preferredGateway = config.preferredGateway || 'random';
	}

	/**
	 * Get random gateway order or use preferred gateway
	 */
	private getGatewayOrder(): GatewayType[] {
		if (this.preferredGateway === 'zibal') {
			return ['zibal', 'nextpay'];
		} else if (this.preferredGateway === 'nextpay') {
			return ['nextpay', 'zibal'];
		} else {
			// Random order
			return Math.random() < 0.5 ? ['zibal', 'nextpay'] : ['nextpay', 'zibal'];
		}
	}

	/**
	 * Execute method with failover logic
	 */
	private async executeWithFailover<T>(
		methodName: 'checkMobile' | 'checkNid' | 'getIban',
		request: any,
		timeout?: number
	): Promise<T> {
		const gatewayOrder = this.getGatewayOrder();
		const errors: { gateway: GatewayType; error: string }[] = [];

		for (const gateway of gatewayOrder) {
			try {
				let result: any;

				if (gateway === 'zibal') {
					result = await this.zibalService[methodName](request, timeout);
				} else {
					result = await this.nextPayService[methodName](request, timeout);
				}

				// If the request was successful, add gateway info and return
				if (result.success) {
					return {
						...result,
						gateway
					} as T;
				}

				// If not successful, treat as error and try next gateway
				errors.push({
					gateway,
					error: result.error || result.message || 'Unknown error'
				});
			} catch (error) {
				errors.push({
					gateway,
					error: error instanceof Error ? error.message : 'Unknown error'
				});
			}
		}

		// If both gateways failed, throw an error with details
		const errorMessage = `All gateways failed for ${methodName}: ${errors
			.map((e) => `${e.gateway}: ${e.error}`)
			.join(', ')}`;

		throw new Error(errorMessage);
	}

	/**
	 * Check mobile number validity with failover
	 */
	async checkMobile(
		request: KycCheckMobileRequest,
		timeout?: number
	): Promise<KycCheckMobileResponse> {
		return this.executeWithFailover<KycCheckMobileResponse>('checkMobile', request, timeout);
	}

	/**
	 * Check national ID validity with failover
	 */
	async checkNid(request: KycCheckNidRequest, timeout?: number): Promise<KycCheckNidResponse> {
		return this.executeWithFailover<KycCheckNidResponse>('checkNid', request, timeout);
	}

	/**
	 * Get IBAN information with failover
	 */
	async getIban(request: KycGetIbanRequest, timeout?: number): Promise<KycGetIbanResponse> {
		return this.executeWithFailover<KycGetIbanResponse>('getIban', request, timeout);
	}
}

// Factory function to create KYC gateway service
export const createKycGatewayService = (config: KycGatewayConfig): KycGatewayService => {
	return new KycGatewayService(config);
};

// Helper function to create service with environment variables
export const createKycGatewayServiceFromEnv = (
	config?: Partial<KycGatewayConfig>
): KycGatewayService => {
	const zibalToken = process.env.ZIBAL_TOKEN;
	const nextPayToken = process.env.NEXTPAY_TOKEN;

	if (!zibalToken) {
		throw new Error('ZIBAL_TOKEN environment variable is required');
	}

	if (!nextPayToken) {
		throw new Error('NEXTPAY_TOKEN environment variable is required');
	}

	return createKycGatewayService({
		zibalToken,
		nextPayToken,
		...config
	});
};

export default KycGatewayService;
