<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['wallet']['getWalletAddresses'];
	type ResponseData = RouterOutputs['wallet']['getWalletAddresses'];

	// Props
	export let onSuccess: ((data: ResponseData | undefined) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting wallet addresses
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).wallet.getWalletAddresses.query(input);
		}),
		{
			initialData: {},
			requestOnSubscribe: true
		}
	);

	// Actions
	export function getWalletAddresses(input: RequestParams = {}) {
		trigger.next(input);
	}

	subscribe(responseSuccess, (result) => {
		onSuccess?.(result);
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
	wallets={$responseSuccess}
	{clearError}
	{getWalletAddresses}
/>
