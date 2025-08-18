<script lang="ts">
	import KycStep1Form from '$lib/components/KycStep1Form.svelte';
	import KycStep2Upload from '$lib/components/KycStep2Upload.svelte';
	import { rules } from '$lib/helpers/form.helper';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import KycStatusIndicator from '$lib/kit/KycStatusIndicator.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import SuccessDisplay from '$lib/kit/SuccessDisplay.svelte';
	import FinalizeKycStep2Provider from '$lib/providers/FinalizeKycStep2Provider.svelte';
	import GetKycStatusProvider from '$lib/providers/GetKycStatusProvider.svelte';
	import SubmitKycInfoProvider from '$lib/providers/SubmitKycInfoProvider.svelte';

	// Form state for step 1
	let nationalId = '';
	let mobile = '';
	let birthDate = '';

	// Validation state
	let nationalIdTouched = false;
	let mobileTouched = false;
	let birthDateTouched = false;

	// Computed validation
	$: nationalIdValid = nationalIdTouched
		? nationalId.length === 10 && rules.nationalId.validate(nationalId)
		: true;
	$: mobileValid = mobileTouched ? mobile.length > 0 && rules.mobile.validate(mobile) : true;
	$: birthDateValid = birthDateTouched
		? birthDate.length > 0 && rules.gregorianDate(['YYYY-MM-DD']).validate(birthDate)
		: true;
	$: step1FormValid =
		nationalIdValid && mobileValid && birthDateValid && nationalId && mobile && birthDate;

	// Handle step 1 form submission
	function handleStep1Submit(e: SubmitEvent, submitKycInfo: Function) {
		e.preventDefault();
		if (!step1FormValid) return;

		const formData = {
			nationalId,
			mobile,
			birthDate
		};

		submitKycInfo(formData);
	}

	// Handle step 2 finalization
	function handleFinalize(finalizeKycStep2: Function) {
		finalizeKycStep2();
	}

	// Handle input blur for validation
	function handleInputBlur(field: string) {
		switch (field) {
			case 'nationalId':
				nationalIdTouched = true;
				break;
			case 'mobile':
				mobileTouched = true;
				break;
			case 'birthDate':
				birthDateTouched = true;
				break;
		}
	}
</script>

<PanelPageWrapper title="احراز هویت" description="فرآیند احراز هویت خود را تکمیل کنید">
	<GetKycStatusProvider
		let:getKycStatus
		let:loading
		let:errorMessage
		let:kycStatus
		onSuccess={(r) => {
			mobile = r?.mobile || '';
			nationalId = r?.nationalId || '';
			birthDate = r?.birthDate || '';
		}}
	>
		{@const bothStepsApproved =
			kycStatus?.step1Status === 'APPROVED' && kycStatus?.step2Status === 'APPROVED'}
		{@const step2Disabled = kycStatus?.step1Status !== 'APPROVED'}
		{@const step2UploadDisabled =
			step2Disabled ||
			kycStatus?.step2Status === 'PENDING' ||
			kycStatus?.step2Status === 'APPROVED'}
		<div class="space-y-6">
			{#if errorMessage}
				<ErrorDisplay message={errorMessage} />
			{/if}

			<!-- Loading State -->
			{#if loading && !kycStatus}
				<Card>
					<div class="flex flex-col items-center justify-center py-12">
						<span class="icon-[svg-spinners--ring-resize] h-12 w-12 text-blue-500"></span>
						<p class="mt-4 text-lg font-medium text-gray-700">
							در حال بارگذاری وضعیت احراز هویت شما
						</p>
						<p class="mt-2 text-sm text-gray-500">لطفاً صبر کنید تا جزئیات تأیید شما دریافت شود</p>
					</div>
				</Card>
			{/if}

			<!-- Step 1: اطلاعات شخصی -->
			{#if !bothStepsApproved}
				<Card
					className={kycStatus?.step1Status === 'APPROVED' || kycStatus?.step1Status === 'PENDING'
						? 'opacity-60'
						: ''}
				>
					<SubmitKycInfoProvider
						let:submitKycInfo
						let:loading
						let:errorMessage
						onSuccess={(e) => {
							// Refresh KYC status after successful submission
							getKycStatus();
						}}
						onError={(e) => {
							// Handle error
						}}
					>
						<KycStep1Form
							{kycStatus}
							{nationalId}
							{mobile}
							{birthDate}
							{nationalIdTouched}
							{mobileTouched}
							{birthDateTouched}
							{nationalIdValid}
							{mobileValid}
							{birthDateValid}
							step1FormValid={!!step1FormValid}
							{loading}
							{errorMessage}
							onSubmit={(e) => handleStep1Submit(e, submitKycInfo)}
							onInputBlur={handleInputBlur}
						/>
					</SubmitKycInfoProvider>
				</Card>
			{/if}

			<!-- Step 2: Document Upload -->
			{#if !bothStepsApproved}
				<Card
					className={step2Disabled ||
					kycStatus?.step2Status === 'PENDING' ||
					kycStatus?.step2Status === 'APPROVED'
						? 'opacity-60'
						: ''}
				>
					<FinalizeKycStep2Provider
						let:finalizeKycStep2
						let:loading
						let:errorMessage
						onSuccess={(e) => {
							// Refresh KYC status after successful finalization
							getKycStatus();
						}}
						onError={(e) => {
							// Handle error
						}}
					>
						<KycStep2Upload
							{kycStatus}
							{step2Disabled}
							{step2UploadDisabled}
							{loading}
							{errorMessage}
							onFinalize={() => handleFinalize(finalizeKycStep2)}
							onRefresh={getKycStatus}
						/>
					</FinalizeKycStep2Provider>
				</Card>
			{/if}

			<!-- Information Summary for Approved Steps -->
			{#if kycStatus && kycStatus.step1Status === 'APPROVED' && kycStatus.step2Status === 'APPROVED'}
				<Card>
					<div class="mb-6 rounded-lg bg-green-50 p-4">
						<div class="flex items-center">
							<span class="icon-[heroicons--check-circle] me-2 h-6 w-6 text-green-500"></span>
							<h2 class="text-lg font-medium text-green-800">تأیید هویت تکمیل شد!</h2>
						</div>
						<p class="mt-2 text-green-700">
							احراز هویت شما تأیید شده است. اکنون به تمام ویژگی‌های پلتفرم دسترسی کامل دارید. لذت
							ببرید!
						</p>
					</div>

					<h2 class="mb-4 text-xl font-bold text-gray-800">خلاصه اطلاعات احراز هویت</h2>

					<!-- Personal Information Section -->
					<div class="mb-6">
						<h3 class="mb-3 flex items-center text-lg font-semibold text-gray-700">
							<span class="icon-[heroicons--user-circle] me-2 h-5 w-5 text-blue-500"></span>
							اطلاعات شخصی
						</h3>
						<div class="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-3">
							<div>
								<p class="text-sm text-gray-500">کد ملی</p>
								<p class="font-medium">{kycStatus.nationalId}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">شماره موبایل</p>
								<p class="font-medium">{kycStatus.mobile}</p>
							</div>
							<div>
								<p class="text-sm text-gray-500">تاریخ تولد</p>
								<p class="font-medium">{new Date(kycStatus.birthDate).toLocaleDateString()}</p>
							</div>
						</div>
					</div>

					<!-- Document Upload Section -->
					{#if kycStatus.step2Status}
						<div>
							<h3 class="mb-3 flex items-center text-lg font-semibold text-gray-700">
								<span class="icon-[heroicons--document-text] me-2 h-5 w-5 text-blue-500"></span>
								اسناد آپلود شده
							</h3>

							<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<div class="rounded-lg border border-gray-200 p-4">
									<div class="mb-2 flex items-center justify-between">
										<h4 class="font-medium text-gray-800">سند امضا شده</h4>
										{#if kycStatus.signedTextMediaId}
											<span class="icon-[heroicons--check-circle] h-5 w-5 text-green-500"></span>
										{/if}
									</div>
									{#if kycStatus.signedTextMediaId}
										<div class="mt-2 flex items-center text-sm text-gray-600">
											<span class="icon-[heroicons--document] me-1 h-4 w-4"></span>
											سند آپلود شد
										</div>
									{:else}
										<p class="text-sm text-gray-500">آپلود نشده</p>
									{/if}
								</div>

								<div class="rounded-lg border border-gray-200 p-4">
									<div class="mb-2 flex items-center justify-between">
										<h4 class="font-medium text-gray-800">سلفی</h4>
										{#if kycStatus.selfieMediaId}
											<span class="icon-[heroicons--check-circle] h-5 w-5 text-green-500"></span>
										{/if}
									</div>
									{#if kycStatus.selfieMediaId}
										<div class="mt-2 flex items-center text-sm text-gray-600">
											<span class="icon-[heroicons--camera] me-1 h-4 w-4"></span>
											سلفی آپلود شد
										</div>
									{:else}
										<p class="text-sm text-gray-500">آپلود نشده</p>
									{/if}
								</div>

								<div class="rounded-lg border border-gray-200 p-4">
									<div class="mb-2 flex items-center justify-between">
										<h4 class="font-medium text-gray-800">کارت ملی</h4>
										{#if kycStatus.nationalCardMediaId}
											<span class="icon-[heroicons--check-circle] h-5 w-5 text-green-500"></span>
										{/if}
									</div>
									{#if kycStatus.nationalCardMediaId}
										<div class="mt-2 flex items-center text-sm text-gray-600">
											<span class="icon-[heroicons--identification] me-1 h-4 w-4"></span>
											کارت ملی آپلود شد
										</div>
									{:else}
										<p class="text-sm text-gray-500">آپلود نشده</p>
									{/if}
								</div>
							</div>

							<!-- Step 2 Status -->
							<div class="mt-4 flex items-center justify-between rounded-lg bg-blue-50 p-4">
								<div class="flex items-center">
									<span class="icon-[heroicons--document-text] me-2 h-5 w-5 text-blue-500"></span>
									<span class="font-medium text-blue-800">وضعیت تأیید سند</span>
								</div>
								<KycStatusIndicator status={kycStatus.step2Status} size="md" />
							</div>
						</div>
					{/if}

					<!-- Overall Status -->
					<div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
							<div class="mb-2 sm:mb-0">
								<h3 class="font-medium text-gray-800">وضعیت احراز هویت</h3>
								<p class="text-sm text-gray-600">
									آخرین به‌روزرسانی: {new Date(kycStatus.lastStepUpdatedAt).toLocaleString()}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium text-gray-700">مرحله ۱:</span>
								<KycStatusIndicator status={kycStatus.step1Status} size="md" />
								<span class="text-sm font-medium text-gray-700">مرحله ۲:</span>
								<KycStatusIndicator status={kycStatus.step2Status} size="md" />
							</div>
						</div>

						{#if kycStatus.adminNotes}
							<div class="mt-3 rounded bg-yellow-50 p-3">
								<p class="text-sm text-yellow-800">
									<span class="font-medium">یادداشت‌های مدیر:</span>
									{kycStatus.adminNotes}
								</p>
							</div>
						{/if}
					</div>
				</Card>
			{/if}
		</div>
	</GetKycStatusProvider>
</PanelPageWrapper>
