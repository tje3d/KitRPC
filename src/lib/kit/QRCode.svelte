<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	/** @type {string} - Text to encode in the QR code */
	export let text: string = '';

	/** @type {number} - Size of the QR code in pixels */
	export let size: number = 200;

	/** @type {string} - Color of the QR code modules */
	export let color: string = '#000000';

	/** @type {string} - Background color of the QR code */
	export let backgroundColor: string = '#ffffff';

	/** @type {number} - Margin around the QR code */
	export let margin: number = 4;

	/** @type {string} - Error correction level (L, M, Q, H) */
	export let errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M';

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	let qrCodeDataUrl: string = '';
	let error: string = '';

	$: {
		if (text) {
			generateQRCode();
		}
	}

	async function generateQRCode() {
		try {
			qrCodeDataUrl = await QRCode.toDataURL(text, {
				width: size,
				margin,
				color: {
					dark: color,
					light: backgroundColor
				},
				errorCorrectionLevel
			});
			error = '';
		} catch (err) {
			error = 'Failed to generate QR code';
			console.error('QR Code generation error:', err);
		}
	}
</script>

{#if error}
	<div class="text-sm text-red-500">Error: {error}</div>
{:else if qrCodeDataUrl}
	<img
		src={qrCodeDataUrl}
		alt={`QR code for ${text}`}
		class={`block ${className}`}
		width={size}
		height={size}
	/>
{:else}
	<div
		class="rounded-xl border-2 border-dashed bg-gray-200"
		style="width: {size}px; height: {size}px;"
	></div>
{/if}
