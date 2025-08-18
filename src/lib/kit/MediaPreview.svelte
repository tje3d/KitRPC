<script lang="ts">
	/** @type {object} - Media object with id, filename, mimeType, etc. */
	export let media: {
		id: string;
		filename: string;
		mimeType: string;
		originalName: string;
		fileSize: number;
		createdAt: string;
	} | null = null;

	/** @type {string} - Label for the media */
	export let label: string = 'رسانه';

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {string} - Base URL for media files (defaults to /media/) */
	export let baseUrl: string = '/media/';

	/** @type {boolean} - Whether to show download button */
	export let showDownload: boolean = true;

	/** @type {boolean} - Whether to show preview button */
	export let showPreview: boolean = true;

	/** @type {boolean} - Whether to show file info */
	export let showFileInfo: boolean = true;

	/** @type {string} - Custom icon class for file type */
	export let iconClass: string = '';

	// State for preview
	let showPreviewModal = false;

	// Check if media is an image
	function isImage(): boolean {
		if (!media) return false;
		return media.mimeType.startsWith('image/');
	}

	// Check if media is a PDF
	function isPdf(): boolean {
		if (!media) return false;
		return media.mimeType === 'application/pdf';
	}

	// Check if media is a video
	function isVideo(): boolean {
		if (!media) return false;
		return media.mimeType.startsWith('video/');
	}

	// Check if media can be previewed
	function canPreview(): boolean {
		return isImage() || isPdf() || isVideo();
	}

	// Format file size
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	// Get media URL
	function getMediaUrl(): string {
		if (!media) return '';
		return `${baseUrl}${media.id}`;
	}

	// Get file type icon
	function getFileIcon(): string {
		if (iconClass) return iconClass;
		if (isImage()) return 'heroicons--photo';
		if (isPdf()) return 'heroicons--document-text';
		if (isVideo()) return 'heroicons--video-camera';
		return 'heroicons--document';
	}

	// Toggle preview
	function togglePreview(): void {
		showPreviewModal = !showPreviewModal;
	}

	// Format date
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<div class={`mb-4 ${className}`}>
	{#if media}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
			<div class="mb-3 flex items-center">
				<span class={`icon-[${getFileIcon()}] me-2 h-5 w-5 text-gray-500`}></span>
				<div>
					<div class="text-sm font-medium break-all text-gray-900">{media.originalName}</div>
					{#if showFileInfo}
						<div class="text-xs text-gray-500">
							{formatFileSize(media.fileSize)} • {formatDate(media.createdAt)}
						</div>
					{/if}
				</div>
			</div>
			<div class="flex flex-wrap gap-2">
				{#if showDownload}
					<a
						href={getMediaUrl()}
						download={media.originalName}
						class="inline-flex items-center rounded-md bg-white px-3 py-1 text-sm font-medium whitespace-nowrap text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						<span class="icon-[heroicons--arrow-down-tray] me-1 h-4 w-4"></span>
						دانلود
					</a>
				{/if}
				{#if showPreview && canPreview()}
					<button
						on:click={togglePreview}
						class="inline-flex items-center rounded-md bg-white px-3 py-1 text-sm font-medium whitespace-nowrap text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						<span class="icon-[heroicons--eye] me-1 h-4 w-4"></span>
						{showPreviewModal ? 'پنهان کردن' : 'پیش‌نمایش'}
					</button>
				{/if}
			</div>
		</div>

		{#if showPreviewModal && isImage()}
			<div class="mt-4 rounded-lg border border-gray-200 bg-white p-4">
				<h4 class="mb-2 text-sm font-medium text-gray-900">پیش‌نمایش {label}</h4>
				<img
					src={getMediaUrl()}
					alt={media.originalName}
					class="h-auto max-h-96 w-full max-w-full rounded-lg object-contain"
				/>
			</div>
		{/if}

		{#if showPreviewModal && isPdf()}
			<div class="mt-4 rounded-lg border border-gray-200 bg-white p-4">
				<h4 class="mb-2 text-sm font-medium text-gray-900">پیش‌نمایش {label}</h4>
				<iframe
					src={getMediaUrl()}
					class="h-64 w-full rounded-lg sm:h-96"
					title={media.originalName}
				></iframe>
			</div>
		{/if}

		{#if showPreviewModal && isVideo()}
			<div class="mt-4 rounded-lg border border-gray-200 bg-white p-4">
				<h4 class="mb-2 text-sm font-medium text-gray-900">پیش‌نمایش {label}</h4>
				<video src={getMediaUrl()} class="max-h-64 w-full rounded-lg sm:max-h-96" controls>
					<track kind="captions" />
					Your browser does not support the video tag.
				</video>
			</div>
		{/if}
	{:else}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center sm:p-6">
			<span class="icon-[heroicons--document-magnifying-glass] mx-auto mb-2 h-8 w-8 text-gray-400"
			></span>
			<p class="text-sm text-gray-500">{label} آپلود نشده است</p>
		</div>
	{/if}
</div>
