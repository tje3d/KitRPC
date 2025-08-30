<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';

	type ResponseData = RouterOutputs['usdtPrice']['getCurrentUsdtPrice'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting current USDT price
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn(() => {
			return trpc(page).usdtPrice.getCurrentUsdtPrice.query();
		}),
		{
			initialData: null,
			requestOnSubscribe: true
		}
	);

	// Actions
	export function getCurrentUsdtPrice() {
		trigger.next(undefined);
	}

	subscribe(responseSuccess, (result) => {
		if (result !== undefined) {
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
	currentPrice={$responseSuccess}
	{clearError}
	{getCurrentUsdtPrice}
/>
