// Type definitions for permission system
export type PermissionResource = string;
export type PermissionAction = string;
export type PermissionIdentifier =
	| string
	| { resource: PermissionResource; action: PermissionAction };

// Type for AuthUser from App namespace
type AuthUser = App.AuthUser;

// Helper function to normalize permission identifier
function normalizePermissionIdentifier(permission: PermissionIdentifier): {
	resource: string;
	action: string;
} {
	if (typeof permission === 'string') {
		// Split string permission "resource:action" format
		const [resource, action] = permission.split(':');
		if (!resource || !action) {
			throw new Error(`فرمت مجوز نامعتبر: ${permission}. انتظار می‌رفت "resource:action"`);
		}
		return { resource, action };
	}
	return permission;
}

/**
 * Check if a user has a specific permission
 * Checks both user.role.permissions and user.permissions
 *
 * @param user - The user object with role and permissions
 * @param permission - The permission to check (either "resource:action" string or { resource, action } object)
 * @returns boolean - Whether the user has the permission
 */
export function hasPermission(
	user: AuthUser | null | undefined,
	permission: PermissionIdentifier
): boolean {
	if (!user) return false;

	const { resource, action } = normalizePermissionIdentifier(permission);

	// Check role permissions
	const hasRolePermission =
		user.role?.permissions?.some(
			(rp) => rp.permission.resource === resource && rp.permission.action === action
		) ?? false;

	// Check user-specific permissions
	const hasUserPermission =
		user.permissions?.some(
			(up) => up.permission.resource === resource && up.permission.action === action
		) ?? false;

	return hasRolePermission || hasUserPermission;
}

/**
 * Check if a user has any of the provided permissions
 *
 * @param user - The user object with role and permissions
 * @param permissions - Array of permissions to check
 * @returns boolean - Whether the user has any of the permissions
 */
export function hasAnyPermission(
	user: AuthUser | null | undefined,
	permissions: PermissionIdentifier[]
): boolean {
	if (!user || !permissions.length) return false;

	return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if a user has all of the provided permissions
 *
 * @param user - The user object with role and permissions
 * @param permissions - Array of permissions to check
 * @returns boolean - Whether the user has all of the permissions
 */
export function hasAllPermissions(
	user: AuthUser | null | undefined,
	permissions: PermissionIdentifier[]
): boolean {
	if (!user || !permissions.length) return false;

	return permissions.every((permission) => hasPermission(user, permission));
}
