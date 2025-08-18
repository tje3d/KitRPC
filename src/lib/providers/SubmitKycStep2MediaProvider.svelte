<script lang="ts">
	import { page } from '$app/state';
	import { uploadFileWithXhr } from '$lib/helpers/fileUpload.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { Subject } from 'rxjs';

	type RequestParams = RouterInputs['kyc']['submitKycStep2Media'];
	type ResponseData = RouterOutputs['kyc']['submitKycStep2Media'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for submitting KYC step 2 media
	const { clearError, errorMessage, loading, request, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).kyc.submitKycStep2Media.mutate(input);
		})
	);

	// Custom subjects for FormData upload
	const uploadFormDataResponseSuccess = new Subject<ResponseData | undefined>();
	const uploadFormDataErrorMessage = new Subject<string | undefined>();

	// Custom XHR request for FormData upload using the helper
	async function submitKycStep2MediaWithFormData(formData: FormData): Promise<ResponseData> {
		return uploadFileWithXhr<ResponseData>(formData, '/api/kyc.submitKycStep2Media');
	}

	// Actions
	export function submitKycStep2Media(input: RequestParams) {
		request(input);
	}

	export async function submitKycStep2MediaFormData(
		file: File,
		fileType: RequestParams['fileType']
	) {
		try {
			loading.set(true);
			clearError();
			const formData = new FormData();
			formData.append('file', file);
			formData.append('fileType', fileType);
			const result = await submitKycStep2MediaWithFormData(formData);
			uploadFormDataResponseSuccess.next(result);
			onSuccess?.(result);
		} catch (error: any) {
			const errorMessage = error.message || 'بارگذاری سند KYC ناموفق بود';
			uploadFormDataErrorMessage.next(errorMessage);
			onError?.(errorMessage);
		} finally {
			loading.set(false);
		}
	}

	subscribe(responseSuccess, (result) => {
		if (!result) return;

		onSuccess?.(result);
	});

	subscribe(errorMessage, (message) => {
		if (!message) return;

		onError?.(message);
	});

	// Subscribe to custom FormData upload subjects
	subscribe(uploadFormDataResponseSuccess, (result) => {
		if (!result) return;
		onSuccess?.(result);
	});

	subscribe(uploadFormDataErrorMessage, (message) => {
		if (!message) return;
		onError?.(message);
	});
</script>

<slot
	response={$responseSuccess}
	loading={$loading}
	errorMessage={$errorMessage}
	{clearError}
	{submitKycStep2Media}
	{submitKycStep2MediaFormData}
/>
