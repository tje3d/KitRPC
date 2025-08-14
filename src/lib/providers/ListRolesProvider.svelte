<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { map } from 'rxjs';

	type RequestParams = RouterInputs['roles']['listRoles'];
	type ResponseData = RouterOutputs['roles']['listRoles'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;
	export let requestOnSubscribe: boolean | undefined = undefined;

	// Request for listing roles
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).roles.listRoles.query(input);
		}),
		{
			requestOnSubscribe,
			initialData: requestOnSubscribe
				? {
						limit: 100,
						page: 1
					}
				: undefined
		}
	);

	const roles = responseSuccess.pipe(
		map((r) => r?.roles || []),
		shareIt()
	);

	const pagination = responseSuccess.pipe(
		map((r) => r?.pagination),
		shareIt()
	);

	// Actions
	export function listRoles(input: RequestParams) {
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
	roles={$roles}
	pagination={$pagination}
	{clearError}
	{listRoles}
/>
