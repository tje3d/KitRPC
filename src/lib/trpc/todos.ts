import { hasPermission } from '$lib/auth';
import { prisma } from '$lib/prisma';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createPermissionMiddleware } from './middleware';
import { t } from './trpc';

// Input validation schemas
const todoInputSchema = z.object({
	text: z.string().min(1, 'Todo text is required')
});

const todoIdSchema = z.object({
	id: z.string().cuid('Invalid todo ID')
});

const todoUpdateSchema = z.object({
	id: z.string().cuid('Invalid todo ID'),
	text: z.string().min(1, 'Todo text is required')
});

// Create permission middlewares
const canReadTodos = createPermissionMiddleware('todo', 'read');
const canCreateTodos = createPermissionMiddleware('todo', 'create');
const canUpdateTodos = createPermissionMiddleware('todo', 'update');
const canDeleteTodos = createPermissionMiddleware('todo', 'delete');

// Protected procedures
const readTodosProcedure = t.procedure.use(canReadTodos);
const createTodosProcedure = t.procedure.use(canCreateTodos);
const updateTodosProcedure = t.procedure.use(canUpdateTodos);
const deleteTodosProcedure = t.procedure.use(canDeleteTodos);

export const todosRouter = t.router({
	// Get all todos
	getAll: readTodosProcedure.query(async ({ ctx }) => {
		try {
			const isAdmin = hasPermission(ctx.user, 'admin', 'manage');

			const todos = await prisma.todo.findMany({
				where: isAdmin ? {} : { userId: ctx.user.id },
				orderBy: { createdAt: 'desc' },
				include: {
					user: isAdmin ? { select: { id: true, username: true } } : false
				}
			});

			return todos.map((todo) => ({
				...todo,
				createdAt: todo.createdAt.toISOString()
			}));
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch todos',
				cause: error
			});
		}
	}),

	// Add a new todo
	add: createTodosProcedure.input(todoInputSchema).mutation(async ({ input, ctx }) => {
		try {
			const newTodo = await prisma.todo.create({
				data: {
					text: input.text,
					completed: false,
					userId: ctx.user.id
				}
			});
			return {
				...newTodo,
				createdAt: newTodo.createdAt.toISOString()
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to create todo',
				cause: error
			});
		}
	}),

	// Toggle todo completion
	toggle: updateTodosProcedure.input(todoIdSchema).mutation(async ({ input, ctx }) => {
		try {
			const existingTodo = await prisma.todo.findUnique({
				where: { id: input.id }
			});

			if (!existingTodo) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Todo not found' });
			}

			const isAdmin = hasPermission(ctx.user, 'admin', 'manage');
			if (!isAdmin && existingTodo.userId !== ctx.user.id) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You can only toggle your own todos'
				});
			}

			const updatedTodo = await prisma.todo.update({
				where: { id: input.id },
				data: { completed: !existingTodo.completed }
			});

			return {
				...updatedTodo,
				createdAt: updatedTodo.createdAt.toISOString()
			};
		} catch (error) {
			if (error instanceof TRPCError) throw error;
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to toggle todo',
				cause: error
			});
		}
	}),

	// Update todo text
	update: updateTodosProcedure.input(todoUpdateSchema).mutation(async ({ input, ctx }) => {
		try {
			const existingTodo = await prisma.todo.findUnique({
				where: { id: input.id }
			});

			if (!existingTodo) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Todo not found' });
			}

			const isAdmin = hasPermission(ctx.user, 'admin', 'manage');
			if (!isAdmin && existingTodo.userId !== ctx.user.id) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You can only update your own todos'
				});
			}

			const updatedTodo = await prisma.todo.update({
				where: { id: input.id },
				data: { text: input.text }
			});

			return {
				...updatedTodo,
				createdAt: updatedTodo.createdAt.toISOString()
			};
		} catch (error: any) {
			if (error instanceof TRPCError) throw error;
			if (error.code === 'P2025') {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Todo not found' });
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to update todo',
				cause: error
			});
		}
	}),

	// Delete a todo
	delete: deleteTodosProcedure.input(todoIdSchema).mutation(async ({ input, ctx }) => {
		try {
			const existingTodo = await prisma.todo.findUnique({
				where: { id: input.id }
			});

			if (!existingTodo) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Todo not found' });
			}

			const isAdmin = hasPermission(ctx.user, 'admin', 'manage');
			if (!isAdmin && existingTodo.userId !== ctx.user.id) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You can only delete your own todos'
				});
			}

			const deletedTodo = await prisma.todo.delete({
				where: { id: input.id }
			});

			return {
				...deletedTodo,
				createdAt: deletedTodo.createdAt.toISOString()
			};
		} catch (error: any) {
			if (error instanceof TRPCError) throw error;
			if (error.code === 'P2025') {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Todo not found' });
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to delete todo',
				cause: error
			});
		}
	})
});
