# Provider Pattern Guide

This guide explains how to create and use provider components in our KitRPC project. Providers are Svelte components that encapsulate tRPC API calls and provide a consistent interface for data fetching and mutations.

## Overview

Providers follow a specific pattern that:
- Encapsulates tRPC API calls
- Provides reactive data through RxJS observables
- Handles loading states and error management
- Exposes data and actions through Svelte slots
- Follows consistent naming conventions

## Provider Types

We have three main types of providers:

1. **Query Providers** - For fetching data (GET operations)
2. **Mutation Providers** - For creating/updating data (POST/PUT operations)
3. **List Providers** - For fetching paginated lists with filtering

---

## 1. Query Providers

Used for simple data fetching operations.

### Example: GetSystemCapacityStatsProvider.svelte

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterOutputs } from '$lib/trpc/router';

	type ResponseData = RouterOutputs['capacity']['getStats'];

	// Props
	export let onSuccess: ((data: ResponseData | undefined) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for getting system capacity stats
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn(() => {
			return trpc(page).capacity.getStats.query();
		}),
		{
			initialData: [],
			requestOnSubscribe: true
		}
	);

	// Actions
	export function getStats() {
		trigger.next();
	}

	subscribe(responseSuccess, (result) => {
		onSuccess?.(Array.isArray(result) ? result : undefined);
	});

	subscribe(errorMessage, (message) => {
		if (!message) return;

		onError?.(message);
	});
</script>

<slot
	response={$responseSuccess}
	loading={$loading}
	errorMessage={$errorMessage}
	capacityStats={$responseSuccess}
	{clearError}
	{getStats}
/>
```

### Key Features:

- **Type Safety**: Uses `RouterOutputs` for response typing
- **Auto-fetch**: `requestOnSubscribe: true` fetches data on component mount
- **Initial Data**: Provides sensible defaults (empty array for lists)
- **Reactive**: Exposes reactive stores through slots
- **Actions**: Provides methods to trigger refetch

---

## 2. Mutation Providers

Used for creating, updating, or deleting data.

### Example: CreateCapacityTransactionProvider.svelte

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';

	type RequestParams = RouterInputs['capacity']['createCapacityTransaction'];
	type ResponseData = RouterOutputs['capacity']['createCapacityTransaction'];

	// Props
	export let onSuccess: ((data: ResponseData | undefined) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for creating a capacity transaction
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((input: RequestParams) => {
			return trpc(page).capacity.createCapacityTransaction.mutate(input);
		})
	);

	// Actions
	export function createCapacityTransaction(input: RequestParams) {
		trigger.next(input);
	}

	subscribe(responseSuccess, (result) => {
		onSuccess?.(result);
	});

	subscribe(errorMessage, (message) => {
		if (!message) return;

		onError?.(message);
	});
</script>

<slot
	response={$responseSuccess}
	loading={$loading}
	errorMessage={$errorMessage}
	transactionResult={$responseSuccess}
	{clearError}
	{createCapacityTransaction}
/>
```

### Key Features:

- **Input Types**: Uses `RouterInputs` for parameter typing
- **No Auto-fetch**: Mutations are triggered manually
- **Parameter Passing**: Actions accept input parameters
- **Result Handling**: Exposes mutation results through slots

---

## 3. List Providers

Used for fetching paginated lists with filtering and sorting.

### Example: GetCapacityTransactionsProvider.svelte

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { shareIt } from '$lib/helpers/rxjs.helper';
	import { subscribe } from '$lib/helpers/svelte-rxjs.helper';
	import { createTrpcRequestFn, useTrpcRequest } from '$lib/helpers/useTrpcRequest.helper';
	import { trpc } from '$lib/trpc/client';
	import type { RouterInputs, RouterOutputs } from '$lib/trpc/router';
	import { map } from 'rxjs';

	type RequestParams = NonNullable<RouterInputs['capacity']['getCapacityTransactions']>;
	type ResponseData = RouterOutputs['capacity']['getCapacityTransactions'];

	// Props
	export let onSuccess: ((data: ResponseData) => void) | undefined = undefined;
	export let onError: ((error: string) => void) | undefined = undefined;

	// Request for fetching capacity transaction history
	const { clearError, errorMessage, loading, trigger, responseSuccess } = useTrpcRequest(
		createTrpcRequestFn((filters: RequestParams) => {
			return trpc(page).capacity.getCapacityTransactions.query(filters);
		}),
		{
			initialData: {},
			requestOnSubscribe: true
		}
	);

	const totalCount = responseSuccess.pipe(
		map((r) => r?.totalCount || 0),
		shareIt()
	);
	const transactions = responseSuccess.pipe(
		map((r) => r?.transactions),
		shareIt()
	);

	// Actions
	export function getCapacityTransactions(filters: RequestParams) {
		trigger.next(filters);
	}

	subscribe(responseSuccess, (r) => {
		if (!r) return;

		onSuccess?.(r);
	});

	subscribe(errorMessage, (message) => {
		if (!message) return;

		onError?.(message);
	});
</script>

<slot
	response={$responseSuccess}
	loading={$loading}
	errorMessage={$errorMessage}
	totalCount={$totalCount}
	transactions={$transactions}
	{clearError}
	{getCapacityTransactions}
/>
```

### Key Features:

- **Derived Observables**: Extracts specific data (totalCount, items) using RxJS operators
- **Pagination Support**: Handles limit/offset parameters
- **Filtering**: Accepts filter parameters
- **Date Handling**: Superjson automatically handles date serialization/deserialization

---

## Usage in Components

There are two main approaches to using providers in your Svelte components:

### Approach 1: Modern `let:` Pattern (Recommended)

This approach eliminates the need for `bind:this` and function definitions in the script section by using Svelte's `let:` syntax to access provider functionality directly in templates.

#### Principles:

1. **No `bind:this` usage** - Providers expose their functionality through slot props
2. **No function definitions in script** - All API calls are handled through provider methods
3. **Declarative template logic** - Business logic is written directly in templates using `let:` syntax
4. **Nested provider composition** - Multiple providers can be nested to handle complex workflows
5. **Reactive data flow** - Providers automatically handle loading states, errors, and data updates

#### Query Provider Usage

```svelte
<GetSystemCapacityStatsProvider
	onError={(error) => {
		toast.error(error || 'Failed to fetch capacity stats');
	}}
	let:loading
	let:capacityStats
	let:getStats
>
	{#if loading}
		<div>Loading...</div>
	{:else}
		{#each capacityStats || [] as stat}
			<div>{stat.currency}: {stat.amount}</div>
		{/each}
	{/if}
	
	<button on:click={() => getStats()}>Refresh</button>
</GetSystemCapacityStatsProvider>
```

#### Mutation Provider Usage

```svelte
<CreateCapacityTransactionProvider
	onSuccess={(data) => {
		if (data) {
			toast.success('Transaction created successfully');
			// Reset form state
			showForm = false;
			// Refresh data
			getStats();
		}
	}}
	onError={(error) => {
		toast.error(error || 'Failed to create transaction');
	}}
	let:createCapacityTransaction
	let:loading={createLoading}
>
	<form on:submit|preventDefault={() => {
		createCapacityTransaction({ 
			currency: formData.currency,
			amount: formData.amount,
			description: formData.description
		});
	}}>
		<!-- Form fields -->
		<Button type="submit" disabled={createLoading}>
			{createLoading ? 'Creating...' : 'Create Transaction'}
		</Button>
	</form>
</CreateCapacityTransactionProvider>
```

#### Nested Provider Composition

```svelte
<GetSystemCapacityStatsProvider let:loading let:capacityStats let:getStats>
	<CreateCapacityTransactionProvider let:createCapacityTransaction let:loading={createLoading}>
		<GetCapacityTransactionsProvider let:transactions let:getCapacityTransactions let:loading={listLoading}>
			<!-- All provider functionality available here -->
			<form on:submit|preventDefault={() => {
				createCapacityTransaction(formData);
			}}>
				<!-- Form content -->
			</form>
			
			{#if loading || listLoading}
				<div>Loading...</div>
			{:else}
				<!-- Display data -->
			{/if}
		</GetCapacityTransactionsProvider>
	</CreateCapacityTransactionProvider>
</GetSystemCapacityStatsProvider>
```

### Approach 2: Traditional `bind:this` Pattern

This approach uses component references and function definitions in the script section.

#### Basic Usage

```svelte
<script>
	import GetSystemCapacityStatsProvider from '$lib/providers/GetSystemCapacityStatsProvider.svelte';

	let capacityProvider;

	function handleSuccess(data) {
		console.log('Capacity stats:', data);
	}

	function handleError(error) {
		console.error('Error:', error);
	}

	function refreshStats() {
		capacityProvider.getStats();
	}
</script>

<GetSystemCapacityStatsProvider
	bind:this={capacityProvider}
	onSuccess={handleSuccess}
	onError={handleError}
	let:capacityStats
	let:loading
	let:errorMessage
	let:clearError
>
	{#if loading}
		<div>Loading...</div>
	{:else if errorMessage}
		<div class="error">
			{errorMessage}
			<button on:click={clearError}>Clear Error</button>
		</div>
	{:else if capacityStats}
		<div>
			{#each capacityStats as stat}
				<div>{stat.currency}: {stat.amount}</div>
			{/each}
		</div>
	{/if}

	<button on:click={refreshStats}>Refresh</button>
</GetSystemCapacityStatsProvider>
```

#### Mutation Usage

```svelte
<script>
	import CreateCapacityTransactionProvider from '$lib/providers/CreateCapacityTransactionProvider.svelte';

	let createProvider;
	let formData = {
		currency: 'USDT',
		amount: 1000,
		description: 'Manual capacity increase'
	};

	function handleCreate() {
		createProvider.createCapacityTransaction(formData);
	}

	function handleSuccess(result) {
		console.log('Transaction created:', result);
		// Reset form or redirect
	}
</script>

<CreateCapacityTransactionProvider
	bind:this={createProvider}
	onSuccess={handleSuccess}
	onError={(error) => console.error(error)}
	let:loading
	let:errorMessage
>
	<form on:submit|preventDefault={handleCreate}>
		<select bind:value={formData.currency}>
			<option value="USDT">USDT</option>
			<option value="IRT">IRT</option>
		</select>
		
		<input
			type="number"
			bind:value={formData.amount}
			placeholder="Amount"
			required
		/>
		
		<input
			type="text"
			bind:value={formData.description}
			placeholder="Description (optional)"
		/>
		
		<button type="submit" disabled={loading}>
			{loading ? 'Creating...' : 'Create Transaction'}
		</button>
	</form>
	
	{#if errorMessage}
		<div class="error">{errorMessage}</div>
	{/if}
</CreateCapacityTransactionProvider>
```

#### List Usage with Pagination

```svelte
<script>
	import GetCapacityTransactionsProvider from '$lib/providers/GetCapacityTransactionsProvider.svelte';

	let listProvider;
	let filters = {
		limit: 10,
		offset: 0,
		currency: undefined
	};

	function loadPage(page) {
		filters.offset = page * filters.limit;
		listProvider.getCapacityTransactions(filters);
	}

	function filterByCurrency(currency) {
		filters.currency = currency;
		filters.offset = 0;
		listProvider.getCapacityTransactions(filters);
	}
</script>

<GetCapacityTransactionsProvider
	bind:this={listProvider}
	let:transactions
	let:totalCount
	let:loading
	let:errorMessage
>
	<div class="filters">
		<button on:click={() => filterByCurrency(undefined)}>All</button>
		<button on:click={() => filterByCurrency('USDT')}>USDT</button>
		<button on:click={() => filterByCurrency('IRT')}>IRT</button>
	</div>

	{#if loading}
		<div>Loading transactions...</div>
	{:else if errorMessage}
		<div class="error">{errorMessage}</div>
	{:else if transactions}
		<div class="transactions">
			{#each transactions as transaction}
				<div class="transaction">
					<span>{transaction.currency}</span>
					<span>{transaction.amount}</span>
					<span>{transaction.createdAt.toLocaleDateString()}</span>
					<span>{transaction.user.username}</span>
				</div>
			{/each}
		</div>
		
		<div class="pagination">
			<span>Total: {totalCount}</span>
			<!-- Add pagination controls here -->
		</div>
	{/if}
</GetCapacityTransactionsProvider>
```

## Advanced Implementation Patterns

### 1. Loading State Management

Each provider exposes its own loading state with unique names to avoid conflicts:

```svelte
<CreateCapacityTransactionProvider let:loading={createLoading}>
	<UpdateCapacityTransactionProvider let:loading={updateLoading}>
		<DeleteCapacityTransactionProvider let:loading={deleteLoading}>
			<!-- Use specific loading states -->
			<Button disabled={createLoading || updateLoading}>
				{createLoading ? 'Creating...' : 'Create'}
			</Button>
		</DeleteCapacityTransactionProvider>
	</UpdateCapacityTransactionProvider>
</CreateCapacityTransactionProvider>
```

### 2. Form Submission Pattern

Forms are handled directly in templates without script functions:

```svelte
<script>
	// Form state
	let formData = { currency: 'USDT', amount: 0, description: '' };
	let errors = {};
</script>

<CreateCapacityTransactionProvider let:createCapacityTransaction>
	<form on:submit|preventDefault={() => {
		// Validation
		if (!formData.amount || formData.amount <= 0) {
			errors.amount = 'Amount must be greater than 0';
			return;
		}

		// Clear errors
		errors = {};

		// Conditional logic
		if (editMode) {
			updateCapacityTransaction({ id: currentTransaction.id, data: formData });
		} else {
			createCapacityTransaction(formData);
		}
	}}>
		<!-- Form fields -->
		<Input bind:value={formData.amount} error={errors.amount} />
	</form>
</CreateCapacityTransactionProvider>
```

### 3. Data Refresh Pattern

Refresh data after mutations using query provider methods:

```svelte
<GetSystemCapacityStatsProvider let:getStats>
	<CreateCapacityTransactionProvider
		onSuccess={() => {
			// Refresh the stats after creation
			getStats();
		}}
		let:createCapacityTransaction
	>
		<!-- Template -->
	</CreateCapacityTransactionProvider>
</GetSystemCapacityStatsProvider>
```

### 4. Reactive Providers (Real-time Data)

Used for data that changes based on reactive props:

```svelte
<!-- GetBankProvider example -->
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

### 5. Migration from bind:this Pattern

#### Before (bind:this pattern):
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

#### After (let: pattern):
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

---

## Naming Conventions

### Provider Files

- **Query Providers**: `Get[Resource][Action]Provider.svelte`
  - Examples: `GetUserByIdProvider.svelte`, `GetCardsProvider.svelte`

- **Mutation Providers**: `[Action][Resource]Provider.svelte`
  - Examples: `CreateCardProvider.svelte`, `UpdateUserProvider.svelte`, `DeleteRoleProvider.svelte`

- **List Providers**: `List[Resources]Provider.svelte` or `Get[Resources]Provider.svelte`
  - Examples: `ListUsersProvider.svelte`, `GetCapacityTransactionsProvider.svelte`

### Slot Props

- **Common Props**: `response`, `loading`, `errorMessage`, `clearError`
- **Data Props**: Use descriptive names like `user`, `cards`, `transactions`, `capacityStats`
- **Action Props**: Use verb names like `getUser`, `createCard`, `updateRole`

---

## Best Practices

### 1. Type Safety

```typescript
// Always use proper typing
type RequestParams = RouterInputs['resource']['endpoint'];
type ResponseData = RouterOutputs['resource']['endpoint'];
```

### 2. Error Handling

```svelte
// Always provide error callbacks
export let onError: ((error: string) => void) | undefined = undefined;

// Subscribe to error messages
subscribe(errorMessage, (message) => {
	if (!message) return;
	onError?.(message);
});
```

### 3. Loading States

```svelte
// Always expose loading state
<slot
	loading={$loading}
	{...otherProps}
/>
```

### 4. Initial Data

```svelte
// Provide sensible defaults
const { ... } = useTrpcRequest(
	...,
	{
		initialData: [], // For arrays
		// or
		initialData: {}, // For objects
		requestOnSubscribe: true // For auto-fetch
	}
);
```

### 5. Date Handling

```svelte
// DON'T manually convert dates - superjson handles this
// ❌ Bad
const transactions = responseSuccess.pipe(
	map((r) => r?.transactions.map(t => ({
		...t,
		createdAt: new Date(t.createdAt) // Don't do this
	})))
);

// ✅ Good
const transactions = responseSuccess.pipe(
	map((r) => r?.transactions) // Dates are already Date objects
);
```

### 6. Reactive Data

```svelte
// Use shareIt() for derived observables
const totalCount = responseSuccess.pipe(
	map((r) => r?.totalCount || 0),
	shareIt() // Important for performance
);
```

### 7. Provider Naming Convention

- **Query providers**: `Get{Entity}Provider`, `List{Entity}Provider`
  - Examples: `GetSystemCapacityStatsProvider`, `GetUserByIdProvider`, `ListUsersProvider`
- **Mutation providers**: `Create{Entity}Provider`, `Update{Entity}Provider`, `Delete{Entity}Provider`
  - Examples: `CreateCapacityTransactionProvider`, `UpdateUserProvider`, `DeleteRoleProvider`
- **Action providers**: `{Action}{Entity}Provider`
  - Examples: `ActivateWalletProvider`, `ResetPasswordProvider`

### 8. Slot Prop Naming

- **Data**: Use entity name (e.g., `cards`, `user`, `bank`, `capacityStats`, `transactions`)
- **Actions**: Use verb + entity (e.g., `createCard`, `updateUser`, `getStats`, `deleteTransaction`)
- **States**: Use descriptive names (e.g., `loading`, `errorMessage`, `response`)
- **Loading conflicts**: Use `loading={specificLoading}` syntax (e.g., `let:loading={createLoading}`)

### 9. Error Handling Patterns

```svelte
<Provider
	onError={(error) => {
		// Always provide fallback message
		toast.error(error || 'Operation failed');
		// Log for debugging
		console.error('Provider error context:', error);
	}}
>
```

### 10. Success Handling Patterns

```svelte
<Provider
	onSuccess={(data) => {
		// Check data exists
		if (data) {
			// Show success message
			toast.success('Operation successful');
			// Reset form state
			formData = { currency: 'USDT', amount: 0, description: '' };
			// Refresh related data
			getStats();
			// Navigate if needed
			// goto('/success-page');
		}
	}}
>
```

### 11. Form State Management

Keep form state in the script section, but handle submission in templates:

```svelte
<script>
	// Form state
	let formData = { currency: 'USDT', amount: 0, description: '' };
	let errors = {};
	let editMode = false;
</script>

<CreateCapacityTransactionProvider let:createCapacityTransaction>
	<form on:submit|preventDefault={() => {
		// Validation logic
		if (!formData.amount || formData.amount <= 0) {
			errors.amount = 'Amount must be greater than 0';
			return;
		}
		
		// Clear errors
		errors = {};
		
		// Call provider action
		createCapacityTransaction(formData);
	}}>
		<Input bind:value={formData.amount} error={errors.amount} />
		<Button type="submit">Create</Button>
	</form>
</CreateCapacityTransactionProvider>
```

### 12. Approach Selection Guidelines

**Use Modern `let:` Pattern When:**
- Building new components
- Simple to medium complexity workflows
- Want cleaner, more declarative code
- Working with nested provider compositions

**Use Traditional `bind:this` Pattern When:**
- Working with existing legacy code
- Need complex programmatic control
- Integrating with external libraries that expect function references
- Debugging complex provider interactions

### 13. Migration from `bind:this` to `let:` Pattern

**Before (Traditional):**
```svelte
<script>
	let provider;
	
	function handleSubmit() {
		provider.createUser(formData);
	}
</script>

<CreateUserProvider bind:this={provider}>
	<form on:submit|preventDefault={handleSubmit}>
		<!-- form content -->
	</form>
</CreateUserProvider>
```

**After (Modern):**
```svelte
<CreateUserProvider let:createUser>
	<form on:submit|preventDefault={() => createUser(formData)}>
		<!-- form content -->
	</form>
</CreateUserProvider>
```

### 14. Troubleshooting Common Issues

**Issue: Provider not updating after data change**
```svelte
<!-- ❌ Wrong: Missing reactive statement -->
<GetUserProvider userId={currentUserId}>

<!-- ✅ Correct: Use reactive statement -->
<GetUserProvider userId={currentUserId} let:getUser>
	{#if currentUserId}
		<div use:getUser></div>
	{/if}
</GetUserProvider>
```

**Issue: Multiple loading states conflict**
```svelte
<!-- ❌ Wrong: Same loading variable name -->
<CreateUserProvider let:loading>
<UpdateUserProvider let:loading>

<!-- ✅ Correct: Rename loading variables -->
<CreateUserProvider let:loading={createLoading}>
<UpdateUserProvider let:loading={updateLoading}>
```

**Issue: Form not resetting after success**
```svelte
<!-- ✅ Correct: Reset in onSuccess -->
<CreateUserProvider 
	onSuccess={() => {
		formData = { name: '', email: '' };
		errors = {};
	}}
>
```

---

## Common Patterns

### 1. CRUD Operations

Complete CRUD interface with nested providers:

```svelte
<GetSystemCapacityStatsProvider let:capacityStats let:getStats>
	<CreateCapacityTransactionProvider onSuccess={() => getStats()} let:createCapacityTransaction>
		<UpdateCapacityTransactionProvider onSuccess={() => getStats()} let:updateCapacityTransaction>
			<DeleteCapacityTransactionProvider onSuccess={() => getStats()} let:deleteCapacityTransaction>
				<!-- CRUD interface -->
				<div class="capacity-management">
					<!-- Display current stats -->
					{#each capacityStats || [] as stat}
						<div>{stat.currency}: {stat.amount}</div>
					{/each}
					
					<!-- Create/Update form -->
					<form on:submit|preventDefault={() => {
						if (editMode) {
							updateCapacityTransaction({ id: currentTransaction.id, data: formData });
						} else {
							createCapacityTransaction(formData);
						}
					}}>
						<!-- Form fields -->
					</form>
				</div>
			</DeleteCapacityTransactionProvider>
		</UpdateCapacityTransactionProvider>
	</CreateCapacityTransactionProvider>
</GetSystemCapacityStatsProvider>
```

### 2. Conditional Actions

Handle different actions based on state:

```svelte
<CreateCapacityTransactionProvider let:createCapacityTransaction>
	<UpdateCapacityTransactionProvider let:updateCapacityTransaction>
		<form on:submit|preventDefault={() => {
			if (editMode) {
				updateCapacityTransaction({ id: currentTransaction.id, data: formData });
			} else {
				createCapacityTransaction(formData);
			}
		}}>
			<!-- Form content -->
		</form>
	</UpdateCapacityTransactionProvider>
</CreateCapacityTransactionProvider>
```

### 3. Confirmation Dialogs

Integrate with dialog systems for confirmations:

```svelte
<DeleteCapacityTransactionProvider let:deleteCapacityTransaction>
	<Button onClick={() => {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'Confirm Delete',
				message: 'Are you sure you want to delete this transaction?',
				onConfirm: () => deleteCapacityTransaction({ id: transaction.id })
			}
		});
	}}>
		Delete Transaction
	</Button>
</DeleteCapacityTransactionProvider>
```

### 4. Auto-refresh on Success (Traditional Pattern)

```svelte
<script>
	let listProvider;
	let createProvider;

	function handleCreateSuccess() {
		// Refresh the list after creating
		listProvider.getTransactions();
	}
</script>

<CreateTransactionProvider
	bind:this={createProvider}
	onSuccess={handleCreateSuccess}
/>

<GetTransactionsProvider bind:this={listProvider} />
```

### 5. Form Integration (Traditional Pattern)

```svelte
<script>
	let provider;
	let form = { name: '', email: '' };

	function handleSubmit() {
		provider.createUser(form);
	}

	function handleSuccess() {
		// Reset form
		form = { name: '', email: '' };
	}
</script>

<CreateUserProvider
	bind:this={provider}
	onSuccess={handleSuccess}
	let:loading
>
	<form on:submit|preventDefault={handleSubmit}>
		<input bind:value={form.name} disabled={loading} />
		<input bind:value={form.email} disabled={loading} />
		<button type="submit" disabled={loading}>Create</button>
	</form>
</CreateUserProvider>
```

### 6. Conditional Rendering

```svelte
<GetUserProvider let:user let:loading let:errorMessage>
	{#if loading}
		<Spinner />
	{:else if errorMessage}
		<ErrorMessage message={errorMessage} />
	{:else if user}
		<UserProfile {user} />
	{:else}
		<div>No user found</div>
	{/if}
</GetUserProvider>
```

---

## Troubleshooting

### Common Issues

1. **Provider not triggering**: Make sure to use `bind:this` and call methods on the provider instance
2. **Type errors**: Ensure you're using the correct `RouterInputs`/`RouterOutputs` types
3. **Date issues**: Don't manually convert dates - superjson handles this automatically
4. **Memory leaks**: Always use `shareIt()` for derived observables
5. **Auto-fetch not working**: Check `requestOnSubscribe: true` in options

### Debugging

```svelte
<script>
	// Add logging to debug provider behavior
	subscribe(responseSuccess, (result) => {
		console.log('Provider response:', result);
		onSuccess?.(result);
	});

	subscribe(loading, (isLoading) => {
		console.log('Provider loading:', isLoading);
	});
</script>
```

---

## Conclusion

This provider pattern provides:

- **Consistency**: All API calls follow the same pattern
- **Type Safety**: Full TypeScript support
- **Reactivity**: Built-in reactive data management
- **Reusability**: Providers can be used across multiple components
- **Error Handling**: Consistent error management
- **Loading States**: Built-in loading state management

By following this guide, you can create robust, type-safe, and maintainable API integrations in your Svelte components.