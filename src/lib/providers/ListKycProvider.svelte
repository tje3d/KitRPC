<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { map } from 'rxjs';

	type RequestParams = RouterInputs['kyc']['listKycRequests'];
	type ResponseData = RouterOutputs['kyc']['listKycRequests'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for listing KYC requests
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).kyc.listKycRequests.query(input);
		}),
		{
			initialData: {},
			requestOnSubscribe: true
		}
	);

	const kycRequests = responseSuccess.pipe(
		map((r) => r?.kycRequests || []),
		shareIt()
	);

	const pagination = responseSuccess.pipe(
		map((r) => {
			if (!r) return undefined;
			const { totalCount, limit, offset } = r;
			return { totalCount, limit, offset };
		}),
		shareIt()
	);

	// Actions
	export function listKycRequests(input: RequestParams) {
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
	kycRequests={$kycRequests}
	pagination={$pagination}
	{clearError}
	{listKycRequests}
/>
