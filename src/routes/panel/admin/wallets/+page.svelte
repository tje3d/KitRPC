<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { rules, useForm } from '$lib/helpers/form.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import Checkbox from '$lib/kit/Checkbox.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import DTActionButton from '$lib/kit/DTActionButton.svelte';
	import DTColumn from '$lib/kit/DTColumn.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import ActivateWalletAddressProvider from '$lib/providers/ActivateWalletAddressProvider.svelte';
	import CreateWalletAddressProvider from '$lib/providers/CreateWalletAddressProvider.svelte';
	import DeleteWalletAddressProvider from '$lib/providers/DeleteWalletAddressProvider.svelte';
	import GetWalletAddressesProvider from '$lib/providers/GetWalletAddressesProvider.svelte';
	import UpdateWalletAddressProvider from '$lib/providers/UpdateWalletAddressProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { WalletAddress } from '@prisma/client';

	// State
	let showAddForm = false;
	let editingWallet: WalletAddress | null = null;

	// Form state
	let network = '';
	let address = '';
	let isActive = true;

	// Initialize form helper
	const {
		errors,
		validate,
		reset: resetValidation
	} = useForm({
		network: {
			rules: [rules.required],
			label: 'Network'
		},
		address: {
			rules: [rules.required],
			label: 'Address'
		}
	});

	// Reset form
	function resetForm() {
		showAddForm = false;
		editingWallet = null;
		network = '';
		address = '';
		isActive = true;
		resetValidation();
	}
</script>

<GetWalletAddressesProvider
	let:loading
	let:wallets
	onError={(error) => {
		toast.error(error || 'دریافت آدرس‌های کیف پول ناموفق بود');
	}}
	let:getWalletAddresses
>
	<CreateWalletAddressProvider
		onSuccess={(data) => {
			if (data) {
				toast.success('آدرس کیف پول با موفقیت اضافه شد');
				resetForm();
				getWalletAddresses();
			}
		}}
		onError={(error) => {
			toast.error(error || 'افزودن آدرس کیف پول ناموفق بود');
		}}
		let:createWalletAddress
		let:loading={loadingCreate}
	>
		<UpdateWalletAddressProvider
			onSuccess={(data) => {
				if (data) {
					toast.success('آدرس کیف پول با موفقیت به‌روزرسانی شد');
					resetForm();
					getWalletAddresses();
				}
			}}
			onError={(error) => {
				toast.error(error || 'به‌روزرسانی آدرس کیف پول ناموفق بود');
			}}
			let:updateWalletAddress
			let:loading={loadingUpdate}
		>
			<ActivateWalletAddressProvider
				onSuccess={(data) => {
					if (data) {
						toast.success('آدرس کیف پول فعال شد');
						getWalletAddresses();
					}
				}}
				onError={(error) => {
					toast.error(error || 'فعال‌سازی آدرس کیف پول ناموفق بود');
				}}
				let:activateWalletAddress
			>
				<DeleteWalletAddressProvider
					onSuccess={(data) => {
						if (data) {
							toast.success('آدرس کیف پول با موفقیت حذف شد');
							getWalletAddresses();
						}
					}}
					onError={(error) => {
						toast.error(error || 'حذف آدرس کیف پول ناموفق بود');
					}}
					let:deleteWalletAddress
				>
					<PanelPageWrapper
						title="مدیریت کیف پول"
						description="مدیریت آدرس‌های کیف پول برای شبکه‌های مختلف."
					>
						<svelte:fragment slot="actions">
							<Button
								className="px-4 py-2"
								onClick={() => {
									showAddForm = true;
									editingWallet = null;
									network = '';
									address = '';
									isActive = true;
								}}
							>
								افزودن کیف پول جدید
							</Button>
						</svelte:fragment>

						<!-- Loading state -->
						{#if loading}
							<div class="flex justify-center py-12">
								<span class="icon-[svg-spinners--bars-scale-fade] h-8 w-8 text-blue-500"></span>
							</div>
						{/if}

						<!-- Add/Edit Wallet Form -->
						{#if showAddForm}
							<Card variant="flat" className="mb-6">
								<h2 class="mb-4 text-lg font-bold text-gray-800">
									{editingWallet ? 'ویرایش آدرس کیف پول' : 'افزودن آدرس کیف پول جدید'}
								</h2>

								<form
									on:submit|preventDefault={() => {
										if (!validate({ network, address })) {
											return;
										}

										if (editingWallet) {
											// Update existing wallet
											updateWalletAddress({
												id: editingWallet.id,
												data: {
													network: network.trim(),
													address: address.trim(),
													isActive
												}
											});
										} else {
											// Create new wallet
											createWalletAddress({
												network: network.trim(),
												address: address.trim(),
												isActive
											});
										}
									}}
									class="space-y-4"
								>
									<FormGroup
										label="شبکه"
										error={$errors?.network || ''}
										showError={!!$errors?.network}
									>
										<Input
											type="text"
											placeholder="مثال: ترون، اتریوم، بایننس"
											bind:value={network}
											disabled={loadingCreate || loadingUpdate}
											id="network"
											name="network"
										/>
										<p class="mt-1 text-sm text-gray-500">
											نام شبکه برای این آدرس کیف پول را وارد کنید
										</p>
									</FormGroup>

									<FormGroup
										label="آدرس"
										error={$errors?.address || ''}
										showError={!!$errors?.address}
									>
										<Input
											type="text"
											placeholder="آدرس کیف پول"
											bind:value={address}
											disabled={loadingCreate || loadingUpdate}
											id="address"
											name="address"
											dir="ltr"
										/>
										<p class="mt-1 text-sm text-gray-500">آدرس کیف پول را وارد کنید</p>
									</FormGroup>

									<Checkbox
										id="isActive"
										name="isActive"
										bind:checked={isActive}
										disabled={loadingCreate || loadingUpdate}
										label="فعال"
									/>

									<div class="flex justify-end space-x-3 pt-2">
										<Button
											variant="secondary"
											onClick={resetForm}
											disabled={loadingCreate || loadingUpdate}>Cancel</Button
										>
										<Button type="submit" disabled={loadingCreate || loadingUpdate}>
											{#if loadingCreate || loadingUpdate}
												<span class="flex items-center justify-center gap-2">
													<span class="icon-[svg-spinners--bars-scale-fade] h-4 w-4"></span>
													در حال ذخیره...
												</span>
											{:else}
												{editingWallet ? 'به‌روزرسانی کیف پول' : 'افزودن کیف پول'}
											{/if}
										</Button>
									</div>
								</form>
							</Card>
						{/if}

						<!-- Wallets List -->
						<Card variant="flat">
							<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h2 class="text-lg font-bold text-gray-800">آدرس‌های کیف پول</h2>
									<p class="mt-1 text-sm text-gray-600">لیست همه آدرس‌های کیف پول</p>
								</div>
							</div>

							{#if wallets?.length === 0 && !loading}
								<div class="py-12 text-center">
									<div class="mx-auto h-12 w-12 text-gray-400">
										<span class="icon-[heroicons--wallet] h-12 w-12"></span>
									</div>
									<h3 class="mt-2 text-sm font-medium text-gray-900">آدرس کیف پولی وجود ندارد</h3>
									<p class="mt-1 text-sm text-gray-500">
										با افزودن یک آدرس کیف پول جدید شروع کنید.
									</p>
									<div class="mt-6">
										<Button
											onClick={() => {
												showAddForm = true;
												editingWallet = null;
												network = '';
												address = '';
												isActive = true;
											}}
										>
											افزودن کیف پول جدید
										</Button>
									</div>
								</div>
							{:else}
								<DataTable
									data={wallets}
									itemsPerPage={10}
									showPagination={(wallets?.length || 0) > 10}
								>
									<svelte:fragment slot="header">
										<DTColumn sortable sortKey="network">
											<svelte:fragment slot="header">شبکه</svelte:fragment>
										</DTColumn>
										<DTColumn sortable sortKey="address">
											<svelte:fragment slot="header">آدرس</svelte:fragment>
										</DTColumn>
										<DTColumn sortable sortKey="isActive">
											<svelte:fragment slot="header">وضعیت</svelte:fragment>
										</DTColumn>
										<DTColumn sortable sortKey="createdAt">
											<svelte:fragment slot="header">ایجاد شده</svelte:fragment>
										</DTColumn>
										<DTColumn>
											<svelte:fragment slot="header">عملیات</svelte:fragment>
										</DTColumn>
									</svelte:fragment>

									<svelte:fragment slot="row" let:row>
										<DTColumn>
											{row.network}
										</DTColumn>
										<DTColumn>
											<div class="font-mono text-sm" dir="ltr">
												{row.address}
											</div>
										</DTColumn>
										<DTColumn>
											<div
												class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
													{row.isActive
													? 'border-green-200 bg-green-100 text-green-800'
													: 'border-gray-200 bg-gray-100 text-gray-800'}"
											>
												<span
													class="me-1.5 h-3 w-3
														{row.isActive
														? 'icon-[heroicons--check-circle] text-green-600'
														: 'icon-[heroicons--x-circle] text-gray-600'}"
												>
												</span>
												<span>{row.isActive ? 'فعال' : 'غیرفعال'}</span>
											</div>
										</DTColumn>
										<DTColumn>
											<div class="text-sm whitespace-nowrap text-gray-500">
												{new Date(row.createdAt).toLocaleDateString()}
											</div>
										</DTColumn>
										<DTColumn>
											<div class="flex space-x-2">
												<DTActionButton
													variant="edit"
													title="ویرایش"
													onClick={() => {
														editingWallet = row;
														network = row.network;
														address = row.address;
														isActive = row.isActive;
														showAddForm = true;
													}}
												/>
												{#if !row.isActive}
													<DTActionButton
														variant="custom"
														title="فعال‌سازی"
														icon="icon-[heroicons--check-circle]"
														customClass="border-green-300 bg-white text-green-700 hover:bg-green-50 focus:ring-green-500"
														onClick={() => {
															activateWalletAddress({ id: row.id });
														}}
													/>
												{/if}
												<DTActionButton
													variant="delete"
													title="حذف"
													onClick={() => {
														dialogStore.open({
															component: ConfirmDialog,
															props: {
																title: 'حذف آدرس کیف پول',
																message: `آیا مطمئن هستید که می‌خواهید آدرس کیف پول ${row.network} را حذف کنید؟ این عمل قابل بازگشت نیست.`,
																confirm: 'حذف',
																cancel: 'لغو',
																color: 'red',
																onConfirm: () => {
																	history.back();
																	deleteWalletAddress({ id: row.id });
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
						</Card>
					</PanelPageWrapper>
				</DeleteWalletAddressProvider>
			</ActivateWalletAddressProvider>
		</UpdateWalletAddressProvider>
	</CreateWalletAddressProvider>
</GetWalletAddressesProvider>
