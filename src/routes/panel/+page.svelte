<script lang="ts">
	import { base } from '$app/paths';
	import CurrencyIcon from '$lib/components/CurrencyIcon.svelte';
	import { authUser } from '$lib/flow/auth.flow';
	import { renderCurrencyWithIcon } from '$lib/helpers/Currency.helper';
	import {
		getTransactionStatusClass,
		getTransactionStatusLabel,
		getTransactionTypeClass,
		getTransactionTypeLabel
	} from '$lib/helpers/transaction.helper';
	import { formatCurrency, formatDateTimeTwoLines } from '$lib/helpers/utils.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import DTColumn from '$lib/kit/DTColumn.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import GetBankProvider from '$lib/providers/GetBankProvider.svelte';
	import GetCardsProvider from '$lib/providers/GetCardsProvider.svelte';
	import TransactionHistoryProvider from '$lib/providers/TransactionHistoryProvider.svelte';

	// Quick actions
	const quickActions = [
		{
			title: 'واریز',
			description: 'واریز وجه به حساب',
			icon: 'icon-[heroicons--arrow-down-tray]',
			href: `${base}/panel/deposit`
		},
		{
			title: 'برداشت',
			description: 'برداشت وجه از حساب',
			icon: 'icon-[heroicons--arrow-up-tray]',
			href: `${base}/panel/withdraw`
		},
		{
			title: 'نقد کردن درآمد ارزی',
			description: 'خرید تتر از شما',
			icon: 'icon-[heroicons--currency-dollar]',
			href: `${base}/panel/sell-usdt`
		},
		{
			title: 'کارت‌ها',
			description: 'مدیریت کارت‌های بانکی',
			icon: 'icon-[heroicons--credit-card]',
			href: `${base}/panel/cards`
		}
	];
</script>

<PanelPageWrapper title="داشبورد" description="خلاصه‌ای از فعالیت‌های اخیر شما">
	<svelte:fragment slot="actions">
		<Button href="{base}/panel/transactions" variant="gradient" className="px-6 py-2.5">
			<span class="icon-[heroicons--chart-bar] ml-2 h-4 w-4"></span>
			مشاهده تراکنش‌ها
		</Button>
	</svelte:fragment>

	<!-- User Stats -->
	<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<!-- IRT Balance Card -->
		<div
			class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-lg"
		>
			<div class="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10"></div>
			<div class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5"></div>

			<div class="relative z-10 flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-emerald-100">موجودی ریال</p>
					<p class="mt-1 text-2xl font-bold text-white">
						{#if $authUser?.balanceIRT !== undefined}
							{formatCurrency($authUser.balanceIRT, 'IRT')}
						{:else}
							-
						{/if}
					</p>
				</div>
				<div
					class="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"
				>
					<CurrencyIcon currency="IRT" size="lg" class="text-white" />
				</div>
			</div>

			<div class="relative z-10 mt-4 flex items-center text-emerald-100">
				<span class="text-sm">بروزرسانی: هم اکنون</span>
			</div>
		</div>

		<!-- USDT Balance Card -->
		<div
			class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 shadow-lg"
		>
			<div class="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10"></div>
			<div class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5"></div>

			<div class="relative z-10 flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-blue-100">موجودی USDT</p>
					<p class="mt-1 text-2xl font-bold text-white">
						{#if $authUser?.balanceUSDT !== undefined}
							{formatCurrency($authUser.balanceUSDT, 'USDT')}
						{:else}
							-
						{/if}
					</p>
				</div>
				<div
					class="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"
				>
					<CurrencyIcon currency="USDT" size="lg" class="text-white" />
				</div>
			</div>

			<div class="relative z-10 mt-4 flex items-center text-blue-100">
				<span class="text-sm">بروزرسانی: هم اکنون</span>
			</div>
		</div>

		<!-- KYC Status Card -->
		<div
			class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-6 shadow-lg"
		>
			<div class="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10"></div>
			<div class="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5"></div>

			<div class="relative z-10">
				<div class="flex items-center justify-between">
					<p class="text-sm font-medium text-purple-100">وضعیت احراز هویت</p>
					<div
						class="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"
					>
						<span class="icon-[heroicons--identification] h-6 w-6 text-white"></span>
					</div>
				</div>

				{#if $authUser?.kycVerification}
					{@const kyc = $authUser.kycVerification}
					<div class="mt-4 space-y-3">
						<!-- Step 1 Progress -->
						<div>
							<div class="flex items-center justify-between text-xs text-purple-100">
								<span>مرحله ۱</span>
								{#if kyc.step1Status === 'APPROVED'}
									<span class="flex items-center text-green-300">
										<span class="icon-[heroicons--check-circle] ml-1 h-3 w-3"></span>
										تایید شده
									</span>
								{:else if kyc.step1Status === 'PENDING'}
									<span class="flex items-center text-amber-300">
										<span class="icon-[heroicons--clock] ml-1 h-3 w-3"></span>
										در انتظار
									</span>
								{:else if kyc.step1Status === 'REJECTED'}
									<span class="flex items-center text-red-300">
										<span class="icon-[heroicons--x-circle] ml-1 h-3 w-3"></span>
										رد شده
									</span>
								{:else}
									<span class="flex items-center text-gray-300">
										<span class="icon-[heroicons--minus-circle] ml-1 h-3 w-3"></span>
										ارسال نشده
									</span>
								{/if}
							</div>
							<div class="mt-1 h-1.5 w-full rounded-full bg-white/20">
								<div
									class="h-full rounded-full {kyc.step1Status === 'APPROVED'
										? 'bg-green-400'
										: kyc.step1Status === 'PENDING'
											? 'bg-amber-400'
											: kyc.step1Status === 'REJECTED'
												? 'bg-red-400'
												: 'bg-gray-400'}"
									style="width: {kyc.step1Status === 'APPROVED'
										? '100%'
										: kyc.step1Status === 'PENDING'
											? '50%'
											: kyc.step1Status === 'REJECTED'
												? '100%'
												: '0%'}"
								></div>
							</div>
						</div>

						<!-- Step 2 Progress -->
						<div>
							<div class="flex items-center justify-between text-xs text-purple-100">
								<span>مرحله ۲</span>
								{#if kyc.step2Status === 'APPROVED'}
									<span class="flex items-center text-green-300">
										<span class="icon-[heroicons--check-circle] ml-1 h-3 w-3"></span>
										تایید شده
									</span>
								{:else if kyc.step2Status === 'PENDING'}
									<span class="flex items-center text-amber-300">
										<span class="icon-[heroicons--clock] ml-1 h-3 w-3"></span>
										در انتظار
									</span>
								{:else if kyc.step2Status === 'REJECTED'}
									<span class="flex items-center text-red-300">
										<span class="icon-[heroicons--x-circle] ml-1 h-3 w-3"></span>
										رد شده
									</span>
								{:else}
									<span class="flex items-center text-gray-300">
										<span class="icon-[heroicons--minus-circle] ml-1 h-3 w-3"></span>
										ارسال نشده
									</span>
								{/if}
							</div>
							<div class="mt-1 h-1.5 w-full rounded-full bg-white/20">
								<div
									class="h-full rounded-full {kyc.step2Status === 'APPROVED'
										? 'bg-green-400'
										: kyc.step2Status === 'PENDING'
											? 'bg-amber-400'
											: kyc.step2Status === 'REJECTED'
												? 'bg-red-400'
												: 'bg-gray-400'}"
									style="width: {kyc.step2Status === 'APPROVED'
										? '100%'
										: kyc.step2Status === 'PENDING'
											? '50%'
											: kyc.step2Status === 'REJECTED'
												? '100%'
												: '0%'}"
								></div>
							</div>
						</div>
					</div>
				{:else}
					<div class="mt-4">
						<div class="flex items-center rounded-lg bg-white/10 p-3 backdrop-blur-sm">
							<span class="icon-[heroicons--exclamation-triangle] ml-2 h-5 w-5 text-amber-300"
							></span>
							<span class="text-sm text-amber-100">احراز هویت انجام نشده</span>
						</div>
						<Button
							href="{base}/panel/kyc"
							variant="secondary"
							size="sm"
							className="mt-3 w-full bg-white/20 text-white hover:bg-white/30"
						>
							شروع احراز هویت
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<Card variant="flat" className="mt-8 relative z-10">
		<div class="mb-6 flex items-center">
			<span class="icon-[heroicons--bolt] ml-3 h-6 w-6 text-blue-600"></span>
			<h2 class="text-xl font-bold text-gray-800">عملیات سریع</h2>
		</div>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each quickActions as action}
				<div
					class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
				>
					<a href={action.href} class="block">
						<div class="flex flex-col items-center text-center">
							<div
								class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-300 group-hover:from-blue-100 group-hover:to-indigo-200"
							>
								<span
									class="{action.icon} h-6 w-6 text-blue-600 transition-colors duration-300 group-hover:text-blue-700"
								></span>
							</div>
							<h3
								class="mb-2 text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700"
							>
								{action.title}
							</h3>
							<p
								class="text-sm text-gray-500 transition-colors duration-300 group-hover:text-gray-600"
							>
								{action.description}
							</p>
						</div>
						<div
							class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-5"
						></div>
					</a>
				</div>
			{/each}
		</div>
	</Card>

	<div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Transaction History -->
		<TransactionHistoryProvider
			let:transactions
			let:loading
			let:errorMessage
			let:getHistory
			onSuccess={() => {}}
			onError={() => {}}
		>
			<Card variant="flat" className="h-fit">
				<div class="mb-6 flex items-center justify-between">
					<div class="flex items-center">
						<span class="icon-[heroicons--clock] ml-3 h-6 w-6 text-green-600"></span>
						<h2 class="text-xl font-bold text-gray-800">تاریخچه تراکنش‌ها</h2>
					</div>
					<Button href="{base}/panel/transactions" variant="gradient-secondary" size="sm">
						<span class="icon-[heroicons--arrow-left] ml-1 h-3 w-3"></span>
						مشاهده همه
					</Button>
				</div>
				{#if loading}
					<div class="space-y-4">
						{#each Array(5) as _, i}
							<div class="flex animate-pulse items-center space-x-4 rounded-lg bg-gray-50 p-4">
								<div class="h-3 w-16 rounded bg-gray-200"></div>
								<div class="h-3 w-24 rounded bg-gray-200"></div>
								<div class="h-3 w-20 rounded bg-gray-200"></div>
								<div class="h-3 w-16 rounded bg-gray-200"></div>
								<div class="h-3 w-20 rounded bg-gray-200"></div>
							</div>
						{/each}
					</div>
				{:else if errorMessage}
					<div class="flex items-center justify-center p-8 text-center">
						<div class="rounded-lg border border-red-200 bg-red-50 p-6">
							<span class="icon-[heroicons--exclamation-triangle] mx-auto mb-3 h-8 w-8 text-red-500"
							></span>
							<p class="mb-1 font-medium text-red-700">خطا در بارگذاری تراکنش‌ها</p>
							<p class="text-sm text-red-600">{errorMessage}</p>
						</div>
					</div>
				{:else if transactions && transactions.length > 0}
					<div class="overflow-hidden rounded-lg border border-gray-200">
						<DataTable
							data={transactions}
							itemsPerPage={5}
							showPagination={false}
							className=""
							showSearch={false}
							showCheckbox={false}
						>
							<svelte:fragment slot="header" let:handleSort let:getSortIcon>
								<DTColumn>
									<svelte:fragment slot="header">نوع</svelte:fragment>
								</DTColumn>
								<DTColumn>
									<svelte:fragment slot="header">مبلغ</svelte:fragment>
								</DTColumn>
								<DTColumn>
									<svelte:fragment slot="header">واحد پول</svelte:fragment>
								</DTColumn>
								<DTColumn>
									<svelte:fragment slot="header">وضعیت</svelte:fragment>
								</DTColumn>
								<DTColumn>
									<svelte:fragment slot="header">تاریخ</svelte:fragment>
								</DTColumn>
							</svelte:fragment>
							<svelte:fragment slot="row" let:row>
								<DTColumn>
									<span class={getTransactionTypeClass(row.type)}>
										{getTransactionTypeLabel(row.type)}
									</span>
								</DTColumn>
								<DTColumn>
									{formatCurrency(row.amount, row.currency)}
								</DTColumn>
								<DTColumn>
									{@html renderCurrencyWithIcon(row.currency)}
								</DTColumn>
								<DTColumn>
									<span class={getTransactionStatusClass(row.status)}>
										{getTransactionStatusLabel(row.status)}
									</span>
								</DTColumn>
								<DTColumn>
									{@html formatDateTimeTwoLines(row.createdAt, 'fa-IR')}
								</DTColumn>
							</svelte:fragment>
						</DataTable>
					</div>
				{:else}
					<div class="flex items-center justify-center p-12 text-center">
						<div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
							<span class="icon-[heroicons--document-text] mx-auto mb-4 h-12 w-12 text-gray-400"
							></span>
							<h3 class="mb-2 text-lg font-medium text-gray-900">هنوز تراکنشی ندارید</h3>
							<p class="mb-4 text-gray-500">اولین تراکنش خود را انجام دهید</p>
							<Button href="{base}/panel/deposit" variant="gradient" size="sm">
								<span class="icon-[heroicons--plus] ml-1 h-4 w-4"></span>
								شروع کنید
							</Button>
						</div>
					</div>
				{/if}
			</Card>
		</TransactionHistoryProvider>

		<!-- Connected Bank Cards -->
		<GetCardsProvider let:cards let:loading let:errorMessage let:getCards>
			<Card variant="flat" className="h-fit">
				<div class="mb-6 flex items-center justify-between">
					<div class="flex items-center">
						<span class="icon-[heroicons--credit-card] ml-3 h-6 w-6 text-blue-600"></span>
						<h2 class="text-xl font-bold text-gray-800">کارت‌های بانکی متصل</h2>
					</div>
					<Button href="{base}/panel/cards" variant="gradient-secondary" size="sm">
						<span class="icon-[heroicons--cog-6-tooth] ml-1 h-3 w-3"></span>
						مدیریت کارت‌ها
					</Button>
				</div>
				{#if loading}
					<div class="space-y-4">
						{#each Array(3) as _, i}
							<div
								class="flex animate-pulse items-center rounded-lg border border-gray-200 bg-gray-50 p-4"
							>
								<div class="ml-3 h-10 w-10 rounded-lg bg-gray-200"></div>
								<div class="flex-1">
									<div class="mb-2 h-4 w-32 rounded bg-gray-200"></div>
									<div class="h-3 w-20 rounded bg-gray-200"></div>
								</div>
								<div class="h-3 w-16 rounded bg-gray-200"></div>
							</div>
						{/each}
					</div>
				{:else if errorMessage}
					<div class="flex items-center justify-center p-8 text-center">
						<div class="rounded-lg border border-red-200 bg-red-50 p-6">
							<span class="icon-[heroicons--exclamation-triangle] mx-auto mb-3 h-8 w-8 text-red-500"
							></span>
							<p class="mb-1 font-medium text-red-700">خطا در بارگذاری کارت‌ها</p>
							<p class="text-sm text-red-600">{errorMessage}</p>
						</div>
					</div>
				{:else if cards && cards.length > 0}
					<div class="space-y-4">
						{#each cards as card}
							<GetBankProvider cardNumber={card.cardNumber} let:bank>
								<div
									class="group relative overflow-hidden rounded-xl border border-gray-200 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
									style="background: {bank
										? `linear-gradient(135deg, ${bank.color}10, ${bank.color}20)`
										: 'linear-gradient(135deg, #f9fafb, #f3f4f6)'}; border-color: {bank
										? `${bank.color}40`
										: '#d1d5db'};"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center">
											<div
												class="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg"
												style="background: {bank
													? `linear-gradient(135deg, ${bank.color}, ${bank.color}dd)`
													: 'linear-gradient(135deg, #3b82f6, #6366f1)'};"
											>
												{#if bank}
													<img src="/img/banks/{bank.id}.svg" alt={bank.name} class="h-8 w-8" />
												{:else}
													<span class="icon-[heroicons--credit-card] h-6 w-6"></span>
												{/if}
											</div>
											<div class="ms-4">
												<h3
													class="text-end text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700"
													dir="ltr"
												>
													{#if card.cardNumber}
														**** **** **** {card.cardNumber.slice(-4)}
													{:else}
														کارت بانکی
													{/if}
												</h3>
												<div class="mt-1 flex items-center space-x-2">
													{#if bank}
														<span class="text-sm text-gray-600">{bank.name}</span>
													{/if}
													{#if card.isDefault}
														<span
															class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
														>
															<span class="icon-[heroicons--check-circle] ml-1 h-3 w-3"></span>
															کارت پیش‌فرض
														</span>
													{:else}
														<span
															class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
														>
															کارت ثانویه
														</span>
													{/if}
												</div>
											</div>
										</div>
										<div class="flex items-center text-sm text-gray-500">
											<span class="icon-[heroicons--calendar-days] ml-1 h-4 w-4"></span>
											{card.createdAt.toLocaleDateString('fa-IR')}
										</div>
									</div>
									<div
										class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5"
										style="background: {bank
											? `linear-gradient(135deg, ${bank.color}, ${bank.color})`
											: 'linear-gradient(135deg, #3b82f6, #6366f1)'};"
									></div>
								</div>
							</GetBankProvider>
						{/each}
					</div>
				{:else}
					<div class="flex items-center justify-center p-12 text-center">
						<div class="rounded-lg border border-gray-200 bg-gray-50 p-8">
							<span class="icon-[heroicons--credit-card] mx-auto mb-4 h-12 w-12 text-gray-400"
							></span>
							<h3 class="mb-2 text-lg font-medium text-gray-900">هنوز کارتی اضافه نکرده‌اید</h3>
							<p class="mb-4 text-gray-500">برای انجام تراکنش‌ها کارت بانکی خود را اضافه کنید</p>
							<Button href="{base}/panel/cards" variant="gradient" size="sm">
								<span class="icon-[heroicons--plus] ml-1 h-4 w-4"></span>
								افزودن کارت
							</Button>
						</div>
					</div>
				{/if}
			</Card>
		</GetCardsProvider>
	</div>
</PanelPageWrapper>
