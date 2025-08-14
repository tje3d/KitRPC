<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['permissions']['unassignPermissionFromUser'];
	type ResponseData = RouterOutputs['permissions']['unassignPermissionFromUser'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for unassigning permission from user
	const { clearError, errorMessage, loading, request, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).permissions.unassignPermissionFromUser.mutate(input);
		})
	);

	// Actions
	export function unassignPermissionFromUser(input: RequestParams) {
		request(input);
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
	{unassignPermissionFromUser}
/>