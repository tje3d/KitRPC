// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {
	Permission as PrismaPermission,
	Role as PrismaRole,
	Todo as PrismaTodo,
	User as PrismaUser
} from '@prisma/client';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		// Shared types - using Prisma-generated types with timestamps converted to string or excluded
		type Todo = Omit<PrismaTodo, 'createdAt'> & {
			createdAt: string;
		};

		type Permission = Omit<PrismaPermission, 'createdAt' | 'updatedAt'>;

		type Role = Omit<PrismaRole, 'createdAt' | 'updatedAt'>;

		// Auth-related types
		type AuthUser = Pick<PrismaUser, 'id' | 'username'> & {
			balanceIRT?: number;
			balanceUSDT?: number;
			role?: Role & {
				permissions: Array<{
					permission: Permission;
				}>;
			};
			permissions?: Array<{
				permission: Permission;
			}>;
		};

		type AuthResponse = {
			success: boolean;
			user: AuthUser;
			token: string;
		};

		// Toast
		type ToastVariant = 'info' | 'success' | 'warning' | 'error';

		interface ToastData {
			id: symbol;
			message: string;
			variant: ToastVariant;
			duration: number;
			pauseOnHover: boolean;
			createdAt: number;
			remaining: number;
			_timer?: ReturnType<typeof setTimeout>;
		}

		// Dialog
		interface DialogConfig {
			id: string;
			component: any;
			props?: Record<string, any>;
			onClose?: () => void;
			preventBackdropClose?: boolean;
			preventDirtyClose?: boolean;
			showClose?: boolean;
			noPadding?: boolean;
			center?: boolean;
			fullScreen?: boolean;
			transitionType?: 'scale' | 'fly';
		}

		interface DialogState {
			dialogs: DialogConfig[];
		}
	}
}

export {};
