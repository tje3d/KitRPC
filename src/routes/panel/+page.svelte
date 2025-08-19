<script lang="ts">
	import { base } from '$app/paths';
	import { formatCurrency, formatDateTimeTwoLines } from '$lib/helpers/utils.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import type { Column } from '$lib/kit/DataTable.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import GetCardsProvider from '$lib/providers/GetCardsProvider.svelte';
	import TransactionHistoryProvider from '$lib/providers/TransactionHistoryProvider.svelte';
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
				return value === 'IRT' ? 'IRT' : 'USDT';
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
		<Button href="{base}/panel/transactions" variant="secondary" className="px-4 py-2">
			مشاهده تراکنش‌ها
		</Button>
	</svelte:fragment>

	<!-- Quick Actions -->
	<Card variant="flat" className="mt-6">
		<h2 class="mb-4 text-lg font-bold text-gray-800">عملیات سریع</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each quickActions as action}
				<Button
					href={action.href}
					variant="secondary"
					className="flex h-24 flex-col items-center justify-center"
				>
					<span class="{action.icon} mb-2 h-6 w-6 text-gray-600"></span>
					<span class="text-sm font-medium text-gray-900">{action.title}</span>
					<span class="mt-1 text-xs text-gray-500">{action.description}</span>
				</Button>
			{/each}
		</div>
	</Card>

	<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Transaction History -->
		<TransactionHistoryProvider
			let:transactions
			let:loading
			let:errorMessage
			let:getHistory
			onSuccess={() => {}}
			onError={() => {}}
		>
			<Card variant="flat">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-bold text-gray-800">تاریخچه تراکنش‌ها</h2>
					<Button href="{base}/panel/transactions" variant="secondary" size="sm">مشاهده همه</Button>
				</div>
				{#if loading}
					<div class="mt-4 space-y-4">
						{#each Array(5) as _, i}
							<div class="animate-pulse">
								<div class="mb-2 h-4 w-full rounded bg-gray-200"></div>
								<div class="h-4 w-3/4 rounded bg-gray-200"></div>
							</div>
						{/each}
					</div>
				{:else if errorMessage}
					<div class="mt-4 text-center text-red-600">
						خطا در بارگذاری تراکنش‌ها: {errorMessage}
					</div>
				{:else if transactions && transactions.length > 0}
					<DataTable
						data={transactions}
						columns={transactionColumns}
						itemsPerPage={5}
						showPagination={false}
						className="mt-4"
						showSearch={false}
						showCheckbox={false}
					/>
				{:else}
					<div class="mt-4 text-center text-gray-500">تراکنشی یافت نشد</div>
				{/if}
			</Card>
		</TransactionHistoryProvider>

		<!-- Connected Bank Cards -->
		<GetCardsProvider let:cards let:loading let:errorMessage let:getCards>
			<Card variant="flat">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-bold text-gray-800">کارت‌های بانکی متصل</h2>
					<Button href="{base}/panel/cards" variant="secondary" size="sm">مدیریت کارت‌ها</Button>
				</div>
				{#if loading}
					<div class="mt-4 space-y-4">
						{#each Array(3) as _, i}
							<div class="animate-pulse">
								<div class="mb-2 h-4 w-full rounded bg-gray-200"></div>
								<div class="h-4 w-3/4 rounded bg-gray-200"></div>
							</div>
						{/each}
					</div>
				{:else if errorMessage}
					<div class="mt-4 text-center text-red-600">
						خطا در بارگذاری کارت‌ها: {errorMessage}
					</div>
				{:else if cards && cards.length > 0}
					<div class="mt-4 space-y-3">
						{#each cards as card}
							<div class="flex items-center justify-between rounded-lg border border-gray-200 p-3">
								<div class="flex items-center">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600"
									>
										<span class="icon-[heroicons--credit-card] h-5 w-5"></span>
									</div>
									<div class="ms-3">
										<h3 class="font-medium text-gray-900">
											{#if card.cardNumber}
												**** **** **** {card.cardNumber.slice(-4)}
											{:else}
												کارت بانکی
											{/if}
										</h3>
										<p class="text-sm text-gray-500">
											{#if card.isDefault}
												<span class="text-green-600">کارت پیش‌فرض</span>
											{:else}
												کارت ثانویه
											{/if}
										</p>
									</div>
								</div>
								<div class="text-sm text-gray-500">
									{new Date(card.createdAt).toLocaleDateString('fa-IR')}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="mt-4 text-center text-gray-500">کارتی یافت نشد</div>
				{/if}
			</Card>
		</GetCardsProvider>
	</div>
</PanelPageWrapper>
