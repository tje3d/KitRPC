<script lang="ts">
	import { Button } from '$lib/kit';
	import SubmitKycStep2MediaProvider from '$lib/providers/SubmitKycStep2MediaProvider.svelte';
	import { createEventDispatcher } from 'svelte';

	export let fileType: 'signedImage' | 'selfie' | 'nationalIdImage';
	export let title: string;
	export let description: string = '';
	export let disabled: boolean = false;
	export let uploadDisabled: boolean = false;
	export let onUploadSuccess: () => void = () => {};
	export let acceptedFileTypes: string = 'image/*';
	export let maxFileSize: string = '5MB';

	const dispatch = createEventDispatcher();

	// File state
	let file: File | null = null;
	let preview: string | null = null;
	let fileInputElement: HTMLInputElement;

	// Handle file changes for previews
	function handleFileChange(selectedFile: File | null) {
		file = selectedFile;
		if (selectedFile) {
			preview = URL.createObjectURL(selectedFile);
		} else {
			preview = null;
		}
		dispatch('fileChange', selectedFile);
	}

	// Handle file input change
	function handleFileInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const selectedFile = input.files[0];
			handleFileChange(selectedFile);
		} else {
			handleFileChange(null);
		}
	}

	// Handle file upload
	function handleUpload(submitKycStep2MediaFormData: Function) {
		if (!file) return;
		submitKycStep2MediaFormData(file, fileType);
	}

	// Clear file
	function clearFile() {
		file = null;
		preview = null;
		if (fileInputElement) {
			fileInputElement.value = '';
		}
		dispatch('fileChange', null);
	}

	// Open file selector
	function openFileSelector() {
		if (disabled || uploadDisabled) return;
		fileInputElement?.click();
	}

	// Format file size for display
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	// Check if file is an image
	function isImageFile(): boolean {
		if (!file) return false;
		return file.type.startsWith('image/');
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
			? 'آپلود سند'
			: fileType === 'selfie'
				? 'آپلود سلفی'
				: 'آپلود کارت';
	})();
</script>

<SubmitKycStep2MediaProvider
	let:submitKycStep2Media
	let:submitKycStep2MediaFormData
	let:loading
	let:errorMessage
	onSuccess={() => {
		onUploadSuccess();
		clearFile();
	}}
>
	<div
		class="flex items-center gap-4 rounded-lg border p-4 transition-all duration-200"
		class:border-gray-200={!disabled}
		class:bg-white={!disabled}
		class:border-gray-300={disabled}
		class:bg-gray-50={disabled}
		class:opacity-60={disabled}
	>
		<!-- File Info Section -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-3">
				<div class="flex-shrink-0">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg"
						class:bg-blue-100={!disabled && !file}
						class:bg-green-100={!disabled && file}
						class:bg-gray-200={disabled}
					>
						<span
							class="h-5 w-5"
							class:icon-[heroicons--document-arrow-up]={!file}
							class:icon-[heroicons--check-circle]={file && !disabled}
							class:text-blue-600={!disabled && !file}
							class:text-green-600={!disabled && file}
							class:text-gray-400={disabled}
						></span>
					</div>
				</div>
				<div class="flex-1 min-w-0">
					<h4
						class="font-medium truncate"
						class:text-gray-900={!disabled}
						class:text-gray-500={disabled}
					>
						{title}
					</h4>
					{#if file}
						<p class="text-sm text-gray-500 truncate">
							{file.name} • {formatFileSize(file.size)}
						</p>
					{:else if description}
						<p
							class="text-sm truncate"
							class:text-gray-600={!disabled}
							class:text-gray-400={disabled}
						>
							{description}
						</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Preview Section -->
		{#if file && preview && isImageFile()}
			<div class="flex-shrink-0">
				<div class="h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
					<img
						src={preview}
						alt="پیش‌نمایش {title}"
						class="h-full w-full object-cover"
					/>
				</div>
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="flex items-center gap-2 flex-shrink-0">
			{#if !file}
				<!-- Select File Button -->
				<Button
					on:click={openFileSelector}
					variant="outline"
					size="sm"
					disabled={disabled || uploadDisabled}
					className="px-3 py-2"
				>
					<span class="icon-[heroicons--folder-open] ml-1 h-4 w-4"></span>
					انتخاب فایل
				</Button>
			{:else}
				<!-- Upload Button -->
				<Button
					on:click={() => handleUpload(submitKycStep2MediaFormData)}
					variant="primary"
					size="sm"
					{loading}
					disabled={disabled || uploadDisabled || !file}
					className="px-3 py-2"
				>
					{#if uploadDisabled}
						<span class="icon-[heroicons--check] ml-1 h-4 w-4"></span>
					{:else}
						<span class="icon-[heroicons--cloud-arrow-up] ml-1 h-4 w-4"></span>
					{/if}
					{uploadButtonText}
				</Button>

				<!-- Clear Button -->
				{#if !uploadDisabled}
					<button
						on:click={clearFile}
						class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						disabled={disabled || loading}
						title="حذف فایل"
					>
						<span class="icon-[heroicons--x-mark] h-4 w-4"></span>
					</button>
				{/if}
			{/if}
		</div>

		<!-- Hidden File Input -->
		<input
			bind:this={fileInputElement}
			type="file"
			class="hidden"
			accept={acceptedFileTypes}
			on:change={handleFileInputChange}
			disabled={disabled || uploadDisabled}
			aria-label="انتخاب فایل {title}"
		/>
	</div>

	<!-- Error Message -->
	{#if errorMessage}
		<div class="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
			<div class="flex items-center">
				<span class="icon-[heroicons--exclamation-triangle] ml-2 h-4 w-4 text-red-500"></span>
				<span class="text-sm text-red-700">{errorMessage}</span>
			</div>
		</div>
	{/if}
</SubmitKycStep2MediaProvider>