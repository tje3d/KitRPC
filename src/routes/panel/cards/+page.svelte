<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { rules } from '$lib/helpers/form.helper';
	import BankCardItem from '$lib/kit/BankCardItem.svelte';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import CreateCardProvider from '$lib/providers/CreateCardProvider.svelte';
	import DeleteCardProvider from '$lib/providers/DeleteCardProvider.svelte';
	import GetBankProvider from '$lib/providers/GetBankProvider.svelte';
	import GetCardsProvider from '$lib/providers/GetCardsProvider.svelte';
	import SetDefaultCardProvider from '$lib/providers/SetDefaultCardProvider.svelte';
	import UpdateCardProvider from '$lib/providers/UpdateCardProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { BankCard } from '@prisma/client';

	// State
	let showAddForm = false;
	let editingCard: BankCard | null = null;

	// Form state
	let cardNumber = '';
	let cardNumberError = '';
</script>

<PanelPageWrapper title="کارت‌های بانکی" description="مدیریت کارت‌های بانکی و روش‌های پرداخت شما">
	<svelte:fragment slot="actions">
		<Button
			className="px-4 py-2"
			onClick={() => {
				showAddForm = true;
				editingCard = null;
				cardNumber = '';
			}}
		>
			افزودن کارت جدید
		</Button>
	</svelte:fragment>

	<GetCardsProvider
		onError={(error) => {
			toast.error(error || 'دریافت کارت‌ها ناموفق بود');
			console.error('Error fetching cards:', error);
		}}
		let:loading
		let:cards
		let:getCards
	>
		<CreateCardProvider
			onSuccess={(data) => {
				if (data) {
					toast.success('کارت با موفقیت اضافه شد');
					// Reset form
					showAddForm = false;
					editingCard = null;
					cardNumber = '';
					cardNumberError = '';
					// Refresh cards list
					getCards();
				}
			}}
			onError={(error) => {
				toast.error(error || 'افزودن کارت ناموفق بود');
				console.error('Error adding card:', error);
			}}
			let:createCard
			let:loading={createLoading}
		>
			<UpdateCardProvider
				onSuccess={(data) => {
					if (data) {
						toast.success('کارت با موفقیت به‌روزرسانی شد');
						// Reset form
						showAddForm = false;
						editingCard = null;
						cardNumber = '';
						cardNumberError = '';
						// Refresh cards list
						getCards();
					}
				}}
				onError={(error) => {
					toast.error(error || 'به‌روزرسانی کارت ناموفق بود');
					console.error('Error updating card:', error);
				}}
				let:updateCard
				let:loading={updateLoading}
			>
				<SetDefaultCardProvider
					onSuccess={(data) => {
						if (data) {
							toast.success('کارت پیش‌فرض به‌روزرسانی شد');
							// Refresh cards list
							getCards();
						}
					}}
					onError={(error) => {
						toast.error(error || 'تنظیم کارت پیش‌فرض ناموفق بود');
						console.error('Error setting default card:', error);
					}}
					let:setDefaultCard
					let:loading={setDefaultLoading}
				>
					<DeleteCardProvider
						onSuccess={(data) => {
							if (data) {
								toast.success('کارت با موفقیت حذف شد');
								// Refresh cards list
								getCards();
							}
						}}
						onError={(error) => {
							toast.error(error || 'حذف کارت ناموفق بود');
							console.error('Error deleting card:', error);
						}}
						let:deleteCard
						let:loading={deleteLoading}
					>
						<!-- Loading state -->
						{#if loading}
							<div class="flex justify-center py-12">
								<span class="iconify icon-[svg-spinners--bars-scale-fade] h-8 w-8 text-blue-500"
								></span>
							</div>
						{/if}

						<!-- Add/Edit Card Form -->
						{#if showAddForm}
							<Card variant="flat" className="mb-8 rounded-2xl shadow-lg">
								<h2 class="mb-6 text-xl font-bold text-gray-800">
									{editingCard ? 'ویرایش کارت' : 'افزودن کارت جدید'}
								</h2>

								<GetBankProvider cardNumber={cardNumber.replace(/\s/g, '')} let:bank>
									<form
										on:submit|preventDefault={() => {
											// Reset errors
											cardNumberError = '';

											// Clean the card number
											const cleanedCardNumber = cardNumber.replace(/[\s-]/g, '');

											// Validate card number using the new helper
											if (!rules.cardNumber.validate(cleanedCardNumber)) {
												cardNumberError = 'شماره کارت باید دقیقاً ۱۶ رقم باشد';
												return;
											}

											if (editingCard) {
												// Update existing card
												updateCard({
													cardId: editingCard.id,
													data: { cardNumber: cleanedCardNumber }
												});
											} else {
												// Create new card
												createCard({
													cardNumber: cleanedCardNumber
												});
											}
										}}
										class="space-y-6"
									>
										<FormGroup
											label="شماره کارت"
											error={cardNumberError}
											showError={!!cardNumberError}
										>
											<Input
												type="text"
												placeholder="1234 5678 9012 3456"
												bind:value={cardNumber}
												disabled={createLoading || updateLoading}
												id="cardNumber"
												name="cardNumber"
												dir="ltr"
												formatCard={true}
												className="text-lg"
											/>
											<p class="mt-2 text-sm text-gray-500">یک شماره کارت ۱۶ رقمی وارد کنید</p>

											{#if bank}
												<div
													class="mt-3 flex items-center gap-3 rounded-lg bg-green-50 p-3 transition-all duration-300"
												>
													<span class="icon-[heroicons--check-circle-solid] h-5 w-5 text-green-600"
													></span>
													<span class="text-sm font-medium text-green-800">
														تشخیص داده شده: {bank.name}
													</span>
												</div>
											{/if}
										</FormGroup>

										<div class="flex justify-end space-x-4 pt-4">
											<Button
												variant="secondary"
												onClick={() => {
													showAddForm = false;
													editingCard = null;
													cardNumber = '';
													cardNumberError = '';
												}}
												disabled={createLoading || updateLoading}
												className="px-6 py-2"
											>
												لغو
											</Button>
											<Button
												type="submit"
												disabled={createLoading || updateLoading}
												className="px-6 py-2"
											>
												{#if createLoading || updateLoading}
													<span class="flex items-center justify-center gap-2">
														<span
															class="iconify h-4 w-4 animate-spin"
															data-icon="svg-spinners:bars-scale-fade"
														></span>
														در حال ذخیره...
													</span>
												{:else}
													{editingCard ? 'به‌روزرسانی کارت' : 'افزودن کارت'}
												{/if}
											</Button>
										</div>
									</form>
								</GetBankProvider>
							</Card>
						{/if}

						<!-- Cards List -->
						<Card variant="flat">
							<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h2 class="text-lg font-bold text-gray-800">کارت‌های شما</h2>
									<p class="mt-1 text-sm text-gray-600">لیست تمام کارت‌های بانکی ذخیره شده شما</p>
								</div>
							</div>

							{#if cards?.length === 0 && !loading}
								<div class="py-12 text-center">
									<div class="mx-auto h-16 w-16 text-gray-400">
										<span class="icon-[heroicons--credit-card-solid] h-16 w-16"></span>
									</div>
									<h3 class="mt-4 text-lg font-medium text-gray-900">کارتی وجود ندارد</h3>
									<p class="mt-2 text-sm text-gray-500">با افزودن یک کارت بانکی جدید شروع کنید.</p>
									<div class="mt-6">
										<Button
											onClick={() => {
												showAddForm = true;
												editingCard = null;
												cardNumber = '';
											}}
										>
											افزودن کارت جدید
										</Button>
									</div>
								</div>
							{:else}
								<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{#each cards || [] as card (card.id)}
										<BankCardItem
											{card}
											onSetDefault={(cardId) => setDefaultCard({ cardId })}
											onEdit={(card) => {
												// Convert string dates to Date objects
												const cardWithDates = {
													...card,
													createdAt: new Date(card.createdAt),
													updatedAt: new Date(card.updatedAt)
												};
												editingCard = cardWithDates;
												cardNumber = card.cardNumber;
												showAddForm = true;
											}}
											onDelete={(cardId) => {
												dialogStore.open({
													component: ConfirmDialog,
													props: {
														title: 'حذف کارت',
														message: `آیا مطمئن هستید که می‌خواهید کارتی که به ${card.cardNumber.slice(-4)} ختم می‌شود را حذف کنید؟ این عملیات قابل بازگشت نیست.`,
														confirm: 'حذف',
														cancel: 'لغو',
														color: 'red',
														onConfirm: () => {
															deleteCard({ cardId });
														}
													}
												});
											}}
											{...{ setDefaultLoading, deleteLoading }}
										/>
									{/each}
								</div>
							{/if}
						</Card>
					</DeleteCardProvider>
				</SetDefaultCardProvider>
			</UpdateCardProvider>
		</CreateCardProvider>
	</GetCardsProvider>
</PanelPageWrapper>
