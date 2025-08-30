<script lang="ts">
	import { Button, Card, DataTable, FormGroup, Input, PanelPageWrapper } from '$lib/kit';
	import CreateUsdtPriceProvider from '$lib/providers/CreateUsdtPriceProvider.svelte';
	import GetCurrentUsdtPriceProvider from '$lib/providers/GetCurrentUsdtPriceProvider.svelte';
	import GetUsdtPriceHistoryProvider from '$lib/providers/GetUsdtPriceHistoryProvider.svelte';
	import { toast } from '$lib/toast/store';

	// Form state
	let showAddForm = false;
	let formData: {
		buyPrice: string;
		sellPrice: string;
	} = {
		buyPrice: '',
		sellPrice: ''
	};

	// Pagination state
	let currentPage = 1;
	let itemsPerPage = 10;

	// Validation
	$: isFormValid =
		formData.buyPrice &&
		formData.sellPrice &&
		!isNaN(parseFloat(formData.buyPrice)) &&
		!isNaN(parseFloat(formData.sellPrice)) &&
		parseFloat(formData.buyPrice) > 0 &&
		parseFloat(formData.sellPrice) > 0;

	// Reset form
	function resetForm() {
		formData = {
			buyPrice: '',
			sellPrice: ''
		};
		showAddForm = false;
	}

	// Format price for display
	function formatPrice(price: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(price);
	}
</script>

<PanelPageWrapper
	title="مدیریت قیمت USDT"
	description="تنظیم قیمت خرید و فروش USDT و مشاهده تاریخچه تغییرات"
>
	<div class="flex flex-col gap-6">
		<GetCurrentUsdtPriceProvider
			onError={(error) => {
				toast.error(error || 'خطا در دریافت قیمت فعلی USDT');
			}}
			let:loading={currentPriceLoading}
			let:currentPrice
			let:getCurrentUsdtPrice
		>
			<GetUsdtPriceHistoryProvider
				onError={(error) => {
					toast.error(error || 'خطا در دریافت تاریخچه قیمت‌ها');
				}}
				let:loading={historyLoading}
				let:priceHistory
				let:getUsdtPriceHistory
				let:response
			>
				<CreateUsdtPriceProvider
					onSuccess={(data) => {
						if (data) {
							toast.success('قیمت جدید با موفقیت ثبت شد');
							resetForm();
							// Refresh current price and history
							getCurrentUsdtPrice();
							getUsdtPriceHistory({
								limit: itemsPerPage,
								offset: (currentPage - 1) * itemsPerPage
							});
						}
					}}
					onError={(error) => {
						toast.error(error || 'خطا در ثبت قیمت جدید');
					}}
					let:createUsdtPrice
					let:loading={createLoading}
				>
					<!-- Current prices display -->
					<div class="grid gap-4">
						{#if currentPriceLoading}
							<Card variant="flat">
								<div class="flex items-center justify-center py-8">
									<span class="icon-[svg-spinners--ring-resize] h-6 w-6 text-blue-600"></span>
									<span class="ms-2 text-gray-600">در حال بارگذاری قیمت فعلی...</span>
								</div>
							</Card>
						{:else if currentPrice}
							<Card variant="flat">
								<div class="flex flex-col">
									<h3 class="mb-4 text-lg font-medium text-gray-800">قیمت‌های فعلی USDT</h3>

									<!-- Price comparison layout -->
									<div class="mb-6 flex items-center justify-between">
										<div class="text-center">
											<div class="mb-1 flex items-center justify-center text-green-600">
												<span class="icon-[heroicons--arrow-trending-up] me-1 h-5 w-5"></span>
												<span class="text-sm font-medium">خرید</span>
											</div>
											<div class="text-2xl font-bold text-gray-900">
												{formatPrice(currentPrice.buyPrice)}
											</div>
											<div class="mt-1 text-xs text-gray-500">تومان</div>
										</div>

										<!-- Price difference indicator -->
										{#if currentPrice.sellPrice > currentPrice.buyPrice}
											<div class="flex flex-col items-center">
												<div class="mb-1 text-xs text-gray-500">تفاوت</div>
												<div class="flex items-center">
													<span class="icon-[heroicons--arrow-up] h-4 w-4 text-green-500"></span>
													<span class="ms-1 text-sm font-medium text-green-600">
														{formatPrice(currentPrice.sellPrice - currentPrice.buyPrice)}
													</span>
												</div>
											</div>
										{:else}
											<div class="flex flex-col items-center">
												<div class="mb-1 text-xs text-gray-500">تفاوت</div>
												<div class="flex items-center">
													<span class="icon-[heroicons--arrow-down] h-4 w-4 text-red-500"></span>
													<span class="ms-1 text-sm font-medium text-red-600">
														{formatPrice(currentPrice.buyPrice - currentPrice.sellPrice)}
													</span>
												</div>
											</div>
										{/if}

										<div class="text-center">
											<div class="mb-1 flex items-center justify-center text-red-600">
												<span class="icon-[heroicons--arrow-trending-down] me-1 h-5 w-5"></span>
												<span class="text-sm font-medium">فروش</span>
											</div>
											<div class="text-2xl font-bold text-gray-900">
												{formatPrice(currentPrice.sellPrice)}
											</div>
											<div class="mt-1 text-xs text-gray-500">تومان</div>
										</div>
									</div>

									<!-- Visual price bar -->
									<div class="relative pt-4">
										<div class="mb-1 flex justify-between text-xs text-gray-500">
											<span>خرید</span>
											<span>فروش</span>
										</div>
										<div class="h-2 overflow-hidden rounded-full bg-gray-200">
											<div
												class="h-full bg-gradient-to-r from-green-500 to-red-500"
												style="width: 100%"
											></div>
										</div>
										<div class="mt-1 flex justify-between">
											<div
												class="absolute -translate-x-1/2 transform text-xs font-medium text-green-600"
												style="left: {(currentPrice.buyPrice /
													(currentPrice.buyPrice + currentPrice.sellPrice)) *
													100}%"
											>
												{formatPrice(currentPrice.buyPrice)}
											</div>
											<div
												class="absolute -translate-x-1/2 transform text-xs font-medium text-red-600"
												style="left: {(currentPrice.sellPrice /
													(currentPrice.buyPrice + currentPrice.sellPrice)) *
													100}%"
											>
												{formatPrice(currentPrice.sellPrice)}
											</div>
										</div>
									</div>
								</div>
							</Card>
						{:else}
							<Card variant="flat">
								<div class="py-8 text-center">
									<span class="icon-[heroicons--information-circle] mx-auto h-12 w-12 text-gray-400"
									></span>
									<p class="mt-2 text-gray-600">هیچ قیمتی ثبت نشده است</p>
								</div>
							</Card>
						{/if}
					</div>

					<!-- Actions section -->
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h2 class="text-xl font-semibold text-gray-800">تاریخچه قیمت‌ها</h2>
						<div class="flex gap-2">
							<Button
								variant="secondary"
								onClick={() => {
									getCurrentUsdtPrice();
									getUsdtPriceHistory({
										limit: itemsPerPage,
										offset: (currentPage - 1) * itemsPerPage
									});
								}}
								loading={currentPriceLoading || historyLoading}
							>
								<span class="icon-[heroicons--arrow-path] h-4 w-4"></span>
								به‌روزرسانی
							</Button>
							<Button variant="gradient" onClick={() => (showAddForm = !showAddForm)}>
								<span class="icon-[heroicons--plus] h-4 w-4"></span>
								ثبت قیمت جدید
							</Button>
						</div>
					</div>

					<!-- Add price form -->
					{#if showAddForm}
						<Card>
							<form
								class="flex flex-col gap-4"
								on:submit|preventDefault={() => {
									if (isFormValid) {
										createUsdtPrice({
											buyPrice: parseFloat(formData.buyPrice),
											sellPrice: parseFloat(formData.sellPrice)
										});
									}
								}}
							>
								<div class="mb-4">
									<h3 class="text-lg font-medium text-gray-800">ثبت قیمت جدید</h3>
									<p class="text-sm text-gray-600">ثبت قیمت خرید و فروش جدید برای USDT</p>
								</div>

								<div class="grid gap-4 md:grid-cols-2">
									<FormGroup label="قیمت خرید (تومان)" required>
										<Input
											id="buy-price"
											name="buy-price"
											bind:value={formData.buyPrice}
											type="number"
											placeholder="قیمت خرید را وارد کنید"
											required
										/>
									</FormGroup>

									<FormGroup label="قیمت فروش (تومان)" required>
										<Input
											id="sell-price"
											name="sell-price"
											bind:value={formData.sellPrice}
											type="number"
											placeholder="قیمت فروش را وارد کنید"
											required
										/>
									</FormGroup>
								</div>

								<div class="flex gap-2 pt-4">
									<Button
										type="submit"
										variant="gradient-success"
										disabled={!isFormValid}
										loading={createLoading}
									>
										<span class="icon-[heroicons--check] h-4 w-4"></span>
										ثبت قیمت
									</Button>
									<Button type="button" variant="secondary" onClick={resetForm}>
										<span class="icon-[heroicons--x-mark] h-4 w-4"></span>
										لغو
									</Button>
								</div>
							</form>
						</Card>
					{/if}

					<!-- Price history table -->
					<Card>
						<DataTable
							data={priceHistory?.prices || []}
							loading={historyLoading}
							totalItems={response?.totalCount || 0}
							{currentPage}
							{itemsPerPage}
							onPageChange={(page) => {
								currentPage = page;

								getUsdtPriceHistory({
									limit: itemsPerPage,
									offset: (currentPage - 1) * itemsPerPage
								});
							}}
							showPagination={true}
						>
							<svelte:fragment slot="header" let:handleSort let:getSortIcon>
								<th
									scope="col"
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
									on:click={() => handleSort('id')}
								>
									<div class="flex items-center space-x-1">
										<span>ID</span>
										<span class="{getSortIcon('id')} h-4 w-4"></span>
									</div>
								</th>
								<th
									scope="col"
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
									on:click={() => handleSort('buyPrice')}
								>
									<div class="flex items-center space-x-1">
										<span>قیمت خرید</span>
										<span class="{getSortIcon('buyPrice')} h-4 w-4"></span>
									</div>
								</th>
								<th
									scope="col"
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
									on:click={() => handleSort('sellPrice')}
								>
									<div class="flex items-center space-x-1">
										<span>قیمت فروش</span>
										<span class="{getSortIcon('sellPrice')} h-4 w-4"></span>
									</div>
								</th>
								<th
									scope="col"
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
									on:click={() => handleSort('createdAt')}
								>
									<div class="flex items-center space-x-1">
										<span>تاریخ ایجاد</span>
										<span class="{getSortIcon('createdAt')} h-4 w-4"></span>
									</div>
								</th>
							</svelte:fragment>

							<svelte:fragment slot="row" let:row>
								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
									{row.id}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
									{formatPrice(row.buyPrice)} تومان
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
									{formatPrice(row.sellPrice)} تومان
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
									{new Date(row.createdAt).toLocaleString('fa-IR')}
								</td>
							</svelte:fragment>
						</DataTable>
					</Card>
				</CreateUsdtPriceProvider>
			</GetUsdtPriceHistoryProvider>
		</GetCurrentUsdtPriceProvider>
	</div>
</PanelPageWrapper>
