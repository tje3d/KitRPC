<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { map, startWith, Subject } from 'rxjs';

	// Types for admin list media
	type AdminListMediaRequestParams = RouterInputs['media']['adminList'];
	type AdminListMediaResponseData = RouterOutputs['media']['adminList'];

	// Types for delete media
	type DeleteMediaRequestParams = RouterInputs['media']['delete'];
	type DeleteMediaResponseData = RouterOutputs['media']['delete'];

	// Types for upload media
	type UploadMediaRequestParams = RouterInputs['media']['upload'];
	type UploadMediaResponseData = RouterOutputs['media']['upload'];
	type UploadMediaFormData = {
		file: File;
		reason: string;
		visibility: string;
	};

	// Props
	export let onSuccess: ((data: AdminListMediaResponseData) => void) | undefined = undefined;
	export let onDeleteSuccess: ((data: DeleteMediaResponseData) => void) | undefined = undefined;
	export let onUploadSuccess: ((data: UploadMediaResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;
	export let onDeleteError: ((error: string) => void) | undefined = undefined;
	export let onUploadError: ((error: string) => void) | undefined = undefined;

	// Request for listing media (admin)
	const {
		clearError: clearListError,
		errorMessage: listErrorMessage,
		loading: listLoading,
		trigger: listTrigger,
		responseSuccess: listResponseSuccess
	} = useTrpcRequest(
		createTrpcRequestFn((input: AdminListMediaRequestParams) => {
			return trpc(page).media.adminList.query(input);
		})
	);

	const media = listResponseSuccess.pipe(
		startWith(undefined),
		map((r) => r?.media || []),
		shareIt()
	);

	const pagination = listResponseSuccess.pipe(
		startWith(undefined),
		map((r) => r?.pagination),
		shareIt()
	);

	// Request for deleting media
	const {
		clearError: clearDeleteError,
		errorMessage: deleteErrorMessage,
		loading: deleteLoading,
		request: deleteRequest,
		responseSuccess: deleteResponseSuccess
	} = useTrpcRequest(
		createTrpcRequestFn((input: DeleteMediaRequestParams) => {
			return trpc(page).media.delete.mutate(input);
		})
	);

	// Request for uploading media
	const {
		clearError: clearUploadError,
		errorMessage: uploadErrorMessage,
		loading: uploadLoading,
		request: uploadRequest,
		responseSuccess: uploadResponseSuccess
	} = useTrpcRequest(
		createTrpcRequestFn((input: UploadMediaRequestParams) => {
			return trpc(page).media.upload.mutate(input);
		})
	);

	// Custom subjects for FormData upload
	const uploadFormDataResponseSuccess = new Subject<UploadMediaResponseData | undefined>();
	const uploadFormDataErrorMessage = new Subject<string | undefined>();

	// Custom XHR request for FormData upload
	async function uploadMediaWithFormData(formData: FormData): Promise<UploadMediaResponseData> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.open('POST', base + '/api/media.upload', true);

			xhr.onload = function () {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve(response.result.data);
					} catch (e) {
						reject(new Error('Failed to parse response'));
					}
				} else {
					try {
						const errorResponse = JSON.parse(xhr.responseText);
						reject(new Error(errorResponse.error?.message || 'Upload failed'));
					} catch (e) {
						reject(new Error('Upload failed'));
					}
				}
			};

			xhr.onerror = function () {
				reject(new Error('Network error'));
			};

			xhr.send(formData);
		});
	}

	// Actions
	export function adminListMedia(input: AdminListMediaRequestParams) {
		listTrigger.next(input);
	}

	export function deleteMedia(input: DeleteMediaRequestParams) {
		deleteRequest(input);
	}

	export function uploadMedia(input: UploadMediaRequestParams) {
		uploadRequest(input);
	}

	export async function uploadMediaFormData(formData: FormData) {
		try {
			uploadLoading.set(true);
			clearUploadError();
			const result = await uploadMediaWithFormData(formData);
			uploadFormDataResponseSuccess.next(result);
			onUploadSuccess?.(result);
		} catch (error: any) {
			const errorMessage = error.message || 'Failed to upload media';
			uploadFormDataErrorMessage.next(errorMessage);
			onUploadError?.(errorMessage);
		} finally {
			uploadLoading.set(false);
		}
	}

	// Subscriptions
	subscribe(listResponseSuccess, (result) => {
		if (!result) return;
		onSuccess?.(result);
	});

	subscribe(deleteResponseSuccess, (result) => {
		if (!result) return;
		onDeleteSuccess?.(result);
	});

	subscribe(uploadResponseSuccess, (result) => {
		if (!result) return;
		onUploadSuccess?.(result);
	});

	subscribe(listErrorMessage, (message) => {
		if (!message) return;
		onError?.(message);
	});

	subscribe(deleteErrorMessage, (message) => {
		if (!message) return;
		onDeleteError?.(message);
	});

	subscribe(uploadErrorMessage, (message) => {
		if (!message) return;
		onUploadError?.(message);
	});

	// Subscribe to custom FormData upload subjects
	subscribe(uploadFormDataResponseSuccess, (result) => {
		if (!result) return;
		onUploadSuccess?.(result);
	});

	subscribe(uploadFormDataErrorMessage, (message) => {
		if (!message) return;
		onUploadError?.(message);
	});
</script>

<slot
	media={$media}
	pagination={$pagination}
	listLoading={$listLoading}
	deleteLoading={$deleteLoading}
	listErrorMessage={$listErrorMessage}
	deleteErrorMessage={$deleteErrorMessage}
	{clearListError}
	{clearDeleteError}
	{clearUploadError}
	{adminListMedia}
	{deleteMedia}
	{uploadMedia}
	{uploadMediaFormData}
	uploadLoading={$uploadLoading}
	uploadErrorMessage={$uploadErrorMessage}
/>
