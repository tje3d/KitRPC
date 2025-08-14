<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PasswordInput from '$lib/kit/PasswordInput.svelte';
	import Select from '$lib/kit/Select.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import CreateUserProvider from '$lib/providers/CreateUserProvider.svelte';
	import ListRolesProvider from '$lib/providers/ListRolesProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import { fade } from 'svelte/transition';

	// Form state
	const username$ = new SvelteSubject<string>('');
	const email$ = new SvelteSubject<string>('');
	const password$ = new SvelteSubject<string>('');
	const selectedRoleId$ = new SvelteSubject<string>('');

	// Validation state
	let usernameTouched = false;
	let emailTouched = false;
	let passwordTouched = false;
	let roleTouched = false;
	let showPassword = false;

	// Computed validation
	$: usernameValid = !usernameTouched || ($username$.length >= 1 && $username$.length <= 50);
	$: emailValid = !emailTouched || !$email$ || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($email$);
	$: passwordValid = !passwordTouched || $password$.length >= 6;
	$: roleValid = !roleTouched || !!$selectedRoleId$;
	$: formValid =
		usernameValid &&
		emailValid &&
		passwordValid &&
		roleValid &&
		$username$ &&
		$password$ &&
		$selectedRoleId$;

	// Actions
	function handleCreateUser(e: SubmitEvent, createUser: Function) {
		e.preventDefault();
		if (!formValid) return;

		// Build userData object properly
		const userData: { username: string; password: string; roleId: string; email?: string } = {
			username: $username$,
			password: $password$,
			roleId: $selectedRoleId$
		};

		// Add email only if provided
		if ($email$) {
			userData.email = $email$;
		}

		createUser(userData);
	}

	function onUserCreated() {
		// Show success toast
		toast.success('User created successfully!');

		// Navigate back to users list
		goto('/panel/admin/users');
	}

	function handleInputBlur(field: string) {
		switch (field) {
			case 'username':
				usernameTouched = true;
				break;
			case 'email':
				emailTouched = true;
				break;
			case 'password':
				passwordTouched = true;
				break;
			case 'role':
				roleTouched = true;
				break;
		}
	}

	function togglePassword() {
		showPassword = !showPassword;
	}

	function handleRoleChange(value: string | string[]) {
		// Handle single selection (string) or multiple selection (string[])
		const roleId = Array.isArray(value) ? value[0] || '' : value;
		selectedRoleId$.next(roleId);
		handleInputBlur('role');
	}
</script>

<PanelPageWrapper title="Create User" description="Add a new user to the system">
	<div slot="actions">
		<Button href="/panel/admin/users" variant="secondary">
			<span class="icon-[heroicons--arrow-left] me-2 h-4 w-4"></span>
			Back to Users
		</Button>
	</div>

	<Card variant="flat">
		<CreateUserProvider
			onSuccess={onUserCreated}
			let:loading
			let:errorMessage
			let:clearError
			let:createUser
		>
			<ListRolesProvider
				let:roles
				let:loading={rolesLoading}
				let:errorMessage={rolesError}
				let:listRoles
				requestOnSubscribe={true}
			>
				{#if rolesError}
					<div class="mb-6" in:fade={{ duration: 300 }}>
						<ErrorDisplay message={rolesError} />
					</div>
				{/if}

				<form on:submit={(e) => handleCreateUser(e, createUser)} class="space-y-6" novalidate>
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
						error="Username is required (1-50 characters)"
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
							placeholder="Enter username"
						/>
					</FormGroup>

					<!-- Email Input -->
					<FormGroup
						label="Email (Optional)"
						forAttr="email"
						error="Please enter a valid email address"
						showError={emailTouched && !emailValid}
					>
						<Input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							bind:value={$email$}
							onBlur={() => handleInputBlur('email')}
							error={emailTouched && !emailValid}
							placeholder="Enter email address"
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
					</FormGroup>

					<!-- Role Selection -->
					<FormGroup
						label="Role"
						forAttr="role"
						error="Please select a role"
						required
						showError={roleTouched && !roleValid}
					>
						<Select
							id="role"
							name="role"
							value={$selectedRoleId$}
							error={roleTouched && !roleValid}
							placeholder="Select a role"
							options={roles?.map((role) => ({ value: role.id, label: role.name })) || []}
							onChange={handleRoleChange}
							disabled={rolesLoading}
						/>
						{#if rolesLoading}
							<div class="mt-2 flex items-center text-sm text-gray-500">
								<span class="icon-[svg-spinners--ring-resize] me-2 h-4 w-4"></span>
								Loading roles...
							</div>
						{/if}
					</FormGroup>

					<!-- Submit Button -->
					<div class="flex justify-end space-x-3">
						<Button href="/panel/admin/users" variant="secondary">Cancel</Button>
						<Button type="submit" {loading} disabled={!formValid} variant="primary">
							{#if loading}
								<slot name="loading-text">Creating user...</slot>
							{:else}
								Create User
							{/if}
						</Button>
					</div>
				</form>

				{#if !rolesLoading && !rolesError && roles && roles.length === 0}
					<div class="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
						<div class="flex items-center">
							<span class="icon-[heroicons--exclamation-triangle] me-2 h-5 w-5 text-yellow-500"
							></span>
							<span class="text-yellow-700"
								>No roles found. Please create roles before adding users.</span
							>
						</div>
						<div class="mt-3">
							<Button href="/panel/admin/roles/create" variant="secondary" size="sm">
								Create Role
							</Button>
						</div>
					</div>
				{/if}
			</ListRolesProvider>
		</CreateUserProvider>
	</Card>
</PanelPageWrapper>
