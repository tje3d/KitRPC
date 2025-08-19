<script lang="ts">
	import { authUser } from '$lib/flow/auth.flow';
	import { formatCurrency } from '$lib/helpers/utils.helper';
</script>

<div class="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="flex items-center gap-2 text-sm font-semibold text-gray-700">
			<span class="icon-[heroicons--currency-dollar] h-4 w-4 text-blue-600"></span>
			موجودی‌ها
		</h3>
	</div>

	{#if $authUser?.balanceIRT !== undefined && $authUser?.balanceUSDT !== undefined}
		<div class="space-y-2">
			<!-- IRT Balance -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					<span class="text-xs font-medium text-gray-600">IRT</span>
				</div>
				<span class="text-xs font-semibold text-gray-900">
					{formatCurrency($authUser.balanceIRT, 'IRT')}
				</span>
			</div>

			<!-- USDT Balance -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="h-2 w-2 rounded-full bg-yellow-500"></div>
					<span class="text-xs font-medium text-gray-600">USDT</span>
				</div>
				<span class="text-xs font-semibold text-gray-900">
					{formatCurrency($authUser.balanceUSDT, 'USDT')}
				</span>
			</div>
		</div>
	{:else}
		<div class="space-y-2">
			<div class="animate-pulse">
				<div class="mb-2 h-4 w-3/4 rounded bg-blue-200"></div>
				<div class="h-4 w-1/2 rounded bg-blue-200"></div>
			</div>
		</div>
	{/if}
</div>
