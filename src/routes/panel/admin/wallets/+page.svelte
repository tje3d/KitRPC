<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import { toast } from '$lib/toast/store';
	import { trpc } from '$lib/trpc/client';
	import type { WalletAddress } from '@prisma/client';
	import { onMount } from 'svelte';

	// State
	let wallets: WalletAddress[] = [];
	let loading = false;
	let saving = false;
	let showAddForm = false;
	let editingWallet: WalletAddress | null = null;

	// Form state
	let network = '';
	let address = '';
	let isActive = true;
	let networkError = '';
	let addressError = '';

	// Fetch all wallet addresses
	async function fetchWallets() {
		loading = true;
		try {
			const result = await trpc().wallet.getWalletAddresses.query({});
			// Convert string dates to Date objects
			wallets = result.map((wallet) => ({
				...wallet,
				createdAt: new Date(wallet.createdAt),
				updatedAt: new Date(wallet.updatedAt)
			}));
		} catch (error) {
			toast.error('Failed to fetch wallet addresses');
			console.error('Error fetching wallets:', error);
		} finally {
			loading = false;
		}
	}

	// Validate form
	function validateForm(): boolean {
		let isValid = true;
		networkError = '';
		addressError = '';

		if (!network.trim()) {
			networkError = 'Network is required';
			isValid = false;
		}

		if (!address.trim()) {
			addressError = 'Address is required';
			isValid = false;
		}

		return isValid;
	}

	// Handle form submission for adding/editing a wallet
	async function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		saving = true;
		try {
			if (editingWallet) {
				// Update existing wallet
				await trpc().wallet.updateWalletAddress.mutate({
					id: editingWallet.id,
					data: {
						network: network.trim(),
						address: address.trim(),
						isActive
					}
				});
				toast.success('Wallet address updated successfully');
			} else {
				// Create new wallet
				await trpc().wallet.createWalletAddress.mutate({
					network: network.trim(),
					address: address.trim(),
					isActive
				});
				toast.success('Wallet address added successfully');
			}

			// Reset form
			resetForm();

			// Refresh wallets list
			await fetchWallets();
		} catch (error: any) {
			toast.error(error.message || 'Failed to save wallet address');
			console.error('Error saving wallet:', error);
		} finally {
			saving = false;
		}
	}

	// Activate a wallet address
	async function activateWallet(walletId: string) {
		try {
			await trpc().wallet.activateWalletAddress.mutate({ id: walletId });
			toast.success('Wallet address activated');
			await fetchWallets(); // Refresh the list
		} catch (error: any) {
			toast.error(error.message || 'Failed to activate wallet address');
			console.error('Error activating wallet:', error);
		}
	}

	// Show delete confirmation dialog
	function confirmDelete(wallet: WalletAddress) {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'Delete Wallet Address',
				message: `Are you sure you want to delete the ${wallet.network} wallet address? This action cannot be undone.`,
				confirm: 'Delete',
				cancel: 'Cancel',
				color: 'red',
				onConfirm: () => {
					deleteWallet(wallet.id);
				}
			}
		});
	}

	// Delete a wallet address
	async function deleteWallet(walletId: string) {
		try {
			await trpc().wallet.deleteWalletAddress.mutate({ id: walletId });
			toast.success('Wallet address deleted successfully');
			await fetchWallets(); // Refresh the list
		} catch (error: any) {
			toast.error(error.message || 'Failed to delete wallet address');
			console.error('Error deleting wallet:', error);
		}
	}

	// Reset form
	function resetForm() {
		showAddForm = false;
		editingWallet = null;
		network = '';
		address = '';
		isActive = true;
		networkError = '';
		addressError = '';
	}

	// Edit a wallet
	function editWallet(wallet: WalletAddress) {
		editingWallet = wallet;
		network = wallet.network;
		address = wallet.address;
		isActive = wallet.isActive;
		showAddForm = true;
	}

	// Load wallets when component mounts
	onMount(() => {
		fetchWallets();
	});

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
			render: (value: Date) => `
				<div class="text-sm whitespace-nowrap text-gray-500">
					${value.toLocaleDateString()}
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

	// Handle row actions
	function handleRowAction(event: Event) {
		const target = event.target as HTMLElement;
		const button = target.closest('button[data-action]');

		if (!button) return;

		const action = button.getAttribute('data-action');
		const id = button.getAttribute('data-id');

		if (!action || !id) return;

		const wallet = wallets.find((w) => w.id === id);
		if (!wallet) return;

		switch (action) {
			case 'edit':
				editWallet(wallet);
				break;
			case 'activate':
				activateWallet(wallet.id);
				break;
			case 'delete':
				confirmDelete(wallet);
				break;
		}
	}
</script>

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

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<FormGroup label="Network" error={networkError} showError={!!networkError}>
					<Input
						type="text"
						placeholder="e.g., Tron, Ethereum, Binance"
						bind:value={network}
						disabled={saving}
						id="network"
						name="network"
					/>
					<p class="mt-1 text-sm text-gray-500">Enter the network name for this wallet address</p>
				</FormGroup>

				<FormGroup label="Address" error={addressError} showError={!!addressError}>
					<Input
						type="text"
						placeholder="Wallet address"
						bind:value={address}
						disabled={saving}
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
						disabled={saving}
						class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<label for="isActive" class="ml-2 block text-sm text-gray-900"> Active </label>
				</div>

				<div class="flex justify-end space-x-3 pt-2">
					<Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>
					<Button type="submit" disabled={saving}>
						{#if saving}
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

		{#if wallets.length === 0 && !loading}
			<div class="py-12 text-center">
				<div class="mx-auto h-12 w-12 text-gray-400">
					<span class="icon-[heroicons--wallet] h-12 w-12"></span>
				</div>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No wallet addresses</h3>
				<p class="mt-1 text-sm text-gray-500">Get started by adding a new wallet address.</p>
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
			<div on:click={handleRowAction}>
				<DataTable
					data={wallets}
					{columns}
					itemsPerPage={10}
					showPagination={wallets.length > 10}
				/>
			</div>
		{/if}
	</Card>
</PanelPageWrapper>
