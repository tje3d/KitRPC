<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs } from '$lib/trpc/router';

	export let onLoggedIn: (user: App.AuthUser, token: string) => void;

	type RequestParams = RouterInputs['auth']['login'];

	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).auth.login.mutate(input);
		})
	);

	subscribe(responseSuccess, (result) => {
		if (!result) return;

		onLoggedIn(result.user, result.token);
	});

	function login(input: RequestParams) {
		trigger.next(input);
	}
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {login} />
