<script lang="ts">
	import { goto } from '$app/navigation';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import Checkbox from '$lib/kit/Checkbox.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import AssignPermissionToRoleProvider from '$lib/providers/AssignPermissionToRoleProvider.svelte';
	import CreateRoleProvider from '$lib/providers/CreateRoleProvider.svelte';
	import ListPermissionsProvider from '$lib/providers/ListPermissionsProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { fade } from 'svelte/transition';

	// Form state
	const name$ = new SvelteSubject<string>('');
	const description$ = new SvelteSubject<string>('');

	// Permission selection state
	let selectedPermissions = $state<string[]>([]);
	let createdRoleId = $state<string | null>(null);
	let isAssigningPermissions = $state(false);
	let permissionAssignmentError = $state<string | null>(null);
	let currentPermissionIndex = $state(0);
	let permissionChanges: string[] = [];

	// Validation state
	let nameTouched = false;
	let descriptionTouched = false;

	// Computed validation
	const nameValid = $derived(!nameTouched || ($name$.length >= 1 && $name$.length <= 50));
	const descriptionValid = $derived(!descriptionTouched || $description$.length <= 255);
	const formValid = $derived(nameValid && descriptionValid && $name$);

	function onRoleCreated(role: any) {
		// Store the created role ID
		createdRoleId = role.id;
		permissionChanges = [...selectedPermissions];

		// If permissions are selected, assign them to the role
		if (selectedPermissions.length > 0) {
			isAssigningPermissions = true;
			permissionAssignmentError = null;
			currentPermissionIndex = 0;
		} else {
			// No permissions to assign, show success and navigate
			toast.success('نقش با موفقیت ایجاد شد!');
			goto('/panel/admin/roles');
		}
	}

	// This function will be called when a permission is successfully assigned
	function onPermissionAssigned() {
		if (!isAssigningPermissions || !createdRoleId) return;

		// Move to the next permission
		currentPermissionIndex++;

		// Check if we've assigned all permissions
		if (currentPermissionIndex >= permissionChanges.length) {
			// All permissions assigned
			isAssigningPermissions = false;
			toast.success('نقش ایجاد شد و مجوزها با موفقیت تخصیص داده شدند!');
			goto('/panel/admin/roles');
		}
	}

	function handleInputBlur(field: string) {
		switch (field) {
			case 'name':
				nameTouched = true;
				break;
			case 'description':
				descriptionTouched = true;
				break;
		}
	}

	function handlePermissionChange(permissionId: string, checked: boolean) {
		if (checked) {
			// Add to selected permissions if not already there
			if (!selectedPermissions.includes(permissionId)) {
				selectedPermissions = [...selectedPermissions, permissionId];
			}
		} else {
			// Remove from selected permissions
			selectedPermissions = selectedPermissions.filter((id) => id !== permissionId);
		}
	}

	function isPermissionSelected(permissionId: string) {
		return selectedPermissions.includes(permissionId);
	}
</script>

<PanelPageWrapper title="ایجاد نقش" description="افزودن نقش جدید به سیستم">
	<div slot="actions">
		<Button href="/panel/admin/roles" variant="secondary">
			<span class="icon-[heroicons--arrow-left] me-2 h-4 w-4"></span>
			بازگشت به نقش‌ها
		</Button>
	</div>

	<Card variant="flat">
		<CreateRoleProvider
			onSuccess={onRoleCreated}
			onError={(error) => {
				toast.error(error || 'خطا در ایجاد نقش');
			}}
			let:loading
			let:errorMessage
			let:clearError
			let:createRole
		>
			<ListPermissionsProvider
				let:permissions
				let:loading={permissionsLoading}
				let:errorMessage={permissionsError}
			>
				<AssignPermissionToRoleProvider
					onSuccess={() => {
						// Permission assigned successfully
						// This will be called after each permission assignment
						onPermissionAssigned();
					}}
					onError={(error) => {
						isAssigningPermissions = false;
						permissionAssignmentError = error;
						toast.error('خطا در تخصیص برخی مجوزها به نقش');
					}}
					let:loading={assignPermissionLoading}
					let:errorMessage={assignPermissionError}
					let:clearError={clearAssignPermissionError}
					let:assignPermissionToRole
				>
					{#if isAssigningPermissions}
						<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
							<div class="flex items-center">
								<span class="icon-[svg-spinners--ring-resize] me-2 h-5 w-5 text-blue-500"></span>
								<span class="text-blue-700">در حال تخصیص مجوزها به نقش...</span>
							</div>
							{#if isAssigningPermissions && createdRoleId && currentPermissionIndex < permissionChanges.length}
								{assignPermissionToRole({
									roleId: createdRoleId,
									permissionId: permissionChanges[currentPermissionIndex]
								})}
							{/if}
						</div>
					{/if}

					{#if permissionAssignmentError}
						<div class="mb-6" in:fade={{ duration: 300 }}>
							<ErrorDisplay
								message={permissionAssignmentError}
								onDismiss={() => (permissionAssignmentError = null)}
							/>
						</div>
					{/if}

					<form
						on:submit|preventDefault={() => {
							if (!formValid) return;

							// Build roleData object
							const roleData = {
								name: $name$,
								description: $description$ || undefined
							};

							createRole(roleData);
						}}
						class="space-y-6"
						novalidate
					>
						<!-- Error Display -->
						{#if errorMessage}
							<div in:fade={{ duration: 300 }}>
								<ErrorDisplay message={errorMessage} onDismiss={clearError} />
							</div>
						{/if}

						{#if permissionsError}
							<div class="mb-6" in:fade={{ duration: 300 }}>
								<ErrorDisplay message={permissionsError} />
							</div>
						{/if}

						<!-- Name Input -->
						<FormGroup
							label="نام نقش"
							forAttr="name"
							error="نام الزامی است (۱-۵۰ کاراکتر)"
							required
							showError={nameTouched && !nameValid}
						>
							<Input
								id="name"
								name="name"
								type="text"
								bind:value={$name$}
								onBlur={() => handleInputBlur('name')}
								error={nameTouched && !nameValid}
								placeholder="نام نقش را وارد کنید"
							/>
						</FormGroup>

						<!-- Description Input -->
						<FormGroup
							label="توضیحات (اختیاری)"
							forAttr="description"
							error="توضیحات باید کمتر از ۲۵۵ کاراکتر باشد"
							showError={descriptionTouched && !descriptionValid}
						>
							<Input
								id="description"
								name="description"
								type="text"
								bind:value={$description$}
								onBlur={() => handleInputBlur('description')}
								error={descriptionTouched && !descriptionValid}
								placeholder="توضیحات نقش را وارد کنید"
							/>
						</FormGroup>

						<!-- Permissions Selection -->
						<FormGroup label="مجوزها (اختیاری)" forAttr="permissions">
							{#if permissionsLoading}
								<div class="flex items-center justify-center py-4">
									<span class="icon-[svg-spinners--ring-resize] me-2 h-5 w-5 text-blue-500"></span>
									<span class="text-gray-500">در حال بارگذاری مجوزها...</span>
								</div>
							{:else if permissions && permissions.length > 0}
								<div
									class="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3"
								>
									{#each permissions as permission (permission.id)}
										<Checkbox
											id={`permission-${permission.id}`}
											name={`permission-${permission.id}`}
											checked={isPermissionSelected(permission.id)}
											onChange={(checked) => handlePermissionChange(permission.id, checked)}
											label={`${permission.name} (${permission.resource}:${permission.action})`}
											className="py-1"
										/>
									{/each}
								</div>
								<div class="mt-2 text-sm text-gray-500">
									{selectedPermissions.length} مجوز انتخاب شده
								</div>
							{:else}
								<div class="py-4 text-center text-gray-500">
									{#if permissionsError}
										خطا در بارگذاری مجوزها
									{:else}
										مجوزی در دسترس نیست
									{/if}
								</div>
							{/if}
						</FormGroup>

						<!-- Submit Button -->
						<div class="flex justify-end space-x-3">
							<Button href="/panel/admin/roles" variant="secondary">لغو</Button>
							<Button
								type="submit"
								{loading}
								disabled={!formValid || isAssigningPermissions}
								variant="primary"
							>
								{#if loading || isAssigningPermissions}
									{#if loading}
										در حال ایجاد نقش...
									{:else}
										در حال تخصیص مجوزها...
									{/if}
								{:else}
									ایجاد نقش
								{/if}
							</Button>
						</div>
					</form>
				</AssignPermissionToRoleProvider>
			</ListPermissionsProvider>
		</CreateRoleProvider>
	</Card>
</PanelPageWrapper>
