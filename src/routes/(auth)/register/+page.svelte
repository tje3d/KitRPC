<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ConfirmPassword from '$lib/kit/ConfirmPassword.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import Link from '$lib/kit/Link.svelte';
	import PasswordInput from '$lib/kit/PasswordInput.svelte';
	import PasswordStrengthIndicator from '$lib/kit/PasswordStrengthIndicator.svelte';
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
	let showPassword = false;
	let showConfirmPassword = false;

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

	function togglePassword() {
		showPassword = !showPassword;
	}

	function toggleConfirmPassword() {
		showConfirmPassword = !showConfirmPassword;
	}
</script>

<svelte:head>
	<title>Create Account - Todo Manager</title>
	<meta
		name="description"
		content="Join Todo Manager - Create your account to start organizing your tasks efficiently"
	/>
</svelte:head>

<div class="mb-4 text-center">
	<h1 class="mb-2 text-3xl font-bold text-gray-900">Create your account</h1>
	<p class="text-gray-600">
		Already have an account?
		<Link href="/login">Sign in</Link>
	</p>
</div>

<RegisterProvider {onRegistered} let:loading let:errorMessage let:clearError let:register>
	<Card>
		<form on:submit={(e) => handleRegister(e, register)} class="space-y-6" novalidate>
			<!-- Error Display -->
			{#if errorMessage}
				<div in:fade={{ duration: 300 }}>
					<ErrorDisplay message={errorMessage} onDismiss={clearError} />
				</div>
			{/if}

			<!-- Username Input -->
			<FormGroup
				label="Username"
				forAttr="username"
				error="Username is required"
				required
				showError={usernameTouched && !usernameValid}
			>
				<Input
					id="username"
					name="username"
					type="text"
					autocomplete="username"
					bind:value={$username$}
					onBlur={() => handleInputBlur('username')}
					error={usernameTouched && !usernameValid}
					placeholder="Enter your username"
				/>
			</FormGroup>

			<!-- Password Input -->
			<FormGroup
				label="Password"
				forAttr="password"
				error="Password must be at least 6 characters long"
				required
				showError={passwordTouched && !passwordValid}
			>
				<PasswordInput
					id="password"
					name="password"
					autocomplete="new-password"
					bind:value={$password$}
					onBlur={() => handleInputBlur('password')}
					error={passwordTouched && !passwordValid}
					placeholder="Create a strong password"
					{showPassword}
					onToggle={togglePassword}
				/>

				<!-- Password Strength Indicator -->
				{#if $password$}
					<div class="space-y-2" in:fade={{ duration: 200 }}>
						<PasswordStrengthIndicator strength={Math.min(passwordStrength.score, 4)} />
					</div>
				{/if}
			</FormGroup>

			<!-- Confirm Password Input -->
			<FormGroup
				label="Confirm Password"
				forAttr="confirmPassword"
				error="Passwords do not match"
				required
				showError={confirmPasswordTouched && !passwordsMatch}
			>
				<ConfirmPassword
					id="confirmPassword"
					name="confirmPassword"
					autocomplete="new-password"
					bind:value={$confirmPassword$}
					onBlur={() => handleInputBlur('confirmPassword')}
					error={confirmPasswordTouched && !passwordsMatch}
					placeholder="Confirm your password"
					originalPassword={$password$}
					showPassword={showConfirmPassword}
					onToggle={toggleConfirmPassword}
					withinFormGroup={true}
				/>
			</FormGroup>

			<!-- Submit Button -->
			<Button type="submit" {loading} disabled={!formValid} variant="gradient" fullWidth size="lg">
				{#if loading}
					<slot name="loading-text">Creating your account...</slot>
				{:else}
					Create account
				{/if}
			</Button>

			<!-- Terms -->
			<p class="text-center text-xs leading-relaxed text-gray-500">
				By creating an account, you agree to our
				<Link href="/terms" external>Terms of Service</Link>
				and
				<Link href="/privacy" external>Privacy Policy</Link>
			</p>
		</form>
	</Card>
</RegisterProvider>
