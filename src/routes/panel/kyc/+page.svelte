<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import ConditionalFunctionCaller from '$lib/components/ConditionalFunctionCaller.svelte';
	import KycStep1Form from '$lib/components/KycStep1Form.svelte';
	import KycStep2Upload from '$lib/components/KycStep2Upload.svelte';
	import { rules } from '$lib/helpers/form.helper';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import KycStatusIndicator from '$lib/kit/KycStatusIndicator.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import FinalizeKycStep2Provider from '$lib/providers/FinalizeKycStep2Provider.svelte';
	import GetKycStatusProvider from '$lib/providers/GetKycStatusProvider.svelte';
	import SubmitKycInfoProvider from '$lib/providers/SubmitKycInfoProvider.svelte';
	import { toast } from '$lib/toast/store';

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

	// Helper function to convert Date to string for birthDate binding
	function formatDateForInput(date: Date | string | undefined): string {
		if (!date) return '';
		if (typeof date === 'string') return date;
		return date.toISOString().split('T')[0];
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
			birthDate = formatDateForInput(r?.birthDate);
		}}
	>
		<!-- Auto-refresh KYC status every 5 seconds when step1 is pending -->
		<ConditionalFunctionCaller
			condition={kycStatus?.step1Status === 'PENDING'}
			callback={() => {
				getKycStatus();
				invalidateAll();
			}}
			interval={5000}
		/>
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

			<!-- Status Hero Section -->
			{#if kycStatus}
				{@const bothStepsCompleted =
					kycStatus.step1Status === 'APPROVED' && kycStatus.step2Status === 'APPROVED'}
				{@const step2Pending = kycStatus.step2Status === 'PENDING'}
				{@const step1Approved = kycStatus.step1Status === 'APPROVED'}
				{@const step1Pending = kycStatus.step1Status === 'PENDING'}
				{@const step1Rejected = kycStatus.step1Status === 'REJECTED'}
				{@const step2Rejected = kycStatus.step2Status === 'REJECTED'}
				{@const step1ApprovedAndNoStep2 = step1Approved && !kycStatus.step2Status}

				<div class="mb-8">
					<div
						class="to relative overflow-hidden rounded-2xl from-cyan-400 to-cyan-500 p-8 shadow-lg"
						class:bg-gradient-to-br={true}
						class:from-green-400={bothStepsCompleted}
						class:to-green-600={bothStepsCompleted}
						class:from-amber-400={step2Pending || step1Pending}
						class:to-amber-600={step2Pending || step1Pending}
						class:from-red-400={step1Rejected || step2Rejected}
						class:to-red-600={step1Rejected || step2Rejected}
					>
						<div class="absolute inset-0 bg-black/10"></div>
						<div class="relative z-10">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-4">
									<div
										class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
									>
										<span
											class="h-8 w-8 text-white"
											class:icon-[heroicons--check-circle]={bothStepsCompleted}
											class:icon-[heroicons--clock]={step2Pending || step1Pending}
											class:icon-[heroicons--x-circle]={step1Rejected || step2Rejected}
											class:icon-[heroicons--document-text]={step1ApprovedAndNoStep2}
											class:icon-[heroicons--user-circle]={!step1Approved &&
												!step1Pending &&
												!step1Rejected}
										></span>
									</div>
									<div>
										<h1 class="text-3xl font-bold text-white">
											{#if bothStepsCompleted}
												تأیید هویت تکمیل شد!
											{:else if step1Rejected}
												اطلاعات شخصی رد شد
											{:else if step2Rejected}
												اسناد ارسالی رد شد
											{:else if step2Pending}
												اسناد در انتظار بررسی
											{:else if step1Pending}
												اطلاعات در انتظار بررسی
											{:else if step1ApprovedAndNoStep2}
												آماده برای ارسال اسناد
											{:else if step1Approved && kycStatus.step2Status}
												اسناد ارسال شده
											{:else}
												شروع فرآیند احراز هویت
											{/if}
										</h1>
										<p class="mt-2 text-lg text-white/90">
											{#if bothStepsCompleted}
												احراز هویت شما تأیید شده است. اکنون به تمام ویژگی‌های پلتفرم دسترسی کامل
												دارید.
											{:else if step1Rejected}
												اطلاعات شخصی ارسالی مورد تأیید قرار نگرفت. لطفاً اطلاعات صحیح را وارد کنید.
											{:else if step2Rejected}
												اسناد ارسالی مورد تأیید قرار نگرفت. لطفاً اسناد معتبر و واضح ارسال کنید.
											{:else if step2Pending}
												مرحله دوم احراز هویت تکمیل شد و در انتظار بررسی توسط تیم پشتیبانی است.
											{:else if step1Pending}
												اطلاعات شخصی شما ارسال شد و در انتظار تأیید است.
											{:else if step1ApprovedAndNoStep2}
												اطلاعات شخصی تأیید شد. اکنون می‌توانید اسناد مورد نیاز را آپلود کنید.
											{:else if step1Approved && kycStatus.step2Status}
												اطلاعات شخصی تأیید شده و اسناد ارسال شده است.
											{:else}
												برای استفاده کامل از پلتفرم، لطفاً فرآیند احراز هویت را تکمیل کنید.
											{/if}
										</p>
									</div>
								</div>
								<div class="hidden sm:block">
									<div class="flex items-center gap-2">
										<div class="text-center">
											<div class="text-sm font-medium text-white/80">مرحله ۱</div>
											<KycStatusIndicator status={kycStatus.step1Status} size="lg" />
										</div>
										<div class="mx-2 h-px w-8 bg-white/40"></div>
										<div class="text-center">
											<div class="text-sm font-medium text-white/80">مرحله ۲</div>
											<KycStatusIndicator status={kycStatus.step2Status} size="lg" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Rejection Reason Cards -->
			{#if kycStatus && (kycStatus.step1Status === 'REJECTED' || kycStatus.step2Status === 'REJECTED')}
				<div class="space-y-4">
					<!-- Step 1 Rejection Reason -->
					{#if kycStatus.step1Status === 'REJECTED' && kycStatus.step1RejectionReason}
						<Card className="border-red-200 bg-red-50">
							<div class="p-6">
								<div class="flex items-start">
									<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
										<span class="icon-[heroicons--x-circle] h-6 w-6 text-red-600"></span>
									</div>
									<div class="mr-4 flex-1">
										<h3 class="text-lg font-semibold text-red-900">
											دلیل رد اطلاعات شخصی (مرحله ۱)
										</h3>
										<p class="mt-2 text-red-800">{kycStatus.step1RejectionReason}</p>
										{#if kycStatus.step1RejectedAt}
											<p class="mt-2 text-sm text-red-600">
												تاریخ رد: {kycStatus.step1RejectedAt.toLocaleDateString('fa-IR')}
											</p>
										{/if}
										<div class="mt-4 rounded-lg bg-red-100 p-3">
											<p class="text-sm font-medium text-red-900">راهنمای رفع مشکل:</p>
											<p class="mt-1 text-sm text-red-800">
												لطفاً اطلاعات صحیح را در فرم زیر وارد کرده و مجدداً ارسال کنید.
											</p>
										</div>
									</div>
								</div>
							</div>
						</Card>
					{/if}

					<!-- Step 2 Rejection Reason -->
					{#if kycStatus.step2Status === 'REJECTED' && kycStatus.step2RejectionReason}
						<Card className="border-red-200 bg-red-50">
							<div class="p-6">
								<div class="flex items-start">
									<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
										<span class="icon-[heroicons--x-circle] h-6 w-6 text-red-600"></span>
									</div>
									<div class="mr-4 flex-1">
										<h3 class="text-lg font-semibold text-red-900">دلیل رد اسناد (مرحله ۲)</h3>
										<p class="mt-2 text-red-800">{kycStatus.step2RejectionReason}</p>
										{#if kycStatus.step2RejectedAt}
											<p class="mt-2 text-sm text-red-600">
												تاریخ رد: {kycStatus.step2RejectedAt.toLocaleDateString('fa-IR')}
											</p>
										{/if}
										<div class="mt-4 rounded-lg bg-red-100 p-3">
											<p class="text-sm font-medium text-red-900">راهنمای رفع مشکل:</p>
											<p class="mt-1 text-sm text-red-800">
												لطفاً اسناد واضح و معتبر را مجدداً آپلود کنید. مطمئن شوید که تصاویر خوانا و
												کامل باشند.
											</p>
										</div>
									</div>
								</div>
							</div>
						</Card>
					{/if}
				</div>
			{/if}

			<!-- Step 1: اطلاعات شخصی -->
			{#if !bothStepsApproved && kycStatus?.step2Status !== 'PENDING'}
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
						bind:nationalId
						bind:mobile
						bind:birthDate
						bind:nationalIdTouched
						bind:mobileTouched
						bind:birthDateTouched
						bind:nationalIdValid
						bind:mobileValid
						bind:birthDateValid
						step1FormValid={!!step1FormValid}
						{loading}
						{errorMessage}
						onSubmit={(e) => handleStep1Submit(e, submitKycInfo)}
						onInputBlur={handleInputBlur}
					/>
				</SubmitKycInfoProvider>
			{/if}

			<!-- Step 2: Document Upload -->
			{#if !bothStepsApproved && kycStatus?.step2Status !== 'PENDING'}
				<FinalizeKycStep2Provider
					let:finalizeKycStep2
					let:loading
					let:errorMessage
					onSuccess={(e) => {
						// Refresh KYC status after successful finalization
						getKycStatus();
						// Show success toast
						toast.success('مرحله دوم احراز هویت با موفقیت تکمیل شد!');
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
			{/if}

			<!-- Information Summary for Approved Steps or Pending Step 2 -->
			{#if kycStatus && kycStatus.step1Status === 'APPROVED' && (kycStatus.step2Status === 'APPROVED' || kycStatus.step2Status === 'PENDING')}
				<!-- Information Cards Grid -->
				<div class="grid gap-6 lg:grid-cols-2">
					<!-- Personal Information Card -->
					<Card className="overflow-hidden">
						<div class="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
							<div class="flex items-center">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-lg"
								>
									<span class="icon-[heroicons--user-circle] h-6 w-6 text-white"></span>
								</div>
								<div class="mr-4">
									<h3 class="text-xl font-bold text-gray-900">اطلاعات شخصی</h3>
									<p class="text-sm text-gray-600">اطلاعات هویتی تأیید شده</p>
								</div>
							</div>
						</div>
						<div class="p-6">
							<div class="space-y-4">
								<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
									<div class="flex items-center">
										<span class="icon-[heroicons--identification] ml-3 h-5 w-5 text-gray-400"
										></span>
										<div>
											<p class="text-sm font-medium text-gray-900">کد ملی</p>
											<p class="text-lg font-bold text-gray-700">{kycStatus.nationalId}</p>
										</div>
									</div>
								</div>
								<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
									<div class="flex items-center">
										<span class="icon-[heroicons--phone] ml-3 h-5 w-5 text-gray-400"></span>
										<div>
											<p class="text-sm font-medium text-gray-900">شماره موبایل</p>
											<p class="text-lg font-bold text-gray-700">{kycStatus.mobile}</p>
										</div>
									</div>
								</div>
								<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
									<div class="flex items-center">
										<span class="icon-[heroicons--calendar-days] ml-3 h-5 w-5 text-gray-400"></span>
										<div>
											<p class="text-sm font-medium text-gray-900">تاریخ تولد</p>
											<p class="text-lg font-bold text-gray-700">
												{kycStatus.birthDate?.toLocaleDateString('fa-IR')}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Card>

					<!-- Documents Card -->
					{#if kycStatus.step2Status}
						<Card className="overflow-hidden">
							<div class="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
								<div class="flex items-center">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 shadow-lg"
									>
										<span class="icon-[heroicons--document-text] h-6 w-6 text-white"></span>
									</div>
									<div class="mr-4">
										<h3 class="text-xl font-bold text-gray-900">اسناد آپلود شده</h3>
										<p class="text-sm text-gray-600">مدارک ارسالی برای تأیید هویت</p>
									</div>
								</div>
							</div>
							<div class="p-6">
								<div class="space-y-4">
									<!-- Signed Document -->
									<div
										class="flex items-center justify-between rounded-lg border-2 p-4 transition-all"
										class:border-green-200={kycStatus.signedTextMediaId}
										class:bg-green-50={kycStatus.signedTextMediaId}
										class:border-gray-200={!kycStatus.signedTextMediaId}
										class:bg-gray-50={!kycStatus.signedTextMediaId}
									>
										<div class="flex items-center">
											<span
												class="ml-3 h-6 w-6"
												class:icon-[heroicons--document-check]={kycStatus.signedTextMediaId}
												class:icon-[heroicons--document]={!kycStatus.signedTextMediaId}
												class:text-green-500={kycStatus.signedTextMediaId}
												class:text-gray-400={!kycStatus.signedTextMediaId}
											></span>
											<div>
												<p class="font-medium text-gray-900">سند امضا شده</p>
												<p
													class="text-sm"
													class:text-green-600={kycStatus.signedTextMediaId}
													class:text-gray-500={!kycStatus.signedTextMediaId}
												>
													{kycStatus.signedTextMediaId ? 'آپلود شده' : 'آپلود نشده'}
												</p>
											</div>
										</div>
										{#if kycStatus.signedTextMediaId}
											<span class="icon-[heroicons--check-circle] h-6 w-6 text-green-500"></span>
										{/if}
									</div>

									<!-- Selfie -->
									<div
										class="flex items-center justify-between rounded-lg border-2 p-4 transition-all"
										class:border-green-200={kycStatus.selfieMediaId}
										class:bg-green-50={kycStatus.selfieMediaId}
										class:border-gray-200={!kycStatus.selfieMediaId}
										class:bg-gray-50={!kycStatus.selfieMediaId}
									>
										<div class="flex items-center">
											<span
												class="ml-3 h-6 w-6"
												class:icon-[heroicons--camera]={kycStatus.selfieMediaId}
												class:text-green-500={kycStatus.selfieMediaId}
												class:text-gray-400={!kycStatus.selfieMediaId}
											></span>
											<div>
												<p class="font-medium text-gray-900">سلفی</p>
												<p
													class="text-sm"
													class:text-green-600={kycStatus.selfieMediaId}
													class:text-gray-500={!kycStatus.selfieMediaId}
												>
													{kycStatus.selfieMediaId ? 'آپلود شده' : 'آپلود نشده'}
												</p>
											</div>
										</div>
										{#if kycStatus.selfieMediaId}
											<span class="icon-[heroicons--check-circle] h-6 w-6 text-green-500"></span>
										{/if}
									</div>

									<!-- National Card -->
									<div
										class="flex items-center justify-between rounded-lg border-2 p-4 transition-all"
										class:border-green-200={kycStatus.nationalCardMediaId}
										class:bg-green-50={kycStatus.nationalCardMediaId}
										class:border-gray-200={!kycStatus.nationalCardMediaId}
										class:bg-gray-50={!kycStatus.nationalCardMediaId}
									>
										<div class="flex items-center">
											<span
												class="ml-3 h-6 w-6"
												class:icon-[heroicons--identification]={kycStatus.nationalCardMediaId}
												class:text-green-500={kycStatus.nationalCardMediaId}
												class:text-gray-400={!kycStatus.nationalCardMediaId}
											></span>
											<div>
												<p class="font-medium text-gray-900">کارت ملی</p>
												<p
													class="text-sm"
													class:text-green-600={kycStatus.nationalCardMediaId}
													class:text-gray-500={!kycStatus.nationalCardMediaId}
												>
													{kycStatus.nationalCardMediaId ? 'آپلود شده' : 'آپلود نشده'}
												</p>
											</div>
										</div>
										{#if kycStatus.nationalCardMediaId}
											<span class="icon-[heroicons--check-circle] h-6 w-6 text-green-500"></span>
										{/if}
									</div>
								</div>

								<!-- Document Status Summary -->
								<div class="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
									<div class="flex items-center justify-between">
										<div class="flex items-center">
											<span
												class="icon-[heroicons--clipboard-document-check] ml-2 h-5 w-5 text-blue-500"
											></span>
											<span class="font-medium text-blue-900">وضعیت تأیید اسناد</span>
										</div>
										<KycStatusIndicator status={kycStatus.step2Status} size="md" />
									</div>
								</div>
							</div>
						</Card>
					{/if}
				</div>
			{/if}
		</div>
	</GetKycStatusProvider>
</PanelPageWrapper>
