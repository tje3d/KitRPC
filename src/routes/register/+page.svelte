<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import RegisterProvider from '$lib/providers/RegisterProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { quintOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	// Form state
	const username$ = new SvelteSubject<string>('');
	const password$ = new SvelteSubject<string>('');
	const confirmPassword$ = new SvelteSubject<string>('');

	// Validation state
	let usernameTouched = false;
	let passwordTouched = false;
	let confirmPasswordTouched = false;

	// Computed validation
	$: usernameValid = !usernameTouched || $username$.length >= 1;
	$: passwordValid = !passwordTouched || $password$.length >= 6;
	$: passwordsMatch = !confirmPasswordTouched || $password$ === $confirmPassword$;
	$: formValid =
		usernameValid &&
		passwordValid &&
		passwordsMatch &&
		$username$ &&
		$password$ &&
		$confirmPassword$;

	// Password strength
	$: passwordStrength = calculatePasswordStrength($password$);

	function calculatePasswordStrength(password: string): {
		score: number;
		label: string;
		color: string;
	} {
		let score = 0;
		if (password.length >= 6) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^a-zA-Z\d]/.test(password)) score++;

		const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
		const colors = [
			'bg-red-500',
			'bg-orange-500',
			'bg-yellow-500',
			'bg-blue-500',
			'bg-green-500',
			'bg-teal-500'
		];

		return {
			score,
			label: labels[score] || 'Very Weak',
			color: colors[score] || 'bg-red-500'
		};
	}

	// Actions
	function handleRegister(e: SubmitEvent, register: Function) {
		e.preventDefault();
		if (!formValid) return;

		const registerData = {
			username: $username$,
			password: $password$
		};

		register(registerData);
	}

	function onRegistered(user: App.AuthUser, token: string) {
		// Set authentication state
		setAuthUser(user);
		setIsLoggedIn(true);

		// Show success toast
		toast.success('Account created successfully! Welcome to TaskFlow.');

		// Navigate to home
		goto('/');
	}

	function handleInputBlur(field: string) {
		switch (field) {
			case 'username':
				usernameTouched = true;
				break;
			case 'password':
				passwordTouched = true;
				break;
			case 'confirmPassword':
				confirmPasswordTouched = true;
				break;
		}
	}
</script>

<svelte:head>
	<title>Create Account - Todo Manager</title>
	<meta
		name="description"
		content="Join Todo Manager - Create your account to start organizing your tasks efficiently"
	/>
</svelte:head>

<RegisterProvider {onRegistered} let:loading let:errorMessage let:clearError let:register>
	<div
		class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4"
	>
		<!-- Background decoration -->
		<div class="pointer-events-none absolute inset-0 overflow-hidden">
			<div
				class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"
			></div>
			<div
				class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 blur-3xl"
			></div>
		</div>

		<div class="relative z-10 w-full max-w-md" in:fly={{ y: 20, duration: 600, easing: quintOut }}>
			<!-- Header -->
			<div class="mb-8 text-center">
				<div
					class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg"
				>
					<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
						/>
					</svg>
				</div>
				<h1 class="mb-2 text-3xl font-bold text-gray-900">Create your account</h1>
				<p class="text-gray-600">
					Already have an account?
					<a
						href="/login"
						class="font-semibold text-blue-600 transition-colors hover:text-blue-700"
					>
						Sign in
					</a>
				</p>
			</div>

			<!-- Main Form Card -->
			<div
				class="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl"
			>
				<form on:submit={(e) => handleRegister(e, register)} class="space-y-6" novalidate>
					<!-- Error Display -->
					{#if errorMessage}
						<div
							class="rounded-2xl border border-red-200 bg-red-50/80 p-4 backdrop-blur-sm"
							in:fade={{ duration: 300 }}
						>
							<div class="flex items-start">
								<svg
									class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									/>
								</svg>
								<div class="ml-3 flex-1">
									<p class="text-sm text-red-800">{errorMessage}</p>
								</div>
								<button
									type="button"
									on:click={clearError}
									class="ml-3 text-red-400 transition-colors hover:text-red-600"
									aria-label="Dismiss error"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/if}

					<!-- Username Input -->
					<div class="space-y-2">
						<label for="username" class="block text-sm font-semibold text-gray-700">
							Username
						</label>
						<div class="relative">
							<input
								id="username"
								name="username"
								type="text"
								autocomplete="username"
								required
								bind:value={$username$}
								on:blur={() => handleInputBlur('username')}
								class="w-full rounded-2xl border border-gray-200 bg-white/50 px-4 py-3 placeholder-gray-400
									backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2
									focus:ring-blue-500 {usernameTouched && !usernameValid ? 'border-red-300 bg-red-50/50' : ''}"
								placeholder="Enter your username"
							/>
							{#if usernameTouched && !usernameValid}
								<p class="mt-1 text-sm text-red-600">Username is required</p>
							{/if}
						</div>
					</div>

					<!-- Password Input -->
					<div class="space-y-2">
						<label for="password" class="block text-sm font-semibold text-gray-700">
							Password
						</label>
						<div class="relative">
							<input
								id="password"
								name="password"
								type="password"
								autocomplete="new-password"
								required
								bind:value={$password$}
								on:blur={() => handleInputBlur('password')}
								class="w-full rounded-2xl border border-gray-200 bg-white/50 px-4 py-3 placeholder-gray-400
									backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2
									focus:ring-blue-500 {passwordTouched && !passwordValid ? 'border-red-300 bg-red-50/50' : ''}"
								placeholder="Create a strong password"
							/>
						</div>

						<!-- Password Strength Indicator -->
						{#if $password$}
							<div class="space-y-2" in:fade={{ duration: 200 }}>
								<div class="flex items-center justify-between text-xs">
									<span class="text-gray-600">Password strength</span>
									<span
										class="font-medium {passwordStrength.score >= 3
											? 'text-green-600'
											: passwordStrength.score >= 2
												? 'text-yellow-600'
												: 'text-red-600'}"
									>
										{passwordStrength.label}
									</span>
								</div>
								<div class="flex space-x-1">
									{#each Array(5) as _, i}
										<div class="h-1 flex-1 rounded-full bg-gray-200">
											<div
												class="h-full rounded-full transition-all duration-300 {i <
												passwordStrength.score
													? passwordStrength.color
													: ''}"
											></div>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						{#if passwordTouched && !passwordValid}
							<p class="text-sm text-red-600">Password must be at least 6 characters long</p>
						{/if}
					</div>

					<!-- Confirm Password Input -->
					<div class="space-y-2">
						<label for="confirmPassword" class="block text-sm font-semibold text-gray-700">
							Confirm password
						</label>
						<div class="relative">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autocomplete="new-password"
								required
								bind:value={$confirmPassword$}
								on:blur={() => handleInputBlur('confirmPassword')}
								class="w-full rounded-2xl border border-gray-200 bg-white/50 px-4 py-3 placeholder-gray-400
									backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2
									focus:ring-blue-500 {confirmPasswordTouched && !passwordsMatch
									? 'border-red-300 bg-red-50/50'
									: ''}"
								placeholder="Confirm your password"
							/>
							{#if confirmPasswordTouched && !passwordsMatch}
								<p class="mt-1 text-sm text-red-600">Passwords do not match</p>
							{/if}
						</div>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={loading || !formValid}
						class="w-full transform rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3
							font-semibold text-white shadow-lg transition-all duration-200
							hover:-translate-y-0.5 hover:shadow-xl focus:ring-2 focus:ring-blue-500
							focus:ring-offset-2 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-lg"
					>
						{#if loading}
							<div class="flex items-center justify-center">
								<svg
									class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Creating your account...
							</div>
						{:else}
							<div class="flex items-center justify-center">
								<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
									/>
								</svg>
								Create account
							</div>
						{/if}
					</button>

					<!-- Terms -->
					<p class="text-center text-xs leading-relaxed text-gray-500">
						By creating an account, you agree to our
						<a href="/terms" class="text-blue-600 underline hover:text-blue-700">Terms of Service</a
						>
						and
						<a href="/privacy" class="text-blue-600 underline hover:text-blue-700">Privacy Policy</a
						>
					</p>
				</form>
			</div>
		</div>
	</div>
</RegisterProvider>
