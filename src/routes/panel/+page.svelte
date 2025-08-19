<script lang="ts">
	import { base } from '$app/paths';
	import { authUser } from '$lib/flow/auth.flow';
	import { formatCurrency, formatDateTimeTwoLines } from '$lib/helpers/utils.helper';
	import { renderCurrencyWithIcon } from '$lib/helpers/Currency.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import type { Column } from '$lib/kit/DataTable.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import GetBankProvider from '$lib/providers/GetBankProvider.svelte';
	import GetCardsProvider from '$lib/providers/GetCardsProvider.svelte';
	import TransactionHistoryProvider from '$lib/providers/TransactionHistoryProvider.svelte';
	import CurrencyIcon from '$lib/components/CurrencyIcon.svelte';
	import type { CurrencyType, TransactionStatus, TransactionType } from '@prisma/client';

	// Transaction history columns
	const transactionColumns: Column[] = [
		{
			key: 'type',
			label: 'نوع',
			render: (value: TransactionType) => {
				switch (value) {
					case 'DEPOSIT':
						return '<span class="text-green-600">واریز</span>';
					case 'WITHDRAWAL':
						return '<span class="text-red-600">برداشت</span>';
					case 'TRANSFER':
						return '<span class="text-blue-600">انتقال</span>';
					default:
						return value;
				}
			}
		},
		{
			key: 'amount',
			label: 'مبلغ',
			render: (value: number, row: any) => {
				return formatCurrency(value, row.currency);
			}
		},
		{
			key: 'currency',
			label: 'واحد پول',
			render: (value: CurrencyType) => {
				return renderCurrencyWithIcon(value);
			}
		},
		{
			key: 'status',
			label: 'وضعیت',
			render: (value: TransactionStatus) => {
				switch (value) {
					case 'PENDING':
						return '<span class="text-yellow-600">در انتظار</span>';
					case 'COMPLETED':
						return '<span class="text-green-600">تکمیل شده</span>';
					case 'FAILED':
						return '<span class="text-red-600">ناموفق</span>';
					case 'CANCELLED':
						return '<span class="text-gray-600">لغو شده</span>';
					default:
						return value;
				}
			}
		},
		{
			key: 'createdAt',
			label: 'تاریخ',
			render: (value: string) => {
				return formatDateTimeTwoLines(value, 'fa-IR');
			}
		}
	];

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
			title: 'انتقال',
			description: 'انتقال وجه به کاربران دیگر',
			icon: 'icon-[heroicons--arrows-right-left]',
			href: `${base}/panel/transfer`
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
		<!-- IRT Balance -->
		<Card
			variant="glass"
			className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200"
		>
			<div class="flex items-center">
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
					<CurrencyIcon currency="IRT" size="lg" />
				</div>
				<div class="ms-4">
					<p class="text-sm font-medium text-gray-600">موجودی ریال</p>
					<p class="text-2xl font-bold text-gray-900">
						{#if $authUser?.balanceIRT !== undefined}
							{formatCurrency($authUser.balanceIRT, 'IRT')}
						{:else}
							-
						{/if}
					</p>
				</div>
			</div>
		</Card>

		<!-- USDT Balance -->
		<Card variant="glass" className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
			<div class="flex items-center">
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
					<CurrencyIcon currency="USDT" size="lg" />
				</div>
				<div class="ms-4">
					<p class="text-sm font-medium text-gray-600">موجودی USDT</p>
					<p class="text-2xl font-bold text-gray-900">
						{#if $authUser?.balanceUSDT !== undefined}
							{formatCurrency($authUser.balanceUSDT, 'USDT')}
						{:else}
							-
						{/if}
					</p>
				</div>
			</div>
		</Card>

		<!-- KYC Status -->
		<Card
			variant="glass"
			className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200"
		>
			<div class="flex items-center">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg"
				>
					<span class="icon-[heroicons--identification] h-6 w-6"></span>
				</div>
				<div class="ms-4 flex-1">
					<p class="mb-2 text-sm font-medium text-gray-600">وضعیت احراز هویت</p>
					{#if $authUser?.kycVerification}
						{@const kyc = $authUser.kycVerification}
						<div class="space-y-1">
							<!-- Step 1 Status -->
							<div class="flex items-center justify-between">
								<span class="text-xs text-gray-500">مرحله ۱:</span>
								{#if kyc.step1Status === 'APPROVED'}
									<span
										class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
									>
										<span class="icon-[heroicons--check-circle] ml-1 h-3 w-3"></span>
										تایید شده
									</span>
								{:else if kyc.step1Status === 'PENDING'}
									<span
										class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
									>
										<span class="icon-[heroicons--clock] ml-1 h-3 w-3"></span>
										در انتظار
									</span>
								{:else if kyc.step1Status === 'REJECTED'}
									<span
										class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
									>
										<span class="icon-[heroicons--x-circle] ml-1 h-3 w-3"></span>
										رد شده
									</span>
								{:else}
									<span
										class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
									>
										<span class="icon-[heroicons--minus-circle] ml-1 h-3 w-3"></span>
										ارسال نشده
									</span>
								{/if}
							</div>
							<!-- Step 2 Status -->
							<div class="flex items-center justify-between">
								<span class="text-xs text-gray-500">مرحله ۲:</span>
								{#if kyc.step2Status === 'APPROVED'}
									<span
										class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
									>
										<span class="icon-[heroicons--check-circle] ml-1 h-3 w-3"></span>
										تایید شده
									</span>
								{:else if kyc.step2Status === 'PENDING'}
									<span
										class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
									>
										<span class="icon-[heroicons--clock] ml-1 h-3 w-3"></span>
										در انتظار
									</span>
								{:else if kyc.step2Status === 'REJECTED'}
									<span
										class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
									>
										<span class="icon-[heroicons--x-circle] ml-1 h-3 w-3"></span>
										رد شده
									</span>
								{:else}
									<span
										class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
									>
										<span class="icon-[heroicons--minus-circle] ml-1 h-3 w-3"></span>
										ارسال نشده
									</span>
								{/if}
							</div>
						</div>
					{:else}
						<span
							class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
						>
							<span class="icon-[heroicons--exclamation-triangle] ml-1 h-3 w-3"></span>
							احراز نشده
						</span>
					{/if}
				</div>
			</div>
		</Card>
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
							columns={transactionColumns}
							itemsPerPage={5}
							showPagination={false}
							className=""
							showSearch={false}
							showCheckbox={false}
						/>
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
													class="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700"
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
