import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { prisma } from '../prisma';

// Use Prisma's generated types instead of manually defined interfaces
type KycVerificationWithUser = Prisma.KycVerificationGetPayload<{
	include: {
		user: {
			select: {
				id: true;
				username: true;
			};
		};
	};
}>;

export type KycUpdateData = Prisma.XOR<
	Prisma.KycVerificationUpdateInput,
	Prisma.KycVerificationUncheckedUpdateInput
>;

export interface KycResponse {
	success: boolean;
	kycId: string;
	userId: string;
	username: string | null;
	message: string;
}

export interface StepDecisionResult {
	updateData: KycUpdateData;
	message: string;
}

// Helper function to retrieve KYC verification records with proper error handling
export const getKycVerificationById = async (kycId: string): Promise<KycVerificationWithUser> => {
	if (!kycId) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'شناسه KYC الزامی است'
		});
	}

	const kycVerification = await prisma.kycVerification.findUnique({
		where: {
			id: kycId
		},
		include: {
			user: {
				select: {
					id: true,
					username: true
				}
			}
		}
	});

	if (!kycVerification) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'KYC verification record not found for this KYC ID'
		});
	}

	return kycVerification;
};

// Helper function to determine which KYC step to process based on current status
export const determineStepToProcess = (
	kycVerification: KycVerificationWithUser
): 'step1' | 'step2' | 'both' => {
	if (kycVerification.step1Status === 'PENDING') {
		return 'step1';
	} else if (
		kycVerification.step1Status === 'APPROVED' &&
		kycVerification.step2Status === 'PENDING'
	) {
		return 'step2';
	} else if (
		kycVerification.step1Status === 'APPROVED' &&
		kycVerification.step2Status === 'APPROVED'
	) {
		return 'both';
	}

	// Default case (should not happen in normal flow)
	return 'step1';
};

// Helper function to create common update data objects for approval
export const createApprovalUpdateData = (
	kycVerification: KycVerificationWithUser,
	adminNotes?: string
): StepDecisionResult => {
	const updateData: KycUpdateData = {
		adminNotes: adminNotes || null,
		lastStepUpdatedAt: new Date(),
		updatedAt: new Date()
	};

	const stepToProcess = determineStepToProcess(kycVerification);
	let message = '';

	switch (stepToProcess) {
		case 'step1':
			updateData.step1Status = 'APPROVED';
			updateData.step1VerifiedAt = new Date();

			message = 'KYC step 1 approved successfully';
			break;
		case 'step2':
			updateData.step2Status = 'APPROVED';
			updateData.step2VerifiedAt = new Date();

			message = 'KYC step 2 approved successfully';
			break;
		case 'both':
			message = 'KYC request already fully approved';
			break;
	}

	return {
		updateData,
		message
	};
};

// Helper function to create common update data objects for rejection
export const createRejectionUpdateData = (
	kycVerification: KycVerificationWithUser,
	rejectionReason: string,
	adminNotes?: string
): StepDecisionResult => {
	const updateData: KycUpdateData = {
		adminNotes: adminNotes || null,
		lastStepUpdatedAt: new Date(),
		updatedAt: new Date()
	};

	const stepToProcess = determineStepToProcess(kycVerification);
	let message = '';

	switch (stepToProcess) {
		case 'step1':
			updateData.step1Status = 'REJECTED';
			updateData.step1RejectedAt = new Date();
			updateData.step1RejectionReason = rejectionReason;

			message = 'KYC step 1 rejected successfully';
			break;
		case 'step2':
			updateData.step2Status = 'REJECTED';
			updateData.step2RejectedAt = new Date();
			updateData.step2RejectionReason = rejectionReason;

			message = 'KYC step 2 rejected successfully';
			break;
		case 'both':
			message = 'KYC request already fully approved';
			break;
	}

	return {
		updateData,
		message
	};
};

// Helper function to format response objects consistently
export const formatKycResponse = (
	kycVerification: KycVerificationWithUser,
	message: string
): KycResponse => {
	return {
		success: true,
		kycId: kycVerification.id,
		userId: kycVerification.userId,
		username: kycVerification.user?.username || null,
		message
	};
};

export default {
	getKycVerificationById,
	determineStepToProcess,
	createApprovalUpdateData,
	createRejectionUpdateData,
	formatKycResponse
};
