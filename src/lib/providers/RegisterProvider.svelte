<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';

	export let onRegistered: (user: App.AuthUser, token: string) => void;

	const { clearError, errorMessage, loading, request, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: { username: string; password: string }) => {
			return trpc(page).auth.register.mutate(input);
		})
	);

	subscribe(responseSuccess, (result) => {
		if (!result) return;

		onRegistered(result.user, result.token);
	});

	function register(input: { username: string; password: string }) {
		request(input);
	}
</script>

<slot loading={$loading} errorMessage={$errorMessage} {clearError} {register} />
