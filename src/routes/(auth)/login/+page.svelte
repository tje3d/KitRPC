<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuthUser, setIsLoggedIn } from '$lib/flow/auth.flow';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import {
		Button,
		Card,
		Checkbox,
		Divider,
		ErrorDisplay,
		FormGroup,
		Input,
		Link,
		PasswordInput,
		SocialButton
	} from '$lib/kit';
	import LoginProvider from '$lib/providers/LoginProvider.svelte';
	import { toast } from '$lib/toast/store';

	// Form state
	const username$ = new SvelteSubject<string>('');
	const password$ = new SvelteSubject<string>('');

	// Validation state
	let usernameTouched = false;
	let passwordTouched = false;
	let showPassword = false;
	let rememberMe = false;

	// Social login providers data
	const socialProviders = [
		{
			name: 'Google',
			icon: `<svg class="me-2 h-5 w-5" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>`,
			handler: () => console.log('Google login')
		},
		{
			name: 'Facebook',
			icon: `<svg class="me-2 h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
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
</script>

<svelte:head>
	<title>ورود - مدیر وظایف</title>
	<meta name="description" content="ورود به مدیر وظایف - دسترسی به وظایف خود و سازماندهی" />
</svelte:head>

<div class="mb-4 text-center">
	<h1 class="mb-2 text-3xl font-bold text-gray-900">خوش آمدید</h1>
	<p class="text-gray-600">
		حساب کاربری ندارید؟
		<Link href="/register">اکنون یکی ایجاد کنید</Link>
	</p>
</div>

<LoginProvider {onLoggedIn} let:login let:clearError let:errorMessage let:loading>
	<!-- Main Form Card -->
	<Card>
		<form on:submit={(e) => handleFormSubmit(e, login)} class="space-y-6" novalidate>
			<!-- Error Display -->
			{#if errorMessage}
				<ErrorDisplay message={errorMessage} onDismiss={clearError} />
			{/if}

			<!-- Username Input -->
			<FormGroup
				label="نام کاربری"
				forAttr="username"
				error="نام کاربری الزامی است"
				showError={usernameTouched && !usernameValid}
				required
			>
				<Input
					id="username"
					name="username"
					type="text"
					autocomplete="username"
					bind:value={$username$}
					onBlur={() => handleInputBlur('username')}
					error={usernameTouched && !usernameValid}
					placeholder="نام کاربری خود را وارد کنید"
				/>
			</FormGroup>

			<!-- Password Input -->
			<FormGroup
				label="رمز عبور"
				forAttr="password"
				error="رمز عبور الزامی است"
				showError={passwordTouched && !passwordValid}
				required
			>
				<Link href="/forgot-password" slot="actions" className="text-xs"
					>رمز عبور را فراموش کرده‌اید؟</Link
				>

				<PasswordInput
					id="password"
					name="password"
					autocomplete="current-password"
					bind:value={$password$}
					onBlur={() => handleInputBlur('password')}
					error={passwordTouched && !passwordValid}
					placeholder="رمز عبور خود را وارد کنید"
					{showPassword}
					onToggle={togglePasswordVisibility}
				/>
			</FormGroup>

			<!-- Remember Me -->
			<div class="flex items-center justify-between">
				<Checkbox
					id="remember-me"
					name="remember-me"
					checked={rememberMe}
					label="مرا به خاطر بسپار"
					onChange={() => (rememberMe = !rememberMe)}
				/>
			</div>

			<!-- Submit Button -->
			<Button
				type="submit"
				disabled={loading || !formValid}
				{loading}
				fullWidth
				size="lg"
				variant="gradient"
			>
				{#if loading}
					<slot name="loading-text">در حال ورود...</slot>
				{:else}
					<div class="flex items-center justify-center">
						<svg class="me-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
						ورود
					</div>
				{/if}
			</Button>
		</form>

		<Divider text="یا ادامه با" />

		<!-- Social Login -->
		<div class="grid grid-cols-2 gap-4">
			{#each socialProviders as provider}
				<SocialButton provider={provider.name} icon={provider.icon} onClick={provider.handler} />
			{/each}
		</div>
	</Card>
</LoginProvider>
