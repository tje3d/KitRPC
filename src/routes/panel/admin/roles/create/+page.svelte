<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import Checkbox from '$lib/kit/Checkbox.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import CreateRoleProvider from '$lib/providers/CreateRoleProvider.svelte';
	import ListPermissionsProvider from '$lib/providers/ListPermissionsProvider.svelte';
	import AssignPermissionToRoleProvider from '$lib/providers/AssignPermissionToRoleProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Form state
	const name$ = new SvelteSubject<string>('');
	const description$ = new SvelteSubject<string>('');

	// Permission selection state
	let selectedPermissions = $state<string[]>([]);
	let createdRoleId = $state<string | null>(null);
	let isAssigningPermissions = $state(false);
	let permissionAssignmentError = $state<string | null>(null);
	let currentPermissionIndex = $state(0);

	// Validation state
	let nameTouched = false;
	let descriptionTouched = false;

	// Computed validation
	const nameValid = $derived(!nameTouched || ($name$.length >= 1 && $name$.length <= 50));
	const descriptionValid = $derived(!descriptionTouched || $description$.length <= 255);
	const formValid = $derived(nameValid && descriptionValid && $name$);

	// Provider references
	let listPermissionsProvider: ListPermissionsProvider;
	let assignPermissionToRoleProvider: AssignPermissionToRoleProvider;

	// Load permissions on component mount
	onMount(() => {
		if (listPermissionsProvider) {
			listPermissionsProvider.listPermissions({ page: 1, limit: 100 });
		}
	});

	// Actions
	function handleCreateRole(e: SubmitEvent, createRole: Function) {
		e.preventDefault();
		if (!formValid) return;

		// Build roleData object
		const roleData = {
			name: $name$,
			description: $description$ || undefined
		};

		createRole(roleData);
	}

	function onRoleCreated(role: any) {
		// Store the created role ID
		createdRoleId = role.id;

		// If permissions are selected, assign them to the role
		if (selectedPermissions.length > 0) {
			assignPermissionsToRole(role.id);
		} else {
			// No permissions to assign, show success and navigate
			toast.success('Role created successfully!');
			goto('/panel/admin/roles');
		}
	}

	function assignPermissionsToRole(roleId: string) {
		if (selectedPermissions.length === 0) return;

		createdRoleId = roleId;
		isAssigningPermissions = true;
		permissionAssignmentError = null;
		currentPermissionIndex = 0;

		// Assign the first permission
		assignNextPermission();
	}

	function assignNextPermission() {
		// Check if we've assigned all permissions
		if (!createdRoleId || currentPermissionIndex >= selectedPermissions.length) {
			// All permissions assigned
			isAssigningPermissions = false;
			toast.success('Role created and permissions assigned successfully!');
			goto('/panel/admin/roles');
			return;
		}

		// Assign the next permission
		const permissionId = selectedPermissions[currentPermissionIndex];
		if (assignPermissionToRoleProvider) {
			assignPermissionToRoleProvider.assignPermissionToRole({
				roleId: createdRoleId,
				permissionId
			});
		}
	}

	// This function will be called when a permission is successfully assigned
	function onPermissionAssigned() {
		if (!isAssigningPermissions || !createdRoleId) return;

		// Move to the next permission
		currentPermissionIndex++;
		assignNextPermission();
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

<PanelPageWrapper title="Create Role" description="Add a new role to the system">
	<div slot="actions">
		<Button href="/panel/admin/roles" variant="secondary">
			<span class="icon-[heroicons--arrow-left] me-2 h-4 w-4"></span>
			Back to Roles
		</Button>
	</div>

	<Card variant="flat">
		<CreateRoleProvider
			onSuccess={onRoleCreated}
			let:loading
			let:errorMessage
			let:clearError
			let:createRole
		>
			<ListPermissionsProvider
				bind:this={listPermissionsProvider}
				let:permissions
				let:loading={permissionsLoading}
				let:errorMessage={permissionsError}
				let:listPermissions
			>
				<AssignPermissionToRoleProvider
					bind:this={assignPermissionToRoleProvider}
					onSuccess={() => {
						// Permission assigned successfully
						// This will be called after each permission assignment
						onPermissionAssigned();
					}}
					onError={(error) => {
						isAssigningPermissions = false;
						permissionAssignmentError = error;
						toast.error('Failed to assign some permissions to role');
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
								<span class="text-blue-700">Assigning permissions to role...</span>
							</div>
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

					<form on:submit={(e) => handleCreateRole(e, createRole)} class="space-y-6" novalidate>
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
							label="Role Name"
							forAttr="name"
							error="Name is required (1-50 characters)"
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
								placeholder="Enter role name"
							/>
						</FormGroup>

						<!-- Description Input -->
						<FormGroup
							label="Description (Optional)"
							forAttr="description"
							error="Description must be less than 255 characters"
							showError={descriptionTouched && !descriptionValid}
						>
							<Input
								id="description"
								name="description"
								type="text"
								bind:value={$description$}
								onBlur={() => handleInputBlur('description')}
								error={descriptionTouched && !descriptionValid}
								placeholder="Enter role description"
							/>
						</FormGroup>

						<!-- Permissions Selection -->
						<FormGroup label="Permissions (Optional)" forAttr="permissions">
							{#if permissionsLoading}
								<div class="flex items-center justify-center py-4">
									<span class="icon-[svg-spinners--ring-resize] me-2 h-5 w-5 text-blue-500"></span>
									<span class="text-gray-500">Loading permissions...</span>
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
									{selectedPermissions.length} permission{selectedPermissions.length !== 1
										? 's'
										: ''} selected
								</div>
							{:else}
								<div class="py-4 text-center text-gray-500">
									{#if permissionsError}
										Failed to load permissions
									{:else}
										No permissions available
									{/if}
								</div>
							{/if}
						</FormGroup>

						<!-- Submit Button -->
						<div class="flex justify-end space-x-3">
							<Button href="/panel/admin/roles" variant="secondary">Cancel</Button>
							<Button
								type="submit"
								{loading}
								disabled={!formValid || isAssigningPermissions}
								variant="primary"
							>
								{#if loading || isAssigningPermissions}
									<slot name="loading-text">
										{#if loading}
											Creating role...
										{:else}
											Assigning permissions...
										{/if}
									</slot>
								{:else}
									Create Role
								{/if}
							</Button>
						</div>
					</form>
				</AssignPermissionToRoleProvider>
			</ListPermissionsProvider>
		</CreateRoleProvider>
	</Card>
</PanelPageWrapper>
