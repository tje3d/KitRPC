import { loadFromLocalStorage, saveToLocalStorage } from '$lib/helpers/localStorage.helper';
import { SvelteSubject, shareIt } from '$lib/helpers/rxjs.helper';
import { TRPCClientError } from '@trpc/client';
import {
	EMPTY,
	Observable,
	Subject,
	TimeoutError,
	catchError,
	distinctUntilChanged,
	filter,
	finalize,
	from,
	map,
	merge,
	of,
	pipe,
	retry,
	startWith,
	switchMap,
	tap,
	throwError,
	timeout,
	timer
} from 'rxjs';

// ─── Types and Interfaces ─────────────────────────────────────────────────────

export type TrpcRequestFunction<TParams, TResponse> = (params: TParams) => Promise<TResponse>;

export interface TrpcRequestWrapOptions {
	interval?: number;
	retryDelay?: number;
	cacheResponse?: boolean;
	startWithCache?: boolean;
	localStorageKey?: string;
	requestOnSubscribe?: boolean;
	retryCount?: number;
	retryMaxDelay?: number;
	global?: boolean;
	validateResponse?: (response: any) => boolean;
	shouldTrigger?: Observable<boolean>;
	initialData?: any;
	extractErrorMessage?: (error: TRPCClientError<any>) => string | undefined;
	timeout?: number; // Timeout in milliseconds
}

// ─── Global Subjects ──────────────────────────────────────────────────────────

export const trpcNetworkErrors$ = new Subject<TRPCClientError<any>>();
export const trpcApiResponses$ = new Subject<any>();

// ─── Error Handling Utilities ────────────────────────────────────────────────

function isTrpcRetriableError(error: TRPCClientError<any>): boolean {
	// Retry on network errors or server errors (5xx)
	return (
		error.data?.code === 'INTERNAL_SERVER_ERROR' ||
		error.data?.httpStatus >= 500 ||
		!error.data?.httpStatus // Network error
	);
}

function incrementalTrpcRetry<T>(count: number, delay: number, maxDelay: number) {
	return retry<T>({
		count,
		delay: (_, attempt) =>
			timer(Math.min(delay * Math.pow(2, attempt - 1), maxDelay)).pipe(map(() => attempt + 1))
	});
}

function retryOnTrpcRetriable<T>(count: number, delay: number, maxDelay: number) {
	return pipe(
		catchError((e: TRPCClientError<any>) => {
			trpcNetworkErrors$.next(e);
			return isTrpcRetriableError(e) ? throwError(() => e) : of(e as any);
		}),
		incrementalTrpcRetry<T>(count, delay, maxDelay)
	);
}

// ─── tRPC Request Wrapper Class ───────────────────────────────

export class TrpcRequestWrap<TParams, TResponse> {
	readonly loading = new SvelteSubject<boolean>(false);
	readonly trigger = new Subject<TParams>();
	readonly response$: Observable<TResponse | undefined>;
	readonly errorMessage: Observable<string | undefined>;
	readonly responseSuccess: Observable<TResponse | undefined>;
	readonly error$: Observable<TRPCClientError<any> | undefined>;

	private readonly clearErrorSubject = new Subject<undefined>();

	private readonly defaultOptions = {
		retryDelay: 3000,
		retryCount: 3,
		retryMaxDelay: 60 * 1000,
		cacheResponse: false,
		startWithCache: false,
		requestOnSubscribe: false,
		global: false,
		timeout: 60000 // 60 seconds default timeout
	};

	constructor(
		private requestFn: TrpcRequestFunction<TParams, TResponse>,
		private options: TrpcRequestWrapOptions = {}
	) {
		const mergedOptions = { ...this.defaultOptions, ...options };
		const {
			interval,
			retryDelay,
			retryCount,
			retryMaxDelay,
			cacheResponse,
			startWithCache,
			localStorageKey,
			requestOnSubscribe,
			global,
			validateResponse,
			shouldTrigger,
			initialData,
			extractErrorMessage,
			timeout: timeoutMs
		} = mergedOptions;

		const requestTrigger$ = this.createRequestTrigger(
			initialData,
			requestOnSubscribe,
			shouldTrigger
		);
		this.response$ = this.setupResponseStream(requestTrigger$, {
			interval,
			retryDelay,
			retryCount,
			retryMaxDelay,
			cacheResponse,
			startWithCache,
			localStorageKey,
			shouldTrigger,
			global,
			timeout: timeoutMs
		});

		this.responseSuccess = this.setupSuccessStream(validateResponse, extractErrorMessage);
		this.errorMessage = this.setupErrorStream(extractErrorMessage);
		this.error$ = this.setupErrorObjectStream();
	}

	// ─── Public Methods ────────────────────────────────────────────────────────

	request = (params: TParams) => {
		this.trigger.next(params);
	};

	/**
	 * Clears any existing error state by emitting undefined to the response stream
	 * This will reset both errorMessage and error$ observables
	 */
	clearError = () => {
		this.clearErrorSubject.next(undefined);
	};

	// ─── Stream Setup Methods ──────────────────────────────────────────────────

	private createRequestTrigger(
		initialData: any,
		requestOnSubscribe: boolean,
		shouldTrigger?: Observable<boolean>
	): Observable<TParams> {
		return this.trigger.pipe(
			requestOnSubscribe
				? startWith((typeof initialData !== 'undefined' ? initialData : null) as any)
				: pipe(),
			switchMap((params) =>
				shouldTrigger
					? shouldTrigger.pipe(
							filter((v) => !!v),
							map(() => params),
							distinctUntilChanged()
						)
					: of(params)
			)
		);
	}

	private setupResponseStream(
		requestTrigger$: Observable<TParams>,
		options: Partial<TrpcRequestWrapOptions>
	): Observable<TResponse | undefined> {
		return requestTrigger$.pipe(
			tap(() => this.loading.next(true)),
			switchMap((params) => this.createRequestStream(params, options)),
			shareIt(!options.global)
		);
	}

	private createRequestStream(
		params: TParams,
		options: Partial<TrpcRequestWrapOptions>
	): Observable<TResponse | undefined> {
		let source$ = this.createBaseRequestStream(params, options);

		if (options.cacheResponse) {
			source$ = this.applyCaching(source$, options.localStorageKey);
		}

		if (options.startWithCache) {
			source$ = this.applyInitialCache(source$);
		}

		return source$.pipe(
			options.interval
				? tap(() => this.loading.next(false))
				: finalize(() => this.loading.next(false)),
			catchError((err) => {
				this.loading.next(false);
				// Handle timeout errors specifically
				if (err instanceof TimeoutError) {
					const timeoutError = new TRPCClientError('Request timeout', {
						result: {
							error: {
								code: 'TIMEOUT',
								message: 'Request timeout',
								data: {
									code: 'TIMEOUT',
									httpStatus: 408
								}
							}
						}
					});
					return of(timeoutError as any);
				}
				return from(this.loadInitialCache()).pipe(catchError(() => of(undefined)));
			})
		);
	}

	private createBaseRequestStream(
		params: TParams,
		options: Partial<TrpcRequestWrapOptions>
	): Observable<TResponse> {
		const request$ = () =>
			from(this.requestFn(params)).pipe(
				timeout(options.timeout!), // Apply timeout to the request
				retryOnTrpcRetriable(options.retryCount!, options.retryDelay!, options.retryMaxDelay!),
				tap((v) => trpcApiResponses$.next(v))
			);

		if (options.interval) {
			const interval$ = timer(0, options.interval);
			if (options.shouldTrigger) {
				return options.shouldTrigger.pipe(
					switchMap((trigger) => (trigger ? interval$.pipe(switchMap(() => request$())) : EMPTY))
				);
			} else {
				return interval$.pipe(switchMap(() => request$()));
			}
		} else {
			return request$();
		}
	}

	private setupSuccessStream(
		validateResponse?: (response: any) => boolean,
		extractErrorMessage?: (error: TRPCClientError<any>) => string | undefined
	): Observable<TResponse | undefined> {
		return this.response$.pipe(
			map((response) => {
				if (!response) return undefined;
				if (response instanceof TRPCClientError) return undefined;

				if (validateResponse && !validateResponse(response)) {
					return undefined;
				}

				return response;
			}),
			shareIt()
		);
	}

	private setupErrorStream(
		extractErrorMessage?: (error: TRPCClientError<any>) => string | undefined
	): Observable<string | undefined> {
		const errorMessageFromResponse$ = this.response$.pipe(
			map((response) => {
				if (!response) {
					return 'Connection error. Please check your internet connection';
				}

				if (response instanceof TRPCClientError) {
					return this.extractTrpcErrorMessage(response, extractErrorMessage);
				}

				return undefined;
			})
		);

		// Merge error message stream with clear error stream
		return merge(errorMessageFromResponse$, this.clearErrorSubject).pipe(
			map((value) => {
				// If clearErrorSubject emits undefined, clear the error message
				if (value === undefined) {
					return undefined;
				}
				// Otherwise return the error message as is
				return value as string | undefined;
			})
		);
	}

	private setupErrorObjectStream(): Observable<TRPCClientError<any> | undefined> {
		const errorFromResponse$ = this.response$.pipe(
			map((response) => {
				if (response instanceof TRPCClientError) {
					return response;
				}
				return undefined;
			})
		);

		// Merge error stream with clear error stream
		return merge(errorFromResponse$, this.clearErrorSubject).pipe(
			map((value) => {
				// If clearErrorSubject emits undefined, clear the error
				if (value === undefined) {
					return undefined;
				}
				// Otherwise return the error as is
				return value as TRPCClientError<any> | undefined;
			}),
			shareIt()
		);
	}

	// ─── Caching Methods ───────────────────────────────────────────────────────

	private applyCaching(
		source$: Observable<TResponse>,
		localStorageKey?: string
	): Observable<TResponse> {
		return source$.pipe(
			tap((result) => {
				if (result instanceof TRPCClientError) {
					return;
				}

				if (localStorageKey) {
					saveToLocalStorage(localStorageKey, result);
				}
			})
		);
	}

	private applyInitialCache(source$: Observable<TResponse>): Observable<TResponse> {
		return source$.pipe(
			startWith(undefined),
			switchMap((result) => {
				if (result) return of(result);
				return from(this.loadInitialCache()).pipe(
					switchMap((cached) => of(result).pipe(startWith(cached)))
				);
			}),
			filter((data): data is TResponse => !!data)
		);
	}

	private async loadInitialCache(): Promise<TResponse | undefined> {
		const localStorageKey = this.options.localStorageKey;
		if (!localStorageKey) return undefined;

		const cachedData = await loadFromLocalStorage<TResponse>(localStorageKey);
		return cachedData ?? undefined;
	}

	// ─── Error Handling Methods ────────────────────────────────────────────────

	private extractTrpcErrorMessage(
		error: TRPCClientError<any>,
		customExtractor?: (error: TRPCClientError<any>) => string | undefined
	): string | undefined {
		// Use custom extractor if provided
		if (customExtractor) {
			const customMessage = customExtractor(error);
			if (customMessage) return customMessage;
		}

		// Handle tRPC specific error codes
		switch (error.data?.code) {
			case 'UNAUTHORIZED':
				return 'You are not authorized to perform this action. Please log in';
			case 'FORBIDDEN':
				return 'You do not have permission to perform this action';
			case 'NOT_FOUND':
				return 'The requested information was not found';
			case 'CONFLICT':
				return 'Data conflict. Please try again';
			case 'BAD_REQUEST':
				return 'Invalid data provided';
			case 'TIMEOUT':
				return 'Request timed out. Please try again';
			case 'TOO_MANY_REQUESTS':
				return 'Too many requests. Please wait a moment';
			case 'INTERNAL_SERVER_ERROR':
				return 'Internal server error. Please try again later';
			case 'PARSE_ERROR':
				return 'Error processing data';
			default:
				break;
		}

		// Try to extract message from error
		if (error.message) {
			return error.message;
		}

		// Try to extract message from shape
		if (error.shape?.message) {
			return error.shape.message;
		}

		// Fallback to generic error message
		return 'An unexpected error occurred. Please try again';
	}
}

// ─── Helper Functions ──────────────────────────────────────────────────────

/**
 * Creates a new TrpcRequestWrap instance for managing tRPC requests
 * @param requestFn - Function that performs the actual tRPC request
 * @param options - Configuration options for the request wrapper
 * @returns A new TrpcRequestWrap instance
 */
export function useTrpcRequest<TParams, TResponse>(
	requestFn: TrpcRequestFunction<TParams, TResponse>,
	options: TrpcRequestWrapOptions = {}
): TrpcRequestWrap<TParams, TResponse> {
	return new TrpcRequestWrap<TParams, TResponse>(requestFn, options);
}

/**
 * Helper to create a tRPC request function from a tRPC procedure
 * @param procedure - The tRPC procedure (query or mutation)
 * @returns A function that can be used with useTrpcRequest
 */
export function createTrpcRequestFn<TParams, TResponse>(
	procedure: (input: TParams) => Promise<TResponse>
): TrpcRequestFunction<TParams, TResponse> {
	return procedure;
}

/**
 * Helper to create a parameterless tRPC request function
 * @param procedure - The tRPC procedure that takes no parameters
 * @returns A function that can be used with useTrpcRequest
 */
export function createTrpcRequestFnNoParams<TResponse>(
	procedure: () => Promise<TResponse>
): TrpcRequestFunction<void, TResponse> {
	return () => procedure();
}
