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
	import { fade } from 'svelte/transition';

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

	import { calculatePasswordStrength } from '$lib/helpers/password.helper';

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
		toast.success('حساب کاربری با موفقیت ایجاد شد! خوش آمدید به TaskFlow.');

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
	<title>ثبت نام</title>
</svelte:head>

<div class="mb-4 text-center">
	<h1 class="mb-2 text-3xl font-bold text-gray-900">ایجاد حساب کاربری</h1>
	<p class="text-gray-600">
		قبلاً حساب کاربری داشته‌اید؟
		<Link href="/login">ورود</Link>
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
				label="نام کاربری"
				forAttr="username"
				error="نام کاربری الزامی است"
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
					placeholder="نام کاربری خود را وارد کنید"
				/>
			</FormGroup>

			<!-- Password Input -->
			<FormGroup
				label="رمز عبور"
				forAttr="password"
				error="رمز عبور باید حداقل ۶ کاراکتر باشد"
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
					placeholder="رمز عبور قوی‌ای ایجاد کنید"
					{showPassword}
					onToggle={togglePassword}
				/>

				<!-- Password Strength Indicator -->
				{#if $password$}
					<div class="space-y-2" in:fade={{ duration: 200 }}>
						<PasswordStrengthIndicator strength={passwordStrength.score} />
					</div>
				{/if}
			</FormGroup>

			<!-- Confirm Password Input -->
			<FormGroup
				label="تأیید رمز عبور"
				forAttr="confirmPassword"
				error="رمزهای عبور مطابقت ندارند"
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
					placeholder="رمز عبور خود را تأیید کنید"
					originalPassword={$password$}
					showPassword={showConfirmPassword}
					onToggle={toggleConfirmPassword}
					withinFormGroup={true}
				/>
			</FormGroup>

			<!-- Submit Button -->
			<Button type="submit" {loading} disabled={!formValid} variant="gradient" fullWidth size="lg">
				{#if loading}
					<slot name="loading-text">در حال ایجاد حساب کاربری...</slot>
				{:else}
					ایجاد حساب کاربری
				{/if}
			</Button>

			<!-- Terms -->
			<p class="text-center text-xs leading-relaxed text-gray-500">
				با ایجاد حساب کاربری، با
				<Link href="/terms" external>شرایط خدمات</Link>
				و
				<Link href="/privacy" external>سیاست حفظ حریم خصوصی</Link>
				ما موافقت می‌کنید
			</p>
		</form>
	</Card>
</RegisterProvider>
