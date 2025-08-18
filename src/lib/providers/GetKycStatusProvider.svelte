<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['kyc']['getKycStatus'];
	type ResponseData = RouterOutputs['kyc']['getKycStatus'];

	// Props
	export let onSuccess: ((data: ResponseData | undefined) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting KYC status
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).kyc.getKycStatus.query(input);
		}),
		{
			initialData: {},
			requestOnSubscribe: true
		}
	);

	// Actions
	export function getKycStatus(input: RequestParams = {}) {
		trigger.next(input);
	}

	subscribe(responseSuccess, (result) => {
		onSuccess?.(Object.keys(result || {}).length === 0 ? undefined : result);
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
	kycStatus={$responseSuccess}
	{clearError}
	{getKycStatus}
/>
