<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { toast } from '$lib/toast/store';
	import { dialogStore } from '$lib/dialog/store';
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import Input from '$lib/kit/Input.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { BankCard } from '@prisma/client';

	// State
	let cards: BankCard[] = [];
	let loading = false;
	let saving = false;
	let showAddForm = false;
	let editingCard: BankCard | null = null;

	// Form state
	let cardNumber = '';
	let cardNumberError = '';

	// Validation function for card number
	function validateCardNumber(number: string): boolean {
		// Remove any spaces or dashes
		const cleaned = number.replace(/[\s-]/g, '');

		// Check if it's exactly 16 digits
		if (!/^\d{16}$/.test(cleaned)) {
			return false;
		}

		return true;
	}

	// Format card number for display (add spaces every 4 digits)
	function formatCardNumber(number: string): string {
		const cleaned = number.replace(/\D/g, '');
		return cleaned.replace(/(\d{4})/g, '$1 ').trim();
	}

	// Fetch all cards for the user
	async function fetchCards() {
		loading = true;
		try {
			const result = await trpc().bankCards.getCards.query();
			// Convert string dates to Date objects
			cards = result.map((card) => ({
				...card,
				createdAt: new Date(card.createdAt),
				updatedAt: new Date(card.updatedAt)
			}));
		} catch (error) {
			toast.error('Failed to fetch cards');
			console.error('Error fetching cards:', error);
		} finally {
			loading = false;
		}
	}

	// Handle form submission for adding/editing a card
	async function handleSubmit() {
		// Reset errors
		cardNumberError = '';

		// Clean the card number
		const cleanedCardNumber = cardNumber.replace(/[\s-]/g, '');

		// Validate card number
		if (!validateCardNumber(cleanedCardNumber)) {
			cardNumberError = 'Card number must be exactly 16 digits';
			return;
		}

		saving = true;
		try {
			if (editingCard) {
				// Update existing card
				await trpc().bankCards.updateCard.mutate({
					cardId: editingCard.id,
					data: { cardNumber: cleanedCardNumber }
				});
				toast.success('Card updated successfully');
			} else {
				// Create new card
				await trpc().bankCards.createCard.mutate({
					cardNumber: cleanedCardNumber
				});
				toast.success('Card added successfully');
			}

			// Reset form
			resetForm();

			// Refresh cards list
			await fetchCards();
		} catch (error: any) {
			toast.error(error.message || 'Failed to save card');
			console.error('Error saving card:', error);
		} finally {
			saving = false;
		}
	}

	// Set a card as default
	async function setDefaultCard(cardId: string) {
		try {
			await trpc().bankCards.setDefaultCard.mutate({ cardId });
			toast.success('Default card updated');
			await fetchCards(); // Refresh the list
		} catch (error: any) {
			toast.error(error.message || 'Failed to set default card');
			console.error('Error setting default card:', error);
		}
	}

	// Show delete confirmation dialog
	function confirmDelete(card: BankCard) {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'Delete Card',
				message: `Are you sure you want to delete the card ending in ${card.cardNumber.slice(-4)}? This action cannot be undone.`,
				confirm: 'Delete',
				cancel: 'Cancel',
				color: 'red',
				onConfirm: () => {
					history.back();

					tick().then(() => {
						deleteCard(card.id);
					});
				}
			}
		});
	}

	// Delete a card
	async function deleteCard(cardId: string) {
		try {
			await trpc().bankCards.deleteCard.mutate({ cardId });
			toast.success('Card deleted successfully');
			await fetchCards(); // Refresh the list
		} catch (error: any) {
			toast.error(error.message || 'Failed to delete card');
			console.error('Error deleting card:', error);
		}
	}

	// Reset form
	function resetForm() {
		showAddForm = false;
		editingCard = null;
		cardNumber = '';
		cardNumberError = '';
	}

	// Edit a card
	function editCard(card: BankCard) {
		editingCard = card;
		cardNumber = formatCardNumber(card.cardNumber);
		showAddForm = true;
	}

	// Format card number as user types
	function handleCardNumberInput(event: Event) {
		const input = event.target as HTMLInputElement;
		let value = input.value.replace(/\D/g, ''); // Remove non-digits

		// Limit to 16 digits
		if (value.length > 16) {
			value = value.substring(0, 16);
		}

		// Add spaces every 4 digits
		cardNumber = value.replace(/(\d{4})/g, '$1 ').trim();

		// Update the input value
		input.value = cardNumber;
	}

	// Load cards when component mounts
	onMount(() => {
		fetchCards();
	});
</script>

<PanelPageWrapper title="Bank Cards" description="Manage your bank cards and payment methods.">
	<svelte:fragment slot="actions">
		<Button
			className="px-4 py-2"
			onClick={() => {
				showAddForm = true;
				editingCard = null;
				cardNumber = '';
			}}
		>
			Add New Card
		</Button>
	</svelte:fragment>

	<!-- Loading state -->
	{#if loading}
		<div class="flex justify-center py-12">
			<span
				class="iconify h-8 w-8 animate-spin text-blue-500"
				data-icon="svg-spinners:bars-scale-fade"
			></span>
		</div>
	{/if}

	<!-- Add/Edit Card Form -->
	{#if showAddForm}
		<Card variant="flat" className="mb-6">
			<h2 class="mb-4 text-lg font-bold text-gray-800">
				{editingCard ? 'Edit Card' : 'Add New Card'}
			</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<FormGroup label="Card Number" error={cardNumberError} showError={!!cardNumberError}>
					<Input
						type="text"
						placeholder="1234 5678 9012 3456"
						bind:value={cardNumber}
						on:input={handleCardNumberInput}
						on:paste={handleCardNumberInput}
						disabled={saving}
						id="cardNumber"
						name="cardNumber"
					/>
					<p class="mt-1 text-sm text-gray-500">Enter a 16-digit card number</p>
				</FormGroup>

				<div class="flex justify-end space-x-3 pt-2">
					<Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>
					<Button type="submit" disabled={saving}>
						{#if saving}
							<span class="flex items-center justify-center gap-2">
								<span class="iconify h-4 w-4 animate-spin" data-icon="svg-spinners:bars-scale-fade"
								></span>
								Saving...
							</span>
						{:else}
							{editingCard ? 'Update Card' : 'Add Card'}
						{/if}
					</Button>
				</div>
			</form>
		</Card>
	{/if}

	<!-- Cards List -->
	<Card variant="flat">
		<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-lg font-bold text-gray-800">Your Cards</h2>
				<p class="mt-1 text-sm text-gray-600">List of all your saved bank cards</p>
			</div>
		</div>

		{#if cards.length === 0 && !loading}
			<div class="py-12 text-center">
				<div class="mx-auto h-12 w-12 text-gray-400">
					<span class="iconify h-12 w-12" data-icon="heroicons:credit-card"></span>
				</div>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No cards</h3>
				<p class="mt-1 text-sm text-gray-500">Get started by adding a new bank card.</p>
				<div class="mt-6">
					<Button
						onClick={() => {
							showAddForm = true;
							editingCard = null;
							cardNumber = '';
						}}
					>
						Add New Card
					</Button>
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each cards as card (card.id)}
					<Card variant="flat" className="border rounded-lg p-4">
						<div class="flex items-start justify-between">
							<div>
								<div class="flex items-center">
									<span class="iconify h-8 w-8 text-gray-400" data-icon="heroicons:credit-card"
									></span>
									{#if card.isDefault}
										<span
											class="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
										>
											Default
										</span>
									{/if}
								</div>
								<p class="mt-2 text-lg font-medium text-gray-900">
									{formatCardNumber(card.cardNumber)}
								</p>
								<p class="text-sm text-gray-500">
									Added {new Date(card.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>

						<div class="mt-4 flex space-x-2">
							{#if !card.isDefault}
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setDefaultCard(card.id)}
									className="flex-1"
								>
									Set Default
								</Button>
							{/if}
							<Button
								variant="secondary"
								size="sm"
								onClick={() => editCard(card)}
								className="flex-1"
							>
								Edit
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => confirmDelete(card)}
								className="flex-1 text-red-600 hover:bg-red-50"
							>
								Delete
							</Button>
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	</Card>
</PanelPageWrapper>
