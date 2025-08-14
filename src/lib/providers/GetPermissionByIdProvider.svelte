<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['permissions']['getPermissionById'];
	type ResponseData = RouterOutputs['permissions']['getPermissionById'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting permission by ID
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).permissions.getPermissionById.query(input);
		})
	);

	// Actions
	export function getPermissionById(input: RequestParams) {
		trigger.next(input);
	}

	subscribe(responseSuccess, (result) => {
		if (!result) return;

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
	{clearError}
	{getPermissionById}
/>