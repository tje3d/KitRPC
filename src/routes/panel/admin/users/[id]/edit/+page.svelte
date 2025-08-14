<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import { calculatePasswordStrength } from '$lib/helpers/password.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import SuccessDisplay from '$lib/kit/SuccessDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import PasswordInput from '$lib/kit/PasswordInput.svelte';
	import PasswordStrengthIndicator from '$lib/kit/PasswordStrengthIndicator.svelte';
	import Select from '$lib/kit/Select.svelte';
	import ChangePasswordProvider from '$lib/providers/ChangePasswordProvider.svelte';
	import GetUserByIdProvider from '$lib/providers/GetUserByIdProvider.svelte';
	import ListRolesProvider from '$lib/providers/ListRolesProvider.svelte';
	import UpdateUserProvider from '$lib/providers/UpdateUserProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Get user ID from URL params
	const userId = $page.params.id;

	// Provider references
	let getUserByIdProvider: GetUserByIdProvider;
	let changePasswordProvider: ChangePasswordProvider;

	// Form state
	const username$ = new SvelteSubject<string>('');
	const email$ = new SvelteSubject<string>('');
	const selectedRoleId$ = new SvelteSubject<string>('');

	// Password change state
	const newPassword$ = new SvelteSubject<string>('');
	const confirmNewPassword$ = new SvelteSubject<string>('');

	// Password visibility state
	let showNewPassword: boolean = false;
	let showConfirmPassword: boolean = false;

	// Validation state
	let usernameTouched = false;
	let emailTouched = false;
	let roleTouched = false;
	let newPasswordTouched = false;
	let confirmNewPasswordTouched = false;

	// Password change success state
	let passwordChangeSuccess: boolean = false;

	// Dismiss password change success message
	function dismissPasswordChangeSuccess() {
		passwordChangeSuccess = false;
	}

	// Computed validation
	$: usernameValid = !usernameTouched || ($username$.length >= 1 && $username$.length <= 50);
	$: emailValid = !emailTouched || !$email$ || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($email$);
	$: roleValid = !roleTouched || !!$selectedRoleId$;

	// Password validation
	$: newPasswordValid = !newPasswordTouched || $newPassword$.length >= 6;
	$: confirmNewPasswordValid = !confirmNewPasswordTouched || $newPassword$ === $confirmNewPassword$;
	$: passwordsMatch = $newPassword$ === $confirmNewPassword$;

	// Overall form validation
	$: formValid = usernameValid && emailValid && roleValid && $username$ && $selectedRoleId$;
	$: passwordFormValid = newPasswordValid && confirmNewPasswordValid && passwordsMatch;

	// Password strength calculation (0-5 scale)
	$: passwordStrength = calculatePasswordStrength($newPassword$).score;

	// Load user data on component mount
	onMount(() => {
		if (getUserByIdProvider) {
			getUserByIdProvider.getUserById({ id: userId });
		}
	});

	// Actions
	function handleUpdateUser(e: SubmitEvent, updateUser: Function) {
		e.preventDefault();
		if (!formValid) return;

		// Build userData object properly
		const userData = {
			id: userId,
			data: {
				username: $username$,
				roleId: $selectedRoleId$,
				email: $email$ || undefined
			}
		};

		updateUser(userData);
	}

	function onUserUpdated() {
		// Show success toast
		toast.success('User updated successfully!');

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
			case 'role':
				roleTouched = true;
				break;
		}
	}

	function handleRoleChange(value: string | string[]) {
		// Handle single selection (string) or multiple selection (string[])
		const roleId = Array.isArray(value) ? value[0] || '' : value;
		selectedRoleId$.next(roleId);
		handleInputBlur('role');
	}

	function onUserLoaded(user: any) {
		// Populate form with user data
		username$.next(user.username || '');
		email$.next(user.email || '');
		selectedRoleId$.next(user.roleId || '');
	}

	// Password visibility toggle functions
	function toggleNewPasswordVisibility() {
		showNewPassword = !showNewPassword;
	}

	function toggleConfirmPasswordVisibility() {
		showConfirmPassword = !showConfirmPassword;
	}

	// Password input blur handlers
	function handlePasswordBlur(field: string) {
		switch (field) {
			case 'newPassword':
				newPasswordTouched = true;
				break;
			case 'confirmNewPassword':
				confirmNewPasswordTouched = true;
				break;
		}
	}

	// Handle password change
	function handleChangePassword(changePassword: Function) {
		// Mark all password fields as touched for validation
		newPasswordTouched = true;
		confirmNewPasswordTouched = true;

		if (!passwordFormValid) return;

		// Call change password function
		changePassword({
			userId: userId,
			newPassword: $newPassword$
		});
	}

	// Handle password change success
	function onPasswordChanged() {
		// Show success message
		passwordChangeSuccess = true;

		// Clear password fields
		newPassword$.next('');
		confirmNewPassword$.next('');

		// Reset touched states
		newPasswordTouched = false;
		confirmNewPasswordTouched = false;

		// Show success toast
		toast.success('Password changed successfully!');
	}
</script>

<PanelPageWrapper title="Edit User" description="Update user information">
	<div slot="actions">
		<Button href="/panel/admin/users" variant="secondary">
			<span class="icon-[heroicons--arrow-left] me-2 h-4 w-4"></span>
			Back to Users
		</Button>
	</div>

	<Card variant="flat">
		<GetUserByIdProvider
			bind:this={getUserByIdProvider}
			onSuccess={onUserLoaded}
			let:loading={userLoading}
			let:errorMessage={userError}
			let:clearError
			let:getUserById
		>
			{#if userLoading}
				<div class="p-8 text-center">
					<span class="icon-[svg-spinners--ring-resize] me-3 h-8 w-8 text-blue-500"></span>
					Loading user...
				</div>
			{:else if userError}
				<div class="mb-6" in:fade={{ duration: 300 }}>
					<ErrorDisplay message={userError} />
				</div>
			{:else}
				<UpdateUserProvider
					onSuccess={onUserUpdated}
					let:loading={updateLoading}
					let:errorMessage={updateError}
					let:clearError={clearUpdateError}
					let:updateUser
				>
					<ChangePasswordProvider
						bind:this={changePasswordProvider}
						onSuccess={onPasswordChanged}
						let:loading={passwordLoading}
						let:errorMessage={passwordError}
						let:clearError={clearPasswordError}
						let:changePassword
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

							<form on:submit={(e) => handleUpdateUser(e, updateUser)} class="space-y-6" novalidate>
								<!-- Error Display -->
								{#if updateError}
									<div in:fade={{ duration: 300 }}>
										<ErrorDisplay message={updateError} onDismiss={clearUpdateError} />
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

								<!-- Password Change Section -->
								<div class="rounded-lg border border-gray-200 p-6">
									<h3 class="mb-4 text-lg font-medium text-gray-900">Change Password</h3>

									<!-- Password Change Success Message -->
									{#if passwordChangeSuccess}
										<div class="mb-4">
											<SuccessDisplay
												message="Password changed successfully!"
												onDismiss={dismissPasswordChangeSuccess}
											/>
										</div>
									{/if}

									<!-- Password Change Error Message -->
									{#if passwordError}
										<div in:fade={{ duration: 300 }} class="mb-4">
											<ErrorDisplay message={passwordError} onDismiss={clearPasswordError} />
										</div>
									{/if}

									<div class="space-y-6">
										<!-- New Password -->
										<FormGroup
											label="New Password"
											forAttr="newPassword"
											error="Password must be at least 6 characters"
											required
											showError={newPasswordTouched && !newPasswordValid}
										>
											<PasswordInput
												id="newPassword"
												name="newPassword"
												bind:value={$newPassword$}
												onBlur={() => handlePasswordBlur('newPassword')}
												error={newPasswordTouched && !newPasswordValid}
												placeholder="Enter new password"
												showPassword={showNewPassword}
												onToggle={toggleNewPasswordVisibility}
												autocomplete="new-password"
											/>
											{#if $newPassword$}
												<div class="mt-2">
													<PasswordStrengthIndicator strength={passwordStrength} />
												</div>
											{/if}
										</FormGroup>

										<!-- Confirm New Password -->
										<FormGroup
											label="Confirm New Password"
											forAttr="confirmNewPassword"
											error={passwordsMatch ? '' : 'Passwords do not match'}
											required
											showError={confirmNewPasswordTouched && !confirmNewPasswordValid}
										>
											<PasswordInput
												id="confirmNewPassword"
												name="confirmNewPassword"
												bind:value={$confirmNewPassword$}
												onBlur={() => handlePasswordBlur('confirmNewPassword')}
												error={confirmNewPasswordTouched && !confirmNewPasswordValid}
												placeholder="Confirm new password"
												showPassword={showConfirmPassword}
												onToggle={toggleConfirmPasswordVisibility}
												autocomplete="new-password"
											/>
										</FormGroup>
									</div>

									<!-- Change Password Button -->
									<div class="mt-6">
										<Button
											onClick={() => handleChangePassword(changePassword)}
											loading={passwordLoading}
											disabled={!passwordFormValid || !$newPassword$ || !$confirmNewPassword$}
											variant="secondary"
										>
											{#if !passwordLoading}
												Change Password
											{/if}
										</Button>
									</div>
								</div>

								<!-- Submit Button -->
								<div class="flex justify-end space-x-3">
									<Button href="/panel/admin/users" variant="secondary">Cancel</Button>
									<Button
										type="submit"
										loading={updateLoading}
										disabled={!formValid}
										variant="primary"
									>
										{#if !updateLoading}
											Update User
										{/if}
									</Button>
								</div>
							</form>

							{#if !rolesLoading && !rolesError && roles && roles.length === 0}
								<div class="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
									<div class="flex items-center">
										<span
											class="icon-[heroicons--exclamation-triangle] me-2 h-5 w-5 text-yellow-500"
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
					</ChangePasswordProvider>
				</UpdateUserProvider>
			{/if}
		</GetUserByIdProvider>
	</Card>
</PanelPageWrapper>
