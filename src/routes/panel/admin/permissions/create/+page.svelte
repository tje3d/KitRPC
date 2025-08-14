<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ErrorDisplay from '$lib/kit/ErrorDisplay.svelte';
	import FormGroup from '$lib/kit/FormGroup.svelte';
	import Input from '$lib/kit/Input.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import CreatePermissionProvider from '$lib/providers/CreatePermissionProvider.svelte';
	import { toast } from '$lib/toast/store';
	import { SvelteSubject } from '$lib/helpers/rxjs.helper';
	import { fade } from 'svelte/transition';

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

	// Actions
	function handleCreatePermission(e: SubmitEvent, createPermission: Function) {
		e.preventDefault();
		if (!formValid) return;

		// Build permissionData object
		const permissionData = {
			name: $name$,
			description: $description$ || undefined,
			resource: $resource$,
			action: $action$
		};

		createPermission(permissionData);
	}

	function onPermissionCreated() {
		// Show success toast
		toast.success('Permission created successfully!');

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
</script>

<PanelPageWrapper title="Create Permission" description="Add a new permission to the system">
	<div slot="actions">
		<Button href="/panel/admin/permissions" variant="secondary">
			<span class="icon-[heroicons--arrow-left] me-2 h-4 w-4"></span>
			Back to Permissions
		</Button>
	</div>

	<Card variant="flat">
		<CreatePermissionProvider
			onSuccess={onPermissionCreated}
			let:loading
			let:errorMessage
			let:clearError
			let:createPermission
		>
			<form
				on:submit={(e) => handleCreatePermission(e, createPermission)}
				class="space-y-6"
				novalidate
			>
				<!-- Error Display -->
				{#if errorMessage}
					<div in:fade={{ duration: 300 }}>
						<ErrorDisplay message={errorMessage} onDismiss={clearError} />
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
					<Button type="submit" {loading} disabled={!formValid} variant="primary">
						{#if loading}
							<slot name="loading-text">Creating permission...</slot>
						{:else}
							Create Permission
						{/if}
					</Button>
				</div>
			</form>
		</CreatePermissionProvider>
	</Card>
</PanelPageWrapper>
