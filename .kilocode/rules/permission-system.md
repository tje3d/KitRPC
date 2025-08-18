## Brief overview

This rule file documents the permission checking system implementation for the KitRPC project, including coding patterns, component structures, and best practices for implementing access control.

## Permission System Architecture

- Use centralized permission helper functions in `src/lib/helpers/permissions.helper.ts` for all permission checks
- Implement permission checks through the `PermissionCheck` Svelte component for UI-level access control
- Check both role-based permissions (`user.role.permissions`) and user-specific permissions (`user.permissions`)
- Follow the resource:action permission naming convention (e.g., "kyc:manage", "media:read")

## Component Design Patterns

- Create Svelte components that wrap content to conditionally render based on permissions
- Use `bind:this` pattern for component references when exposing methods
- Implement redirect functionality using SvelteKit's `goto` function
- Follow existing provider component patterns in `src/lib/providers`

## Helper Function Standards

- Create reusable, well-typed helper functions for common operations
- Support both single values and arrays as parameters
- Handle edge cases like null/undefined users gracefully
- Export proper TypeScript types for function parameters and return values

## Implementation Best Practices

- Replace duplicated permission checking code with the PermissionCheck component
- Use consistent permission identifiers throughout the application
- Redirect users to appropriate pages when they lack permissions
