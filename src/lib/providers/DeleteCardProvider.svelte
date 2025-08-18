<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['bankCards']['deleteCard'];
	type ResponseData = RouterOutputs['bankCards']['deleteCard'];

	// Props
	export let onSuccess: ((data: ResponseData | undefined) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for deleting a card
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).bankCards.deleteCard.mutate(input);
		})
	);

	// Actions
	export function deleteCard(input: RequestParams) {
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
	result={$responseSuccess}
	{clearError}
	{deleteCard}
/>
