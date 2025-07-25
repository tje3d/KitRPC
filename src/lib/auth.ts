import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from './prisma';

// Password utilities
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

// Token utilities
export function generateToken(): string {
	return randomBytes(32).toString('hex');
}

// Session utilities
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
	const token = generateToken();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	await prisma.session.create({
		data: {
			userId,
			token,
			expiresAt
		}
	});

	return { token, expiresAt };
}

export async function validateSession(token: string) {
	const session = await prisma.session.findUnique({
		where: { token },
		include: {
			user: {
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
			}
		}
	});

	if (!session || session.expiresAt < new Date()) {
		if (session) {
			// Clean up expired session
			await prisma.session.delete({ where: { id: session.id } });
		}
		return null;
	}

	return session;
}

export async function deleteSession(token: string): Promise<void> {
	await prisma.session.deleteMany({
		where: { token }
	});
}

// Permission utilities
export function hasPermission(
	user: {
		role: {
			permissions: { permission: { resource: string; action: string } }[];
		};
		permissions: { permission: { resource: string; action: string } }[];
	},
	resource: string,
	action: string
): boolean {
	// Check role permissions
	const hasRolePermission = user.role.permissions.some(
		(rp) => rp.permission.resource === resource && rp.permission.action === action
	);

	// Check user-specific permissions
	const hasUserPermission = user.permissions.some(
		(up) => up.permission.resource === resource && up.permission.action === action
	);

	return hasRolePermission || hasUserPermission;
}