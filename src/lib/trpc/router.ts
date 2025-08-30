import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { authRouter } from './auth';
import { bankCardsRouter } from './bankCards';
import { capacityRouter } from './capacity';
import { kycRouter } from './kyc';
import { mediaRouter } from './media';
import { permissionsRouter } from './permissions';
import { rolesRouter } from './roles';
import { sessionsRouter } from './sessions';
import { transactionsRouter } from './transactions';
import { t } from './trpc';
import { usersRouter } from './users';
import { usdtPriceRouter } from './usdtPrice';
import { walletRouter } from './wallet';

export const router = t.router({
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
	kyc: kycRouter,

	// System capacity procedures
	capacity: capacityRouter,

	// USDT price management procedures
	usdtPrice: usdtPriceRouter
});

export type Router = typeof router;
export type RouterOutputs = inferRouterOutputs<Router>;
export type RouterInputs = inferRouterInputs<Router>;
