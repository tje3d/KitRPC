<script lang="ts">
	import { detectIranianBank } from '$lib/helpers/IranianBanks.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import CardNumber from '$lib/kit/CardNumber.svelte';
	import type { BankCard } from '@prisma/client';

	/** @type {BankCard} - The bank card to display */
	export let card: BankCard;

	/** @type {Function} - Function to set card as default */
	export let onSetDefault: ((cardId: string) => void) | undefined = undefined;

	/** @type {Function} - Function to edit card */
	export let onEdit: ((card: BankCard) => void) | undefined = undefined;

	/** @type {Function} - Function to delete card */
	export let onDelete: ((cardId: string) => void) | undefined = undefined;

	/** @type {boolean} - Whether set default operation is loading */
	export let setDefaultLoading: boolean = false;

	/** @type {boolean} - Whether delete operation is loading */
	export let deleteLoading: boolean = false;

	// Detect bank information from card number
	$: bankInfo = detectIranianBank(card.cardNumber);
</script>

<Card variant="elevated">
	<!-- Bank color accent -->
	{#if bankInfo}
		<div
			class="absolute top-0 right-0 left-0 h-2 transition-all duration-300"
			style={`background-color: ${bankInfo.color}`}
		></div>
	{/if}

	<div class="flex items-start justify-between">
		<div class="flex items-center">
			{#if bankInfo}
				<img
					src="/img/banks/{bankInfo.id}.svg"
					alt={bankInfo.name}
					class="h-10 w-10 rounded-lg object-contain transition-transform duration-30 hover:scale-110"
					on:error={(e) => {
						const target = e.target as HTMLImageElement;
						// Fallback to generic icon if bank image fails to load
						target.src =
							'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjIiIHk9IjUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNCIgcng9IjIiPjwvcmVjdD48bGluZSB4MT0iMiIgeTE9IjEwIiB4Mj0iMjIiIHkyPSIxMCI+PC9saW5lPjwvc3ZnPg==';
					}}
				/>
			{:else}
				<span
					class="icon-[heroicons--credit-card] h-10 w-10 text-gray-400 transition-transform duration-300 hover:scale-110"
				></span>
			{/if}
			{#if card.isDefault}
				<span
					class="ms-3 inline-flex animate-pulse items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
				>
					<span class="icon-[heroicons--check-badge-solid] me-1 h-4 w-4"></span>
					پیش‌فرض
				</span>
			{/if}
		</div>
	</div>

	<div class="mt-6">
		<p
			class="font-mono text-xl font-bold tracking-wider text-gray-900 transition-colors duration-300 hover:text-blue-600"
		>
			<CardNumber cardNumber={card.cardNumber} />
		</p>
		{#if bankInfo}
			<p class="mt-2 text-sm font-medium text-gray-700">
				{bankInfo.name}
			</p>
		{/if}
		<p class="mt-1 text-xs text-gray-500">
			افزوده شده در {new Date(card.createdAt).toLocaleDateString('fa-IR')}
		</p>
	</div>

	<div class="mt-6 flex space-x-2">
		{#if !card.isDefault}
			<Button
				variant="secondary"
				size="sm"
				onClick={() => onSetDefault?.(card.id)}
				className="flex-1 transition-all duration-300 hover:shadow-md"
				loading={setDefaultLoading}
			>
				پیش فرض
			</Button>
		{/if}
		<Button
			variant="secondary"
			size="sm"
			onClick={() => onEdit?.(card)}
			className="flex-1 transition-all duration-300 hover:shadow-md"
		>
			ویرایش
		</Button>
		<Button
			variant="secondary"
			size="sm"
			onClick={() => onDelete?.(card.id)}
			className="flex-1 text-red-600 hover:bg-red-50 transition-all duration-300 hover:shadow-md"
			loading={deleteLoading}
		>
			حذف
		</Button>
	</div>
</Card>
