<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = NonNullable<RouterInputs['transactions']['getHistory']>;
	type ResponseData = RouterOutputs['transactions']['getHistory'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for fetching transaction history
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((filters: RequestParams) => {
			return trpc(page).transactions.getHistory.query(filters);
		})
	);

	$: totalCount = $responseSuccess?.totalCount || 0;
	$: transactions = $responseSuccess?.transactions.map((r) => ({
		...r,
		createdAt: new Date(r.createdAt),
		updatedAt: new Date(r.updatedAt)
	}));

	// Actions
	export function getHistory(filters: RequestParams) {
		trigger.next(filters);
	}

	subscribe(responseSuccess, (r) => {
		if (!r) return;

		onSuccess?.(r);
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
	{totalCount}
	{transactions}
	{clearError}
	{getHistory}
/>
