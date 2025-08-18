<script lang="ts">
	import DocumentUploadSection from '$lib/kit/DocumentUploadSection.svelte';
	import SubmitKycStep2MediaProvider from '$lib/providers/SubmitKycStep2MediaProvider.svelte';

	export let fileType: 'signedImage' | 'selfie' | 'nationalIdImage';
	export let title: string;
	export let description: string;
	export let disabled: boolean = false;
	export let uploadDisabled: boolean = false;
	export let onUploadSuccess: () => void = () => {};

	// File state
	let file: File | null = null;
	let preview: string | null = null;

	// Handle file changes for previews
	function handleFileChange(selectedFile: File | null) {
		file = selectedFile;
		if (selectedFile) {
			preview = URL.createObjectURL(selectedFile);
		} else {
			preview = null;
		}
	}

	// Handle file upload
	function handleUpload(submitKycStep2MediaFormData: Function) {
		if (!file) return;
		// Upload file with FormData using XHR
		submitKycStep2MediaFormData(file, fileType);
	}

	// Get upload button text based on file type and status
	$: uploadButtonText = (() => {
		if (uploadDisabled) {
			return fileType === 'signedImage'
				? 'سند ارسال شد'
				: fileType === 'selfie'
					? 'سلفی ارسال شد'
					: 'کارت ملی ارسال شد';
		}
		return fileType === 'signedImage'
			? 'آپلود سند امضا شده'
			: fileType === 'selfie'
				? 'آپلود سلفی'
				: 'آپلود کارت ملی';
	})();
</script>

<SubmitKycStep2MediaProvider
	let:submitKycStep2Media
	let:submitKycStep2MediaFormData
	let:loading
	let:errorMessage
	onSuccess={() => {
		onUploadSuccess();
	}}
>
	<DocumentUploadSection
		{title}
		{description}
		bind:file
		{preview}
		onFileChange={handleFileChange}
		onUpload={() => handleUpload(submitKycStep2MediaFormData)}
		{loading}
		acceptedFileTypes="image/*"
		maxFileSize="5MB"
		{uploadButtonText}
		disabled={uploadDisabled || disabled}
		{errorMessage}
	/>
</SubmitKycStep2MediaProvider>
