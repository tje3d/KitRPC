import {
	createSession,
	deleteSession,
	hashPassword,
	hasPermission,
	verifyPassword
} from '$lib/auth';
import { prisma } from '$lib/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from './trpc';

// Input validation schemas
const loginSchema = z
	.object({
		email: z.string().email().optional(),
		mobile: z.string().optional(),
		password: z.string().min(6)
	})
	.refine((data) => data.email || data.mobile, {
		message: 'Either email or mobile is required'
	});

const registerSchema = z
	.object({
		email: z.string().email().optional(),
		mobile: z.string().optional(),
		password: z.string().min(6),
		roleId: z.string().optional() // Optional, will default to a basic role
	})
	.refine((data) => data.email || data.mobile, {
		message: 'Either email or mobile is required'
	});

// Middleware for authenticated users
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You must be logged in to access this resource'
		});
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

// Protected procedures
const protectedProcedure = t.procedure.use(isAuthenticated);

export const authRouter = t.router({
	// Register new user
	register: t.procedure.input(registerSchema).mutation(async ({ input, ctx }) => {
		try {
			// Check if user already exists
			const existingUser = await prisma.user.findFirst({
				where: {
					OR: [
						...(input.email ? [{ email: input.email }] : []),
						...(input.mobile ? [{ mobile: input.mobile }] : [])
					]
				}
			});

			if (existingUser) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'User with this email or mobile already exists'
				});
			}

			// Get default role (create if doesn't exist)
			let defaultRole = await prisma.role.findUnique({
				where: { name: 'user' }
			});

			if (!defaultRole) {
				defaultRole = await prisma.role.create({
					data: {
						name: 'user',
						description: 'Default user role'
					}
				});
			}

			// Hash password
			const hashedPassword = await hashPassword(input.password);

			// Create user
			const user = await prisma.user.create({
				data: {
					email: input.email,
					mobile: input.mobile,
					password: hashedPassword,
					roleId: input.roleId || defaultRole.id
				},
				include: {
					role: {
						include: {
							permissions: {
								include: {
									permission: true
								}
							}
						}
					},
					permissions: {
						include: {
							permission: true
						}
					}
				}
			});

			// Create session
			const { token, expiresAt } = await createSession(user.id);

			// Set cookie
			ctx.cookies.set('session_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				expires: expiresAt,
				path: '/'
			});

			return {
				success: true,
				user: {
					id: user.id,
					email: user.email,
					mobile: user.mobile,
					role: user.role,
					permissions: user.permissions
				},
				token
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to register user',
				cause: error
			});
		}
	}),

	// Login user
	login: t.procedure.input(loginSchema).mutation(async ({ input, ctx }) => {
		try {
			// Find user
			const user = await prisma.user.findFirst({
				where: {
					OR: [
						...(input.email ? [{ email: input.email }] : []),
						...(input.mobile ? [{ mobile: input.mobile }] : [])
					]
				},
				include: {
					role: {
						include: {
							permissions: {
								include: {
									permission: true
								}
							}
						}
					},
					permissions: {
						include: {
							permission: true
						}
					}
				}
			});

			if (!user) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invalid credentials'
				});
			}

			// Verify password
			const isValidPassword = await verifyPassword(input.password, user.password);
			if (!isValidPassword) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invalid credentials'
				});
			}

			// Create session
			const { token, expiresAt } = await createSession(user.id);

			// Set cookie
			ctx.cookies.set('session_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				expires: expiresAt,
				path: '/'
			});

			return {
				success: true,
				user: {
					id: user.id,
					email: user.email,
					mobile: user.mobile,
					role: user.role,
					permissions: user.permissions
				},
				token
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to login',
				cause: error
			});
		}
	}),

	// Logout user
	logout: protectedProcedure.mutation(async ({ ctx }) => {
		try {
			const token = ctx.cookies.get('session_token');
			if (token) {
				await deleteSession(token);
			}

			// Clear cookie
			ctx.cookies.delete('session_token', { path: '/' });

			return { success: true };
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to logout',
				cause: error
			});
		}
	}),

	// Get current user
	me: protectedProcedure.query(async ({ ctx }) => {
		return {
			id: ctx.user.id,
			email: ctx.user.email,
			mobile: ctx.user.mobile,
			role: ctx.user.role,
			permissions: ctx.user.permissions
		};
	}),

	// Check if user has permission
	checkPermission: protectedProcedure
		.input(
			z.object({
				resource: z.string(),
				action: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			return hasPermission(ctx.user, input.resource, input.action);
		})
});
