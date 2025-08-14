<script lang="ts">
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import QRCode from '$lib/kit/QRCode.svelte';
	import { trpc } from '$lib/trpc/client';
	import { onMount } from 'svelte';
	import { detectIranianBank } from '$lib/helpers/IranianBanks.helper';
	import type { BankCard } from '@prisma/client';

	// State
	let activeTab: 'irt' | 'usdt' = 'usdt';
	let loading = false;
	let error: string | null = null;

	// USDT deposit state
	let networks = [{ id: 'tron', name: 'Tron (TRC20)', value: 'tron' }];
	let selectedNetwork = 'tron';
	let walletAddress: string | null = null;
	let walletAddressLoading = false;
	let walletAddressError: string | null = null;

	// IRT deposit state
	let bankCards: BankCard[] = [];
	let bankCardsLoading = false;
	let bankCardsError: string | null = null;
	let selectedCardId: string | null = null;

	// Fetch wallet address for USDT deposit
	async function fetchWalletAddress() {
		if (activeTab !== 'usdt') return;

		walletAddressLoading = true;
		walletAddressError = null;

		try {
			const result = await trpc().wallet.getActiveWalletAddressByNetwork.query({
				network: selectedNetwork
			});
			walletAddress = result.address;
		} catch (err: any) {
			walletAddressError = err.message || 'Failed to fetch wallet address';
			console.error('Error fetching wallet address:', err);
		} finally {
			walletAddressLoading = false;
		}
	}

	// Fetch bank cards for IRT deposit
	async function fetchBankCards() {
		if (activeTab !== 'irt') return;

		bankCardsLoading = true;
		bankCardsError = null;

		try {
			const result = await trpc().bankCards.getCards.query();
			// Convert string dates to Date objects
			bankCards = result.map((card) => ({
				...card,
				createdAt: new Date(card.createdAt),
				updatedAt: new Date(card.updatedAt)
			}));

			// Set first card as selected if available
			if (bankCards.length > 0 && !selectedCardId) {
				selectedCardId = bankCards[0].id;
			}
		} catch (err: any) {
			bankCardsError = err.message || 'Failed to fetch bank cards';
			console.error('Error fetching bank cards:', err);
		} finally {
			bankCardsLoading = false;
		}
	}

	// Handle tab change
	function changeTab(tab: 'irt' | 'usdt') {
		activeTab = tab;

		// Reset form when changing tabs
		error = null;

		// Fetch data for the selected tab
		if (tab === 'usdt') {
			fetchWalletAddress();
		} else {
			fetchBankCards();
		}
	}

	// Handle network change for USDT
	function handleNetworkChange(network: string) {
		selectedNetwork = network;
		fetchWalletAddress();
	}

	// Format card number for display
	function formatCardNumber(number: string): string {
		const cleaned = number.replace(/\D/g, '');
		return cleaned.replace(/(\d{4})/g, '$1 ').trim();
	}

	// Load initial data
	onMount(() => {
		fetchWalletAddress();
	});
</script>

<PanelPageWrapper
	title="Deposit Funds"
	description="Add funds to your account using cryptocurrency or bank transfer."
>
	<Card variant="flat">
		<!-- Tab navigation -->
		<div class="mb-6 border-b border-gray-200">
			<nav class="ga-8 -mb-px flex">
				<button
					on:click={() => changeTab('usdt')}
					class={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
						activeTab === 'usdt'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
					}`}
				>
					USDT Deposit
				</button>
				<button
					on:click={() => changeTab('irt')}
					class={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
						activeTab === 'irt'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
					}`}
				>
					IRT Deposit
				</button>
			</nav>
		</div>

		<!-- Error message -->
		{#if error}
			<div class="mb-6 rounded-md bg-red-50 p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<span class="icon-[heroicons--exclamation-circle] h-5 w-5 text-red-400"></span>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Error</h3>
						<div class="mt-2 text-sm text-red-700">
							<p>{error}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- USDT Deposit Form -->
		{#if activeTab === 'usdt'}
			<div class="space-y-6">
				<!-- Network selector -->
				<div>
					<label class="block text-sm font-medium text-gray-700">Network</label>
					<div class="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
						{#each networks as network}
							<button
								type="button"
								on:click={() => handleNetworkChange(network.value)}
								class={`relative flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
									selectedNetwork === network.value
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
								}`}
							>
								<span>{network.name}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Wallet address display with QR code -->
				<div>
					<label class="block text-sm font-medium text-gray-700">Wallet Address</label>
					<div class="mt-1">
						{#if walletAddressLoading}
							<div
								class="flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-4 py-3"
							>
								<span class="icon-[svg-spinners--bars-scale-fade] h-5 w-5 text-blue-500"></span>
							</div>
						{:else if walletAddressError}
							<div class="rounded-md border border-red-300 bg-red-50 px-4 py-3">
								<div class="flex">
									<span class="icon-[heroicons--exclamation-circle] h-5 w-5 text-red-400"></span>
									<p class="ml-2 text-sm text-red-700">{walletAddressError}</p>
								</div>
							</div>
						{:else if walletAddress}
							<div class="flex flex-col items-center space-y-4">
								<!-- QR Code -->
								<QRCode
									text={walletAddress || ''}
									size={250}
									className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
								/>

								<!-- Wallet address -->
								<div class="w-full">
									<div class="flex rounded-md shadow-sm">
										<input
											type="text"
											readonly
											value={walletAddress}
											class="block w-full min-w-0 flex-1 rounded-none rounded-e-md border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
											dir="ltr"
										/>
										<button
											type="button"
											class="relative -ml-px inline-flex items-center rounded-e-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
											on:click={() => {
												if (walletAddress) {
													navigator.clipboard.writeText(walletAddress);
												}
											}}
										>
											<span class="icon-[heroicons--clipboard-document] h-5 w-5"></span>
										</button>
									</div>
								</div>

								<!-- User guidance -->
								<div class="w-full rounded-md bg-blue-50 p-4">
									<div class="flex">
										<div class="flex-shrink-0">
											<span class="icon-[heroicons--information-circle] h-5 w-5 text-blue-400"
											></span>
										</div>
										<div class="ml-3">
											<h3 class="text-sm font-medium text-blue-800">Deposit Instructions</h3>
											<div class="mt-2 text-sm text-blue-700">
												<ul class="list-disc space-y-1 pl-5">
													<li>
														Send your USDT to the address above using the {selectedNetwork.toUpperCase()}
														network
													</li>
													<li>Make sure to use the correct network to avoid loss of funds</li>
													<li>Your deposit will be processed automatically after confirmation</li>
													<li>No amount or description is needed - just send to this address</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="rounded-md border border-gray-300 bg-gray-50 px-4 py-3">
								<p class="text-sm text-gray-500">
									No active wallet address available for this network.
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- IRT Deposit Form -->
		{#if activeTab === 'irt'}
			<div class="space-y-6">
				<!-- Bank card selector -->
				<div>
					<label class="block text-sm font-medium text-gray-700">Bank Card</label>
					<div class="mt-1">
						{#if bankCardsLoading}
							<div
								class="flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-4 py-3"
							>
								<span class="icon-[svg-spinners--bars-scale-fade] h-5 w-5 text-blue-500"></span>
							</div>
						{:else if bankCardsError}
							<div class="rounded-md border border-red-300 bg-red-50 px-4 py-3">
								<div class="flex">
									<span class="icon-[heroicons--exclamation-circle] h-5 w-5 text-red-400"></span>
									<p class="ml-2 text-sm text-red-700">{bankCardsError}</p>
								</div>
							</div>
						{:else if bankCards.length > 0}
							<div class="space-y-3">
								{#each bankCards as card}
									<div
										class={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
											selectedCardId === card.id
												? 'border-blue-500 ring-2 ring-blue-500'
												: 'border-gray-300'
										}`}
										on:click={() => (selectedCardId = card.id)}
									>
										<div class="flex items-center">
											<input
												type="radio"
												id={`card-{card.id}`}
												name="card-selection"
												value={card.id}
												checked={selectedCardId === card.id}
												class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
												on:change={() => (selectedCardId = card.id)}
											/>
											<label for={`card-{card.id}`} class="ml-3 flex flex-col">
												<span class="block text-sm font-medium text-gray-700">
													{#if detectIranianBank(card.cardNumber)}
														<img
															src="/img/banks/{detectIranianBank(card.cardNumber)?.id}.svg"
															alt={detectIranianBank(card.cardNumber)?.name}
															class="mr-2 inline-block h-6 w-6"
														/>
													{/if}
													{formatCardNumber(card.cardNumber)}
												</span>
												{#if card.isDefault}
													<span
														class="mt-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
													>
														Default
													</span>
												{/if}
											</label>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="rounded-md border border-gray-300 bg-gray-50 px-4 py-3">
								<p class="text-sm text-gray-500">
									You don't have any bank cards saved. Please add a bank card in the Cards section
									first.
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Implementation note -->
				<div class="rounded-md bg-blue-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<span class="icon-[heroicons--information-circle] h-5 w-5 text-blue-400"></span>
						</div>
						<div class="ml-3 flex-1 md:flex md:justify-between">
							<p class="text-sm text-blue-700">
								IRT deposit functionality will be implemented in a future update.
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</Card>
</PanelPageWrapper>
