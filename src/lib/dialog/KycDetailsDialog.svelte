<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import Button from '$lib/kit/Button.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import KycStatusIndicator from '$lib/kit/KycStatusIndicator.svelte';
	import MediaPreview from '$lib/kit/MediaPreview.svelte';
	import ApproveKycRequestProvider from '$lib/providers/ApproveKycRequestProvider.svelte';
	import GetKycDetailsProvider from '$lib/providers/GetKycDetailsProvider.svelte';
	import GetMediaByIdProvider from '$lib/providers/GetMediaByIdProvider.svelte';
	import RejectKycRequestProvider from '$lib/providers/RejectKycRequestProvider.svelte';
	import { toast } from '$lib/toast/store';

	// Props
	let { kycId }: { kycId: string } = $props();
</script>

<h3 class="mb-4 text-lg leading-6 font-medium text-gray-900">جزئیات احراز هویت</h3>

<GetKycDetailsProvider
	{kycId}
	let:loading
	let:errorMessage
	let:clearError
	let:kycDetails
	let:refresh
	let:level
	let:isDone
>
	<ApproveKycRequestProvider
		onSuccess={(data) => {
			toast.success(data.message);
			refresh();
		}}
		onError={(message) => {
			toast.error(message || 'تأیید درخواست KYC ناموفق بود');
		}}
		let:loading={approveLoading}
		let:errorMessage={approveErrorMessage}
		let:approveKycRequest
		let:clearError={approveClear}
	>
		<RejectKycRequestProvider
			onSuccess={(data) => {
				toast.success(data.message);
				refresh();
			}}
			onError={(message) => {
				toast.error(message || 'رد درخواست KYC ناموفق بود');
			}}
			let:loading={rejectLoading}
			let:errorMessage={rejectErrorMessage}
			let:rejectKycRequest
			let:clearError={rejectClear}
		>
			{#if errorMessage || approveErrorMessage || rejectErrorMessage}
				<ErrorDisplay
					message={errorMessage || approveErrorMessage || rejectErrorMessage}
					onDismiss={() => {
						clearError();
						approveClear();
						rejectClear();
					}}
				/>

				<div class="mt-4 text-center">
					<Button
						onClick={() => {
							clearError();
							approveClear();
							rejectClear();
							refresh();
						}}>تلاش مجدد</Button
					>
				</div>
			{/if}

			{#if kycDetails}
				<div class="space-y-6">
					<!-- User Information -->
					<div class="rounded-lg bg-gray-50 p-4">
						<h4 class="text-md mb-3 font-medium text-gray-900">اطلاعات کاربر</h4>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<p class="text-sm text-gray-500">نام کاربری</p>
								<p class="text-sm font-medium text-gray-900">
									{kycDetails.username || 'نامشخص'}
								</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">ایمیل</p>
								<p class="text-sm font-medium text-gray-900">
									{kycDetails.email || 'نامشخص'}
								</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">تاریخ ثبت نام</p>
								<p class="text-sm font-medium text-gray-900">
									{kycDetails.userCreatedAt
										? new Date(kycDetails.userCreatedAt).toLocaleDateString('fa-IR')
										: 'نامشخص'}
								</p>
							</div>
						</div>
					</div>

					<!-- KYC Information -->
					<div class="rounded-lg bg-gray-50 p-4">
						<h4 class="text-md mb-3 font-medium text-gray-900">اطلاعات احراز هویت</h4>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<p class="text-sm text-gray-500">کد ملی</p>
								<p class="text-sm font-medium text-gray-900">{kycDetails.nationalId}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">شماره موبایل</p>
								<p class="text-sm font-medium text-gray-900">{kycDetails.mobile}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">تاریخ تولد</p>
								<p class="text-sm font-medium text-gray-900">
									{kycDetails.birthDate
										? new Date(kycDetails.birthDate).toLocaleDateString('fa-IR')
										: 'نامشخص'}
								</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">آخرین بروزرسانی</p>
								<p class="text-sm font-medium text-gray-900">
									{kycDetails.lastStepUpdatedAt
										? new Date(kycDetails.lastStepUpdatedAt).toLocaleDateString('fa-IR')
										: 'نامشخص'}
								</p>
							</div>
						</div>

						{#if kycDetails.adminNotes}
							<div class="mt-4">
								<p class="text-sm text-gray-500">یادداشت‌های مدیر</p>
								<p class="rounded bg-yellow-50 p-2 text-sm font-medium text-gray-900">
									{kycDetails.adminNotes}
								</p>
							</div>
						{/if}
					</div>

					<!-- Media Documents -->
					<div class="rounded-lg bg-gray-50 p-4">
						<h4 class="text-md mb-3 font-medium text-gray-900">مدارک</h4>

						<div class="flex flex-col gap-4">
							<!-- Selfie -->
							<div>
								<h5 class="mb-2 text-sm font-medium text-gray-900">سلفی</h5>
								{#if kycDetails.selfieMediaId}
									<GetMediaByIdProvider
										onError={(message) => {
											toast.error(message || 'دریافت اطلاعات سلفی ناموفق بود');
										}}
										id={kycDetails.selfieMediaId}
										let:response={media}
									>
										{#if !media}
											<div class="flex justify-center py-2">
												<span class="icon-[svg-spinners--bars-scale-fade] h-5 w-5 text-blue-500"
												></span>
											</div>
										{:else}
											<MediaPreview {media} label="سلفی" showPreview={true} showDownload={true} />
										{/if}
									</GetMediaByIdProvider>
								{:else}
									<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
										<span
											class="icon-[heroicons--document-magnifying-glass] mx-auto mb-2 h-8 w-8 text-gray-400"
										></span>
										<p class="text-sm text-gray-500">سلفی آپلود نشده است</p>
									</div>
								{/if}
							</div>

							<!-- Signed Text -->
							<div>
								<h5 class="mb-2 text-sm font-medium text-gray-900">متن امضا شده</h5>
								{#if kycDetails.signedTextMediaId}
									<GetMediaByIdProvider
										onError={(message) => {
											toast.error(message || 'دریافت اطلاعات متن امضا شده ناموفق بود');
										}}
										let:response={media}
										id={kycDetails.signedTextMediaId}
									>
										{#if !media}
											<div class="flex justify-center py-2">
												<span class="icon-[svg-spinners--bars-scale-fade] h-5 w-5 text-blue-500"
												></span>
											</div>
										{:else}
											<MediaPreview
												{media}
												label="متن امضا شده"
												showPreview={true}
												showDownload={true}
											/>
										{/if}
									</GetMediaByIdProvider>
								{:else}
									<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
										<span
											class="icon-[heroicons--document-magnifying-glass] mx-auto mb-2 h-8 w-8 text-gray-400"
										></span>
										<p class="text-sm text-gray-500">متن امضا شده آپلود نشده است</p>
									</div>
								{/if}
							</div>

							<!-- National Card -->
							<div>
								<h5 class="mb-2 text-sm font-medium text-gray-900">کارت ملی</h5>
								{#if kycDetails.nationalCardMediaId}
									<GetMediaByIdProvider
										id={kycDetails.nationalCardMediaId}
										onError={(message) => {
											toast.error(message || 'دریافت اطلاعات کارت ملی ناموفق بود');
										}}
										let:response={media}
									>
										{#if !media}
											<div class="flex justify-center py-2">
												<span class="icon-[svg-spinners--bars-scale-fade] h-5 w-5 text-blue-500"
												></span>
											</div>
										{:else}
											<MediaPreview
												{media}
												label="کارت ملی"
												showPreview={true}
												showDownload={true}
											/>
										{/if}
									</GetMediaByIdProvider>
								{:else}
									<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
										<span
											class="icon-[heroicons--document-magnifying-glass] mx-auto mb-2 h-8 w-8 text-gray-400"
										></span>
										<p class="text-sm text-gray-500">کارت ملی آپلود نشده است</p>
									</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- KYC Steps Status -->
					<div class="rounded-lg bg-gray-50 p-4">
						<h4 class="text-md mb-3 font-medium text-gray-900">وضعیت مراحل</h4>
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="rounded-lg border border-gray-200 p-3">
								<div class="mb-2 flex items-center justify-between">
									<h5 class="text-sm font-medium text-gray-900">مرحله ۱</h5>
									<KycStatusIndicator status={kycDetails.step1Status} size="sm" />
								</div>

								{#if kycDetails.step1Status === 'REJECTED' && kycDetails.step1RejectionReason}
									<div class="mt-2">
										<p class="text-xs text-gray-500">دلیل رد:</p>
										<p class="text-xs text-red-600">
											{kycDetails.step1RejectionReason}
										</p>
									</div>
								{/if}

								{#if kycDetails.step1Status === 'REJECTED' && kycDetails.step1RejectedAt}
									<div class="mt-1">
										<p class="text-xs text-gray-500">
											تاریخ رد: {new Date(kycDetails.step1RejectedAt).toLocaleDateString('fa-IR')}
										</p>
									</div>
								{/if}
							</div>

							<div class="rounded-lg border border-gray-200 p-3">
								<div class="mb-2 flex items-center justify-between">
									<h5 class="text-sm font-medium text-gray-900">مرحله ۲</h5>
									<KycStatusIndicator status={kycDetails.step2Status} size="sm" />
								</div>

								{#if kycDetails.step2Status === 'REJECTED' && kycDetails.step2RejectionReason}
									<div class="mt-2">
										<p class="text-xs text-gray-500">دلیل رد:</p>
										<p class="text-xs text-red-600">
											{kycDetails.step2RejectionReason}
										</p>
									</div>
								{/if}

								{#if kycDetails.step2Status === 'REJECTED' && kycDetails.step2RejectedAt}
									<div class="mt-1">
										<p class="text-xs text-gray-500">
											تاریخ رد: {new Date(kycDetails.step2RejectedAt).toLocaleDateString('fa-IR')}
										</p>
									</div>
								{/if}
							</div>
						</div>

						<!-- Action buttons -->
						<div class="mt-4 flex justify-end gap-2">
							{#if !isDone && (kycDetails.step1Status === 'PENDING' || kycDetails.step2Status === 'PENDING')}
								<Button
									variant="gradient-success"
									size="sm"
									onClick={() => {
										dialogStore.open({
											component: ConfirmDialog,
											props: {
												title: 'تأیید احراز هویت',
												message: `آیا از تأییر این مرحله از احراز هویت اطمینان دارید؟`,
												confirm: 'تأیید',
												cancel: 'انصراف',
												color: 'blue',
												showTextInput: true,
												textInputLabel: 'یادداشت‌های مدیر (اختیاری)',
												textInputPlaceholder: 'یادداشت‌های خود را برای این تأیید وارد کنید...',
												onConfirm: (adminNotes?: string) => {
													history.back();

													approveKycRequest({
														kycId,
														adminNotes: adminNotes || undefined
													});
												}
											}
										});
									}}
								>
									تأیید مرحله {level}
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										dialogStore.open({
											component: ConfirmDialog,
											props: {
												title: 'رد احراز هویت',
												message: `آیا از رد این مرحله از احراز هویت اطمینان دارید؟`,
												confirm: 'رد',
												cancel: 'انصراف',
												color: 'red',
												showTextInput: true,
												textInputRequired: true,
												textInputLabel: 'دلیل رد',
												textInputPlaceholder: 'دلیل رد را وارد کنید...',
												onConfirm: (rejectionReason?: string, adminNotes?: string) => {
													if (rejectionReason) {
														history.back();
														rejectKycRequest({
															kycId,
															rejectionReason,
															adminNotes: adminNotes || undefined
														});
													}
												}
											}
										});
									}}
								>
									رد مرحله {level}
								</Button>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</RejectKycRequestProvider>
	</ApproveKycRequestProvider>
</GetKycDetailsProvider>
