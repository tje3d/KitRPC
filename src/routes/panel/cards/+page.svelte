<script lang="ts">
	import { CardNumber } from '$lib';
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { rules } from '$lib/helpers/form.helper';
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
							<Card variant="flat" className="mb-6">
								<h2 class="mb-4 text-lg font-bold text-gray-800">
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
										class="space-y-4"
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
											/>
											<p class="mt-1 text-sm text-gray-500">یک شماره کارت ۱۶ رقمی وارد کنید</p>

											{#if bank}
												<div class="mt-2 flex items-center gap-2 rounded-md bg-green-50 p-2">
													<span class="icon-[heroicons--check-circle] h-4 w-4 text-green-600"
													></span>
													<span class="text-sm text-green-800">
														تشخیص داده شده: {bank.name}
													</span>
												</div>
											{/if}
										</FormGroup>

										<div class="flex justify-end space-x-3 pt-2">
											<Button
												variant="secondary"
												onClick={() => {
													showAddForm = false;
													editingCard = null;
													cardNumber = '';
													cardNumberError = '';
												}}
												disabled={createLoading || updateLoading}
											>
												لغو
											</Button>
											<Button type="submit" disabled={createLoading || updateLoading}>
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
									<div class="mx-auto h-12 w-12 text-gray-400">
										<span class="iconify h-12 w-12" data-icon="heroicons:credit-card"></span>
									</div>
									<h3 class="mt-2 text-sm font-medium text-gray-900">کارتی وجود ندارد</h3>
									<p class="mt-1 text-sm text-gray-500">با افزودن یک کارت بانکی جدید شروع کنید.</p>
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
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{#each cards || [] as card (card.id)}
										<GetBankProvider cardNumber={card.cardNumber} let:bank>
											<Card variant="flat" className="border rounded-lg p-4">
												<div class="flex items-start justify-between">
													<div>
														<div class="flex items-center">
															{#if bank}
																<img
																	src="/img/banks/{bank.id}.svg"
																	alt={bank.name}
																	class="h-8 w-8"
																/>
															{:else}
																<span
																	class="iconify h-8 w-8 text-gray-400"
																	data-icon="heroicons:credit-card"
																></span>
															{/if}
															{#if card.isDefault}
																<span
																	class="ms-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
																>
																	پیش‌فرض
																</span>
															{/if}
														</div>
														<p class="mt-2 text-lg font-medium text-gray-900">
															<CardNumber cardNumber={card.cardNumber} />
														</p>
														{#if bank}
															<p class="text-sm text-gray-600">
																{bank.name}
															</p>
														{/if}
														<p class="text-sm text-gray-500">
															افزوده شده در {new Date(card.createdAt).toLocaleDateString()}
														</p>
													</div>
												</div>

												<div class="mt-4 flex space-x-2">
													{#if !card.isDefault}
														<Button
															variant="secondary"
															size="sm"
															onClick={() => setDefaultCard({ cardId: card.id })}
															className="flex-1"
															disabled={setDefaultLoading}
														>
															پیش فرض
														</Button>
													{/if}
													<Button
														variant="secondary"
														size="sm"
														onClick={() => {
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
														className="flex-1"
													>
														ویرایش
													</Button>
													<Button
														variant="secondary"
														size="sm"
														onClick={() => {
															dialogStore.open({
																component: ConfirmDialog,
																props: {
																	title: 'حذف کارت',
																	message: `آیا مطمئن هستید که می‌خواهید کارتی که به ${card.cardNumber.slice(-4)} ختم می‌شود را حذف کنید؟ این عملیات قابل بازگشت نیست.`,
																	confirm: 'حذف',
																	cancel: 'لغو',
																	color: 'red',
																	onConfirm: () => {
																		deleteCard({ cardId: card.id });
																	}
																}
															});
														}}
														className="flex-1 text-red-600 hover:bg-red-50"
														disabled={deleteLoading}
													>
														حذف
													</Button>
												</div>
											</Card>
										</GetBankProvider>
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
