<script lang="ts">
	import { authUser } from '$lib/flow/auth.flow';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import PasswordInput from '$lib/kit/PasswordInput.svelte';
	import PasswordStrengthIndicator from '$lib/kit/PasswordStrengthIndicator.svelte';
	import SuccessDisplay from '$lib/kit/SuccessDisplay.svelte';
	import { onMount } from 'svelte';
	import ChangeOwnPasswordProvider from '$lib/providers/ChangeOwnPasswordProvider.svelte';

	// Form state
	let currentPassword = '';
	let newPassword = '';
	let confirmNewPassword = '';
	let showCurrentPassword = false;
	let showNewPassword = false;
	let showConfirmPassword = false;

	// Validation state
	let currentPasswordError = '';
	let newPasswordError = '';
	let confirmNewPasswordError = '';
	let formError = '';
	let formSuccess = '';
	let isSubmitting = false;

	// Password strength (0-5)
	$: passwordStrength = calculatePasswordStrength(newPassword).score;

	import { calculatePasswordStrength } from '$lib/helpers/password.helper';

	// Validate form
	function validateForm(): boolean {
		let isValid = true;
		currentPasswordError = '';
		newPasswordError = '';
		confirmNewPasswordError = '';
		formError = '';

		// Current password validation
		if (!currentPassword) {
			currentPasswordError = 'Current password is required';
			isValid = false;
		}

		// New password validation
		if (!newPassword) {
			newPasswordError = 'New password is required';
			isValid = false;
		} else if (newPassword.length < 6) {
			newPasswordError = 'Password must be at least 6 characters';
			isValid = false;
		} else if (passwordStrength < 2) {
			newPasswordError = 'Password is too weak';
			isValid = false;
		}

		// Confirm password validation
		if (!confirmNewPassword) {
			confirmNewPasswordError = 'Please confirm your new password';
			isValid = false;
		} else if (newPassword !== confirmNewPassword) {
			confirmNewPasswordError = 'Passwords do not match';
			isValid = false;
		}

		return isValid;
	}

	// Handle form submission
	function handleSubmit(
		changeOwnPassword: (input: { currentPassword: string; newPassword: string }) => void
	) {
		if (!validateForm()) return;

		isSubmitting = true;
		formSuccess = '';
		formError = '';

		changeOwnPassword({
			currentPassword,
			newPassword
		});
	}

	// Reset form
	function resetForm() {
		currentPassword = '';
		newPassword = '';
		confirmNewPassword = '';
		currentPasswordError = '';
		newPasswordError = '';
		confirmNewPasswordError = '';
		formError = '';
		formSuccess = '';
		isSubmitting = false;
	}

	// Toggle password visibility
	function togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
		if (field === 'current') {
			showCurrentPassword = !showCurrentPassword;
		} else if (field === 'new') {
			showNewPassword = !showNewPassword;
		} else if (field === 'confirm') {
			showConfirmPassword = !showConfirmPassword;
		}
	}
</script>

<PanelPageWrapper title="User Profile" description="View your account information.">
	<div class="space-y-6">
		<Card variant="flat">
			<h2 class="text-lg font-bold text-gray-800">Profile Information</h2>
			<p class="mt-1 text-sm text-gray-600">Your account details are displayed below.</p>

			<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
				<FormGroup label="Username" forAttr="username">
					<Input
						id="username"
						name="username"
						value={$authUser?.username || ''}
						disabled
						placeholder="Your username"
					/>
				</FormGroup>

				<FormGroup label="Email" forAttr="email">
					<Input
						id="email"
						name="email"
						type="email"
						value={$authUser?.email || ''}
						disabled
						placeholder="Your email address"
					/>
				</FormGroup>
			</div>
		</Card>

		<Card variant="flat">
			<h2 class="text-lg font-bold text-gray-800">Change Password</h2>
			<p class="mt-1 text-sm text-gray-600">Update your account password.</p>

			<ChangeOwnPasswordProvider
				onSuccess={(data: { success: boolean; message: string }) => {
					isSubmitting = false;
					formSuccess = data.message || 'Password changed successfully';
					resetForm();
				}}
				onError={(error: string) => {
					isSubmitting = false;
					formError = error;
				}}
			>
				{#snippet children({
					changeOwnPassword,
					loading,
					errorMessage,
					clearError
				}: {
					changeOwnPassword: (input: { currentPassword: string; newPassword: string }) => void;
					loading: boolean;
					errorMessage: string | null;
					clearError: () => void;
				})}
					{#if formSuccess}
						<SuccessDisplay message={formSuccess} className="mb-4" />
					{/if}

					{#if formError}
						<ErrorDisplay message={formError} className="mb-4" />
					{/if}

					<form
						on:submit|preventDefault={() => handleSubmit(changeOwnPassword)}
						class="mt-6 space-y-6"
					>
						<FormGroup
							label="Current Password"
							forAttr="current-password"
							error={currentPasswordError}
						>
							<PasswordInput
								id="current-password"
								name="currentPassword"
								bind:value={currentPassword}
								placeholder="Enter your current password"
								error={!!currentPasswordError}
								bind:showPassword={showCurrentPassword}
								onToggle={() => togglePasswordVisibility('current')}
							/>
						</FormGroup>

						<FormGroup label="New Password" forAttr="new-password" error={newPasswordError}>
							<PasswordInput
								id="new-password"
								name="newPassword"
								bind:value={newPassword}
								placeholder="Enter your new password"
								error={!!newPasswordError}
								bind:showPassword={showNewPassword}
								onToggle={() => togglePasswordVisibility('new')}
							/>
							<PasswordStrengthIndicator strength={passwordStrength} className="mt-2" />
						</FormGroup>

						<FormGroup
							label="Confirm New Password"
							forAttr="confirm-password"
							error={confirmNewPasswordError}
						>
							<PasswordInput
								id="confirm-password"
								name="confirmNewPassword"
								bind:value={confirmNewPassword}
								placeholder="Confirm your new password"
								error={!!confirmNewPasswordError}
								bind:showPassword={showConfirmPassword}
								onToggle={() => togglePasswordVisibility('confirm')}
							/>
						</FormGroup>

						<div class="flex justify-end pt-4">
							<Button
								type="submit"
								variant="primary"
								loading={loading || isSubmitting}
								disabled={loading || isSubmitting}
							>
								Change Password
							</Button>
						</div>
					</form>
				{/snippet}
			</ChangeOwnPasswordProvider>
		</Card>
	</div>
</PanelPageWrapper>
