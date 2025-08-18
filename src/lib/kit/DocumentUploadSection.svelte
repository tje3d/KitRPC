<script lang="ts">
	import Button from './Button.svelte';
	import { createEventDispatcher } from 'svelte';

	/** @type {string} - Section title */
	export let title: string = '';

	/** @type {string} - Section description */
	export let description: string = '';

	/** @type {File | null} - Selected file (bound) */
	export let file: File | null = null;

	/** @type {string | null} - File preview URL */
	export let preview: string | null = null;

	/** @type {Function} - Function to handle file selection */
	export let onFileChange: (file: File | null) => void = () => {};

	/** @type {Function} - Function to handle upload */
	export let onUpload: () => void = () => {};

	/** @type {boolean} - Whether the upload is in progress */
	export let loading: boolean = false;

	/** @type {boolean} - Whether the section is disabled */
	export let disabled: boolean = false;

	/** @type {string} - Error message to display */
	export let errorMessage: string = '';

	/** @type {string} - Accepted file types for the input */
	export let acceptedFileTypes: string = 'image/*';

	/** @type {string} - Maximum file size with unit */
	export let maxFileSize: string = '5MB';

	/** @type {string} - Text for the upload button */
	export let uploadButtonText: string = 'Upload';

	// Create event dispatcher
	const dispatch = createEventDispatcher();

	// State for drag and drop
	let isDragOver = false;

	let theEle: HTMLInputElement;

	// Handle file input change
	function handleFileInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const selectedFile = input.files[0];
			file = selectedFile;
			onFileChange(selectedFile);
			dispatch('fileChange', selectedFile);
		} else {
			file = null;
			onFileChange(null);
			dispatch('fileChange', null);
		}
	}

	// Handle drag over event
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	// Handle drag leave event
	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	// Handle drop event
	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		if (disabled || loading) return;

		if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
			const droppedFile = event.dataTransfer.files[0];
			file = droppedFile;
			onFileChange(droppedFile);
			dispatch('fileChange', droppedFile);
		}
	}

	// Handle click on the drop area to trigger file input
	function handleClick() {
		if (disabled || loading) return;
		theEle.click();
	}

	// Format file size for display
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	// Get file type icon based on file type
	function getFileTypeIcon(): string {
		if (!file) return 'icon-[heroicons--document]';
		if (file.type.startsWith('image/')) return 'icon-[heroicons--photo]';
		if (file.type === 'application/pdf') return 'icon-[heroicons--document-text]';
		return 'icon-[heroicons--document]';
	}

	// Check if file is an image
	function isImageFile(): boolean {
		if (!file) return false;
		return file.type.startsWith('image/');
	}

	// Check if file is a PDF
	function isPdfFile(): boolean {
		if (!file) return false;
		return file.type === 'application/pdf';
	}
</script>

<div class="space-y-4 select-none">
	{#if title}
		<h3 class="text-lg font-medium text-gray-900">{title}</h3>
	{/if}

	{#if description}
		<p class="text-gray-600">{description}</p>
	{/if}

	<div class="space-y-6">
		<!-- File Drop Area -->
		<div class="space-y-2">
			<label class="block text-sm font-medium text-gray-700"> فایل سند </label>
			<div
				class={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors duration-200 ease-in-out
					${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
					${disabled || loading ? 'cursor-not-allowed opacity-50' : 'hover:border-gray-400 hover:bg-gray-100'}`}
				on:dragover={handleDragOver}
				on:dragleave={handleDragLeave}
				on:drop={handleDrop}
				on:click={handleClick}
				role="button"
				tabindex={disabled || loading ? -1 : 0}
				aria-disabled={disabled || loading}
				aria-label="Upload document file"
			>
				{#if preview && file}
					<!-- File Preview -->
					<div class="flex h-full w-full items-center justify-center p-2">
						{#if isImageFile()}
							<img
								src={preview}
								alt="Document preview"
								class="max-h-full max-w-full rounded-lg object-contain"
							/>
						{:else if isPdfFile()}
							<div class="flex flex-col items-center">
								<span class="icon-[heroicons--document-text] mb-2 h-12 w-12 text-gray-400"></span>
								<span class="text-sm text-gray-500">پیش‌نمایش سند PDF</span>
							</div>
						{:else}
							<div class="flex flex-col items-center">
								<span class="icon-[{getFileTypeIcon()}] mb-2 h-12 w-12 text-gray-400"></span>
								<span class="text-sm text-gray-500">پیش‌نمایش فایل</span>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Drop Area Content -->
					<div class="flex flex-col items-center justify-center pt-5 pb-6">
						<span class="icon-[heroicons--cloud-arrow-up] mb-3 h-10 w-10 text-gray-400"></span>
						<p class="mb-2 text-sm text-gray-500">
							<span class="font-semibold">برای آپلود کلیک کنید</span> یا بکشید و رها کنید
						</p>
						<p class="text-xs text-gray-500">
							{acceptedFileTypes} (حداکثر {maxFileSize})
						</p>
					</div>
				{/if}
				<input
					bind:this={theEle}
					type="file"
					class="hidden"
					accept={acceptedFileTypes}
					on:change={handleFileInputChange}
					disabled={disabled || loading}
					aria-label="File input"
				/>
			</div>
		</div>

		<!-- File Info and Preview -->
		{#if file}
			<div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<span class={`${getFileTypeIcon()} me-2 h-5 w-5 text-gray-500`}></span>
						<div>
							<div class="max-w-xs truncate text-sm font-medium whitespace-normal text-gray-900">
								{file.name}
							</div>
							<div class="text-xs text-gray-500">
								{formatFileSize(file.size)} • {file.type || 'Unknown type'}
							</div>
						</div>
					</div>
					<button
						on:click={() => {
							file = null;
							onFileChange(null);
							dispatch('fileChange', null);
						}}
						class="rounded-full text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						aria-label="Remove file"
						disabled={disabled || loading}
					>
						<span class="icon-[heroicons--x-mark] h-5 w-5"></span>
					</button>
				</div>
			</div>
		{/if}

		<!-- Error Message -->
		{#if errorMessage}
			<div class="rounded-lg border border-red-200 bg-red-50 p-4">
				<div class="flex items-center">
					<span class="icon-[heroicons--exclamation-triangle] me-2 h-5 w-5 text-red-500"></span>
					<span class="text-red-700">{errorMessage}</span>
				</div>
			</div>
		{/if}

		<!-- Upload Button -->
		<div class="flex justify-end">
			<Button
				on:click={onUpload}
				{loading}
				variant="primary"
				disabled={disabled || !file || loading}
			>
				{uploadButtonText}
			</Button>
		</div>
	</div>
</div>
