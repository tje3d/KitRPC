<script lang="ts">
	import { Button, ErrorDisplay, FormGroup, Input, KycStatusIndicator } from '$lib/kit';
	import JalaliDatePicker from '$lib/kit/JalaliDatePicker.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { slide } from 'svelte/transition';

	type KycStatus = RouterOutputs['kyc']['getKycStatus'];

	export let kycStatus: KycStatus | undefined;
	export let nationalId: string;
	export let mobile: string;
	export let birthDate: string;
	export let nationalIdTouched: boolean;
	export let mobileTouched: boolean;
	export let birthDateTouched: boolean;
	export let nationalIdValid: boolean;
	export let mobileValid: boolean;
	export let birthDateValid: boolean;
	export let step1FormValid: boolean;
	export let loading: boolean;
	export let errorMessage: string | undefined;
	export let onSubmit: (e: SubmitEvent) => void;
	export let onInputBlur: (field: string) => void;

	$: isStep1Approved = kycStatus?.step1Status === 'APPROVED';
	$: isStep1Pending = kycStatus?.step1Status === 'PENDING';
	$: isStep1Completed = isStep1Approved || isStep1Pending;

	// Collapse state - collapse when approved
	let isCollapsed = false;
	$: isCollapsed = isStep1Approved;
</script>

<div
	class="rounded-2xl border shadow-lg transition-all duration-300"
	class:border-gray-200={!isStep1Completed || isStep1Approved}
	class:bg-white={!isStep1Completed || isStep1Approved}
	class:border-gray-300={isStep1Completed && !isStep1Approved}
	class:bg-gray-50={isStep1Completed && !isStep1Approved}
	class:opacity-80={isStep1Completed && !isStep1Approved}
>
	<!-- Header Section -->
	<div
		class="rounded-t-2xl border-b p-6 transition-all duration-300"
		class:rounded-b-2xl={isCollapsed}
		class:border-gray-100={!isStep1Completed || isStep1Approved}
		class:border-gray-200={isStep1Completed && !isStep1Approved}
		class:bg-gradient-to-r={true}
		class:from-green-50={isStep1Approved}
		class:to-emerald-50={isStep1Approved}
		class:from-amber-50={isStep1Pending}
		class:to-yellow-50={isStep1Pending}
		class:from-blue-50={!isStep1Completed}
		class:to-indigo-50={!isStep1Completed}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
					class:bg-green-500={isStep1Approved}
					class:bg-amber-500={isStep1Pending}
					class:bg-blue-500={!isStep1Completed}
				>
					<span
						class="h-6 w-6 text-white"
						class:icon-[heroicons--check-circle]={isStep1Approved}
						class:icon-[heroicons--clock]={isStep1Pending}
						class:icon-[heroicons--user-circle]={!isStep1Completed}
					></span>
				</div>
				<div class="mr-4">
					<div class="flex items-center gap-3">
						<h2
							class="text-2xl font-bold transition-colors duration-300"
							class:text-gray-900={!isStep1Completed || isStep1Approved}
							class:text-gray-600={isStep1Completed && !isStep1Approved}
						>
							مرحله ۱: اطلاعات شخصی
						</h2>
						{#if kycStatus && (!isStep1Completed || isStep1Approved)}
							<KycStatusIndicator status={kycStatus.step1Status} />
						{:else if isStep1Completed && !isStep1Approved}
							<span class="rounded-full bg-gray-300 px-2 py-1 text-xs font-medium text-gray-600"
								>تکمیل شده</span
							>
						{/if}
					</div>
					<p
						class="mt-1 text-sm transition-colors duration-300"
						class:text-green-700={isStep1Approved}
						class:text-amber-700={isStep1Pending}
						class:text-gray-600={!isStep1Completed}
						class:text-gray-500={isStep1Completed && !isStep1Approved}
					>
						{#if isStep1Approved}
							اطلاعات شما تأیید شده است
						{:else if isStep1Pending}
							اطلاعات شما ارسال شده و در انتظار بررسی است
						{:else}
							لطفاً اطلاعات شخصی خود را برای تأیید هویت وارد کنید
						{/if}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					on:click={() => (isCollapsed = !isCollapsed)}
					class="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
					class:bg-white={!isStep1Completed || isStep1Approved}
					class:text-gray-600={!isStep1Completed || isStep1Approved}
					class:hover:bg-white={!isStep1Completed || isStep1Approved}
					class:hover:text-gray-800={!isStep1Completed || isStep1Approved}
					class:bg-gray-200={isStep1Completed && !isStep1Approved}
					class:text-gray-400={isStep1Completed && !isStep1Approved}
					class:cursor-not-allowed={isStep1Completed && !isStep1Approved}
					title={isStep1Completed && !isStep1Approved
						? 'مرحله تکمیل شده است'
						: isCollapsed
							? 'نمایش جزئیات'
							: 'مخفی کردن جزئیات'}
					disabled={isStep1Completed && !isStep1Approved}
				>
					<span
						class="h-4 w-4 transition-transform duration-200"
						class:icon-[heroicons--chevron-down]={!isCollapsed}
						class:icon-[heroicons--chevron-up]={isCollapsed}
					></span>
				</button>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300"
					class:bg-white={!isStep1Completed || isStep1Approved}
					class:bg-gray-300={isStep1Completed && !isStep1Approved}
				>
					<span
						class="text-lg font-bold transition-colors duration-300"
						class:text-gray-700={!isStep1Completed || isStep1Approved}
						class:text-gray-500={isStep1Completed && !isStep1Approved}>۱</span
					>
				</div>
			</div>
		</div>
	</div>

	<!-- Collapsible Content -->
	{#if !isCollapsed}
		<div transition:slide={{ duration: 300 }}>
			<!-- Status Alert -->
			{#if isStep1Approved}
				<div class="mx-6 mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--check-circle] ml-3 h-6 w-6 text-green-600"></span>
						<div>
							<p class="font-medium text-green-900">تأیید موفق</p>
							<p class="text-sm text-green-700">اطلاعات شخصی شما با موفقیت تأیید شد.</p>
						</div>
					</div>
				</div>
			{:else if isStep1Pending}
				<div class="mx-6 mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
					<div class="flex items-center">
						<span class="icon-[heroicons--clock] ml-3 h-6 w-6 text-amber-600"></span>
						<div>
							<p class="font-medium text-amber-900">در انتظار بررسی</p>
							<p class="text-sm text-amber-700">
								اطلاعات شخصی شما ارسال شده و در انتظار بررسی است.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Form Content -->
			<div class="p-6">
				{#if errorMessage}
					<div class="mb-6">
						<ErrorDisplay message={errorMessage} />
					</div>
				{/if}

				<form class="space-y-6" on:submit={onSubmit}>
					<FormGroup
						label="کد ملی"
						forAttr="nationalId"
						error="لطفاً یک کد ملی معتبر ۱۰ رقمی وارد کنید"
						showError={nationalIdTouched && !nationalIdValid}
					>
						<Input
							id="nationalId"
							name="nationalId"
							type="text"
							placeholder="کد ملی ۱۰ رقمی خود را وارد کنید"
							bind:value={nationalId}
							onBlur={() => onInputBlur('nationalId')}
							error={nationalIdTouched && !nationalIdValid}
							maxlength={10}
							disabled={isStep1Completed}
						/>
					</FormGroup>

					<FormGroup
						label="شماره تلفن"
						forAttr="mobile"
						error="لطفاً یک شماره تلفن معتبر به فرمت ۰۹XXXXXXXXX وارد کنید"
						showError={mobileTouched && !mobileValid}
					>
						<Input
							id="mobile"
							name="mobile"
							type="tel"
							placeholder="۰۹XXXXXXXXX"
							bind:value={mobile}
							onBlur={() => onInputBlur('mobile')}
							error={mobileTouched && !mobileValid}
							disabled={isStep1Completed}
						/>
					</FormGroup>

					<FormGroup
						label="تاریخ تولد"
						forAttr="birthDate"
						error="لطفاً یک تاریخ معتبر به فرمت YYYY-MM-DD وارد کنید"
						showError={birthDateTouched && !birthDateValid}
					>
						<JalaliDatePicker
							id="birthDate"
							name="birthDate"
							placeholder="YYYY-MM-DD"
							bind:value={birthDate}
							on:change={(e) => {
								birthDate = e.detail.value;
								// Trigger validation when date changes
								onInputBlur('birthDate');
							}}
							on:input={(e) => {
								birthDate = e.detail.value;
							}}
							disabled={isStep1Completed}
						/>
					</FormGroup>

					<div class="flex justify-end pt-4">
						<Button
							type="submit"
							{loading}
							disabled={!step1FormValid || isStep1Completed}
							variant="primary"
							className="px-8 py-3 text-lg font-medium"
						>
							{#if isStep1Approved}
								<span class="icon-[heroicons--check] ml-2 h-5 w-5"></span>
								اطلاعات تأیید شد
							{:else if isStep1Pending}
								<span class="icon-[heroicons--clock] ml-2 h-5 w-5"></span>
								اطلاعات ارسال شد
							{:else}
								<span class="icon-[heroicons--paper-airplane] ml-2 h-5 w-5"></span>
								ارسال اطلاعات
							{/if}
						</Button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
