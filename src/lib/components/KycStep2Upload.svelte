<script lang="ts">
	import { Button, ErrorDisplay, KycStatusIndicator } from '$lib/kit';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { slide } from 'svelte/transition';
	import KycFileUploadSection from './KycFileUploadSection.svelte';

	type KycStatus = RouterOutputs['kyc']['getKycStatus'];

	export let kycStatus: KycStatus | undefined;
	export let step2Disabled: boolean;
	export let step2UploadDisabled: boolean;
	export let loading: boolean;
	export let errorMessage: string | undefined;
	export let onFinalize: () => void;
	export let onRefresh: () => void;

	// Collapse state - collapse when step2 is approved or when step1 is not approved
	let isCollapsed = false;
	$: isCollapsed = kycStatus?.step2Status === 'APPROVED' || step2Disabled;

	// State for re-uploading files
	let reUploadingFiles: Record<string, boolean> = {};

	// Function to toggle re-upload mode for a specific file type
	function toggleReUpload(fileType: string) {
		reUploadingFiles[fileType] = !reUploadingFiles[fileType];
		reUploadingFiles = { ...reUploadingFiles };
	}

	// File upload rows data
	const uploadRows = [
		{
			fileType: 'signedImage' as const,
			title: 'سند امضا شده',
			description: 'یک سند امضا شده با تاریخ امروز آپلود کنید',
			icon: 'icon-[heroicons--document-text]',
			getMediaId: (status?: KycStatus) => status?.signedTextMediaId
		},
		{
			fileType: 'selfie' as const,
			title: 'سلفی',
			description: 'یک سلفی واضح از خودتان در حال نگه داشتن کارت ملی آپلود کنید',
			icon: 'icon-[heroicons--camera]',
			getMediaId: (status?: KycStatus) => status?.selfieMediaId
		},
		{
			fileType: 'nationalIdImage' as const,
			title: 'تصویر کارت ملی',
			description: 'یک عکس واضح از کارت ملی خود آپلود کنید',
			icon: 'icon-[heroicons--identification]',
			getMediaId: (status?: KycStatus) => status?.nationalCardMediaId
		}
	];
</script>

<div
	class="overflow-hidden rounded-2xl border shadow-lg transition-all duration-300"
	class:border-gray-200={!step2Disabled}
	class:bg-white={!step2Disabled}
	class:border-gray-300={step2Disabled}
	class:bg-gray-50={step2Disabled}
	class:opacity-60={step2Disabled}
	class:grayscale={step2Disabled}
>
	<!-- Header Section -->
	<div
		class="border-b p-6 transition-all duration-300"
		class:border-gray-100={!step2Disabled}
		class:border-gray-200={step2Disabled}
		class:bg-gradient-to-r={true}
		class:from-green-50={kycStatus?.step2Status === 'APPROVED' && !step2Disabled}
		class:to-emerald-50={kycStatus?.step2Status === 'APPROVED' && !step2Disabled}
		class:from-amber-50={kycStatus?.step2Status === 'PENDING' && !step2Disabled}
		class:to-yellow-50={kycStatus?.step2Status === 'PENDING' && !step2Disabled}
		class:from-purple-50={kycStatus?.step2Status !== 'APPROVED' &&
			kycStatus?.step2Status !== 'PENDING' &&
			!step2Disabled}
		class:to-indigo-50={kycStatus?.step2Status !== 'APPROVED' &&
			kycStatus?.step2Status !== 'PENDING' &&
			!step2Disabled}
		class:from-gray-100={step2Disabled}
		class:to-gray-200={step2Disabled}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
					class:bg-green-500={kycStatus?.step2Status === 'APPROVED'}
					class:bg-amber-500={kycStatus?.step2Status === 'PENDING'}
					class:bg-purple-500={kycStatus?.step2Status !== 'APPROVED' &&
						kycStatus?.step2Status !== 'PENDING'}
					class:bg-gray-400={step2Disabled}
				>
					<span
						class="h-6 w-6 text-white"
						class:icon-[heroicons--check-circle]={kycStatus?.step2Status === 'APPROVED'}
						class:icon-[heroicons--clock]={kycStatus?.step2Status === 'PENDING'}
						class:icon-[heroicons--document-arrow-up]={kycStatus?.step2Status !== 'APPROVED' &&
							kycStatus?.step2Status !== 'PENDING' &&
							!step2Disabled}
						class:icon-[heroicons--lock-closed]={step2Disabled}
					></span>
				</div>
				<div class="mr-4">
					<div class="flex items-center gap-3">
						<h2
							class="text-2xl font-bold transition-colors duration-300"
							class:text-gray-900={!step2Disabled}
							class:text-gray-500={step2Disabled}
						>
							مرحله ۲: آپلود اسناد
						</h2>
						{#if kycStatus && !step2Disabled}
							<KycStatusIndicator status={kycStatus.step2Status} />
						{:else if step2Disabled}
							<span class="rounded-full bg-gray-300 px-2 py-1 text-xs font-medium text-gray-600"
								>غیرفعال</span
							>
						{/if}
					</div>
					<p
						class="mt-1 text-sm transition-colors duration-300"
						class:text-green-700={kycStatus?.step2Status === 'APPROVED' && !step2Disabled}
						class:text-amber-700={kycStatus?.step2Status === 'PENDING' && !step2Disabled}
						class:text-gray-600={kycStatus?.step2Status !== 'APPROVED' &&
							kycStatus?.step2Status !== 'PENDING' &&
							!step2Disabled}
						class:text-gray-500={step2Disabled}
					>
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
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					on:click={() => (isCollapsed = !isCollapsed)}
					class="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
					class:bg-white={!step2Disabled}
					class:text-gray-600={!step2Disabled}
					class:hover:bg-white={!step2Disabled}
					class:hover:text-gray-800={!step2Disabled}
					class:bg-gray-200={step2Disabled}
					class:text-gray-400={step2Disabled}
					class:cursor-not-allowed={step2Disabled}
					title={step2Disabled
						? 'مرحله غیرفعال است'
						: isCollapsed
							? 'نمایش جزئیات'
							: 'مخفی کردن جزئیات'}
					disabled={step2Disabled}
				>
					<span
						class="h-4 w-4 transition-transform duration-200"
						class:icon-[heroicons--chevron-down]={!isCollapsed}
						class:icon-[heroicons--chevron-up]={isCollapsed}
					></span>
				</button>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300"
					class:bg-white={!step2Disabled}
					class:bg-gray-300={step2Disabled}
				>
					<span
						class="text-lg font-bold transition-colors duration-300"
						class:text-gray-700={!step2Disabled}
						class:text-gray-500={step2Disabled}>۲</span
					>
				</div>
			</div>
		</div>
	</div>

	<!-- Collapsible Content -->
	{#if !isCollapsed}
		<div transition:slide={{ duration: 300 }}>
			<!-- Status Alert -->
			{#if step2Disabled}
				<div class="mx-6 mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--information-circle] ml-3 h-6 w-6 text-yellow-600"></span>
						<div>
							<p class="font-medium text-yellow-900">مرحله غیرفعال</p>
							<p class="text-sm text-yellow-700">
								قبل از آپلود اسناد، باید مرحله ۱ را تکمیل کرده باشید.
							</p>
						</div>
					</div>
				</div>
			{:else if kycStatus?.step2Status === 'APPROVED'}
				<div class="mx-6 mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--check-circle] ml-3 h-6 w-6 text-green-600"></span>
						<div>
							<p class="font-medium text-green-900">تأیید موفق</p>
							<p class="text-sm text-green-700">اسناد شما با موفقیت تأیید شد.</p>
						</div>
					</div>
				</div>
			{:else if kycStatus?.step2Status === 'PENDING'}
				<div class="mx-6 mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--clock] ml-3 h-6 w-6 text-amber-600"></span>
						<div>
							<p class="font-medium text-amber-900">در انتظار بررسی</p>
							<p class="text-sm text-amber-700">اسناد شما ارسال شده و در انتظار بررسی است.</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Upload Section -->
			<div class="p-6">
				<div class="mb-6">
					<h3 class="flex items-center gap-2 text-lg font-semibold text-gray-800">
						<span class="icon-[heroicons--cloud-arrow-up] h-5 w-5 text-blue-600"></span>
						آپلود اسناد
					</h3>
					<p class="mt-1 text-sm text-gray-600">
						لطفاً تمام اسناد مورد نیاز را با کیفیت مناسب آپلود کنید
					</p>
				</div>

				<!-- File Upload Rows -->
				<div class="space-y-6">
					{#each uploadRows as row}
						{@const isUploaded = kycStatus && row.getMediaId(kycStatus)}
						<div
							class="rounded-xl border transition-all duration-200"
							class:border-gray-200={!step2Disabled && !isUploaded}
							class:bg-white={!step2Disabled && !isUploaded}
							class:border-green-200={!step2Disabled && isUploaded}
							class:bg-green-50={!step2Disabled && isUploaded}
							class:border-gray-300={step2Disabled}
							class:bg-gray-50={step2Disabled}
							class:opacity-60={step2Disabled}
						>
							<div class="p-6">
								<div class="flex items-start justify-between">
									<div class="flex flex-1 items-start gap-4">
										<!-- Icon -->
										<div
											class="flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
											class:bg-blue-100={!step2Disabled && !isUploaded}
											class:text-blue-600={!step2Disabled && !isUploaded}
											class:bg-green-100={!step2Disabled && isUploaded}
											class:text-green-600={!step2Disabled && isUploaded}
											class:bg-gray-200={step2Disabled}
											class:text-gray-400={step2Disabled}
										>
											<span class="{row.icon} h-6 w-6"></span>
										</div>

										<!-- Content -->
										<div class="flex-1">
											<div class="mb-2 flex items-center gap-3">
												<h4
													class="text-lg font-semibold transition-colors"
													class:text-gray-900={!step2Disabled}
													class:text-gray-500={step2Disabled}
												>
													{row.title}
												</h4>
												{#if isUploaded}
													<div class="flex items-center gap-2">
														<span class="icon-[heroicons--check-circle] h-5 w-5 text-green-600"
														></span>
														<span class="text-sm font-medium text-green-700">آپلود شده</span>
													</div>
												{/if}
											</div>
											<p
												class="mb-4 text-sm transition-colors"
												class:text-gray-600={!step2Disabled}
												class:text-gray-500={step2Disabled}
											>
												{row.description}
											</p>

											<!-- Upload Section or Preview -->
											{#if isUploaded && !reUploadingFiles[row.fileType]}
												<div
													class="flex items-center justify-between rounded-lg border border-green-200 bg-white p-4"
												>
													<div class="flex items-center gap-3">
														<img
															src="/media/{row.getMediaId(kycStatus)}"
															alt={row.title}
															class="h-16 w-16 rounded-lg border border-gray-200 object-cover"
														/>
														<div>
															<p class="font-medium text-gray-900">{row.title}</p>
															<p class="text-sm text-gray-500">فایل آپلود شده</p>
														</div>
													</div>
													<div class="flex items-center gap-3">
														<button
															class="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
															disabled={step2Disabled || step2UploadDisabled}
															on:click={() => toggleReUpload(row.fileType)}
														>
															تغییر فایل
														</button>
													</div>
												</div>
											{:else}
												<div class="space-y-4">
													<KycFileUploadSection
														fileType={row.fileType}
														title=""
														description=""
														disabled={step2Disabled}
														uploadDisabled={step2UploadDisabled}
														onUploadSuccess={() => {
															reUploadingFiles[row.fileType] = false;
															reUploadingFiles = { ...reUploadingFiles };
															onRefresh();
														}}
													/>
													{#if isUploaded && reUploadingFiles[row.fileType]}
														<div class="flex justify-end">
															<button
																class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-700"
																on:click={() => toggleReUpload(row.fileType)}
															>
																لغو
															</button>
														</div>
													{/if}
												</div>
											{/if}
										</div>
									</div>

									<!-- Checkbox -->
									<div class="ms-4">
										<div
											class="flex h-6 w-6 items-center justify-center rounded border-2 transition-colors"
											class:border-green-500={isUploaded && !step2Disabled}
											class:bg-green-500={isUploaded && !step2Disabled}
											class:border-gray-300={!isUploaded || step2Disabled}
											class:bg-gray-100={step2Disabled}
										>
											{#if isUploaded && !step2Disabled}
												<span class="icon-[heroicons--check] h-4 w-4 text-white"></span>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>

				{#if errorMessage}
					<div class="mt-6">
						<ErrorDisplay message={errorMessage} />
					</div>
				{/if}

				<!-- Submit Section -->
				<div class="mt-8 border-t border-gray-200 pt-6">
					<div class="flex justify-end">
						<Button
							on:click={onFinalize}
							{loading}
							variant="primary"
							className="px-8 py-3 text-lg font-medium"
							disabled={step2Disabled ||
								kycStatus?.step2Status === 'PENDING' ||
								kycStatus?.step2Status === 'APPROVED'}
						>
							{#if kycStatus?.step2Status === 'APPROVED'}
								<span class="icon-[heroicons--check] ml-2 h-5 w-5"></span>
								اسناد تأیید شد
							{:else if kycStatus?.step2Status === 'PENDING'}
								<span class="icon-[heroicons--clock] ml-2 h-5 w-5"></span>
								اسناد ارسال شد
							{:else}
								<span class="icon-[heroicons--check-circle] ml-2 h-5 w-5"></span>
								نهایی کردن ارسال
							{/if}
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
