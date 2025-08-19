# Provider Pattern Guide for SvelteKit Pages

This guide explains how to use the provider pattern in SvelteKit pages, based on the implementation in `/src/routes/panel/cards/+page.svelte`. This pattern eliminates the need for `bind:this` and function definitions in the script section by using Svelte's `let:` syntax to access provider functionality directly in templates.

## Overview

The provider pattern in this codebase follows these principles:

1. **No `bind:this` usage** - Providers expose their functionality through slot props
2. **No function definitions in script** - All API calls are handled through provider methods
3. **Declarative template logic** - Business logic is written directly in templates using `let:` syntax
4. **Nested provider composition** - Multiple providers can be nested to handle complex workflows
5. **Reactive data flow** - Providers automatically handle loading states, errors, and data updates

## Provider Structure

Each provider follows a consistent structure:

### Basic Provider Template

```svelte
<!-- ExampleProvider.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['example']['action'];
	type ResponseData = RouterOutputs['example']['action'];

	// Props for callbacks
	export let onSuccess: ((data: ResponseData | undefined) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// TRPC request setup
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createeTrpcRequestFn((input: RequestParams) => {
			return trpc(page).example.action.mutate(input); // or .query() for queries
		})
	);

	// Exported action function
	export function performAction(input: RequestParams) {
		trigger.next(input);
	}

	// Handle success responses
	subscribe(responseSuccess, (result) => {
		onSuccess?.(result);
	});

	// Handle errors
	subscribe(errorMessage, (message) => {
		if (!message) return;
		onError?.(message);
	});
</script>

<slot
	response={$responseSuccess}
	loading={$loading}
	errorMessage={$errorMessage}
	data={$responseSuccess}
	{clearError}
	{performAction}
/>
```

## Provider Types

### 1. Query Providers (Data Fetching)

Used for fetching data, typically with auto-loading on mount.

**Example: GetCardsProvider**
```svelte
<!-- Usage in page -->
<GetCardsProvider
	onError={(error) => {
		toast.error(error || 'Failed to fetch cards');
	}}
	let:loading
	let:cards
	let:getCards
>
	<!-- Template content here -->
	{#if loading}
		<div>Loading...</div>
	{:else}
		{#each cards || [] as card}
			<!-- Card display -->
		{/each}
	{/if}
</GetCardsProvider>
```

**Key Features:**
- `requestOnSubscribe: true` for auto-loading
- Exposes `loading`, `data`, and refresh function
- Handles error states automatically

### 2. Mutation Providers (Actions)

Used for creating, updating, or deleting data.

**Example: CreateCardProvider**
```svelte
<!-- Usage in page -->
<CreateCardProvider
	onSuccess={(data) => {
		if (data) {
			toast.success('Card created successfully');
			// Reset form state
			showForm = false;
			// Refresh data
			getCards();
		}
	}}
	onError={(error) => {
		toast.error(error || 'Failed to create card');
	}}
	let:createCard
	let:loading={createLoading}
>
	<form on:submit|preventDefault={() => {
		createCard({ cardNumber: cleanedCardNumber });
	}}>
		<!-- Form fields -->
		<Button type="submit" disabled={createLoading}>
			{createLoading ? 'Creating...' : 'Create Card'}
		</Button>
	</form>
</CreateCardProvider>
```

**Key Features:**
- Manual triggering through action functions
- Loading states for UI feedback
- Success/error callbacks for side effects

### 3. Reactive Providers (Real-time Data)

Used for data that changes based on reactive props.

**Example: GetBankProvider**
```svelte
<!-- Usage in page -->
<GetBankProvider cardNumber={cardNumber.replace(/\s/g, '')} let:bank>
	{#if bank}
		<div class="bank-info">
			<img src="/img/banks/{bank.id}.svg" alt={bank.name} />
			<span>{bank.name}</span>
		</div>
	{/if}
</GetBankProvider>
```

**Key Features:**
- Reactive to prop changes
- Automatic updates when dependencies change
- No manual triggering required

## Implementation Patterns

### 1. Nested Provider Composition

The cards page demonstrates how to nest multiple providers for complex workflows:

```svelte
<GetCardsProvider let:loading let:cards let:getCards>
	<CreateCardProvider let:createCard let:loading={createLoading}>
		<UpdateCardProvider let:updateCard let:loading={updateLoading}>
			<DeleteCardProvider let:deleteCard let:loading={deleteLoading}>
				<!-- All provider functionality available here -->
				<form on:submit|preventDefault={() => {
					if (editingCard) {
						updateCard({ cardId: editingCard.id, data: formData });
					} else {
						createCard(formData);
					}
				}}>
					<!-- Form content -->
				</form>
			</DeleteCardProvider>
		</UpdateCardProvider>
	</CreateCardProvider>
</GetCardsProvider>
```

### 2. Loading State Management

Each provider exposes its own loading state with unique names:

```svelte
<CreateCardProvider let:loading={createLoading}>
	<UpdateCardProvider let:loading={updateLoading}>
		<DeleteCardProvider let:loading={deleteLoading}>
			<!-- Use specific loading states -->
			<Button disabled={createLoading || updateLoading}>
				{createLoading ? 'Creating...' : 'Create'}
			</Button>
		</DeleteCardProvider>
	</UpdateCardProvider>
</CreateCardProvider>
```

### 3. Error Handling

Errors are handled through callback props:

```svelte
<CreateCardProvider
	onSuccess={(data) => {
		// Handle success
		toast.success('Success message');
		// Reset form state
		// Refresh data
	}}
	onError={(error) => {
		// Handle error
		toast.error(error || 'Default error message');
		console.error('Error context:', error);
	}}
>
	<!-- Template -->
</CreateCardProvider>
```

### 4. Form Submission Pattern

Forms are handled directly in templates without script functions:

```svelte
<form on:submit|preventDefault={() => {
	// Validation
	if (!isValid) {
		errorMessage = 'Validation error';
		return;
	}

	// Conditional logic
	if (editMode) {
		updateItem({ id: item.id, data: formData });
	} else {
		createItem(formData);
	}
}}>
	<!-- Form fields -->
</form>
```

### 5. Data Refresh Pattern

Refresh data after mutations using query provider methods:

```svelte
<GetItemsProvider let:getItems>
	<CreateItemProvider
		onSuccess={() => {
			// Refresh the list after creation
			getItems();
		}}
	>
		<!-- Template -->
	</CreateItemProvider>
</GetItemsProvider>
```

## Best Practices

### 1. Provider Naming Convention

- **Query providers**: `Get{Entity}Provider`, `List{Entity}Provider`
- **Mutation providers**: `Create{Entity}Provider`, `Update{Entity}Provider`, `Delete{Entity}Provider`
- **Action providers**: `{Action}{Entity}Provider` (e.g., `ActivateWalletProvider`)

### 2. Slot Prop Naming

- **Data**: Use entity name (e.g., `cards`, `user`, `bank`)
- **Actions**: Use verb + entity (e.g., `createCard`, `updateUser`)
- **States**: Use descriptive names (e.g., `loading`, `errorMessage`)
- **Loading conflicts**: Use `loading={specificLoading}` syntax

### 3. Error Handling

```svelte
<Provider
	onError={(error) => {
		// Always provide fallback message
		toast.error(error || 'Operation failed');
		// Log for debugging
		console.error('Context:', error);
	}}
>
```

### 4. Success Handling

```svelte
<Provider
	onSuccess={(data) => {
		// Check data exists
		if (data) {
			// Show success message
			toast.success('Operation successful');
			// Reset form state
			// Refresh related data
			// Navigate if needed
		}
	}}
>
```

### 5. Form State Management

Keep form state in the script section, but handle submission in templates:

```svelte
<script>
	// Form state
	let formData = { name: '', email: '' };
	let errors = {};
</script>

<Provider>
	<form on:submit|preventDefault={() => {
		// Validation logic here
		// Call provider action
	}}>
		<Input bind:value={formData.name} error={errors.name} />
	</form>
</Provider>
```

## Migration from bind:this Pattern

### Before (bind:this pattern):
```svelte
<script>
	let provider;

	async function handleSubmit() {
		try {
			await provider.createItem(data);
			// Handle success
		} catch (error) {
			// Handle error
		}
	}
</script>

<Provider bind:this={provider} />
<form on:submit|preventDefault={handleSubmit}>
```

### After (let: pattern):
```svelte
<Provider
	onSuccess={() => { /* Handle success */ }}
	onError={() => { /* Handle error */ }}
	let:createItem
>
	<form on:submit|preventDefault={() => createItem(data)}>
		<!-- Form content -->
	</form>
</Provider>
```

## Common Patterns

### 1. CRUD Operations
```svelte
<GetItemsProvider let:items let:getItems>
	<CreateItemProvider onSuccess={() => getItems()} let:createItem>
		<UpdateItemProvider onSuccess={() => getItems()} let:updateItem>
			<DeleteItemProvider onSuccess={() => getItems()} let:deleteItem>
				<!-- CRUD interface -->
			</DeleteItemProvider>
		</UpdateItemProvider>
	</CreateItemProvider>
</GetItemsProvider>
```

### 2. Conditional Actions
```svelte
<form on:submit|preventDefault={() => {
	if (editMode) {
		updateItem({ id: currentItem.id, data: formData });
	} else {
		createItem(formData);
	}
}}>
```

### 3. Confirmation Dialogs
```svelte
<Button onClick={() => {
	dialogStore.open({
		component: ConfirmDialog,
		props: {
			title: 'Confirm Delete',
			message: 'Are you sure?',
			onConfirm: () => deleteItem({ id: item.id })
		}
	});
}}>
	Delete
</Button>
```

This pattern provides a clean, declarative way to handle API operations without cluttering the script section with function definitions or using `bind:this` references.