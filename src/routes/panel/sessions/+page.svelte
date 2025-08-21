<script lang="ts">
	import DeviceIcon from '$lib/components/DeviceIcon.svelte';
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import DTActionButton from '$lib/kit/DTActionButton.svelte';
	import DTColumn from '$lib/kit/DTColumn.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import StatusBadge from '$lib/kit/StatusBadge.svelte';
	import SessionProvider from '$lib/providers/SessionProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { tick } from 'svelte';
</script>

<SessionProvider
	onDeleteSuccess={(data) => {
		if (data) {
			toast.success('نشست با موفقیت پایان یافت');
		}
	}}
	onDeleteError={(error) => {
		toast.error(error || 'پایان دادن به نشست ناموفق بود');
	}}
	onError={(message) => toast.error(message || 'Failed to fetch sessions')}
	let:sessions
	let:loading
	let:errorMessage
	let:deleteLoading
	let:deleteErrorMessage
	let:clearError
	let:clearDeleteError
	let:getSessions
	let:deleteSession
	let:currentSession
>
	<PanelPageWrapper
		title="مدیریت نشست‌ها"
		description="مشاهده و مدیریت نشست‌های فعال خود در دستگاه‌ها."
	>
		<!-- Current Session Section -->
		<Card
			variant="flat"
			className="mb-8 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-xl ring ring-emerald-100/50"
		>
			<div class="relative z-10">
				<div
					class="flex flex-col justify-between border-b border-emerald-200/60 pb-6 sm:flex-row sm:items-center"
				>
					<div class="flex items-center space-x-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg"
						>
							<span class="icon-[heroicons--computer-desktop] h-5 w-5 text-white"></span>
						</div>
						<div>
							<h2
								class="bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-xl font-bold text-transparent"
							>
								نشست فعلی
							</h2>
							<p class="text-sm text-emerald-600/80">دستگاه فعال شما</p>
						</div>
					</div>
					<div class="mt-3 sm:mt-0">
						<div class="flex items-center space-x-2">
							<div class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
							<StatusBadge status="success" label="فعال" variant="default" />
						</div>
					</div>
				</div>

				{#if loading}
					<div class="flex justify-center py-8">
						<div class="flex flex-col items-center space-y-3">
							<span class="icon-[svg-spinners--bars-scale-fade] h-8 w-8 text-emerald-500"></span>
							<p class="text-sm text-emerald-600">در حال بارگذاری اطلاعات نشست...</p>
						</div>
					</div>
				{:else if currentSession}
					<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						<div
							class="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-emerald-300 hover:shadow-xl"
						>
							<div
								class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							></div>
							<div class="relative z-10">
								<div class="mb-3 flex items-center">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 transition-colors duration-300 group-hover:from-emerald-200 group-hover:to-green-200"
									>
										<DeviceIcon
											deviceType={currentSession.deviceType}
											className="h-4 w-4 text-emerald-600"
										/>
									</div>
									<span class="ms-3 text-sm font-semibold text-gray-700">دستگاه</span>
								</div>
								<p
									class="text-base font-bold text-gray-900 transition-colors duration-300 group-hover:text-emerald-700"
								>
									{currentSession.deviceType}
								</p>
							</div>
						</div>

						<div
							class="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-emerald-300 hover:shadow-xl"
						>
							<div
								class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							></div>
							<div class="relative z-10">
								<div class="mb-3 flex items-center">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 transition-colors duration-300 group-hover:from-blue-200 group-hover:to-indigo-200"
									>
										<span class="icon-[heroicons--globe-alt] h-4 w-4 text-blue-600"></span>
									</div>
									<span class="ms-3 text-sm font-semibold text-gray-700">مرورگر</span>
								</div>
								<p
									class="text-base font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700"
								>
									{currentSession.browser || 'Unknown'}
								</p>
							</div>
						</div>

						<div
							class="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-emerald-300 hover:shadow-xl"
						>
							<div
								class="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							></div>
							<div class="relative z-10">
								<div class="mb-3 flex items-center">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 transition-colors duration-300 group-hover:from-purple-200 group-hover:to-violet-200"
									>
										<span class="icon-[heroicons--globe-alt] h-4 w-4 text-purple-600"></span>
									</div>
									<span class="ms-3 text-sm font-semibold text-gray-700">آدرس IP</span>
								</div>
								<p
									class="font-mono text-base font-bold text-gray-900 transition-colors duration-300 group-hover:text-purple-700"
								>
									{currentSession.ipAddress || 'Unknown'}
								</p>
							</div>
						</div>

						<div
							class="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-emerald-300 hover:shadow-xl"
						>
							<div
								class="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							></div>
							<div class="relative z-10">
								<div class="mb-3 flex items-center">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 transition-colors duration-300 group-hover:from-orange-200 group-hover:to-amber-200"
									>
										<span class="icon-[heroicons--clock] h-4 w-4 text-orange-600"></span>
									</div>
									<span class="ms-3 text-sm font-semibold text-gray-700">زمان ورود</span>
								</div>
								<p
									class="text-base font-bold text-gray-900 transition-colors duration-300 group-hover:text-orange-700"
								>
									{currentSession.createdAt.toLocaleString('FA-IR')}
								</p>
							</div>
						</div>
					</div>
				{:else}
					<div class="py-12 text-center">
						<div
							class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100"
						>
							<span class="icon-[heroicons--exclamation-triangle] h-10 w-10 text-red-500"></span>
						</div>
						<h3 class="mb-2 text-lg font-bold text-gray-900">نشست فعلی یافت نشد</h3>
						<p class="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
							امکان دریافت اطلاعات نشست فعلی شما وجود ندارد. لطفاً صفحه را تازه‌سازی کنید یا دوباره
							وارد شوید.
						</p>
						<button
							class="mt-4 inline-flex items-center rounded-lg border border-transparent bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-emerald-600 hover:to-green-700 hover:shadow-xl focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
							on:click={() => window.location.reload()}
						>
							<span class="icon-[heroicons--arrow-path] me-2 h-4 w-4"></span>
							تازه‌سازی صفحه
						</button>
					</div>
				{/if}
			</div>
		</Card>

		<!-- All Sessions Section -->
		<Card variant="flat">
			<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="text-lg font-bold text-gray-800">نشست‌های فعال</h2>
					<p class="mt-1 text-sm text-gray-600">فهرست تمام نشست‌های فعال شما در دستگاه‌ها</p>
				</div>
			</div>

			<!-- Loading State -->
			{#if loading}
				<div class="flex justify-center py-12">
					<span class="icon-[svg-spinners--bars-scale-fade] h-8 w-8 text-blue-500"></span>
				</div>
			{/if}

			<!-- Error State -->
			{#if errorMessage}
				<Card variant="flat" className="mb-6">
					<div class="rounded-md bg-red-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<span class="icon-[heroicons--x-circle] h-5 w-5 text-red-400"></span>
							</div>
							<div class="ms-3">
								<h3 class="text-sm font-medium text-red-800">خطا در بارگذاری نشست‌ها</h3>
								<div class="mt-2 text-sm text-red-700">
									<p>{errorMessage}</p>
									<button
										class="mt-2 text-sm text-red-600 underline hover:text-red-500"
										on:click={() => {
											clearError();
										}}
									>
										رد
									</button>
								</div>
							</div>
						</div>
					</div>
				</Card>
			{/if}

			<!-- Sessions Table -->
			{#if !loading && !errorMessage}
				{#if sessions?.filter((s) => !s.isCurrent).length === 0}
					<div class="py-12 text-center">
						<div
							class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"
						>
							<span class="icon-[heroicons--device-phone-mobile] h-10 w-10 text-gray-400"></span>
						</div>
						<h3 class="text-lg font-medium text-gray-900">هیچ نشست دیگری یافت نشد</h3>
						<p class="mx-auto mt-2 max-w-sm text-sm text-gray-500">
							شما در حال حاضر تنها از این دستگاه وارد شده‌اید. نشست‌های دیگر در اینجا نمایش داده
							خواهند شد.
						</p>
					</div>
				{:else}
					<DataTable
						data={sessions?.filter((s) => !s.isCurrent)}
						itemsPerPage={1000}
						totalItems={sessions?.filter((s) => !s.isCurrent).length || 0}
						currentPage={1}
						showPagination={false}
						showCheckbox={false}
						showSearch={false}
					>
						<svelte:fragment slot="header" let:handleSort let:getSortIcon>
							<DTColumn>
								<svelte:fragment slot="header">دستگاه</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">مرورگر</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">آدرس IP</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">زمان ورود</svelte:fragment>
							</DTColumn>
							<DTColumn>
								<svelte:fragment slot="header">عملیات</svelte:fragment>
							</DTColumn>
						</svelte:fragment>

						<svelte:fragment slot="row" let:row>
							<DTColumn>
								<div class="flex items-center">
									<DeviceIcon deviceType={row.deviceType} className="h-5 w-5 text-gray-500" />
									<span class="ms-2 text-sm font-medium text-gray-900">{row.deviceType}</span>
								</div>
							</DTColumn>
							<DTColumn>
								<div class="flex items-center">
									<span class="icon-[heroicons--globe-alt] h-5 w-5 text-gray-500"></span>
									<span class="ms-2 text-sm text-gray-900">{row.browser || 'Unknown'}</span>
								</div>
							</DTColumn>
							<DTColumn>
								<div class="text-sm text-gray-500">
									{row.ipAddress || 'Unknown'}
								</div>
							</DTColumn>
							<DTColumn>
								<div class="text-sm text-gray-500">
									{row.createdAt.toLocaleString('FA-IR')}
								</div>
							</DTColumn>
							<DTColumn>
								<div class="flex items-center justify-end gap-2">
									<DTActionButton
										variant="delete"
										title="پایان دادن به نشست"
										onClick={() => {
											dialogStore.open({
												component: ConfirmDialog,
												props: {
													title: 'پایان دادن به نشست',
													message: `آیا مطمئن هستید که می‌خواهید نشست از ${row.deviceType} در ${row.createdAt.toLocaleString('FA-IR')} را پایان دهید؟ این عمل قابل بازگشت نیست.`,
													confirm: 'پایان دادن',
													cancel: 'لغو',
													color: 'red',
													onConfirm: () => {
														history.back();
														tick().then(() => {
															deleteSession(row.id);
														});
													}
												}
											});
										}}
									/>
								</div>
							</DTColumn>
						</svelte:fragment>
					</DataTable>
				{/if}
			{/if}
		</Card>
	</PanelPageWrapper>
</SessionProvider>
