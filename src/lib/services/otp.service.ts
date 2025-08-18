import { prisma } from '$lib/prisma';
import type { Otp } from '@prisma/client';

/**
 * Generate a 6-digit OTP code
 * @returns A string containing a 6-digit OTP code
 */
export function generateOtpCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if a user has any non-expired OTP
 * @param userId - The ID of the user to check
 * @returns A promise that resolves to true if the user has a non-expired OTP, false otherwise
 */
export async function hasNonExpiredOtp(userId: string): Promise<boolean> {
	const now = new Date();

	const otp = await prisma.otp.findFirst({
		where: {
			userId: userId,
			expiresAt: {
				gt: now
			}
		}
	});

	return otp !== null;
}

/**
 * Get a user's non-expired OTP if it exists
 * @param userId - The ID of the user to check
 * @returns A promise that resolves to the OTP object if found, null otherwise
 */
export async function getNonExpiredOtp(userId: string): Promise<Otp | null> {
	const now = new Date();

	const otp = await prisma.otp.findFirst({
		where: {
			userId: userId,
			expiresAt: {
				gt: now
			}
		}
	});

	return otp;
}

/**
 * Get a user's non-expired OTP if it exists, extending its expiration time,
 * or create a new OTP if none exists
 * @param userId - The ID of the user
 * @returns A promise that resolves to an object containing the OTP and a boolean indicating if it was newly created
 */
export async function getOrCreateNonExpiredOtp(
	userId: string
): Promise<{ otp: Otp; isNew: boolean }> {
	const existingOtp = await getNonExpiredOtp(userId);
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

	if (existingOtp) {
		// Extend the expiration time of existing OTP
		const updatedOtp = await prisma.otp.update({
			where: {
				id: existingOtp.id
			},
			data: {
				expiresAt: expiresAt,
				createdAt: new Date() // Reset creation time
			}
		});

		return { otp: updatedOtp, isNew: false };
	} else {
		// Create a new OTP
		const newOtp = await prisma.otp.create({
			data: {
				userId: userId,
				code: generateOtpCode(),
				expiresAt: expiresAt
			}
		});

		return { otp: newOtp, isNew: true };
	}
}
