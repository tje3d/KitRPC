<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['kyc']['getKycDetails'];
	type ResponseData = RouterOutputs['kyc']['getKycDetails'];

	export let kycId: string | undefined = undefined;

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting KYC details
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).kyc.getKycDetails.query(input);
		})
	);

	// Actions
	export function getKycDetails(input: RequestParams) {
		trigger.next(input);
	}

	export function refresh() {
		if (!kycId) return;

		getKycDetails({ kycId });
	}

	$: if (kycId) {
		getKycDetails({ kycId });
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
	{getKycDetails}
	kycDetails={$responseSuccess}
/>
