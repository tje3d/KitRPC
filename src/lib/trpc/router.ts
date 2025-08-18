import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { authRouter } from './auth';
import { bankCardsRouter } from './bankCards';
import { kycRouter } from './kyc';
import { mediaRouter } from './media';
import { permissionsRouter } from './permissions';
import { rolesRouter } from './roles';
import { sessionsRouter } from './sessions';
import { transactionsRouter } from './transactions';
import { t } from './trpc';
import { usersRouter } from './users';
import { walletRouter } from './wallet';

export const router = t.router({
	greeting: t.procedure.query(async () => {
		return `Hello tRPC v11 @ ${new Date().toLocaleTimeString()}`;
	}),

	// Authentication procedures
	auth: authRouter,

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
	sessions: sessionsRouter,

	// Media management procedures
	media: mediaRouter,

	// KYC procedures
	kyc: kycRouter
});

export type Router = typeof router;
export type RouterOutputs = inferRouterOutputs<Router>;
export type RouterInputs = inferRouterInputs<Router>;
