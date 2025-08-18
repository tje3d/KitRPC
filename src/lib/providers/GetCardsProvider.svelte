<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['bankCards']['getCards'];
	type ResponseData = RouterOutputs['bankCards']['getCards'];

	// Props
	export let onSuccess: ((data: ResponseData | undefined) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting cards
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).bankCards.getCards.query();
		}),
		{
			initialData: [],
			requestOnSubscribe: true
		}
	);

	// Actions
	export function getCards() {
		trigger.next();
	}

	subscribe(responseSuccess, (result) => {
		onSuccess?.(Array.isArray(result) ? result : undefined);
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
	cards={$responseSuccess}
	{clearError}
	{getCards}
/>
