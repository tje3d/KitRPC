import { hasPermission } from '$lib/auth';
import { TRPCError } from '@trpc/server';
import { t } from './trpc';

// Middleware for authenticated users
export const isAuthenticated = t.middleware(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'برای دسترسی به این منبع باید وارد شوید'
		});
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

// Generic permission middleware factory
export const createPermissionMiddleware = (resource: string, action: string) =>
	t.middleware(async ({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'باید وارد شوید'
			});
		}

		if (!hasPermission(ctx.user, resource, action)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: `شما مجوز ${action} ${resource} را ندارید`
			});
		}

		return next({
			ctx: {
				...ctx,
				user: ctx.user // Propagate non-null user
			} as {
				user: NonNullable<typeof ctx.user>; // Ensures user exists
			} & typeof ctx // Type assertion ensures user exists
		});
	});

// Admin middleware for KYC management
export const isAdmin = t.middleware(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'باید وارد شوید'
		});
	}

	// Check if user has the kyc:manage permission
	// Ensure role and permissions exist before checking
	if (!ctx.user.role || !ctx.user.permissions) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: `شما مجوز مدیریت تأییدیه‌های KYC را ندارید`
		});
	}

	const hasKycPermission = hasPermission(ctx.user, 'kyc', 'manage');

	if (!hasKycPermission) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: `شما مجوز مدیریت تأییدیه‌های KYC را ندارید`
		});
	}

	return next({
		ctx: {
			...ctx,
			user: ctx.user // Propagate non-null user
		}
	});
});
