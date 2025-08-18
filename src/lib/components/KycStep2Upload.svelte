<script lang="ts">
	import { Button, ErrorDisplay, KycStatusIndicator, MediaPreview } from '$lib/kit';
	import type { RouterOutputs } from '$lib/trpc/router';
	import KycFileUploadSection from './KycFileUploadSection.svelte';

	type KycStatus = RouterOutputs['kyc']['getKycStatus'];

	export let kycStatus: KycStatus | undefined;
	export let step2Disabled: boolean;
	export let step2UploadDisabled: boolean;
	export let loading: boolean;
	export let errorMessage: string | undefined;
	export let onFinalize: () => void;
	export let onRefresh: () => void;
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="flex items-center gap-2 text-xl font-bold text-gray-800">
				مرحله ۲: آپلود اسناد
				{#if step2Disabled}
					<span class="icon-[heroicons--lock-closed] h-5 w-5 text-gray-400"></span>
				{/if}
			</h2>
			<p class="mt-1 text-gray-600">
				{#if step2Disabled}
					برای فعال کردن آپلود اسناد، مرحله ۱ را تکمیل کنید
				{:else if kycStatus?.step2Status === 'PENDING'}
					اسناد شما ارسال شده و در انتظار بررسی است
				{:else if kycStatus?.step2Status === 'APPROVED'}
					اسناد شما تأیید شده است
				{:else}
					لطفاً اسناد مورد نیاز را برای تأیید هویت آپلود کنید
				{/if}
			</p>
		</div>
		{#if kycStatus}
			<KycStatusIndicator status={kycStatus.step2Status} size="md" />
		{/if}
	</div>

	{#if step2Disabled}
		<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
			<div class="flex items-center">
				<span class="icon-[heroicons--information-circle] me-2 h-5 w-5 text-yellow-600"></span>
				<p class="text-sm text-yellow-800">قبل از آپلود اسناد، باید مرحله ۱ را تکمیل کرده باشید.</p>
			</div>
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-6 md:grid-cols-1">
		<KycFileUploadSection
			fileType="signedImage"
			title="سند امضا شده"
			description="یک سند امضا شده با تاریخ امروز آپلود کنید"
			disabled={step2Disabled}
			uploadDisabled={step2UploadDisabled}
			onUploadSuccess={onRefresh}
		/>

		<KycFileUploadSection
			fileType="selfie"
			title="سلفی"
			description="یک سلفی واضح از خودتان در حال نگه داشتن کارت ملی آپلود کنید"
			disabled={step2Disabled}
			uploadDisabled={step2UploadDisabled}
			onUploadSuccess={onRefresh}
		/>

		<KycFileUploadSection
			fileType="nationalIdImage"
			title="تصویر کارت ملی"
			description="یک عکس واضح از کارت ملی خود آپلود کنید"
			disabled={step2Disabled}
			uploadDisabled={step2UploadDisabled}
			onUploadSuccess={onRefresh}
		/>
	</div>

	<!-- Uploaded Files Preview -->
	{#if !step2Disabled && kycStatus}
		<div class="space-y-4">
			<h3 class="text-lg font-medium text-gray-800">اسناد آپلود شده</h3>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<MediaPreview
					media={kycStatus.signedTextMediaId
						? {
								id: kycStatus.signedTextMediaId,
								filename: 'signed-document.jpg',
								mimeType: 'image/jpeg',
								originalName: 'سند امضا شده',
								fileSize: 1024000,
								createdAt: new Date().toISOString()
							}
						: null}
					label="سند امضا شده"
				/>

				<MediaPreview
					media={kycStatus.selfieMediaId
						? {
								id: kycStatus.selfieMediaId,
								filename: 'selfie.jpg',
								mimeType: 'image/jpeg',
								originalName: 'سلفی',
								fileSize: 1024000,
								createdAt: new Date().toISOString()
							}
						: null}
					label="سلفی"
				/>

				<MediaPreview
					media={kycStatus.nationalCardMediaId
						? {
								id: kycStatus.nationalCardMediaId,
								filename: 'national-id.jpg',
								mimeType: 'image/jpeg',
								originalName: 'کارت ملی',
								fileSize: 1024000,
								createdAt: new Date().toISOString()
							}
						: null}
					label="کارت ملی"
				/>
			</div>
		</div>
	{/if}

	{#if errorMessage}
		<ErrorDisplay message={errorMessage} />
	{/if}

	<div class="flex justify-end">
		<Button
			on:click={onFinalize}
			{loading}
			variant="primary"
			disabled={step2Disabled ||
				kycStatus?.step2Status === 'PENDING' ||
				kycStatus?.step2Status === 'APPROVED'}
		>
			نهایی کردن ارسال
		</Button>
	</div>
</div>
