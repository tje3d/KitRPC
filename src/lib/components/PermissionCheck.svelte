<script lang="ts">
	import { goto } from '$app/navigation';
	import { authUser } from '$lib/flow/auth.flow';
	import { hasAllPermissions, hasPermission, type PermissionIdentifier } from '$lib/helpers/permissions.helper';

	// Props
	export let permission: PermissionIdentifier | PermissionIdentifier[];
	export let redirect: string | undefined = undefined;

	// Reactive variable to track if user has required permissions
	let hasRequiredPermissions = false;

	// Check if user has the required permissions
	$: if (!$authUser) {
		hasRequiredPermissions = false;
	} else {
		// Handle single permission
		if (typeof permission === 'string' || ('resource' in permission && 'action' in permission)) {
			hasRequiredPermissions = hasPermission($authUser, permission);
		}
		// Handle array of permissions (require all)
		else if (Array.isArray(permission)) {
			hasRequiredPermissions = hasAllPermissions($authUser, permission);
		}
		// Default to false if permission format is invalid
		else {
			hasRequiredPermissions = false;
		}
	}

	// Redirect if user doesn't have required permissions and redirect is specified
	$: if (!hasRequiredPermissions && redirect) {
		goto(redirect);
	}
</script>

{#if hasRequiredPermissions}
	<slot />
{/if}