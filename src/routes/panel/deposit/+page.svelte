<script lang="ts">
	import { detectIranianBank } from '$lib/helpers/IranianBanks.helper';
	import Card from '$lib/kit/Card.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import QRCode from '$lib/kit/QRCode.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { BankCard } from '@prisma/client';
	import { onMount } from 'svelte';

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
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Main content area -->
		<div class="lg:col-span-2">
			<Card variant="flat">
				<!-- Currency selector -->
				<div class="mb-6">
					<h2 class="text-lg font-semibold text-gray-800">Select Deposit Method</h2>
					<p class="mt-1 text-sm text-gray-600">
						Choose how you'd like to add funds to your account
					</p>
					<div class="mt-4 inline-flex rounded-lg bg-gray-100 p-1" role="group">
						<button
							type="button"
							on:click={() => changeTab('usdt')}
							class={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
								activeTab === 'usdt'
									? 'bg-white text-blue-600 shadow-sm'
									: 'text-gray-600 hover:text-gray-900'
							} focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
						>
							USDT Deposit
						</button>
						<button
							type="button"
							on:click={() => changeTab('irt')}
							class={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
								activeTab === 'irt'
									? 'bg-white text-blue-600 shadow-sm'
									: 'text-gray-600 hover:text-gray-900'
							} focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
						>
							IRT Deposit
						</button>
					</div>
				</div>

				<!-- Error message -->
				{#if error}
					<div class="mb-6 rounded-lg bg-red-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<span class="icon-[heroicons--exclamation-circle] h-5 w-5 text-red-400"></span>
							</div>
							<div class="ms-3">
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
							<div class="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
								{#each networks as network}
									<button
										type="button"
										on:click={() => handleNetworkChange(network.value)}
										class={`relative flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
											selectedNetwork === network.value
												? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
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
							<div class="mt-2">
								{#if walletAddressLoading}
									<div
										class="flex items-center justify-center rounded-lg border border-gray-300 bg-gray-50 px-4 py-8"
									>
										<span class="icon-[svg-spinners--bars-scale-fade] h-6 w-6 text-blue-500"></span>
									</div>
								{:else if walletAddressError}
									<div class="rounded-lg border border-red-300 bg-red-50 px-4 py-4">
										<div class="flex">
											<span class="icon-[heroicons--exclamation-circle] h-5 w-5 text-red-400"
											></span>
											<p class="ms-2 text-sm text-red-700">{walletAddressError}</p>
										</div>
									</div>
								{:else if walletAddress}
									<div class="space-y-6">
										<!-- QR Code -->
										<div class="flex flex-col items-center">
											<QRCode
												text={walletAddress || ''}
												size={200}
												className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
											/>
											<p class="mt-2 text-sm text-gray-600">Scan QR code to deposit</p>
										</div>

										<!-- Wallet address -->
										<div class="w-full">
											<div class="flex rounded-lg shadow-sm">
												<input
													type="text"
													readonly
													value={walletAddress}
													class="block w-full min-w-0 flex-1 rounded-e-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
													dir="ltr"
												/>
												<button
													type="button"
													class="relative -ms-px inline-flex items-center rounded-e-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
													on:click={() => {
														if (walletAddress) {
															navigator.clipboard.writeText(walletAddress);
														}
													}}
												>
													<span class="icon-[heroicons--clipboard-document] h-5 w-5"></span>
													<span class="ms-2">Copy</span>
												</button>
											</div>
										</div>
									</div>
								{:else}
									<div class="rounded-lg border border-gray-300 bg-gray-50 px-4 py-8 text-center">
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
							<div class="flex items-center justify-between">
								<label class="block text-sm font-medium text-gray-700">Bank Card</label>
								<a
									href="/panel/cards"
									class="text-sm font-medium text-blue-600 hover:text-blue-500"
								>
									Manage Cards
								</a>
							</div>
							<div class="mt-2">
								{#if bankCardsLoading}
									<div
										class="flex items-center justify-center rounded-lg border border-gray-300 bg-gray-50 px-4 py-8"
									>
										<span class="icon-[svg-spinners--bars-scale-fade] h-6 w-6 text-blue-500"></span>
									</div>
								{:else if bankCardsError}
									<div class="rounded-lg border border-red-300 bg-red-50 px-4 py-4">
										<div class="flex">
											<span class="icon-[heroicons--exclamation-circle] h-5 w-5 text-red-400"
											></span>
											<p class="ms-2 text-sm text-red-700">{bankCardsError}</p>
										</div>
									</div>
								{:else if bankCards.length > 0}
									<div class="space-y-3">
										{#each bankCards as card}
											<div
												class={`relative flex cursor-pointer rounded-lg border p-4 transition-all duration-200 focus:outline-none ${
													selectedCardId === card.id
														? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
														: 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
													<label for={`card-{card.id}`} class="ms-3 flex flex-col">
														<span class="block text-sm font-medium text-gray-700">
															{#if detectIranianBank(card.cardNumber)}
																<img
																	src="/img/banks/{detectIranianBank(card.cardNumber)?.id}.svg"
																	alt={detectIranianBank(card.cardNumber)?.name}
																	class="me-2 inline-block h-6 w-6"
																/>
															{/if}
															{formatCardNumber(card.cardNumber)}
														</span>
														{#if card.isDefault}
															<span
																class="mt-1 inline-flex w-fit items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
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
									<div class="rounded-lg border border-gray-300 bg-gray-50 px-4 py-8 text-center">
										<p class="text-sm text-gray-500">You don't have any bank cards saved.</p>
										<a
											href="/panel/cards"
											class="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
										>
											Add a bank card
											<span class="icon-[heroicons--arrow-right] ms-1 h-4 w-4"></span>
										</a>
									</div>
								{/if}
							</div>
						</div>

						<!-- Implementation note -->
						<div class="rounded-lg bg-blue-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<span class="icon-[heroicons--information-circle] h-5 w-5 text-blue-400"></span>
								</div>
								<div class="ms-3 flex-1 md:flex md:justify-between">
									<p class="text-sm text-blue-700">
										IRT deposit functionality will be implemented in a future update.
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</Card>
		</div>

		<!-- Sidebar with instructions and information -->
		<div class="space-y-6">
			<!-- Deposit instructions -->
			<Card variant="flat">
				<h3 class="flex items-center text-sm font-semibold text-gray-800">
					<span class="icon-[heroicons--information-circle] me-2 h-5 w-5 text-blue-500"></span>
					Deposit Instructions
				</h3>
				<div class="mt-4 space-y-4">
					{#if activeTab === 'usdt'}
						<ul class="space-y-3">
							<li class="flex items-start">
								<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
								></span>
								<span class="text-sm text-gray-600">
									Send your USDT to the address above using the {selectedNetwork.toUpperCase()} network
								</span>
							</li>
							<li class="flex items-start">
								<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
								></span>
								<span class="text-sm text-gray-600">
									Make sure to use the correct network to avoid loss of funds
								</span>
							</li>
							<li class="flex items-start">
								<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
								></span>
								<span class="text-sm text-gray-600">
									Your deposit will be processed automatically after confirmation
								</span>
							</li>
							<li class="flex items-start">
								<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
								></span>
								<span class="text-sm text-gray-600">
									No amount or description is needed - just send to this address
								</span>
							</li>
						</ul>
					{:else}
						<ul class="space-y-3">
							<li class="flex items-start">
								<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
								></span>
								<span class="text-sm text-gray-600"> Select your bank card from the list </span>
							</li>
							<li class="flex items-start">
								<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
								></span>
								<span class="text-sm text-gray-600"> Transfer funds to the selected account </span>
							</li>
							<li class="flex items-start">
								<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 text-green-500"
								></span>
								<span class="text-sm text-gray-600">
									Submit transaction details for verification
								</span>
							</li>
						</ul>
					{/if}
				</div>
			</Card>

			<!-- Important notes -->
			<Card variant="flat">
				<h3 class="flex items-center text-sm font-semibold text-gray-800">
					<span class="icon-[heroicons--exclamation-triangle] me-2 h-5 w-5 text-yellow-500"></span>
					Important Notes
				</h3>
				<div class="mt-4 space-y-4">
					<div class="rounded-lg bg-yellow-50 p-3">
						<p class="text-sm text-yellow-700">
							{#if activeTab === 'usdt'}
								Only send USDT (TRC20) to this address. Sending any other cryptocurrency or using a
								different network may result in permanent loss of funds.
							{:else}
								IRT deposits are currently under development. This feature will be available in the
								next update.
							{/if}
						</p>
					</div>
					<div class="rounded-lg bg-blue-50 p-3">
						<p class="text-sm text-blue-700">
							Deposits are typically processed within 10 minutes. Large transactions may require
							additional verification.
						</p>
					</div>
				</div>
			</Card>
		</div>
	</div>
</PanelPageWrapper>
