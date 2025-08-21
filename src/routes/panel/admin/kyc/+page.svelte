<script lang="ts">
	import PermissionCheck from '$lib/components/PermissionCheck.svelte';
	import KycDetailsDialog from '$lib/dialog/KycDetailsDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import DTColumn from '$lib/kit/DTColumn.svelte';
	import Input from '$lib/kit/Input.svelte';
	import KycStatusIndicator from '$lib/kit/KycStatusIndicator.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import Select from '$lib/kit/Select.svelte';
	import ListKycProvider from '$lib/providers/ListKycProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { KycStatus } from '@prisma/client';
	import { tick } from 'svelte';

	// Pagination
	let currentPage = 1;
	const itemsPerPage = 10;

	// Filters
	let filters = {
		search: '',
		step1Status: '' as KycStatus | '',
		step2Status: '' as KycStatus | ''
	};

	// KYC status options
	const kycStatuses = [
		{ value: 'PENDING', label: 'در انتظار' },
		{ value: 'APPROVED', label: 'تأیید شده' },
		{ value: 'REJECTED', label: 'رد شده' }
	];

	$: requestOpts = {
		limit: itemsPerPage,
		offset: (currentPage - 1) * itemsPerPage,
		search: filters.search || undefined,
		step1Status: filters.step1Status || undefined,
		step2Status: filters.step2Status || undefined
	};
</script>

<PermissionCheck permission={{ resource: 'kyc', action: 'manage' }} redirect="/panel">
	<ListKycProvider
		let:loading
		let:clearError
		let:kycRequests
		let:pagination
		let:listKycRequests
		onError={(message) => toast.error(message || 'دریافت درخواست‌های KYC ناموفق بود')}
	>
		<PanelPageWrapper
			title="مدیریت احراز هویت"
			description="مشاهده و مدیریت درخواست‌های احراز هویت کاربران."
		>
			<!-- Filters Section -->
			<Card variant="flat" className="mb-6">
				<!-- Filter Header with Toggle -->
				<div class="flex items-center justify-between border-b border-gray-200 pb-4">
					<div class="flex items-center gap-2">
						<span class="icon-[heroicons--funnel] h-5 w-5 text-gray-500"></span>
						<h2 class="text-lg font-semibold text-gray-800">فیلترها</h2>
					</div>
					<div class="flex items-center gap-3">
						<Button
							size="sm"
							variant="secondary"
							onClick={() => {
								filters = {
									search: '',
									step1Status: '',
									step2Status: ''
								};
								currentPage = 1;
								tick().then(() => {
									listKycRequests(requestOpts);
								});
							}}
						>
							<span class="icon-[heroicons--arrow-path] me-1 h-4 w-4"></span>
							بازنشانی
						</Button>
						<Button
							size="sm"
							onClick={() => {
								currentPage = 1;
								tick().then(() => {
									listKycRequests(requestOpts);
								});
							}}
						>
							<span class="icon-[heroicons--magnifying-glass] me-1 h-4 w-4"></span>
							اعمال
						</Button>
					</div>
				</div>

				<!-- Filter Fields -->
				<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 md:grid-cols-4">
					<!-- Search -->
					<div>
						<label for="search" class="mb-2 block text-sm font-medium text-gray-700"> جستجو </label>
						<Input
							id="search"
							name="search"
							type="text"
							placeholder="جستجو بر اساس نام کاربری"
							bind:value={filters.search}
							className="text-sm"
						/>
					</div>

					<!-- Step 1 Status -->
					<div>
						<Select
							id="step1Status"
							name="step1Status"
							label="وضعیت مرحله ۱"
							value={filters.step1Status}
							options={[{ value: '', label: 'همه' }, ...kycStatuses]}
							placeholder="انتخاب کنید"
							onChange={(value) => {
								filters.step1Status = value as KycStatus | '';
							}}
							className="text-sm"
						/>
					</div>

					<!-- Step 2 Status -->
					<div>
						<Select
							id="step2Status"
							name="step2Status"
							label="وضعیت مرحله ۲"
							value={filters.step2Status}
							options={[{ value: '', label: 'همه' }, ...kycStatuses]}
							placeholder="انتخاب کنید"
							onChange={(value) => {
								filters.step2Status = value as KycStatus | '';
							}}
							className="text-sm"
						/>
					</div>
				</div>
			</Card>

			<!-- Loading State -->
			{#if loading}
				<div class="flex justify-center py-12">
					<span class="icon-[svg-spinners--bars-scale-fade] h-8 w-8 text-blue-500"></span>
				</div>
			{/if}

			<!-- KYC Requests Table -->
			{#if !loading}
				<Card variant="flat">
					<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 class="text-lg font-bold text-gray-800">درخواست‌های احراز هویت</h2>
							<p class="mt-1 text-sm text-gray-600">فهرست درخواست‌های احراز هویت کاربران</p>
						</div>
					</div>

					{#if kycRequests?.length === 0}
						<div class="py-12 text-center">
							<div class="mx-auto h-12 w-12 text-gray-400">
								<span class="icon-[heroicons--document-text] h-12 w-12"></span>
							</div>
							<h3 class="mt-2 text-sm font-medium text-gray-900">هیچ درخواستی یافت نشد</h3>
							<p class="mt-1 text-sm text-gray-500">
								سعی کنید فیلترهای خود را تغییر دهید تا آنچه را که به دنبالش هستید پیدا کنید.
							</p>
						</div>
					{:else}
						<DataTable
							data={kycRequests || []}
							{itemsPerPage}
							totalItems={pagination?.totalCount || 0}
							{currentPage}
							showPagination={(pagination?.totalCount || 0) > itemsPerPage}
							onPageChange={(page) => {
								if (page < 1 || page > Math.ceil((pagination?.totalCount || 1) / itemsPerPage))
									return;
								currentPage = page;
								listKycRequests(requestOpts);
							}}
						>
							<svelte:fragment slot="header" let:handleSort let:getSortIcon>
								<DTColumn sortable={true} sortKey="username" onSort={handleSort} {getSortIcon}>
									<svelte:fragment slot="header">نام کاربری</svelte:fragment>
								</DTColumn>
								<DTColumn sortable={true} sortKey="nationalId" onSort={handleSort} {getSortIcon}>
									<svelte:fragment slot="header">کد ملی</svelte:fragment>
								</DTColumn>
								<DTColumn sortable={true} sortKey="mobile" onSort={handleSort} {getSortIcon}>
									<svelte:fragment slot="header">شماره موبایل</svelte:fragment>
								</DTColumn>
								<DTColumn sortable={true} sortKey="step1Status" onSort={handleSort} {getSortIcon}>
									<svelte:fragment slot="header">وضعیت مرحله ۱</svelte:fragment>
								</DTColumn>
								<DTColumn sortable={true} sortKey="step2Status" onSort={handleSort} {getSortIcon}>
									<svelte:fragment slot="header">وضعیت مرحله ۲</svelte:fragment>
								</DTColumn>
								<DTColumn sortable={true} sortKey="birthDate" onSort={handleSort} {getSortIcon}>
									<svelte:fragment slot="header">تاریخ تولد</svelte:fragment>
								</DTColumn>
								<DTColumn>
									<svelte:fragment slot="header">عملیات</svelte:fragment>
								</DTColumn>
							</svelte:fragment>

							<svelte:fragment slot="row" let:row>
								<DTColumn>
									{row?.user?.username || ''}
								</DTColumn>
								<DTColumn>
									{row.nationalId}
								</DTColumn>
								<DTColumn>
									{row.mobile}
								</DTColumn>
								<DTColumn>
									<KycStatusIndicator status={row.step1Status} size="sm" />
								</DTColumn>
								<DTColumn>
									<KycStatusIndicator status={row.step2Status} size="sm" />
								</DTColumn>
								<DTColumn>
									<div class="text-sm whitespace-nowrap text-gray-500">
										{new Date(row.birthDate).toLocaleDateString('fa-IR')}
									</div>
								</DTColumn>
								<DTColumn>
									<div class="flex gap-2">
										<button
											class="view-details-btn rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
											on:click={() => {
												dialogStore.open({
													component: KycDetailsDialog,
													props: {
														kycId: row.id
													}
												});
											}}
										>
											مشاهده جزئیات
										</button>
									</div>
								</DTColumn>
							</svelte:fragment>
						</DataTable>
					{/if}
				</Card>
			{/if}
		</PanelPageWrapper>
	</ListKycProvider>
</PermissionCheck>
