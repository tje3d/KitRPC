<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';

	type ResponseData = RouterOutputs['capacity']['getStats'];

	// Props
	export let onSuccess: ((data: ResponseData | undefined) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting system capacity stats
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn(() => {
			return trpc(page).capacity.getStats.query();
		}),
		{
			initialData: [],
			requestOnSubscribe: true
		}
	);

	// Actions
	export function getStats() {
		trigger.next(undefined);
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
	capacityStats={$responseSuccess}
	{clearError}
	{getStats}
/>
