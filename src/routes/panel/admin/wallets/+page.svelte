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
			label: 'Network',
			sortable: true
		},
		{
			key: 'address',
			label: 'Address',
			sortable: true,
			render: (value: string) => `
				<div class="font-mono text-sm" dir="ltr">
					${value}
				</div>
			`
		},
		{
			key: 'isActive',
			label: 'Status',
			sortable: true,
			render: (value: boolean) => `
				<div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
					${value ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}">
					<span class="me-1.5 h-3 w-3
					${value ? 'text-green-600 icon-[heroicons--check-circle]' : 'text-gray-600 icon-[heroicons--x-circle]'}">
					</span>
					<span>${value ? 'Active' : 'Inactive'}</span>
				</div>
			`
		},
		{
			key: 'createdAt',
			label: 'Created',
			sortable: true,
			render: (value: string) => `
				<div class="text-sm whitespace-nowrap text-gray-500">
					${new Date(value).toLocaleDateString()}
				</div>
			`
		},
		{
			key: 'actions',
			label: 'Actions',
			render: (_: any, row: any) => `
				<div class="flex space-x-2">
					<button 
						class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
						title="Edit"
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
							title="Activate"
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
						title="Delete"
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
		toast.error(error || 'Failed to fetch wallet addresses');
	}}
	let:getWalletAddresses
>
	<CreateWalletAddressProvider
		onSuccess={(data) => {
			if (data) {
				toast.success('Wallet address added successfully');
				resetForm();
				getWalletAddresses();
			}
		}}
		onError={(error) => {
			toast.error(error || 'Failed to add wallet address');
		}}
		let:createWalletAddress
		let:loading={loadingCreate}
	>
		<UpdateWalletAddressProvider
			onSuccess={(data) => {
				if (data) {
					toast.success('Wallet address updated successfully');
					resetForm();
					getWalletAddresses();
				}
			}}
			onError={(error) => {
				toast.error(error || 'Failed to update wallet address');
			}}
			let:updateWalletAddress
			let:loading={loadingUpdate}
		>
			<ActivateWalletAddressProvider
				onSuccess={(data) => {
					if (data) {
						toast.success('Wallet address activated');
						getWalletAddresses();
					}
				}}
				onError={(error) => {
					toast.error(error || 'Failed to activate wallet address');
				}}
				let:activateWalletAddress
			>
				<DeleteWalletAddressProvider
					onSuccess={(data) => {
						if (data) {
							toast.success('Wallet address deleted successfully');
							getWalletAddresses();
						}
					}}
					onError={(error) => {
						toast.error(error || 'Failed to delete wallet address');
					}}
					let:deleteWalletAddress
				>
					<PanelPageWrapper
						title="Wallet Management"
						description="Manage wallet addresses for different networks."
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
								Add New Wallet
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
									{editingWallet ? 'Edit Wallet Address' : 'Add New Wallet Address'}
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
										label="Network"
										error={$errors?.network || ''}
										showError={!!$errors?.network}
									>
										<Input
											type="text"
											placeholder="e.g., Tron, Ethereum, Binance"
											bind:value={network}
											disabled={loadingCreate || loadingUpdate}
											id="network"
											name="network"
										/>
										<p class="mt-1 text-sm text-gray-500">
											Enter the network name for this wallet address
										</p>
									</FormGroup>

									<FormGroup
										label="Address"
										error={$errors?.address || ''}
										showError={!!$errors?.address}
									>
										<Input
											type="text"
											placeholder="Wallet address"
											bind:value={address}
											disabled={loadingCreate || loadingUpdate}
											id="address"
											name="address"
											dir="ltr"
										/>
										<p class="mt-1 text-sm text-gray-500">Enter the wallet address</p>
									</FormGroup>

									<div class="flex items-center">
										<input
											type="checkbox"
											id="isActive"
											bind:checked={isActive}
											disabled={loadingCreate || loadingUpdate}
											class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<label for="isActive" class="ms-2 block text-sm text-gray-900"> Active </label>
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
													Saving...
												</span>
											{:else}
												{editingWallet ? 'Update Wallet' : 'Add Wallet'}
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
									<h2 class="text-lg font-bold text-gray-800">Wallet Addresses</h2>
									<p class="mt-1 text-sm text-gray-600">List of all wallet addresses</p>
								</div>
							</div>

							{#if wallets?.length === 0 && !loading}
								<div class="py-12 text-center">
									<div class="mx-auto h-12 w-12 text-gray-400">
										<span class="icon-[heroicons--wallet] h-12 w-12"></span>
									</div>
									<h3 class="mt-2 text-sm font-medium text-gray-900">No wallet addresses</h3>
									<p class="mt-1 text-sm text-gray-500">
										Get started by adding a new wallet address.
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
											Add New Wallet
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
														title: 'Delete Wallet Address',
														message: `Are you sure you want to delete the ${wallet.network} wallet address? This action cannot be undone.`,
														confirm: 'Delete',
														cancel: 'Cancel',
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
