import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '$lib/prisma';
import { isAuthenticated } from './middleware';
import { t } from './trpc';

// Input validation schemas
const deleteSessionSchema = z.object({
	id: z.string().cuid()
});

// Protected procedures
const protectedProcedure = t.procedure.use(isAuthenticated);

export const sessionsRouter = t.router({
	// Get all sessions for the current user (excluding expired ones)
	getSessions: protectedProcedure.query(async ({ ctx }) => {
		try {
			// Get the current session token from cookies
			const currentToken = ctx.cookies.get('session_token');

			const sessions = await prisma.session.findMany({
				where: {
					userId: ctx.user.id,
					expiresAt: {
						gt: new Date()
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			});

			return sessions.map((session) => ({
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt,
				createdAt: session.createdAt,
				updatedAt: session.updatedAt,
				userAgent: session.userAgent,
				ipAddress: session.ipAddress,
				deviceType: session.deviceType,
				browser: session.browser,
				isCurrent: session.token === currentToken
			}));
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch sessions',
				cause: error
			});
		}
	}),

	// Delete a specific session by ID (but not the current session)
	deleteSession: protectedProcedure.input(deleteSessionSchema).mutation(async ({ ctx, input }) => {
		try {
			// Get the current session token from cookies
			const currentToken = ctx.cookies.get('session_token');

			// Find the session to delete
			const sessionToDelete = await prisma.session.findUnique({
				where: {
					id: input.id,
					userId: ctx.user.id
				}
			});

			if (!sessionToDelete) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Session not found'
				});
			}

			// Check if session is expired
			if (sessionToDelete.expiresAt < new Date()) {
				// Just delete the expired session
				await prisma.session.delete({
					where: { id: input.id }
				});
				return { success: true, message: 'Expired session removed' };
			}

			// Prevent deletion of current session
			if (sessionToDelete.token === currentToken) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Cannot delete the current active session'
				});
			}

			// Delete the session
			await prisma.session.delete({
				where: { id: input.id }
			});

			return { success: true };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to delete session',
				cause: error
			});
		}
	})
});
