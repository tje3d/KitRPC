<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import { authUser, isLoggedIn } from '$lib/flow/auth.flow';
	import LogoutProvider from '$lib/providers/LogoutProvider.svelte';
	import TodoProvider from '$lib/providers/TodoProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { onMount, tick } from 'svelte';
	import { elasticOut, quintOut } from 'svelte/easing';
	import { fade, fly, scale } from 'svelte/transition';

	let editingId: string | null = null;
	let editingText: string = '';
	let newTodoText: string = '';
	let todoProvider: TodoProvider;

	const cardClasses = 'backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-2xl';
	const errorCardClasses = 'backdrop-blur-sm bg-red-50/80 border border-red-200 rounded-2xl p-4';
	const primaryButtonClasses =
		'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
	const actionButtonClasses =
		'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';
	const editButtonClasses = `${actionButtonClasses} bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md`;
	const saveButtonClasses = `${actionButtonClasses} bg-green-600 text-white hover:bg-green-700 hover:shadow-md`;
	const cancelButtonClasses = `${actionButtonClasses} bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md`;
	const deleteButtonClasses = `${actionButtonClasses} bg-red-600 text-white hover:bg-red-700 hover:shadow-md`;

	const navButtonClasses =
		'rounded-xl bg-white/50 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white/80';
	const navPrimaryClasses =
		'rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl';

	const statsCards = [
		{
			label: 'Total Tasks',
			getValue: (s: any) => s.total,
			color: 'blue',
			bgGradient: 'from-blue-500 to-blue-600',
			iconBg: 'bg-blue-100',
			icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
		},
		{
			label: 'Completed',
			getValue: (s: any) => s.completed,
			color: 'green',
			bgGradient: 'from-green-500 to-emerald-600',
			iconBg: 'bg-green-100',
			icon: 'M5 13l4 4L19 7'
		},
		{
			label: 'Remaining',
			getValue: (s: any) => s.remaining,
			color: 'orange',
			bgGradient: 'from-orange-500 to-amber-600',
			iconBg: 'bg-orange-100',
			icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
		}
	];

	const featureCards = [
		{
			title: 'Easy Task Creation',
			text: 'Quickly add and organize your tasks with our intuitive interface.',
			color: 'blue'
		},
		{
			title: 'Progress Tracking',
			text: 'Monitor your productivity with detailed statistics.',
			color: 'green'
		},
		{
			title: 'Lightning Fast',
			text: 'Built with modern technology for instant responsiveness.',
			color: 'purple'
		}
	];

	const handleKeydown = (e: KeyboardEvent, fn: () => void) => e.key === 'Enter' && fn();

	// Success handlers with toast notifications
	function onAddSuccess() {
		newTodoText = '';
		todoProvider?.loadTodos();
		toast.success('Task added successfully!');
	}
	function onUpdateSuccess() {
		editingId = null;
		editingText = '';
		todoProvider?.loadTodos();
		toast.success('Task updated successfully!');
	}
	function onToggleSuccess() {
		todoProvider?.loadTodos();
		toast.info('Task status updated');
	}
	function onDeleteSuccess() {
		todoProvider?.loadTodos();
		toast.success('Task deleted successfully!');
	}
	function onLoggedOut() {
		toast.info('Logged out successfully');
		invalidateAll();
	}

	// Handle logout with confirmation dialog
	async function handleLogout(logout: () => void) {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'Confirm Logout',
				message:
					'Are you sure you want to log out? You will need to sign in again to access your tasks.',
				confirm: 'Logout',
				cancel: 'Cancel',
				color: 'red',
				onConfirm() {
					history.back();

					tick().then(() => {
						logout();
					});
				}
			}
		});
	}

	onMount(() => {
		if ($isLoggedIn) todoProvider?.loadTodos();
	});
</script>

<svelte:head>
	<title>TaskFlow - Modern Task Management</title>
	<meta
		name="description"
		content="Professional task management platform with modern design and seamless user experience"
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
	<!-- decorative blobs -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"
		></div>
		<div
			class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 blur-3xl"
		></div>
	</div>

	<!-- ---------- NAVIGATION ---------- -->
	<nav class="relative z-10 border-b border-white/20 bg-white/80 backdrop-blur-xl">
		<div class="mx-auto max-w-7xl px-6">
			<div class="flex h-16 items-center justify-between">
				<!-- logo -->
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg"
					>
						<span
							class="iconify h-6 w-6 text-white"
							data-icon="heroicons:clipboard-document-list-20-solid"
						></span>
					</div>
					<span class="text-xl font-bold text-gray-800">TaskFlow</span>
				</div>

				<!-- auth links -->
				<div class="flex items-center gap-4">
					{#if $isLoggedIn}
						<span class="text-sm text-gray-600">Welcome, {$authUser?.username || 'User'}</span>
						<LogoutProvider {onLoggedOut}>
							<svelte:fragment
								slot="default"
								let:loading
								let:errorMessage
								let:clearError
								let:logout
							>
								<button
									on:click={() => handleLogout(logout)}
									disabled={loading}
									class="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{#if loading}
										<span class="flex items-center gap-2">
											<span
												class="iconify h-4 w-4 animate-spin"
												data-icon="svg-spinners:bars-scale-fade"
											></span>
											Logging out...
										</span>
									{:else}
										Logout
									{/if}
								</button>

								<!-- Logout error display -->
								{#if errorMessage}
									<div
										class="fixed top-6 right-6 z-50 max-w-md"
										in:fly={{ x: 300, duration: 400, easing: quintOut }}
										out:fly={{ x: 300, duration: 300 }}
									>
										<div class="{errorCardClasses} shadow-2xl">
											<div class="flex items-start gap-3">
												<div
													class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100"
												>
													<span
														class="iconify h-4 w-4 text-red-600"
														data-icon="heroicons:exclamation-circle-20-solid"
													></span>
												</div>
												<div class="flex-1">
													<h3 class="text-sm font-semibold text-red-800">Logout Error</h3>
													<p class="mt-1 text-sm text-red-700">{errorMessage}</p>
												</div>
												<button
													on:click={clearError}
													class="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
													aria-label="Dismiss error"
												>
													<span class="iconify h-4 w-4" data-icon="heroicons:x-mark-20-solid"
													></span>
												</button>
											</div>
										</div>
									</div>
								{/if}
							</svelte:fragment>
						</LogoutProvider>
					{:else}
						<a href="/login" class={navButtonClasses}>Login</a>
						<a href="/register" class={navPrimaryClasses}>Register</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<!-- ---------- MAIN CONTENT ---------- -->
	<div class="relative z-10 mx-auto max-w-7xl px-6 py-12">
		{#if $isLoggedIn}
			<TodoProvider
				bind:this={todoProvider}
				let:todos
				let:todoStats
				let:loading
				let:errorMessage
				let:addLoading
				let:toggleLoading
				let:updateLoading
				let:deleteLoading
				let:addError
				let:toggleError
				let:updateError
				let:deleteError
				{onAddSuccess}
				{onUpdateSuccess}
				{onToggleSuccess}
				{onDeleteSuccess}
				let:loadTodos
				let:addTodo
				let:toggleTodo
				let:startEditing
				let:saveEdit
				let:deleteTodo
				let:clearError
				let:clearAddError
				let:clearToggleError
				let:clearUpdateError
				let:clearDeleteError
			>
				<!-- header -->
				<header class="mb-12 text-center" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
					<h1
						class="mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent"
					>
						Your Task Dashboard
					</h1>
					<p class="mx-auto max-w-2xl text-lg text-gray-600">
						Manage your tasks efficiently with our modern interface
					</p>
				</header>

				<!-- global error -->
				{#if errorMessage}
					<div
						class="fixed top-6 right-6 z-50 max-w-md"
						in:fly={{ x: 300, duration: 400, easing: quintOut }}
						out:fly={{ x: 300, duration: 300 }}
					>
						<div class="{errorCardClasses} shadow-2xl">
							<div class="flex items-start gap-3">
								<div
									class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100"
								>
									<span
										class="iconify h-4 w-4 text-red-600"
										data-icon="heroicons:exclamation-circle-20-solid"
									></span>
								</div>
								<div class="flex-1">
									<h3 class="text-sm font-semibold text-red-800">Error</h3>
									<p class="mt-1 text-sm text-red-700">{errorMessage}</p>
								</div>
								<button
									on:click={clearError}
									class="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
									aria-label="Dismiss error"
								>
									<span class="iconify h-4 w-4" data-icon="heroicons:x-mark-20-solid"></span>
								</button>
							</div>
						</div>
					</div>
				{/if}

				<main class="space-y-8">
					<!-- stats cards -->
					<section
						class="grid grid-cols-1 gap-6 md:grid-cols-3"
						in:fly={{ y: 20, duration: 600, delay: 200, easing: quintOut }}
					>
						{#each statsCards as card, index}
							<div
								class="{cardClasses} p-6 transition-transform duration-200 hover:scale-105"
								in:scale={{ duration: 500, delay: 400 + index * 100, easing: elasticOut }}
							>
								<div class="flex items-center justify-between">
									<div>
										<p class="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
											{card.label}
										</p>
										<p
											class="bg-gradient-to-r text-4xl font-bold {card.bgGradient} bg-clip-text text-transparent"
										>
											{card.getValue(todoStats)}
										</p>
									</div>
									<div
										class="h-16 w-16 {card.iconBg} flex items-center justify-center rounded-2xl shadow-lg"
									>
										<span
											class="iconify h-8 w-8 text-{card.color}-600"
											data-icon={card.icon ===
											'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
												? 'heroicons:clipboard-document-list-20-solid'
												: card.icon === 'M5 13l4 4L19 7'
													? 'heroicons:check-20-solid'
													: 'heroicons:chart-bar-20-solid'}
										></span>
									</div>
								</div>
							</div>
						{/each}
					</section>

					<!-- add todo section -->
					<section
						class="{cardClasses} p-8"
						in:fly={{ y: 20, duration: 600, delay: 600, easing: quintOut }}
					>
						<div class="mb-6 flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
							>
								<span class="iconify h-6 w-6 text-white" data-icon="heroicons:plus-20-solid"></span>
							</div>
							<h2 class="text-2xl font-bold text-gray-800">Add New Task</h2>
						</div>

						{#if addError}
							<div class="mb-6 {errorCardClasses}" in:fade={{ duration: 300 }}>
								<div class="flex items-center gap-3">
									<span
										class="iconify h-5 w-5 text-red-500"
										data-icon="heroicons:exclamation-circle-20-solid"
									></span>
									<p class="text-sm text-red-700">{addError}</p>
									<button
										on:click={clearAddError}
										class="text-red-400 hover:text-red-600"
										aria-label="Dismiss error"
										><span class="iconify h-4 w-4" data-icon="heroicons:x-mark-20-solid"
										></span></button
									>
								</div>
							</div>
						{/if}

						<div class="flex items-center gap-4">
							<div class="relative flex-1">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
									<span
										class="iconify h-5 w-5 text-gray-400"
										data-icon="heroicons:pencil-square-20-solid"
									></span>
								</div>
								<input
									type="text"
									bind:value={newTodoText}
									placeholder="What needs to be done today?"
									on:keydown={(e) => handleKeydown(e, () => addTodo(newTodoText))}
									class="w-full rounded-2xl border border-gray-200 bg-white/50 py-4 pr-4 pl-12 text-lg placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<button
								on:click={() => addTodo(newTodoText)}
								disabled={!newTodoText.trim() || addLoading}
								class={primaryButtonClasses}
							>
								{#if addLoading}
									<div class="flex items-center gap-2">
										<span
											class="iconify h-5 w-5 animate-spin"
											data-icon="svg-spinners:bars-scale-fade"
										></span>Adding...
									</div>
								{:else}
									<div class="flex items-center gap-2">
										<span class="iconify h-5 w-5" data-icon="heroicons:plus-20-solid"></span>Add
										Task
									</div>
								{/if}
							</button>
						</div>
					</section>

					<!-- todo list -->
					<section
						class={cardClasses}
						in:fly={{ y: 20, duration: 600, delay: 800, easing: quintOut }}
					>
						<div class="border-b border-gray-200/50 p-8">
							<div class="flex items-center gap-4">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
								>
									<span
										class="iconify h-6 w-6 text-white"
										data-icon="heroicons:clipboard-document-list-20-solid"
									></span>
								</div>
								<h2 class="text-2xl font-bold text-gray-800">Your Tasks</h2>
								{#if todos.length}
									<span
										class="ml-auto rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
										>{todos.length} {todos.length === 1 ? 'task' : 'tasks'}</span
									>
								{/if}
							</div>
						</div>

						<div class="p-8">
							{#if loading && todos.length === 0}
								<!-- skeletons -->
								<div class="space-y-4">
									{#each Array(3) as _, i}
										<div
											class="animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 p-6"
											in:fade={{ delay: i * 100 }}
										>
											<div class="flex items-center gap-4">
												<div class="h-6 w-6 rounded-full bg-gray-300"></div>
												<div class="h-6 flex-1 rounded-lg bg-gray-300"></div>
												<div class="flex gap-2">
													<div class="h-8 w-16 rounded-lg bg-gray-300"></div>
													<div class="h-8 w-16 rounded-lg bg-gray-300"></div>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{:else if todos.length === 0}
								<div class="py-20 text-center" in:fade={{ duration: 500 }}>
									<div
										class="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg"
									>
										<span
											class="iconify h-16 w-16 text-blue-500"
											data-icon="heroicons:clipboard-document-list-20-solid"
										></span>
									</div>
									<h3 class="mb-3 text-2xl font-bold text-gray-800">No tasks yet</h3>
									<p class="mx-auto max-w-md text-lg leading-relaxed text-gray-600">
										Ready to boost your productivity? Add your first task above and start organizing
										your day.
									</p>
								</div>
							{:else}
								<div class="space-y-4">
									{#each todos as todo, index (todo.id)}
										<div
											class="group rounded-2xl border border-white/30 bg-white/60 p-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:shadow-xl"
											in:fly={{ y: 20, duration: 400, delay: index * 50 }}
										>
											<!-- errors for this todo -->
											{#each [{ err: toggleError, clear: clearToggleError }, { err: updateError, clear: clearUpdateError }, { err: deleteError, clear: clearDeleteError }] as { err, clear }}
												{#if err}
													<div class="mb-4 {errorCardClasses}" in:fade={{ duration: 300 }}>
														<div class="flex items-center gap-3">
															<span
																class="iconify h-4 w-4 text-red-500"
																data-icon="heroicons:exclamation-circle-20-solid"
															></span>
															<p class="flex-1 text-sm text-red-700">{err}</p>
															<button
																on:click={clear}
																class="text-red-400 hover:text-red-600"
																aria-label="Dismiss error"
																><span class="iconify h-4 w-4" data-icon="heroicons:x-mark-20-solid"
																></span></button
															>
														</div>
													</div>
												{/if}
											{/each}

											<div class="flex items-center gap-4">
												<div class="relative">
													<input
														type="checkbox"
														checked={todo.completed}
														on:change={() => toggleTodo(todo.id)}
														disabled={toggleLoading}
														class="h-6 w-6 rounded-lg border-2 border-gray-300 text-blue-600 transition-all duration-200 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
													/>
													{#if toggleLoading}
														<div class="absolute inset-0 flex items-center justify-center">
															<span
																class="iconify h-4 w-4 animate-spin text-blue-600"
																data-icon="svg-spinners:bars-scale-fade"
															></span>
														</div>
													{/if}
												</div>

												{#if editingId === todo.id}
													<input
														type="text"
														bind:value={editingText}
														on:keydown={(e) => {
															if (e.key === 'Enter' && editingId) saveEdit(editingId, editingText);
															if (e.key === 'Escape') {
																editingId = null;
																editingText = '';
															}
														}}
														disabled={updateLoading}
														class="flex-1 rounded-xl border border-blue-300 bg-white/70 px-4 py-3 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
														autofocus
													/>
												{:else}
													<span
														class="flex-1 text-lg font-medium transition-all duration-200 {todo.completed
															? 'text-gray-500 line-through'
															: 'text-gray-800'}">{todo.text}</span
													>
												{/if}

												<div
													class="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
												>
													{#if editingId === todo.id}
														<button
															on:click={() => editingId && saveEdit(editingId, editingText)}
															disabled={updateLoading}
															class={saveButtonClasses}
														>
															{#if updateLoading}
																<span class="flex items-center gap-2"
																	><span
																		class="iconify h-4 w-4 animate-spin"
																		data-icon="svg-spinners:bars-scale-fade"
																	></span>Saving...</span
																>
															{:else}
																<span
																	class="iconify mr-1 h-4 w-4"
																	data-icon="heroicons:check-20-solid"
																></span>Save
															{/if}
														</button>
														<button
															on:click={() => {
																editingId = null;
																editingText = '';
															}}
															disabled={updateLoading}
															class={cancelButtonClasses}
														>
															<span
																class="iconify mr-1 h-4 w-4"
																data-icon="heroicons:x-mark-20-solid"
															></span>Cancel
														</button>
													{:else}
														<button
															on:click={() => {
																editingId = todo.id;
																editingText = todo.text;
															}}
															disabled={loading ||
																addLoading ||
																toggleLoading ||
																updateLoading ||
																deleteLoading}
															class={editButtonClasses}
														>
															<span
																class="iconify mr-1 h-4 w-4"
																data-icon="heroicons:pencil-square-20-solid"
															></span>Edit
														</button>
														<button
															on:click={() => deleteTodo(todo.id)}
															disabled={deleteLoading}
															class={deleteButtonClasses}
														>
															{#if deleteLoading}
																<span class="flex items-center gap-2"
																	><span
																		class="iconify h-4 w-4 animate-spin"
																		data-icon="svg-spinners:bars-scale-fade"
																	></span>Deleting...</span
																>
															{:else}
																<span
																	class="iconify mr-1 h-4 w-4"
																	data-icon="heroicons:trash-20-solid"
																></span>Delete
															{/if}
														</button>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</section>
				</main>
			</TodoProvider>
		{:else}
			<!-- ---------- LANDING PAGE ---------- -->
			<div class="text-center" in:fly={{ y: 20, duration: 800, easing: quintOut }}>
				<!-- hero -->
				<div class="mb-16">
					<div
						class="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl"
					>
						<span
							class="iconify h-12 w-12 text-white"
							data-icon="heroicons:clipboard-document-list-20-solid"
						></span>
					</div>
					<h1
						class="mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-6xl font-bold tracking-tight text-transparent"
					>
						Welcome to TaskFlow
					</h1>
					<p class="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
						The modern task management platform designed for productivity. Organize your work, track
						your progress, and achieve your goals with our intuitive and beautiful interface.
					</p>
					<div class="flex items-center justify-center gap-4">
						<a
							href="/register"
							class="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
							>Get Started Free</a
						>
						<a
							href="/login"
							class="rounded-2xl border border-gray-300 bg-white/50 px-8 py-4 text-lg font-semibold text-gray-700 backdrop-blur-sm transition-all duration-200 hover:bg-white/80"
							>Sign In</a
						>
					</div>
				</div>

				<!-- features -->
				<div
					class="grid grid-cols-1 gap-8 md:grid-cols-3"
					in:fly={{ y: 20, duration: 600, delay: 400, easing: quintOut }}
				>
					{#each featureCards as card}
						<div class="{cardClasses} p-8 text-center">
							<div
								class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-{card.color}-500 to-{card.color}-600 shadow-lg"
							>
								<span
									class="iconify h-8 w-8 text-white"
									data-icon={card.title === 'Easy Task Creation'
										? 'heroicons:plus-20-solid'
										: card.title === 'Progress Tracking'
											? 'heroicons:chart-bar-20-solid'
											: 'heroicons:bolt-20-solid'}
								></span>
							</div>
							<h3 class="mb-4 text-xl font-bold text-gray-800">{card.title}</h3>
							<p class="text-gray-600">{card.text}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
