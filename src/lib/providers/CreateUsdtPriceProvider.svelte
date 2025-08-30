<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';

	type ResponseData = RouterOutputs['usdtPrice']['createUsdtPrice'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for creating USDT price
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: { buyPrice: number; sellPrice: number }) => {
			return trpc(page).usdtPrice.createUsdtPrice.mutate(input);
		})
	);

	// Actions
	export function createUsdtPrice(input: { buyPrice: number; sellPrice: number }) {
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
	{clearError}
	{createUsdtPrice}
/>
