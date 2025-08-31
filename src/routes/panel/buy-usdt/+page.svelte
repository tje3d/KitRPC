<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import CurrencyIcon from '$lib/components/CurrencyIcon.svelte';
	import { authUser } from '$lib/flow/auth.flow';
	import { rules, useForm, type FormConfig } from '$lib/helpers/form.helper';
	import { formatNumberAdvanced } from '$lib/helpers/formatNumber.helper';
	import { Instructions, Notes } from '$lib/kit';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import SuccessDisplay from '$lib/kit/SuccessDisplay.svelte';
	import BuyUsdtProvider from '$lib/providers/BuyUsdtProvider.svelte';
	import GetCurrentUsdtPriceProvider from '$lib/providers/GetCurrentUsdtPriceProvider.svelte';
	import { toast } from '$lib/toast/store';

	// Form configuration
	const formConfig: FormConfig = {
		amountUsdt: {
			rules: [rules.required, rules.minAmount(0.01)],
			label: 'مبلغ USDT'
		}
	};

	// Form helper
	const { errors, validate, reset: resetValidation } = useForm(formConfig);

	// State
	let amountUsdt: string = '';
	let successMessage: string | null = null;
	let errorMessage: string | null = null;
	let buyUsdtProvider: BuyUsdtProvider | null = null;
	let currentUsdtPrice: { buyPrice: number; sellPrice: number } | null = null;

	// Set amount based on percentage of balance
	function setAmountByPercentage(percentage: number) {
		if ($authUser?.balanceIRT !== undefined && currentUsdtPrice?.buyPrice) {
			// For buying, we need to calculate based on IRT balance and current buy price
			const usdtAmount = ($authUser.balanceIRT / currentUsdtPrice.buyPrice) * (percentage / 100);
			amountUsdt = formatNumberAdvanced(usdtAmount, { decimals: 2, separator: false });
		}
	}

	// Set amount to maximum based on IRT balance
	function setMaxBalance() {
		if ($authUser?.balanceIRT !== undefined && currentUsdtPrice?.buyPrice) {
			const maxUsdt = $authUser.balanceIRT / currentUsdtPrice.buyPrice;
			amountUsdt = formatNumberAdvanced(maxUsdt, { decimals: 2, separator: false });
		}
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

<GetCurrentUsdtPriceProvider
	let:loading={usdtPriceLoading}
	let:currentPrice={currentUsdtPrice}
	onSuccess={(data) => {
		currentUsdtPrice = data;
	}}
	onError={handleError}
>
	<BuyUsdtProvider
		bind:this={buyUsdtProvider}
		let:loading={buyLoading}
		let:clearError
		let:buyUsdt
		onSuccess={(data) => {
			successMessage = `خرید ${formatNumber(data.transaction?.amount || 0)} تتر با موفقیت انجام شد.`;
			resetValidation();
			amountUsdt = '';

			// Show toast notification
			toast.success(successMessage);

			// Refresh current USDT price
			invalidateAll();
		}}
		onError={handleError}
	>
		<PanelPageWrapper title="خدمات ارز دیجیتال" description="خرید USDT با تومان">
			<!-- Background with gradient -->
			<div
				class="to-indigo-10 absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50"
			></div>
			<div
				class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/30 via-blue-100/20 to-indigo-200/30"
			></div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Main content area -->
				<div class="lg:col-span-2">
					<!-- Glass morphism card -->
					<Card variant="elevated">
						<form
							on:submit|preventDefault={() => {
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

								// Check if user has enough IRT balance
								if (
									$authUser?.balanceIRT !== undefined &&
									currentUsdtPrice?.buyPrice &&
									amount * currentUsdtPrice.buyPrice > $authUser.balanceIRT
								) {
									errorMessage = 'موجودی تومان شما کافی نیست';
									return;
								}

								// Trigger buy USDT request
								buyUsdt({ amountUsdt: amount });
							}}
						>
							<div class="space-y-6">
								<!-- Live USDT Price Display -->
								<div class="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-6 shadow-lg">
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-sm font-medium text-blue-100">نرخ لحظه‌ای خرید USDT</h3>
											{#if usdtPriceLoading}
												<div class="mt-2 h-8 w-32 animate-pulse rounded-lg bg-blue-400/30"></div>
											{:else}
												<p class="mt-1 text-2xl font-bold text-white">
													{formatNumber(currentUsdtPrice?.buyPrice)}
													<span class="text-lg">تومان</span>
												</p>
											{/if}
										</div>
										<div class="icon-[heroicons--currency-dollar] h-12 w-12 text-white/90"></div>
									</div>
								</div>

								<!-- User Balance Information -->
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div
										class="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-5 backdrop-blur-sm"
									>
										<div class="flex items-center gap-3">
											<div class="rounded-xl bg-blue-500/20 p-3">
												<CurrencyIcon currency="USDT" size="md" />
											</div>
											<div>
												<h3 class="text-xs font-medium text-blue-700">موجودی USDT</h3>
												{#if $authUser?.balanceUSDT !== undefined}
													<p class="mt-1 text-xl font-bold text-blue-900">
														{formatNumber($authUser.balanceUSDT)}
													</p>
												{:else}
													<div class="mt-1 h-6 w-20 animate-pulse rounded bg-blue-200"></div>
												{/if}
											</div>
										</div>
									</div>

									<div
										class="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/10 to-orange-500/10 p-5 backdrop-blur-sm"
									>
										<div class="flex items-center gap-3">
											<div class="rounded-xl bg-amber-500/20 p-3">
												<CurrencyIcon currency="IRT" size="md" />
											</div>
											<div>
												<h3 class="text-xs font-medium text-amber-700">موجودی تومان</h3>
												{#if $authUser?.balanceIRT !== undefined}
													<p class="mt-1 text-xl font-bold text-amber-900">
														{formatNumber($authUser.balanceIRT)}
													</p>
												{:else}
													<div class="mt-1 h-6 w-20 animate-pulse rounded bg-amber-200"></div>
												{/if}
											</div>
										</div>
									</div>
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
											disabled={buyLoading}
											dir="ltr"
											onlyNumber={true}
											maxDecimals={2}
											on:input={() => {
												// Clear errors when user starts typing
												if ($errors?.amountUsdt) {
													validate({ amountUsdt });
												}
											}}
											className="pe-24 py-4 text-lg rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-inner ring-2 ring-gray-200 focus:ring-2 focus:ring-blue-500"
										/>
										<button
											type="button"
											on:click={setMaxBalance}
											class="absolute start-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
											disabled={buyLoading || $authUser?.balanceIRT === undefined}
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
										class="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 px-3 py-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:outline-none"
										disabled={buyLoading || $authUser?.balanceIRT === undefined}
									>
										۲۰٪
									</button>
									<button
										type="button"
										on:click={() => setAmountByPercentage(40)}
										class="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 px-3 py-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:outline-none"
										disabled={buyLoading || $authUser?.balanceIRT === undefined}
									>
										۴۰٪
									</button>
									<button
										type="button"
										on:click={() => setAmountByPercentage(60)}
										class="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 px-3 py-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:outline-none"
										disabled={buyLoading || $authUser?.balanceIRT === undefined}
									>
										۶۰٪
									</button>
									<button
										type="button"
										on:click={() => setAmountByPercentage(80)}
										class="rounded-xl border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 px-3 py-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:outline-none"
										disabled={buyLoading || $authUser?.balanceIRT === undefined}
									>
										۸۰٪
									</button>
									<button
										type="button"
										on:click={() => setAmountByPercentage(100)}
										class="rounded-xl border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 px-3 py-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:outline-none"
										disabled={buyLoading || $authUser?.balanceIRT === undefined}
									>
										۱۰۰٪
									</button>
								</div>

								<!-- USDT to IRT conversion display -->
								<div
									class="rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-500/10 to-indigo-50/10 p-5 backdrop-blur-sm"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											<span class="icon-[heroicons--arrows-right-left] h-5 w-5 text-blue-600"
											></span>
											<span class="text-sm font-medium text-blue-700">هزینه خرید</span>
										</div>
										<span class="text-lg font-bold text-blue-900">
											{formatNumber((currentUsdtPrice?.buyPrice || 0) * parseFloat(amountUsdt))} تومان
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
										loading={buyLoading}
										disabled={buyLoading}
										variant="primary"
										className="rounded-xl px-6 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
									>
										{#if buyLoading}
											<div class="flex items-center">
												<span class="icon-[svg-spinners--bars-scale] me-2 h-5 w-5"></span>
												در حال پردازش...
											</div>
										{:else}
											<div class="flex items-center">
												<span class="icon-[heroicons--arrow-down-tray] me-2 h-5 w-5"></span>
												خرید USDT
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
					<!-- Instructions -->
					<Instructions
						title="دستورالعمل‌های خرید"
						items={[
							'مبلغ USDT که می‌خواهید خریداری کنید را وارد کنید',
							'قیمت خرید بر اساس نرخ لحظه‌ای محاسبه می‌شود',
							'پس از تایید، مبلغ تومان معادل از حساب شما کسر و USDT به حساب شما واریز خواهد شد'
						]}
					/>

					<!-- Important notes -->
					<Notes
						title="نکات مهم"
						notes={[
							{
								text: 'حداقل مبلغ قابل خرید 0.01 USDT می‌باشد.',
								type: 'warning'
							},
							{
								text: 'پس از خرید، مبلغ USDT معادل طی چند دقیقه به حساب شما واریز خواهد شد.',
								type: 'info'
							}
						]}
					/>
				</div>
			</div>
		</PanelPageWrapper>
	</BuyUsdtProvider>
</GetCurrentUsdtPriceProvider>
