<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { map } from 'rxjs';

	type RequestParams = NonNullable<RouterInputs['transactions']['getHistory']>;
	type ResponseData = RouterOutputs['transactions']['getHistory'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for fetching transaction history
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((filters: RequestParams) => {
			return trpc(page).transactions.getHistory.query(filters);
		}),
		{
			initialData: {},
			requestOnSubscribe: true
		}
	);

	const totalCount = responseSuccess.pipe(
		map((r) => r?.totalCount || 0),
		shareIt()
	);
	const transactions = responseSuccess.pipe(
		map((r) =>
			r?.transactions.map((r) => ({
				...r,
				createdAt: new Date(r.createdAt),
				updatedAt: new Date(r.updatedAt)
			}))
		),
		shareIt()
	);

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
	totalCount={$totalCount}
	transactions={$transactions}
	{clearError}
	{getHistory}
/>
