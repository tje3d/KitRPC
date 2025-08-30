<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';

	type ResponseData = RouterOutputs['transactions']['buyUsdt'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for buying USDT
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: { amountUsdt: number }) => {
			return trpc(page).transactions.buyUsdt.mutate(input);
		})
	);

	// Actions
	export function buyUsdt(input: { amountUsdt: number }) {
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
	{buyUsdt}
/>
