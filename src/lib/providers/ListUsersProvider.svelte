<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { map } from 'rxjs';

	type RequestParams = RouterInputs['users']['listUsers'];
	type ResponseData = RouterOutputs['users']['listUsers'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for listing users
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).users.listUsers.query(input);
		})
	);

	const users = responseSuccess.pipe(
		map((r) => r?.users || []),
		shareIt()
	);

	const pagination = responseSuccess.pipe(
		map((r) => r?.pagination),
		shareIt()
	);

	// Actions
	export function listUsers(input: RequestParams) {
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
	users={$users}
	pagination={$pagination}
	{clearError}
	{listUsers}
/>