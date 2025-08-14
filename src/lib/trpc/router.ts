import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { authRouter } from './auth';
import { bankCardsRouter } from './bankCards';
import { todosRouter } from './todos';
import { transactionsRouter } from './transactions';
import { usersRouter } from './users';
import { rolesRouter } from './roles';
import { permissionsRouter } from './permissions';
import { walletRouter } from './wallet';
import { sessionsRouter } from './sessions';
import { t } from './trpc';

export const router = t.router({
	greeting: t.procedure.query(async () => {
		return `Hello tRPC v11 @ ${new Date().toLocaleTimeString()}`;
	}),

	// Authentication procedures
	auth: authRouter,

	// Todo procedures
	todos: todosRouter,

	// Bank card procedures
	bankCards: bankCardsRouter,

	// Transaction procedures
	transactions: transactionsRouter,

	// Wallet address procedures
	wallet: walletRouter,

	// User management procedures
	users: usersRouter,

	// Role management procedures
	roles: rolesRouter,

	// Permission management procedures
	permissions: permissionsRouter,

	// Session management procedures
	sessions: sessionsRouter
});

export type Router = typeof router;
export type RouterOutputs = inferRouterOutputs<Router>;
export type RouterInputs = inferRouterInputs<Router>;
