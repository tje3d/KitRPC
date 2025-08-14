<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import GetPermissionByIdProvider from '$lib/providers/GetPermissionByIdProvider.svelte';
	import UpdatePermissionProvider from '$lib/providers/UpdatePermissionProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	// Get permission ID from URL params
	const permissionId = $page.params.id;

	// Provider references
	let getPermissionByIdProvider: GetPermissionByIdProvider;

	// Form state
	const name$ = new SvelteSubject<string>('');
	const description$ = new SvelteSubject<string>('');
	const resource$ = new SvelteSubject<string>('');
	const action$ = new SvelteSubject<string>('');

	// Validation state
	let nameTouched = false;
	let descriptionTouched = false;
	let resourceTouched = false;
	let actionTouched = false;

	// Computed validation
	const nameValid = $derived(!nameTouched || ($name$.length >= 1 && $name$.length <= 100));
	const descriptionValid = $derived(!descriptionTouched || $description$.length <= 255);
	const resourceValid = $derived(
		!resourceTouched || ($resource$.length >= 1 && $resource$.length <= 50)
	);
	const actionValid = $derived(!actionTouched || ($action$.length >= 1 && $action$.length <= 50));
	const formValid = $derived(
		nameValid && resourceValid && actionValid && $name$ && $resource$ && $action$
	);

	// Load permission data on component mount
	onMount(() => {
		if (getPermissionByIdProvider) {
			getPermissionByIdProvider.getPermissionById({ id: permissionId });
		}
	});

	// Actions
	function handleUpdatePermission(e: SubmitEvent, updatePermission: Function) {
		e.preventDefault();
		if (!formValid) return;

		// Build permissionData object
		const permissionData = {
			id: permissionId,
			data: {
				name: $name$,
				description: $description$ || undefined,
				resource: $resource$,
				action: $action$
			}
		};

		updatePermission(permissionData);
	}

	function onPermissionUpdated() {
		// Show success toast
		toast.success('Permission updated successfully!');

		// Navigate back to permissions list
		goto('/panel/admin/permissions');
	}

	function handleInputBlur(field: string) {
		switch (field) {
			case 'name':
				nameTouched = true;
				break;
			case 'description':
				descriptionTouched = true;
				break;
			case 'resource':
				resourceTouched = true;
				break;
			case 'action':
				actionTouched = true;
				break;
		}
	}

	function onPermissionLoaded(permission: any) {
		// Populate form with permission data
		name$.next(permission.name || '');
		description$.next(permission.description || '');
		resource$.next(permission.resource || '');
		action$.next(permission.action || '');
	}

	function onPermissionError(error: string) {
		// If permission not found, show error and redirect after delay
		if (error.includes('not found')) {
			toast.error('Permission not found');
			setTimeout(() => {
				goto('/panel/admin/permissions');
			}, 2000);
		}
	}
</script>

<PanelPageWrapper title="Edit Permission" description="Update permission information">
	<div slot="actions">
		<Button href="/panel/admin/permissions" variant="secondary">
			<span class="icon-[heroicons--arrow-left] me-2 h-4 w-4"></span>
			Back to Permissions
		</Button>
	</div>

	<Card variant="flat">
		<GetPermissionByIdProvider
			bind:this={getPermissionByIdProvider}
			onSuccess={onPermissionLoaded}
			onError={onPermissionError}
			let:loading={permissionLoading}
			let:errorMessage={permissionError}
			let:clearError
			let:getPermissionById
		>
			{#if permissionLoading}
				<div class="p-8 text-center">
					<span class="icon-[svg-spinners--ring-resize] me-3 h-8 w-8 text-blue-500"></span>
					Loading permission...
				</div>
			{:else if permissionError && !permissionError.includes('not found')}
				<div class="mb-6" in:fade={{ duration: 300 }}>
					<ErrorDisplay message={permissionError} onDismiss={clearError} />
				</div>
			{:else}
				<UpdatePermissionProvider
					onSuccess={onPermissionUpdated}
					let:loading={updateLoading}
					let:errorMessage={updateError}
					let:clearError={clearUpdateError}
					let:updatePermission
				>
					<form
						on:submit={(e) => handleUpdatePermission(e, updatePermission)}
						class="space-y-6"
						novalidate
					>
						<!-- Error Display -->
						{#if updateError}
							<div in:fade={{ duration: 300 }}>
								<ErrorDisplay message={updateError} onDismiss={clearUpdateError} />
							</div>
						{/if}

						<!-- Name Input -->
						<FormGroup
							label="Permission Name"
							forAttr="name"
							error="Name is required (1-100 characters)"
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
								placeholder="Enter permission name"
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
								placeholder="Enter permission description"
							/>
						</FormGroup>

						<!-- Resource Input -->
						<FormGroup
							label="Resource"
							forAttr="resource"
							error="Resource is required (1-50 characters)"
							required
							showError={resourceTouched && !resourceValid}
						>
							<Input
								id="resource"
								name="resource"
								type="text"
								bind:value={$resource$}
								onBlur={() => handleInputBlur('resource')}
								error={resourceTouched && !resourceValid}
								placeholder="Enter resource (e.g., user, role, permission)"
							/>
						</FormGroup>

						<!-- Action Input -->
						<FormGroup
							label="Action"
							forAttr="action"
							error="Action is required (1-50 characters)"
							required
							showError={actionTouched && !actionValid}
						>
							<Input
								id="action"
								name="action"
								type="text"
								bind:value={$action$}
								onBlur={() => handleInputBlur('action')}
								error={actionTouched && !actionValid}
								placeholder="Enter action (e.g., create, read, update, delete)"
							/>
						</FormGroup>

						<!-- Submit Button -->
						<div class="flex justify-end space-x-3">
							<Button href="/panel/admin/permissions" variant="secondary">Cancel</Button>
							<Button type="submit" loading={updateLoading} disabled={!formValid} variant="primary">
								{#if updateLoading}
									<slot name="loading-text">Updating permission...</slot>
								{:else}
									Update Permission
								{/if}
							</Button>
						</div>
					</form>
				</UpdatePermissionProvider>
			{/if}
		</GetPermissionByIdProvider>
	</Card>
</PanelPageWrapper>
