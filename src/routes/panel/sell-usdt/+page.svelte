<script lang="ts">
	import { authUser } from '$lib/flow/auth.flow';
	import { rules, useForm, type FormConfig } from '$lib/helpers/form.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import SuccessDisplay from '$lib/kit/SuccessDisplay.svelte';
	import GetCurrentUsdtPriceProvider from '$lib/providers/GetCurrentUsdtPriceProvider.svelte';
	import SellUsdtProvider from '$lib/providers/SellUsdtProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { RouterOutputs } from '$lib/trpc/router';

	// Types
	type SellUsdtResponse = RouterOutputs['transactions']['sellUsdt'];
	type UsdtPriceResponse = RouterOutputs['usdtPrice']['getCurrentUsdtPrice'];

	// Custom validation rules
	const customRules = {
		...rules,
		minAmount: (min: number) => ({
			validate: (value: string) => {
				const numValue = parseFloat(value);
				return !isNaN(numValue) && numValue >= min;
			},
			message: (label: string) => `مقدار ${label} باید حداقل ${min} باشد`
		}),
		maxAmount: (max: number) => ({
			validate: (value: string) => {
				const numValue = parseFloat(value);
				return !isNaN(numValue) && numValue <= max;
			},
			message: (label: string) => `مقدار ${label} نمی‌تواند بیشتر از ${max} باشد`
		})
	};

	// Form configuration
	const formConfig: FormConfig = {
		amountUsdt: {
			rules: [customRules.required, customRules.minAmount(0.01)],
			label: 'مبلغ USDT'
		}
	};

	// Form helper
	const { errors, validate, reset: resetValidation } = useForm(formConfig);

	// State
	let amountUsdt: string = '';
	let successMessage: string | null = null;
	let errorMessage: string | null = null;
	let sellUsdtProvider: SellUsdtProvider | null = null;

	// Set amount based on percentage of balance
	function setAmountByPercentage(percentage: number) {
		if ($authUser?.balanceUSDT !== undefined) {
			const amount = $authUser.balanceUSDT * (percentage / 100);
			amountUsdt = amount.toFixed(2);
		}
	}

	// Set amount to maximum balance
	function setMaxBalance() {
		if ($authUser?.balanceUSDT !== undefined) {
			amountUsdt = $authUser.balanceUSDT.toString();
		}
	}

	// Handle form submission
	async function handleSubmit() {
		// Reset messages
		successMessage = null;
		errorMessage = null;

		// Validate form
		const formData = {
			amountUsdt: amountUsdt
		};

		if (!validate(formData)) {
			return;
		}

		// Convert string to number
		const amount = parseFloat(amountUsdt);

		// Check if amount is valid
		if (isNaN(amount) || amount <= 0) {
			errorMessage = 'مبلغ وارد شده نامعتبر است';
			return;
		}

		// Check if user has enough USDT balance
		if ($authUser?.balanceUSDT !== undefined && amount > $authUser.balanceUSDT) {
			errorMessage = 'موجودی USDT شما کافی نیست';
			return;
		}

		// Trigger sell USDT request
		sellUsdtProvider?.sellUsdt({ amountUsdt: amount });
	}

	// Handle successful sell Usdt
	function handleSuccess(data: SellUsdtResponse) {
		successMessage = `فروش ${formatNumber(data.transaction?.amount || 0)} با موفقیت انجام شد.`;
		resetValidation();
		amountUsdt = '';

		// Show toast notification
		toast.success(successMessage);
	}

	// Handle error
	function handleError(message: string) {
		errorMessage = message;
		toast.error(message);
	}

	function formatNumber(value?: number | null) {
		if (!value) return 0;

		return new Intl.NumberFormat('en-US', {
			roundingMode: 'trunc',
			useGrouping: true
		}).format(value);
	}
</script>

<SellUsdtProvider
	bind:this={sellUsdtProvider}
	let:loading={sellLoading}
	let:clearError
	let:sellUsdt
	onSuccess={handleSuccess}
	onError={handleError}
>
	<GetCurrentUsdtPriceProvider
		let:loading={usdtPriceLoading}
		let:currentPrice={currentUsdtPrice}
		let:getCurrentUsdtPrice
		onError={handleError}
	>
		<PanelPageWrapper title="نقد کردن درآمد ارزی" description="فروش USDT و تبدیل آن به تومان">
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Main content area -->
				<div class="lg:col-span-2">
					<Card variant="flat">
						<form on:submit|preventDefault={handleSubmit}>
							<div class="space-y-6">
								<!-- User Balance Information -->
								<div
									class="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
								>
									<div class="mb-3 flex items-center justify-between">
										<h3 class="flex items-center gap-2 text-sm font-semibold text-gray-700">
											<span class="icon-[heroicons--wallet] h-4 w-4 text-blue-600"></span>
											موجودی شما
										</h3>
									</div>

									{#if $authUser?.balanceUSDT !== undefined}
										<div class="flex items-center justify-between">
											<span class="text-xs font-medium text-gray-600">USDT</span>
											<span class="text-sm font-semibold text-gray-900">
												{formatNumber($authUser.balanceUSDT)}
											</span>
										</div>
									{:else}
										<div class="animate-pulse">
											<div class="h-4 w-1/2 rounded bg-blue-200"></div>
										</div>
									{/if}

									{#if $authUser?.balanceIRT !== undefined}
										<div class="mt-2 flex items-center justify-between">
											<span class="text-xs font-medium text-gray-600">تومان</span>
											<span class="text-sm font-semibold text-gray-900">
												{formatNumber($authUser.balanceIRT)}
											</span>
										</div>
									{:else}
										<div class="mt-2 animate-pulse">
											<div class="h-4 w-1/2 rounded bg-blue-200"></div>
										</div>
									{/if}
								</div>

								<!-- Amount input -->
								<FormGroup
									label="مبلغ USDT"
									error={$errors?.amountUsdt || ''}
									showError={!!$errors?.amountUsdt}
								>
									<div class="relative">
										<Input
											id="amount-usdt"
											name="amountUsdt"
											type="text"
											placeholder="مثلا: 100"
											bind:value={amountUsdt}
											disabled={sellLoading}
											dir="ltr"
											onlyNumber={true}
											maxDecimals={2}
											on:input={() => {
												// Clear errors when user starts typing
												if ($errors?.amountUsdt) {
													validate({ amountUsdt });
												}
											}}
											className="pe-20"
										/>
										<button
											type="button"
											on:click={setMaxBalance}
											class="absolute start-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
											disabled={sellLoading || $authUser?.balanceUSDT === undefined}
										>
											حداکثر
										</button>
									</div>
								</FormGroup>

								<!-- Percentage buttons -->
								<div class="grid grid-cols-5 gap-2" dir="ltr">
									<button
										type="button"
										on:click={() => setAmountByPercentage(20)}
										class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:outline-none"
										disabled={sellLoading || $authUser?.balanceUSDT === undefined}
									>
										۲۰٪
									</button>
									<button
										type="button"
										on:click={() => setAmountByPercentage(40)}
										class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:outline-none"
										disabled={sellLoading || $authUser?.balanceUSDT === undefined}
									>
										۴۰٪
									</button>
									<button
										type="button"
										on:click={() => setAmountByPercentage(60)}
										class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:outline-none"
										disabled={sellLoading || $authUser?.balanceUSDT === undefined}
									>
										۶۰٪
									</button>
									<button
										type="button"
										on:click={() => setAmountByPercentage(80)}
										class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-50 focus:ring-offset-1 focus:outline-none"
										disabled={sellLoading || $authUser?.balanceUSDT === undefined}
									>
										۸۰٪
									</button>
									<button
										type="button"
										on:click={() => setAmountByPercentage(100)}
										class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-50 focus:ring-offset-1 focus:outline-none"
										disabled={sellLoading || $authUser?.balanceUSDT === undefined}
									>
										۱۰۰٪
									</button>
								</div>

								<!-- USDT to IRT conversion display -->
								<div
									class="border-green-10 to-emerald-10 rounded-lg bg-gradient-to-br from-green-50 p-4"
								>
									<div class="flex items-center justify-between">
										<span class="text-xs font-medium text-gray-600">نرخ تبدیل لحظه‌ای</span>
										{#if usdtPriceLoading}
											<div class="h-4 w-20 animate-pulse rounded bg-green-200"></div>
										{:else}
											<span class="text-sm font-semibold text-gray-900">
												{formatNumber(currentUsdtPrice?.sellPrice)} تومان
											</span>
										{/if}
									</div>

									<div class="mt-2 flex items-center justify-between">
										<span class="text-xs font-medium text-gray-600">معادل تومان</span>
										<span class="text-sm font-semibold text-gray-900">
											{formatNumber((currentUsdtPrice?.sellPrice || 0) * parseFloat(amountUsdt))} تومان
										</span>
									</div>
								</div>

								<!-- Error display -->
								{#if errorMessage}
									<ErrorDisplay message={errorMessage} onDismiss={clearError} />
								{/if}

								<!-- Success display -->
								{#if successMessage}
									<SuccessDisplay
										message={successMessage}
										onDismiss={() => {
											successMessage = null;
										}}
									/>
								{/if}

								<!-- Submit button -->
								<div class="flex justify-end">
									<Button
										type="submit"
										loading={sellLoading}
										disabled={sellLoading}
										variant="primary"
									>
										{#if sellLoading}
											<div class="flex items-center">
												<span class="icon-[svg-spinners--bars-scale] me-2 h-4 w-4"></span>
												در حال پردازش...
											</div>
										{:else}
											<div class="flex items-center">
												<span class="icon-[heroicons--arrow-down-tray] me-2 h-4 w-4"></span>
												نقد کردن
											</div>
										{/if}
									</Button>
								</div>
							</div>
						</form>
					</Card>
				</div>

				<!-- Sidebar with instructions and information -->
				<div class="space-y-6">
					<!-- Current USDT Price -->
					{#if currentUsdtPrice}
						<Card variant="flat">
							<h3 class="flex items-center text-sm font-semibold text-gray-800">
								<span class="icon-[heroicons--currency-dollar] me-2 h-5 w-5 text-green-500"></span>
								نرخ لحظه‌ای USDT
							</h3>
							<div
								class="to-emerald-10 mt-3 rounded-lg bg-gradient-to-br from-green-50 p-4 text-center"
							>
								<p class="text-2xl font-bold text-gray-900">
									{formatNumber(currentUsdtPrice?.sellPrice)}
								</p>
								<p class="mt-1 text-xs text-gray-600">تومان</p>
							</div>
						</Card>
					{/if}

					<!-- Instructions -->
					<Card variant="flat">
						<h3 class="flex items-center text-sm font-semibold text-gray-800">
							<span class="icon-[heroicons--information-circle] me-2 h-5 w-5 text-blue-500"></span>
							دستورالعمل‌های فروش
						</h3>
						<div class="mt-4 space-y-4">
							<ul class="space-y-3">
								<li class="flex items-start">
									<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
									></span>
									<span class="text-sm text-gray-600">
										مبلغ USDT که می‌خواهید بفروشید را وارد کنید
									</span>
								</li>
								<li class="flex items-start">
									<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
									></span>
									<span class="text-sm text-gray-600">
										قیمت فروش بر اساس نرخ لحظه‌ای محاسبه می‌شود
									</span>
								</li>
								<li class="flex items-start">
									<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
									></span>
									<span class="text-sm text-gray-600">
										پس از تایید، مبلغ تومان معادل به حساب شما واریز خواهد شد
									</span>
								</li>
							</ul>
						</div>
					</Card>

					<!-- Important notes -->
					<Card variant="flat">
						<h3 class="flex items-center text-sm font-semibold text-gray-800">
							<span class="icon-[heroicons--exclamation-triangle] me-2 h-5 w-5 text-yellow-500"
							></span>
							نکات مهم
						</h3>
						<div class="mt-4 space-y-4">
							<div class="rounded-lg bg-yellow-50 p-3">
								<p class="text-sm text-yellow-700">حداقل مبلغ قابل فروش 0.01 USDT می‌باشد.</p>
							</div>
							<div class="rounded-lg bg-blue-50 p-3">
								<p class="text-sm text-blue-700">
									پس از فروش، مبلغ تومان معادل طی چند دقیقه به حساب شما واریز خواهد شد.
								</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</PanelPageWrapper>
	</GetCurrentUsdtPriceProvider>
</SellUsdtProvider>
