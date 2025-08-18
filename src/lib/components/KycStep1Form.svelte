<script lang="ts">
	import { Button, ErrorDisplay, FormGroup, Input } from '$lib/kit';
	import JalaliDatePicker from '$lib/kit/JalaliDatePicker.svelte';
	import type { RouterOutputs } from '$lib/trpc/router';

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
</script>

<div class="space-y-6">
	<div>
		<h2 class="flex items-center gap-2 text-xl font-bold text-gray-800">
			مرحله ۱: اطلاعات شخصی
			{#if isStep1Approved}
				<span class="icon-[heroicons--check-circle] h-5 w-5 text-green-500"></span>
			{/if}
		</h2>
		<p class="mt-1 text-gray-600">
			{#if isStep1Approved}
				اطلاعات شما تأیید شده است
			{:else if isStep1Pending}
				اطلاعات شما ارسال شده و در انتظار بررسی است
			{:else}
				لطفاً اطلاعات شخصی خود را برای تأیید هویت وارد کنید
			{/if}
		</p>
	</div>

	{#if isStep1Approved}
		<div class="rounded-lg border border-green-200 bg-green-50 p-4">
			<div class="flex items-center">
				<span class="icon-[heroicons--check-circle] me-2 h-5 w-5 text-green-600"></span>
				<p class="text-sm text-green-800">اطلاعات شخصی شما با موفقیت تأیید شد.</p>
			</div>
		</div>
	{:else if isStep1Pending}
		<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
			<div class="flex items-center">
				<span class="icon-[heroicons--clock] me-2 h-5 w-5 text-yellow-600"></span>
				<p class="text-sm text-yellow-800">اطلاعات شخصی شما ارسال شده و در انتظار بررسی است.</p>
			</div>
		</div>
	{/if}

	{#if errorMessage}
		<ErrorDisplay message={errorMessage} />
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

		<div class="flex justify-end">
			<Button
				type="submit"
				{loading}
				disabled={!step1FormValid || isStep1Completed}
				variant="primary"
			>
				{#if isStep1Approved}
					اطلاعات تأیید شد
				{:else if isStep1Pending}
					اطلاعات ارسال شد
				{:else}
					ارسال اطلاعات
				{/if}
			</Button>
		</div>
	</form>
</div>
