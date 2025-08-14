<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import Checkbox from '$lib/kit/Checkbox.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import GetRoleByIdProvider from '$lib/providers/GetRoleByIdProvider.svelte';
	import UpdateRoleProvider from '$lib/providers/UpdateRoleProvider.svelte';
	import ListPermissionsProvider from '$lib/providers/ListPermissionsProvider.svelte';
	import AssignPermissionToRoleProvider from '$lib/providers/AssignPermissionToRoleProvider.svelte';
	import UnassignPermissionFromRoleProvider from '$lib/providers/UnassignPermissionFromRoleProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Get role ID from URL params
	const roleId = $page.params.id;

	// Provider references
	let getRoleByIdProvider: GetRoleByIdProvider;
	let listPermissionsProvider: ListPermissionsProvider;
	let assignPermissionToRoleProvider: AssignPermissionToRoleProvider;
	let unassignPermissionFromRoleProvider: UnassignPermissionFromRoleProvider;

	// Form state
	const name$ = new SvelteSubject<string>('');
	const description$ = new SvelteSubject<string>('');

	// Permission selection state
	let selectedPermissions = $state<string[]>([]);
	let isProcessingPermissions = $state(false);
	let permissionProcessingError = $state<string | null>(null);
	let currentPermissionIndex = $state(0);
	let originalPermissionIds = $state<string[]>([]);
	let permissionChanges: { id: string; type: 'add' | 'remove' }[] = [];
	let currentRoleId = $state<string>('');

	// Validation state
	let nameTouched = false;
	let descriptionTouched = false;

	// Computed validation
	const nameValid = $derived(!nameTouched || ($name$.length >= 1 && $name$.length <= 50));
	const descriptionValid = $derived(!descriptionTouched || $description$.length <= 255);
	const formValid = $derived(nameValid && descriptionValid && $name$);

	// Load role data and permissions on component mount
	onMount(() => {
		if (getRoleByIdProvider) {
			getRoleByIdProvider.getRoleById({ id: roleId });
		}

		if (listPermissionsProvider) {
			listPermissionsProvider.listPermissions({ page: 1, limit: 100 });
		}
	});

	// Actions
	function handleUpdateRole(e: SubmitEvent, updateRole: Function) {
		e.preventDefault();
		if (!formValid) return;

		// Build roleData object
		const roleData = {
			id: roleId,
			data: {
				name: $name$,
				description: $description$ || undefined
			}
		};

		updateRole(roleData);
	}

	function onRoleUpdated(role: any) {
		// Set the current role ID for permission processing
		currentRoleId = role.id;

		// Check if permissions have changed
		const currentPermissionIds = selectedPermissions;
		const permissionsToAdd = currentPermissionIds.filter(
			(id) => !originalPermissionIds.includes(id)
		);
		const permissionsToRemove = originalPermissionIds.filter(
			(id) => !currentPermissionIds.includes(id)
		);

		// If permissions have changed, process them
		if (permissionsToAdd.length > 0 || permissionsToRemove.length > 0) {
			processPermissionChanges(role.id, permissionsToAdd, permissionsToRemove);
		} else {
			// No permissions to change, show success and navigate
			toast.success('Role updated successfully!');
			goto('/panel/admin/roles');
		}
	}

	function processPermissionChanges(roleId: string, toAdd: string[], toRemove: string[]) {
		// Set the current role ID for permission processing
		currentRoleId = roleId;

		isProcessingPermissions = true;
		permissionProcessingError = null;
		currentPermissionIndex = 0;

		// Process all changes
		permissionChanges = [
			...toAdd.map((id) => ({ id, type: 'add' as const })),
			...toRemove.map((id) => ({ id, type: 'remove' as const }))
		];

		if (permissionChanges.length === 0) {
			// No changes to process
			isProcessingPermissions = false;
			toast.success('Role updated successfully!');
			goto('/panel/admin/roles');
			return;
		}

		// Process the first change
		processNextPermissionChange(roleId);
	}

	function processNextPermissionChange(roleId: string) {
		// Check if we've processed all changes
		if (currentPermissionIndex >= permissionChanges.length) {
			// All changes processed
			isProcessingPermissions = false;
			toast.success('Role updated and permissions processed successfully!');
			goto('/panel/admin/roles');
			return;
		}

		// Process the next change
		const change = permissionChanges[currentPermissionIndex];

		if (change.type === 'add' && assignPermissionToRoleProvider) {
			assignPermissionToRoleProvider.assignPermissionToRole({
				roleId,
				permissionId: change.id
			});
		} else if (change.type === 'remove' && unassignPermissionFromRoleProvider) {
			unassignPermissionFromRoleProvider.unassignPermissionFromRole({
				roleId,
				permissionId: change.id
			});
		}
	}

	function onPermissionProcessed() {
		if (!isProcessingPermissions) return;

		// Move to the next permission change
		currentPermissionIndex++;
		// We'll get the changes array from the context when calling processNextPermissionChange
		// This is a simplified approach - in a real implementation, we'd need to pass the changes array
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

	function onRoleLoaded(role: any) {
		// Populate form with role data
		name$.next(role.name || '');
		description$.next(role.description || '');

		// Populate selected permissions from role's current permissions
		if (role.permissions && Array.isArray(role.permissions)) {
			selectedPermissions = role.permissions.map((p: any) => p.permissionId);
			originalPermissionIds = [...selectedPermissions];
		}
	}

	function onRoleError(error: string) {
		// If role not found, show error and redirect after delay
		if (error.includes('not found')) {
			toast.error('Role not found');
			setTimeout(() => {
				goto('/panel/admin/roles');
			}, 2000);
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

<PanelPageWrapper title="Edit Role" description="Update role information">
	<div slot="actions">
		<Button href="/panel/admin/roles" variant="secondary">
			<span class="icon-[heroicons--arrow-left] me-2 h-4 w-4"></span>
			Back to Roles
		</Button>
	</div>

	<Card variant="flat">
		<GetRoleByIdProvider
			bind:this={getRoleByIdProvider}
			onSuccess={onRoleLoaded}
			onError={onRoleError}
			let:loading={roleLoading}
			let:errorMessage={roleError}
			let:clearError
			let:getRoleById
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
						// Move to the next permission change
						currentPermissionIndex++;
						processNextPermissionChange(currentRoleId);
					}}
					onError={(error) => {
						isProcessingPermissions = false;
						permissionProcessingError = error;
						toast.error('Failed to process some permission changes');
					}}
					let:loading={assignPermissionLoading}
					let:errorMessage={assignPermissionError}
					let:clearError={clearAssignPermissionError}
					let:assignPermissionToRole
				>
					<UnassignPermissionFromRoleProvider
						bind:this={unassignPermissionFromRoleProvider}
						onSuccess={() => {
							// Permission unassigned successfully
							// Move to the next permission change
							currentPermissionIndex++;
							processNextPermissionChange(currentRoleId);
						}}
						onError={(error) => {
							isProcessingPermissions = false;
							permissionProcessingError = error;
							toast.error('Failed to process some permission changes');
						}}
						let:loading={unassignPermissionLoading}
						let:errorMessage={unassignPermissionError}
						let:clearError={clearUnassignPermissionError}
						let:unassignPermissionFromRole
					>
						{#if isProcessingPermissions}
							<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
								<div class="flex items-center">
									<span class="icon-[svg-spinners--ring-resize] me-2 h-5 w-5 text-blue-500"></span>
									<span class="text-blue-700">Processing permission changes...</span>
								</div>
							</div>
						{/if}

						{#if permissionProcessingError}
							<div class="mb-6" in:fade={{ duration: 300 }}>
								<ErrorDisplay
									message={permissionProcessingError}
									onDismiss={() => (permissionProcessingError = null)}
								/>
							</div>
						{/if}

						{#if roleLoading}
							<div class="p-8 text-center">
								<span class="icon-[svg-spinners--ring-resize] me-3 h-8 w-8 text-blue-500"></span>
								Loading role...
							</div>
						{:else if roleError && !roleError.includes('not found')}
							<div class="mb-6" in:fade={{ duration: 300 }}>
								<ErrorDisplay message={roleError} onDismiss={clearError} />
							</div>
						{:else}
							<UpdateRoleProvider
								onSuccess={onRoleUpdated}
								let:loading={updateLoading}
								let:errorMessage={updateError}
								let:clearError={clearUpdateError}
								let:updateRole
							>
								<form
									on:submit={(e) => handleUpdateRole(e, updateRole)}
									class="space-y-6"
									novalidate
								>
									<!-- Error Display -->
									{#if updateError}
										<div in:fade={{ duration: 300 }}>
											<ErrorDisplay message={updateError} onDismiss={clearUpdateError} />
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
												<span class="icon-[svg-spinners--ring-resize] me-2 h-5 w-5 text-blue-500"
												></span>
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
											loading={updateLoading || isProcessingPermissions}
											disabled={!formValid || isProcessingPermissions}
											variant="primary"
										>
											{#if updateLoading || isProcessingPermissions}
												<slot name="loading-text">
													{#if updateLoading}
														Updating role...
													{:else}
														Processing permissions...
													{/if}
												</slot>
											{:else}
												Update Role
											{/if}
										</Button>
									</div>
								</form>
							</UpdateRoleProvider>
						{/if}
					</UnassignPermissionFromRoleProvider>
				</AssignPermissionToRoleProvider>
			</ListPermissionsProvider>
		</GetRoleByIdProvider>
	</Card>
</PanelPageWrapper>
