<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { rules, useForm, type FormConfig } from '$lib/helpers/form.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
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

	// Form configuration
	const formConfig: FormConfig = {
		network: {
			rules: [rules.required],
			label: 'Network'
		},
		address: {
			rules: [rules.required],
			label: 'Address'
		}
	};

	// Initialize form helper
	const { errors, validate, reset: resetValidation } = useForm(formConfig);

	// Reset form
	function resetForm() {
		showAddForm = false;
		editingWallet = null;
		network = '';
		address = '';
		isActive = true;
		resetValidation();
	}

	// Define columns for the DataTable
	const columns = [
		{
			key: 'network',
			label: 'شبکه',
			sortable: true
		},
		{
			key: 'address',
			label: 'آدرس',
			sortable: true,
			render: (value: string) => `
				<div class="font-mono text-sm" dir="ltr">
					${value}
				</div>
			`
		},
		{
			key: 'isActive',
			label: 'وضعیت',
			sortable: true,
			render: (value: boolean) => `
				<div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
					${value ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}">
					<span class="me-1.5 h-3 w-3
					${value ? 'text-green-600 icon-[heroicons--check-circle]' : 'text-gray-600 icon-[heroicons--x-circle]'}">
					</span>
					<span>${value ? 'فعال' : 'غیرفعال'}</span>
				</div>
			`
		},
		{
			key: 'createdAt',
			label: 'ایجاد شده',
			sortable: true,
			render: (value: string) => `
				<div class="text-sm whitespace-nowrap text-gray-500">
					${new Date(value).toLocaleDateString()}
				</div>
			`
		},
		{
			key: 'actions',
			label: 'عملیات',
			render: (_: any, row: any) => `
				<div class="flex space-x-2">
					<button 
						class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
						title="ویرایش"
						data-action="edit"
						data-id="${row.id}"
					>
						<span class="icon-[heroicons--pencil-square] h-5 w-5"></span>
					</button>
					${
						!row.isActive
							? `
						<button 
							class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
							title="فعال‌سازی"
							data-action="activate"
							data-id="${row.id}"
						>
							<span class="icon-[heroicons--check-circle] h-5 w-5"></span>
						</button>
					`
							: ''
					}
					<button 
						class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
						title="حذف"
						data-action="delete"
						data-id="${row.id}"
					>
						<span class="icon-[heroicons--trash] h-5 w-5"></span>
					</button>
				</div>
			`
		}
	];
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

									<div class="flex items-center">
										<input
											type="checkbox"
											id="isActive"
											bind:checked={isActive}
											disabled={loadingCreate || loadingUpdate}
											class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<label for="isActive" class="ms-2 block text-sm text-gray-900"> فعال </label>
									</div>

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
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									on:click={(event) => {
										const target = event.target as HTMLElement;
										const button = target.closest('button[data-action]');

										if (!button) return;

										const action = button.getAttribute('data-action');
										const id = button.getAttribute('data-id');

										if (!action || !id) return;

										const wallet = wallets?.find((w) => w.id === id);
										if (!wallet) return;

										switch (action) {
											case 'edit':
												{
													editingWallet = {
														...wallet,
														createdAt: new Date(wallet.createdAt),
														updatedAt: new Date(wallet.updatedAt)
													};
													network = wallet.network;
													address = wallet.address;
													isActive = wallet.isActive;
													showAddForm = true;
												}
												break;
											case 'activate':
												{
													activateWalletAddress({ id: wallet.id });
												}
												break;
											case 'delete':
												dialogStore.open({
													component: ConfirmDialog,
													props: {
														title: 'حذف آدرس کیف پول',
														message: `آیا مطمئن هستید که می‌خواهید آدرس کیف پول ${wallet.network} را حذف کنید؟ این عمل قابل بازگشت نیست.`,
														confirm: 'حذف',
														cancel: 'لغو',
														color: 'red',
														onConfirm: () => {
															history.back();
															deleteWalletAddress({ id: wallet.id });
														}
													}
												});
												break;
										}
									}}
								>
									<DataTable
										data={wallets}
										{columns}
										itemsPerPage={10}
										showPagination={(wallets?.length || 0) > 10}
									/>
								</div>
							{/if}
						</Card>
					</PanelPageWrapper>
				</DeleteWalletAddressProvider>
			</ActivateWalletAddressProvider>
		</UpdateWalletAddressProvider>
	</CreateWalletAddressProvider>
</GetWalletAddressesProvider>
