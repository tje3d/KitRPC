// API Request Helper
// Shared utilities for making HTTP requests with timeout and error handling

// Base error types for network operations
export class NetworkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NetworkError';
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

// Utility function to create fetch with timeout
export const fetchWithTimeout = async (
	url: string,
	options: RequestInit,
	timeoutMs: number = 30000
): Promise<Response> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				throw new NetworkError('Request timeout');
			}
			throw new NetworkError(`Network error: ${error.message}`);
		}
		throw new NetworkError('Unknown network error');
	}
};

// Generic API request builder
export interface ApiRequestConfig {
	baseUrl: string;
	token?: string;
	tokenType?: 'Bearer' | 'Custom';
	tokenField?: string; // For custom token placement in body
	defaultTimeout?: number;
}

export const createApiRequest = (config: ApiRequestConfig) => {
	return async <T>(
		endpoint: string,
		data: Record<string, any>,
		timeoutMs: number = config.defaultTimeout || 30000
	): Promise<T> => {
		if (config.token && config.tokenType === 'Bearer' && !config.token) {
			throw new Error('API token is not set');
		}

		const url = `${config.baseUrl}${endpoint}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};

		// Add authorization header if using Bearer token
		if (config.token && config.tokenType === 'Bearer') {
			headers.Authorization = `Bearer ${config.token}`;
		}

		// Prepare request body
		let requestBody = { ...data };

		// Add token to body if using custom token field
		if (config.token && config.tokenField) {
			requestBody[config.tokenField] = config.token;
		}

		try {
			const response = await fetchWithTimeout(
				url,
				{
					method: 'POST',
					headers,
					body: JSON.stringify(requestBody)
				},
				timeoutMs
			);

			// Parse response regardless of status code
			const responseData = await response.json();
			return responseData as T;
		} catch (error) {
			// Re-throw network errors
			if (error instanceof NetworkError) {
				throw error;
			}
			// Handle JSON parsing errors or other unexpected errors
			throw new NetworkError(
				`Failed to process response: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	};
};

// Export default utilities
export default {
	fetchWithTimeout,
	createApiRequest,
	NetworkError,
	ValidationError
};
