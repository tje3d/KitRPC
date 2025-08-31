<script lang="ts">
	import { authUser } from '$lib/flow/auth.flow';
	import { formatCurrency } from '$lib/helpers/utils.helper';
	import CurrencyIcon from '$lib/components/CurrencyIcon.svelte';
</script>

<div
	class="group relative overflow-hidden rounded-lg border border-gray-200/50 bg-gradient-to-br from-white/80 to-blue-50/60 p-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-gray-500/60 dark:from-gray-600/80 dark:to-gray-700/60"
>
	<!-- Title -->
	<div class="mb-3 flex items-center gap-2">
		<h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">موجودی حساب</h3>
		<div class="h-px flex-1 bg-gradient-to-r from-gray-200/60 to-transparent dark:from-gray-500/60"></div>
	</div>
	
	<div class="relative">
		{#if $authUser?.balanceIRT !== undefined && $authUser?.balanceUSDT !== undefined}
			<div class="space-y-1.5">
				<!-- IRT Balance -->
				<div
					class="flex items-center justify-between rounded-md bg-white/50 px-2 py-1.5 transition-all duration-200 hover:bg-white/70 dark:bg-gray-500/40 dark:hover:bg-gray-500/60"
				>
					<div class="flex items-center gap-2">
						<div
							class="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30"
						>
							<CurrencyIcon currency="IRT" size="sm" />
						</div>
						<span class="text-sm font-medium text-gray-600 dark:text-gray-400">ریال</span>
					</div>
					<span class="font-sans text-sm font-bold text-gray-900 dark:text-gray-100">
						{formatCurrency($authUser.balanceIRT, 'IRT')}
					</span>
				</div>

				<!-- USDT Balance -->
				<div
					class="flex items-center justify-between rounded-md bg-white/50 px-2 py-1.5 transition-all duration-200 hover:bg-white/70 dark:bg-gray-500/40 dark:hover:bg-gray-500/60"
				>
					<div class="flex items-center gap-2">
						<div
							class="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30"
						>
							<CurrencyIcon currency="USDT" size="sm" />
						</div>
						<span class="text-sm font-medium text-gray-600 dark:text-gray-400">تتر</span>
					</div>
					<span class="font-sans text-sm font-bold text-gray-900 dark:text-gray-100">
						{formatCurrency($authUser.balanceUSDT, 'USDT')}
					</span>
				</div>
			</div>
		{:else}
			<div class="space-y-1.5">
				<div class="animate-pulse">
					<!-- IRT Skeleton -->
					<div
						class="mb-1.5 flex items-center justify-between rounded-md bg-white/50 px-2 py-1.5 dark:bg-gray-500/40"
					>
						<div class="flex items-center gap-2">
							<div
								class="h-5 w-5 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-500 dark:to-gray-400"
							></div>
							<div class="h-2.5 w-6 rounded bg-gray-200 dark:bg-gray-500"></div>
						</div>
						<div class="h-3 w-16 rounded bg-gray-200 dark:bg-gray-500"></div>
					</div>

					<!-- USDT Skeleton -->
					<div
						class="flex items-center justify-between rounded-md bg-white/50 px-2 py-1.5 dark:bg-gray-500/40"
					>
						<div class="flex items-center gap-2">
							<div
								class="h-5 w-5 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-500 dark:to-gray-400"
							></div>
							<div class="h-2.5 w-6 rounded bg-gray-200 dark:bg-gray-500"></div>
						</div>
						<div class="h-3 w-14 rounded bg-gray-200 dark:bg-gray-500"></div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
