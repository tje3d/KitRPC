<script lang="ts">
	/**
	 * @component PendingStatus
	 * A reusable component to display a pending status message with an icon.
	 * Used to indicate that a process is in progress and awaiting completion.
	 */

	export let title: string = 'Verification in Progress';
	export let message: string = 'Your KYC verification is currently under review. Please wait for approval.';
	export let stepInfo: string | undefined = undefined;
</script>

<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
	<div class="flex flex-col items-center justify-center">
		<span class="icon-[heroicons--clock] mb-3 h-12 w-12 text-yellow-500"></span>
		<h3 class="mb-2 text-lg font-medium text-yellow-800">{title}</h3>
		<p class="text-yellow-700">{message}</p>
		{#if stepInfo}
			<p class="mt-2 text-yellow-700">{stepInfo}</p>
		{/if}
	</div>
</div>