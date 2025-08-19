<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { map } from 'rxjs';

	type RequestParams = RouterInputs['permissions']['listPermissions'];
	type ResponseData = RouterOutputs['permissions']['listPermissions'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for listing permissions
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).permissions.listPermissions.query(input);
		}),
		{
			initialData: {},
			requestOnSubscribe: true
		}
	);

	const permissions = responseSuccess.pipe(
		map((r) => r?.permissions || []),
		shareIt()
	);

	const pagination = responseSuccess.pipe(
		map((r) => r?.pagination),
		shareIt()
	);

	// Actions
	export function listPermissions(input: RequestParams) {
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
	permissions={$permissions}
	pagination={$pagination}
	{clearError}
	{listPermissions}
/>
