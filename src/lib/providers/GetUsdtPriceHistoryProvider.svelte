<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';

	type ResponseData = RouterOutputs['usdtPrice']['getUsdtPriceHistory'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting USDT price history
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: { limit?: number; offset?: number } = {}) => {
			return trpc(page).usdtPrice.getUsdtPriceHistory.query(input);
		}),
		{
			initialData: { prices: [], totalCount: 0 },
			requestOnSubscribe: true
		}
	);

	// Actions
	export function getUsdtPriceHistory(input: { limit?: number; offset?: number } = {}) {
		trigger.next(input);
	}

	subscribe(responseSuccess, (result) => {
		if (result) {
			onSuccess?.(result);
		}
	});

	subscribe(errorMessage, (message) => {
		if (!message) return;

		onError?.(message);
	});
</script>

<slot
	response={$responseSuccess}
	loading={$loading}
	errorMessage={$errorMessage}
	priceHistory={$responseSuccess}
	{clearError}
	{getUsdtPriceHistory}
/>
