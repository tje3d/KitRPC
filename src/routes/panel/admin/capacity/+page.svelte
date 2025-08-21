<script lang="ts">
	import CurrencyIcon from '$lib/components/CurrencyIcon.svelte';
	import { renderCurrencyWithIcon } from '$lib/helpers/Currency.helper';
	import { formatCurrency } from '$lib/helpers/utils.helper';
	import { Button, Card, DataTable, FormGroup, Input, PanelPageWrapper } from '$lib/kit';
	import CreateCapacityTransactionProvider from '$lib/providers/CreateCapacityTransactionProvider.svelte';
	import GetCapacityTransactionsProvider from '$lib/providers/GetCapacityTransactionsProvider.svelte';
	import GetSystemCapacityStatsProvider from '$lib/providers/GetSystemCapacityStatsProvider.svelte';
	import { toast } from '$lib/toast/store';

	// وضعیت فرم
	let showAddForm = false;
	let formData: {
		currency: 'USDT' | 'IRT' | '';
		amount: string;
		description: string;
	} = {
		currency: '',
		amount: '',
		description: ''
	};

	// وضعیت صفحه‌بندی
	let currentPage = 1;
	let itemsPerPage = 10;

	// گزینه‌های ارز
	const currencyOptions = [
		{ value: 'USDT', label: 'USDT - Tether' },
		{ value: 'IRT', label: 'IRT - تومان' }
	];

	// پیکربندی نمایش ارز
	const currencyConfig = {
		USDT: {
			color: 'from-green-500 to-emerald-600'
		},
		IRT: {
			color: 'from-blue-500 to-indigo-600'
		}
	};

	// اعتبارسنجی فرم
	$: isFormValid =
		formData.currency &&
		formData.amount &&
		!isNaN(parseFloat(formData.amount)) &&
		formData.description.trim();

	// بازنشانی فرم
	function resetForm() {
		formData = {
			currency: '' as 'USDT' | 'IRT' | '',
			amount: '',
			description: ''
		};
		showAddForm = false;
	}
</script>

<PanelPageWrapper title="مدیریت ظرفیت" description="نظارت بر ظرفیت سیستم و مدیریت تراکنش‌های ظرفیت">
	<div class="flex flex-col gap-6">
		<GetSystemCapacityStatsProvider
			onError={(error) => {
				toast.error(error || 'خطا در دریافت آمار ظرفیت');
			}}
			let:loading={statsLoading}
			let:capacityStats
			let:getStats
		>
			<GetCapacityTransactionsProvider
				onError={(error) => {
					toast.error(error || 'خطا در دریافت تراکنش‌ها');
				}}
				let:loading={transactionsLoading}
				let:transactions
				let:totalCount
				let:getCapacityTransactions
			>
				<CreateCapacityTransactionProvider
					onSuccess={(data) => {
						if (data) {
							toast.success('تراکنش با موفقیت ایجاد شد');
							resetForm();
							// به‌روزرسانی آمار و تراکنش‌ها
							getStats();
							getCapacityTransactions({
								limit: itemsPerPage,
								offset: (currentPage - 1) * itemsPerPage
							});
						}
					}}
					onError={(error) => {
						toast.error(error || 'خطا در ایجاد تراکنش');
					}}
					let:createCapacityTransaction
					let:loading={createLoading}
				>
					<!-- بخش آمار ظرفیت -->
					<div class="grid gap-4 md:grid-cols-2">
						{#if statsLoading}
							<div class="col-span-full">
								<Card>
									<div class="flex items-center justify-center py-8">
										<span class="icon-[svg-spinners--ring-resize] h-6 w-6 text-blue-600"></span>
										<span class="ms-2 text-gray-600">در حال بارگذاری آمار ظرفیت...</span>
									</div>
								</Card>
							</div>
						{:else if capacityStats && capacityStats.length > 0}
							{#each capacityStats as stat}
								{@const config = currencyConfig[stat.currency]}
								{#if config}
									<div
										class="relative overflow-hidden rounded-2xl bg-gradient-to-br {config.color} p-6 text-white shadow-lg"
									>
										<div class="relative z-10">
											<div class="flex items-center justify-between">
												<div class="flex items-center space-x-3">
													<CurrencyIcon
														currency={stat.currency}
														showLabel={true}
														size="lg"
														class="text-white"
													/>
												</div>
											</div>
											<div class="mt-4">
												<div class="text-3xl font-bold">
													{formatCurrency(stat.amount || 0, stat.currency)}
												</div>
												<p class="mt-1 text-sm text-white/90">موجودی قابل دسترس</p>
											</div>
										</div>
										<!-- الگوی تزئینی پس‌زمینه -->
										<div class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
										<div class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5"></div>
									</div>
								{/if}
							{/each}
						{:else}
							<div class="col-span-full">
								<Card>
									<div class="py-8 text-center">
										<span
											class="icon-[heroicons--information-circle] mx-auto h-12 w-12 text-gray-400"
										></span>
										<p class="mt-2 text-gray-600">هیچ داده ظرفیتی در دسترس نیست</p>
									</div>
								</Card>
							</div>
						{/if}
					</div>

					<!-- بخش عملیات -->
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h2 class="text-xl font-semibold text-gray-800">تراکنش‌های اخیر</h2>
						<div class="flex gap-2">
							<Button
								variant="secondary"
								onClick={() => {
									getStats();
									getCapacityTransactions({
										limit: itemsPerPage,
										offset: (currentPage - 1) * itemsPerPage
									});
								}}
								loading={statsLoading || transactionsLoading}
							>
								<span class="icon-[heroicons--arrow-path] h-4 w-4"></span>
								به‌روزرسانی
							</Button>
							<Button variant="gradient" onClick={() => (showAddForm = !showAddForm)}>
								<span class="icon-[heroicons--plus] h-4 w-4"></span>
								افزودن تراکنش
							</Button>
						</div>
					</div>

					<!-- فرم افزودن تراکنش -->
					{#if showAddForm}
						<Card>
							<form
								class="flex flex-col gap-4"
								on:submit|preventDefault={() => {
									if (isFormValid && formData.currency !== '') {
										createCapacityTransaction({
											currency: formData.currency as 'USDT' | 'IRT',
											amount: parseFloat(formData.amount),
											description: formData.description
										});
									}
								}}
							>
								<div class="mb-4">
									<h3 class="text-lg font-medium text-gray-800">افزودن تراکنش جدید</h3>
									<p class="text-sm text-gray-600">ایجاد تراکنش ظرفیت جدید</p>
								</div>

								<div class="grid gap-4 md:grid-cols-2">
									<FormGroup label="ارز" required>
										<select
											bind:value={formData.currency}
											class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 placeholder-gray-400 shadow-sm transition-all duration-200 ease-in-out focus:border-transparent focus:shadow-md focus:ring-2 focus:shadow-blue-100 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
											required
										>
											<option value="" disabled>انتخاب ارز</option>
											{#each currencyOptions as option}
												<option value={option.value}>{option.label}</option>
											{/each}
										</select>
									</FormGroup>

									<FormGroup label="مقدار" required>
										<Input
											id="capacity-amount"
											name="capacity-amount"
											bind:value={formData.amount}
											type="number"
											placeholder="مقدار را وارد کنید (مثبت یا منفی)"
											required
										/>
									</FormGroup>
								</div>

								<FormGroup label="توضیحات" required>
									<Input
										id="capacity-desc"
										name="capacity-desc"
										bind:value={formData.description}
										placeholder="توضیحات تراکنش را وارد کنید"
										required
									/>
								</FormGroup>

								<div class="flex gap-2 pt-4">
									<Button
										type="submit"
										variant="gradient-success"
										disabled={!isFormValid}
										loading={createLoading}
									>
										<span class="icon-[heroicons--check] h-4 w-4"></span>
										ایجاد تراکنش
									</Button>
									<Button type="button" variant="secondary" onClick={resetForm}>
										<span class="icon-[heroicons--x-mark] h-4 w-4"></span>
										لغو
									</Button>
								</div>
							</form>
						</Card>
					{/if}

					<!-- جدول تراکنش‌ها -->
					<Card>
						<DataTable
							data={transactions || []}
							loading={transactionsLoading}
							totalItems={totalCount}
							{currentPage}
							{itemsPerPage}
							onPageChange={(page) => {
								currentPage = page;

								getCapacityTransactions({
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
									on:click={() => handleSort('currency')}
								>
									<div class="flex items-center space-x-1">
										<span>ارز</span>
										<span class="{getSortIcon('currency')} h-4 w-4"></span>
									</div>
								</th>
								<th
									scope="col"
									class="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase hover:bg-gray-100"
									on:click={() => handleSort('amount')}
								>
									<div class="flex items-center space-x-1">
										<span>مقدار</span>
										<span class="{getSortIcon('amount')} h-4 w-4"></span>
									</div>
								</th>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									توضیحات
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
									{@html renderCurrencyWithIcon(row.currency)}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
									{formatCurrency(row.amount, row.currency)}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
									{row.description || '-'}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
									{row.createdAt.toLocaleString('fa-IR')}
								</td>
							</svelte:fragment>
						</DataTable>
					</Card>
				</CreateCapacityTransactionProvider>
			</GetCapacityTransactionsProvider>
		</GetSystemCapacityStatsProvider>
	</div>
</PanelPageWrapper>
