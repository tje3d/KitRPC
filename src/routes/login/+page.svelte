<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import LoginProvider from '$lib/providers/LoginProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { quintOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	// Form state
	const username$ = new SvelteSubject<string>('');
	const password$ = new SvelteSubject<string>('');

	// Validation state
	let usernameTouched = false;
	let passwordTouched = false;
	let showPassword = false;

	// Class constants for reused styles
	const baseInputClasses =
		'w-full rounded-2xl border border-gray-200 bg-white/50 px-4 py-3 placeholder-gray-400 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500';
	const errorInputClasses = 'border-red-300 bg-red-50/50';
	const toggleButtonBaseClasses =
		'rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200';
	const toggleButtonActiveClasses = 'bg-white text-gray-900 shadow-md';
	const toggleButtonInactiveClasses = 'text-gray-500 hover:text-gray-700';
	const socialButtonClasses =
		'group flex items-center justify-center rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl';
	const socialButtonTextClasses =
		'text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900';
	const primaryButtonClasses =
		'w-full transform rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-lg';

	// Social login providers data
	const socialProviders = [
		{
			name: 'Google',
			icon: `<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>`,
			handler: () => console.log('Google login')
		},
		{
			name: 'Facebook',
			icon: `<svg class="mr-2 h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
			</svg>`,
			handler: () => console.log('Facebook login')
		}
	];

	// Computed validation
	$: usernameValid = !usernameTouched || $username$.length > 0;
	$: passwordValid = !passwordTouched || $password$.length > 0;
	$: formValid = usernameValid && $username$ && passwordValid && $password$;

	// Actions
	function onLoggedIn(user: App.AuthUser, token: string) {
		// Set authentication state
		setAuthUser(user);
		setIsLoggedIn(true);

		// Show success toast
		toast.success('Welcome back! You have been signed in successfully.');

		// Navigate to home
		goto('/');
	}

	function handleFormSubmit(event: Event, loginFn: (data: any) => void) {
		event.preventDefault();
		if (!formValid) return;

		const loginData = {
			username: $username$,
			password: $password$
		};
		loginFn(loginData);
	}

	function handleInputBlur(field: string) {
		switch (field) {
			case 'username':
				usernameTouched = true;
				break;
			case 'password':
				passwordTouched = true;
				break;
		}
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	// Helper function to get input classes with error state
	function getInputClasses(hasError: boolean) {
		return `${baseInputClasses} ${hasError ? errorInputClasses : ''}`;
	}
</script>

<svelte:head>
	<title>Sign In - Todo Manager</title>
	<meta
		name="description"
		content="Sign in to Todo Manager - Access your tasks and stay organized"
	/>
</svelte:head>

<LoginProvider {onLoggedIn} let:login let:clearError let:errorMessage let:loading>
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
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h1 class="mb-2 text-3xl font-bold text-gray-900">Welcome back</h1>
				<p class="text-gray-600">
					Don't have an account?
					<a
						href="/register"
						class="font-semibold text-blue-600 transition-colors hover:text-blue-700"
					>
						Create one now
					</a>
				</p>
			</div>

			<!-- Main Form Card -->
			<div
				class="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl"
			>
				<form on:submit={(e) => handleFormSubmit(e, login)} class="space-y-6" novalidate>
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
								class={getInputClasses(usernameTouched && !usernameValid)}
								placeholder="Enter your username"
							/>
							{#if usernameTouched && !usernameValid}
								<p class="mt-1 text-sm text-red-600">Username is required</p>
							{/if}
						</div>
					</div>

					<!-- Password Input -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label for="password" class="block text-sm font-semibold text-gray-700">
								Password
							</label>
							<a
								href="/forgot-password"
								class="text-sm text-blue-600 transition-colors hover:text-blue-700"
								tabindex="-1"
							>
								Forgot password?
							</a>
						</div>
						<div class="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								autocomplete="current-password"
								required
								bind:value={$password$}
								on:blur={() => handleInputBlur('password')}
								class={getInputClasses(passwordTouched && !passwordValid)}
								placeholder="Enter your password"
							/>
							<button
								type="button"
								on:click={togglePasswordVisibility}
								class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{#if showPassword}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
										/>
									</svg>
								{:else}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>

						{#if passwordTouched && !passwordValid}
							<p class="mt-1 text-sm text-red-600">Password is required</p>
						{/if}
					</div>

					<!-- Remember Me -->
					<div class="flex items-center justify-between">
						<div class="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								class="h-4 w-4 rounded border-gray-300 text-blue-600 transition-colors focus:ring-blue-500"
							/>
							<label for="remember-me" class="ml-2 block text-sm text-gray-700">
								Remember me
							</label>
						</div>
					</div>

					<!-- Submit Button -->
					<button type="submit" disabled={loading || !formValid} class={primaryButtonClasses}>
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
								Signing you in...
							</div>
						{:else}
							<div class="flex items-center justify-center">
								<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
									/>
								</svg>
								Sign in
							</div>
						{/if}
					</button>
				</form>

				<!-- Divider -->
				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-200"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white/80 px-4 text-gray-500">Or continue with</span>
					</div>
				</div>

				<!-- Social Login -->
				<div class="grid grid-cols-2 gap-4">
					{#each socialProviders as provider}
						<button on:click={provider.handler} class={socialButtonClasses}>
							{@html provider.icon}
							<span class={socialButtonTextClasses}>{provider.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Security Notice -->
			<div class="mt-8 text-center">
				<p class="text-xs leading-relaxed text-gray-500">
					Protected by industry-standard encryption.
					<a href="/security" class="text-blue-600 underline hover:text-blue-700">Learn more</a>
				</p>
			</div>
		</div>
	</div>
</LoginProvider>
