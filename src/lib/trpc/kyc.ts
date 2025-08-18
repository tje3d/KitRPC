import { prisma } from '$lib/prisma';
import {
	createApprovalUpdateData,
	createRejectionUpdateData,
	formatKycResponse,
	getKycVerificationById
} from '$lib/services/kyc.service';
import { createMediaRecord, saveMediaFile } from '$lib/services/media.service';
import { getOrCreateNonExpiredOtp } from '$lib/services/otp.service';
import { MediaReason, MediaVisibility, Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createPermissionMiddleware, isAuthenticated } from './middleware';
import { t } from './trpc';

// Input validation schemas
const submitKycInfoSchema = z.object({
	nationalId: z.string().length(10, 'National ID must be 10 digits'),
	mobile: z.string().regex(/^09\d{9}$/, 'Mobile number must be in 09XXXXXXXXX format'),
	birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format')
});

const submitKycStep2MediaSchema = z.object({
	fileType: z.enum(['signedImage', 'selfie', 'nationalIdImage'])
	// Note: Files will be processed in hooks.server.ts and available in context
	// Expected files: signedImage, selfie, nationalIdImage
});

// Note: File data will be processed in hooks.server.ts and available in context
// Expected files in ctx.fileData: signedImage, selfie, nationalIdImage

const getKycStatusSchema = z.object({});

// Admin input validation schemas
const listPendingKycRequestsSchema = z.object({
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0),
	search: z.string().optional(),
	status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
	step1Status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
	step2Status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional()
});

const getKycDetailsSchema = z.object({
	kycId: z.string().min(1, 'KYC ID is required')
});

const approveKycRequestSchema = z.object({
	kycId: z.string().min(1, 'KYC ID is required'),
	adminNotes: z.string().optional()
});

const rejectKycRequestSchema = z.object({
	kycId: z.string().min(1, 'KYC ID is required'),
	rejectionReason: z.string().min(1, 'Rejection reason is required'),
	adminNotes: z.string().optional()
});

// Protected procedures
const protectedProcedure = t.procedure.use(isAuthenticated);
const adminOnly = createPermissionMiddleware('kyc', 'manage');
const adminProcedure = t.procedure.use(adminOnly);

// Helper function to process file uploads with consistent validation
interface ProcessFileResult {
	mediaId?: string;
	error?: {
		code: 'PAYLOAD_TOO_LARGE' | 'BAD_REQUEST';
		message: string;
	};
}

// Type for file data from context
interface FileData {
	filename: string;
	mimeType: string;
	encoding: string;
	buffer: Buffer;
}

const processKycFile = async (
	fileData: FileData,
	ctx: any,
	maxFileSize: number = 5 * 1024 * 1024, // 5MB default
	allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): Promise<ProcessFileResult> => {
	try {
		// Validate file size
		if (fileData.buffer.length > maxFileSize) {
			return {
				error: {
					code: 'PAYLOAD_TOO_LARGE',
					message: `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`
				}
			};
		}

		// Validate file type
		if (!allowedMimeTypes.includes(fileData.mimeType)) {
			return {
				error: {
					code: 'BAD_REQUEST',
					message: `File type not allowed. Only ${allowedMimeTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')} files are allowed.`
				}
			};
		}

		// Save the file using the media service
		const buffer = fileData.buffer;
		const savedFile = await saveMediaFile(buffer, ctx.user.id, fileData.filename);

		// Create a media record in the database
		const mediaRecord = await createMediaRecord({
			reason: MediaReason.KYC,
			visibility: MediaVisibility.PRIVATE,
			filename: savedFile.fileName,
			originalName: fileData.filename,
			fileSize: buffer.length,
			mimeType: fileData.mimeType,
			storagePath: savedFile.filePath,
			ownerId: ctx.user.id
		});

		return { mediaId: mediaRecord.id };
	} catch (error: any) {
		return {
			error: {
				code: 'BAD_REQUEST',
				message: `Failed to process file: ${error.message}`
			}
		};
	}
};

export const kycRouter = t.router({
	// Submit KYC personal information and create OTP
	submitKycInfo: protectedProcedure.input(submitKycInfoSchema).mutation(async ({ input, ctx }) => {
		try {
			// Check if user already has a KYC verification record
			const existingKyc = await prisma.kycVerification.findUnique({
				where: {
					userId: ctx.user.id
				}
			});

			// Get or create a non-expired OTP for the user
			const { otp, isNew } = await getOrCreateNonExpiredOtp(ctx.user.id);

			if (existingKyc) {
				// If existing KYC is already approved, don't allow new submission
				if (existingKyc.step2Status === 'APPROVED') {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'KYC already approved. Cannot submit new request.'
					});
				}

				// Update existing KYC verification record
				const kycVerification = await prisma.kycVerification.update({
					where: { id: existingKyc.id },
					data: {
						nationalId: input.nationalId,
						mobile: input.mobile,
						birthDate: new Date(input.birthDate),
						step1Status: 'PENDING',
						step1RejectedAt: null,
						step1RejectionReason: null,
						lastStepUpdatedAt: new Date(),
						updatedAt: new Date()
					}
				});

				// The OTP is handled by getOrCreateNonExpiredOtp, so no additional database operations needed here

				return {
					success: true,
					kycId: kycVerification.id,
					message: isNew
						? 'KYC information submitted successfully. New OTP has been sent to your mobile number.'
						: 'KYC information submitted successfully. Existing OTP has been extended.'
				};
			} else {
				// Create new KYC verification record
				const kycVerification = await prisma.kycVerification.create({
					data: {
						userId: ctx.user.id,
						nationalId: input.nationalId,
						mobile: input.mobile,
						birthDate: new Date(input.birthDate),
						step1Status: 'PENDING'
					}
				});

				// The OTP is handled by getOrCreateNonExpiredOtp, so no additional database operations needed here

				return {
					success: true,
					kycId: kycVerification.id,
					message: isNew
						? 'KYC information submitted successfully. New OTP has been sent to your mobile number.'
						: 'KYC information submitted successfully. Existing OTP has been extended.'
				};
			}
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to submit KYC information',
				cause: error
			});
		}
	}),

	// Get current KYC status
	getKycStatus: protectedProcedure.input(getKycStatusSchema).query(async ({ ctx }) => {
		try {
			// Get user's KYC verification record
			const kycVerification = await prisma.kycVerification.findUnique({
				where: {
					userId: ctx.user.id
				}
			});

			if (!kycVerification) {
				return {};
			}

			return {
				kycId: kycVerification.id,
				step1Status: kycVerification.step1Status,
				step2Status: kycVerification.step2Status,
				step1RejectedAt: kycVerification.step1RejectedAt?.toISOString() || null,
				step2RejectedAt: kycVerification.step2RejectedAt?.toISOString() || null,
				step1RejectionReason: kycVerification.step1RejectionReason || null,
				step2RejectionReason: kycVerification.step2RejectionReason || null,
				adminNotes: kycVerification.adminNotes || null,
				lastStepUpdatedAt: kycVerification.lastStepUpdatedAt.toISOString(),
				nationalId: kycVerification.nationalId,
				mobile: kycVerification.mobile,
				birthDate: kycVerification.birthDate.toISOString(),
				selfieMediaId: kycVerification.selfieMediaId || null,
				signedTextMediaId: kycVerification.signedTextMediaId || null,
				nationalCardMediaId: kycVerification.nationalCardMediaId || null
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch KYC status',
				cause: error
			});
		}
	}),

	// Admin: List pending KYC requests with filtering and pagination
	listKycRequests: adminProcedure.input(listPendingKycRequestsSchema).query(async ({ input }) => {
		try {
			// Build where clause for filtering
			const whereClause: Prisma.KycVerificationWhereInput = {};

			// Add search filter if provided
			if (input.search) {
				whereClause.user = {
					OR: [{ username: { contains: input.search } }, { email: { contains: input.search } }]
				};
			}

			// Add step1Status filter if provided
			if (input.step1Status) {
				whereClause.step1Status = input.step1Status;
			}

			// Add step2Status filter if provided
			if (input.step2Status) {
				whereClause.step2Status = input.step2Status;
			}

			// Get KYC verifications with user information
			const [kycVerifications, totalCount] = await Promise.all([
				prisma.kycVerification.findMany({
					where: whereClause,
					include: {
						user: {
							select: {
								id: true,
								username: true,
								email: true
							}
						}
					},
					orderBy: {
						createdAt: 'desc'
					},
					skip: input.offset,
					take: input.limit
				}),
				prisma.kycVerification.count({
					where: whereClause
				})
			]);

			// Format the response
			return {
				kycRequests: kycVerifications.map((kyc) => ({
					id: kyc.id,
					userId: kyc.userId,
					username: kyc.user?.username || null,
					email: kyc.user?.email || null,
					nationalId: kyc.nationalId,
					mobile: kyc.mobile,
					birthDate: kyc.birthDate.toISOString()
				})),
				totalCount,
				limit: input.limit,
				offset: input.offset
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch KYC requests',
				cause: error
			});
		}
	}),

	// Submit KYC step 2 media (signed image, selfie, national ID)
	submitKycStep2Media: protectedProcedure
		.input(submitKycStep2MediaSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				// Check if user has a KYC verification record
				const kycVerification = await prisma.kycVerification.findUnique({
					where: {
						userId: ctx.user.id
					}
				});

				if (!kycVerification) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'KYC verification record not found'
					});
				}

				// Check if step 1 is completed
				if (kycVerification.step1Status !== 'APPROVED') {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Step 1 verification must be completed and approved first'
					});
				}

				// Process file from context (now always a single file)
				const fileData = ctx.fileData as FileData | null;

				if (!fileData) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'No file data provided'
					});
				}

				// Process the file
				const result = await processKycFile(fileData, ctx);
				if (result.error) {
					throw new TRPCError({
						code: result.error.code,
						message: result.error.message
					});
				}

				// Update KYC verification with the appropriate media ID based on file type
				const updateData: any = {
					lastStepUpdatedAt: new Date(),
					updatedAt: new Date()
				};

				// Update the appropriate media ID based on file type
				switch (input.fileType) {
					case 'signedImage':
						updateData.signedTextMediaId = result.mediaId;
						break;
					case 'selfie':
						updateData.selfieMediaId = result.mediaId;
						break;
					case 'nationalIdImage':
						updateData.nationalCardMediaId = result.mediaId;
						break;
				}

				const updatedKyc = await prisma.kycVerification.update({
					where: { id: kycVerification.id },
					data: updateData
				});

				return {
					success: true,
					kycId: updatedKyc.id,
					message: `KYC ${input.fileType} uploaded successfully.`
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to upload KYC document',
					cause: error
				});
			}
		}),

	// Finalize KYC step 2 by checking all 3 media files are uploaded and setting step2Status to pending
	finalizeKycStep2: protectedProcedure.mutation(async ({ ctx }) => {
		try {
			// Check if user has a KYC verification record
			const kycVerification = await prisma.kycVerification.findUnique({
				where: {
					userId: ctx.user.id
				}
			});

			if (!kycVerification) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'KYC verification record not found'
				});
			}

			// Check if step 1 is completed
			if (kycVerification.step1Status !== 'APPROVED') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Step 1 verification must be completed and approved first'
				});
			}

			// Validate that all 3 media files are uploaded
			if (!kycVerification.signedTextMediaId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Signed text document is required'
				});
			}

			if (!kycVerification.selfieMediaId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Selfie image is required'
				});
			}

			if (!kycVerification.nationalCardMediaId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'National card image is required'
				});
			}

			// Update KYC verification status to pending for step 2
			const updatedKyc = await prisma.kycVerification.update({
				where: { id: kycVerification.id },
				data: {
					step2Status: 'PENDING',
					step2VerifiedAt: new Date(),
					lastStepUpdatedAt: new Date(),
					updatedAt: new Date()
				}
			});

			return {
				success: true,
				kycId: updatedKyc.id,
				message: 'KYC step 2 finalized successfully. Awaiting admin review.'
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to finalize KYC step 2',
				cause: error
			});
		}
	}),

	// Admin: Get detailed KYC information for a specific user
	getKycDetails: adminProcedure.input(getKycDetailsSchema).query(async ({ input }) => {
		try {
			// Get user's KYC verification record with all related data
			const kycVerification = await prisma.kycVerification.findUnique({
				where: {
					id: input.kycId
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
							email: true,
							createdAt: true
						}
					}
				}
			});

			if (!kycVerification) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'KYC verification record not found for this user'
				});
			}

			// Format the response
			return {
				id: kycVerification.id,
				userId: kycVerification.userId,
				username: kycVerification.user?.username || null,
				email: kycVerification.user?.email || null,
				userCreatedAt: kycVerification.user?.createdAt.toISOString() || null,
				step1Status: kycVerification.step1Status,
				step2Status: kycVerification.step2Status,
				step1RejectedAt: kycVerification.step1RejectedAt?.toISOString() || null,
				step2RejectedAt: kycVerification.step2RejectedAt?.toISOString() || null,
				step1RejectionReason: kycVerification.step1RejectionReason || null,
				step2RejectionReason: kycVerification.step2RejectionReason || null,
				adminNotes: kycVerification.adminNotes || null,
				lastStepUpdatedAt: kycVerification.lastStepUpdatedAt.toISOString(),
				nationalId: kycVerification.nationalId,
				mobile: kycVerification.mobile,
				birthDate: kycVerification.birthDate.toISOString(),
				selfieMediaId: kycVerification.selfieMediaId || null,
				signedTextMediaId: kycVerification.signedTextMediaId || null,
				nationalCardMediaId: kycVerification.nationalCardMediaId || null
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch KYC details',
				cause: error
			});
		}
	}),

	// Admin: Approve a KYC request
	approveKycRequest: adminProcedure
		.input(approveKycRequestSchema)
		.mutation(
			async ({ input, ctx }: { input: z.infer<typeof approveKycRequestSchema>; ctx: any }) => {
				try {
					// Get the KYC verification record with step status using helper function
					const kycVerification = await getKycVerificationById(input.kycId);

					// Determine which step to approve based on current status and create update data
					const { updateData, message } = createApprovalUpdateData(
						kycVerification,
						input.adminNotes
					);

					// Update KYC verification status
					const updatedKyc = await prisma.kycVerification.update({
						where: { id: kycVerification.id },
						data: updateData
					});

					// Format and return response using helper function
					return formatKycResponse(kycVerification, message);
				} catch (error) {
					if (error instanceof TRPCError) {
						throw error;
					}

					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Failed to approve KYC request',
						cause: error
					});
				}
			}
		),

	// Admin: Reject a KYC request with reason
	rejectKycRequest: adminProcedure
		.input(rejectKycRequestSchema)
		.mutation(
			async ({ input, ctx }: { input: z.infer<typeof rejectKycRequestSchema>; ctx: any }) => {
				try {
					// Get the KYC verification record with step status using helper function
					const kycVerification = await getKycVerificationById(input.kycId);

					// Determine which step to reject based on current status and create update data
					const { updateData, message } = createRejectionUpdateData(
						kycVerification,
						input.rejectionReason,
						input.adminNotes
					);

					// Update KYC verification status
					const updatedKyc = await prisma.kycVerification.update({
						where: { id: kycVerification.id },
						data: updateData
					});

					// Format and return response using helper function
					return formatKycResponse(kycVerification, message);
				} catch (error) {
					if (error instanceof TRPCError) {
						throw error;
					}

					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Failed to reject KYC request',
						cause: error
					});
				}
			}
		)
});
