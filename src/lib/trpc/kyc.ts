import { prisma } from '$lib/prisma';
import {
	identityInquiry,
	shahkarInquiry,
	VerificationNetworkError,
	VerificationValidationError
} from '$lib/services/kyc-verification.service';
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
import moment from 'moment-jalaali';
import { createPermissionMiddleware, isAuthenticated } from './middleware';
import { t } from './trpc';

// اسکیماهای اعتبارسنجی ورودی
const submitKycInfoSchema = z.object({
	nationalId: z.string().length(10, 'کد ملی باید ۱۰ رقم باشد'),
	mobile: z.string().regex(/^09\d{9}$/, 'شماره موبایل باید در قالب ۰۹XXXXXXXXX باشد'),
	birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ تولد باید در قالب YYYY-MM-DD باشد')
});

const submitKycStep2MediaSchema = z.object({
	fileType: z.enum(['signedImage', 'selfie', 'nationalIdImage'])
	// توجه: فایل‌ها در hooks.server.ts پردازش شده و در context در دسترس خواهند بود
	// فایل‌های مورد انتظار: signedImage, selfie, nationalIdImage
});

// توجه: داده‌های فایل در hooks.server.ts پردازش شده و در context در دسترس خواهند بود
// فایل‌های مورد انتظار در ctx.fileData: signedImage, selfie, nationalIdImage

const getKycStatusSchema = z.object({});

// اسکیماهای اعتبارسنجی ورودی ادمین
const listPendingKycRequestsSchema = z.object({
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0),
	search: z.string().optional(),
	status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
	step1Status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
	step2Status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional()
});

const getKycDetailsSchema = z.object({
	kycId: z.string().min(1, 'شناسه KYC الزامی است')
});

const approveKycRequestSchema = z.object({
	kycId: z.string().min(1, 'شناسه KYC الزامی است'),
	adminNotes: z.string().optional()
});

const rejectKycRequestSchema = z.object({
	kycId: z.string().min(1, 'شناسه KYC الزامی است'),
	rejectionReason: z.string().min(1, 'دلیل رد الزامی است'),
	adminNotes: z.string().optional()
});

// پروسیجرهای محافظت شده
const protectedProcedure = t.procedure.use(isAuthenticated);
const adminOnly = createPermissionMiddleware('kyc', 'manage');
const adminProcedure = t.procedure.use(adminOnly);

// تابع کمکی برای پردازش آپلود فایل با اعتبارسنجی یکسان
interface ProcessFileResult {
	mediaId?: string;
	error?: {
		code: 'PAYLOAD_TOO_LARGE' | 'BAD_REQUEST';
		message: string;
	};
}

// نوع داده برای اطلاعات فایل از context
interface FileData {
	filename: string;
	mimeType: string;
	encoding: string;
	buffer: Buffer;
}

// تابع تأیید KYC در پس‌زمینه
const performKycVerification = async (
	kycId: string,
	nationalId: string,
	mobile: string,
	birthDate: string
): Promise<void> => {
	try {
		// مرحله ۱: تأیید شهکار (کد ملی + موبایل)
		await shahkarInquiry({
			nationalCode: nationalId,
			mobile: mobile
		});

		// تبدیل تاریخ تولد از تقویم میلادی به جلالی
		const jalaliBirthDate = moment(birthDate, 'YYYY-MM-DD').format('jYYYY-jMM-jDD');

		// مرحله ۲: دریافت اطلاعات هویتی (کد ملی + تاریخ تولد)
		const identityResult = await identityInquiry({
			nationalCode: nationalId,
			birthDate: jalaliBirthDate
		});

		// دریافت اطلاعات KYC برای به‌روزرسانی کاربر
		const kycRecord = await prisma.kycVerification.findUnique({
			where: { id: kycId },
			select: { userId: true }
		});

		if (!kycRecord) {
			throw new Error('KYC record not found');
		}

		// تأیید موفق - به‌روزرسانی اطلاعات کاربر و وضعیت KYC
		await Promise.all([
			// به‌روزرسانی اطلاعات کاربر
			prisma.user.update({
				where: { id: kycRecord.userId },
				data: {
					firstName: identityResult.firstName,
					lastName: identityResult.lastName,
					fatherName: identityResult.fatherName,
					updatedAt: new Date()
				}
			}),
			// به‌روزرسانی وضعیت KYC
			prisma.kycVerification.update({
				where: { id: kycId },
				data: {
					step1Status: 'APPROVED',
					step1VerifiedAt: new Date(),
					lastStepUpdatedAt: new Date(),
					updatedAt: new Date()
				}
			})
		]);
	} catch (error) {
		let rejectionReason = 'خطای سیستم در تأیید اطلاعات';

		if (error instanceof VerificationNetworkError) {
			// خطای شبکه - درخواست مجدد
			rejectionReason = 'خطای شبکه در تأیید اطلاعات. لطفاً مجدداً تلاش کنید';
		} else if (error instanceof VerificationValidationError) {
			// خطای اعتبارسنجی - عدم تطابق داده‌ها
			rejectionReason = error.message;
		}

		// به‌روزرسانی وضعیت به رد شده
		await prisma.kycVerification.update({
			where: { id: kycId },
			data: {
				step1Status: 'REJECTED',
				step1RejectedAt: new Date(),
				step1RejectionReason: rejectionReason,
				lastStepUpdatedAt: new Date(),
				updatedAt: new Date()
			}
		});
	}
};

const processKycFile = async (
	fileData: FileData,
	ctx: any,
	maxFileSize: number = 5 * 1024 * 1024, // پیش‌فرض ۵ مگابایت
	allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): Promise<ProcessFileResult> => {
	try {
		// اعتبارسنجی اندازه فایل
		if (fileData.buffer.length > maxFileSize) {
			return {
				error: {
					code: 'PAYLOAD_TOO_LARGE',
					message: `اندازه فایل از حد مجاز ${maxFileSize / (1024 * 1024)} مگابایت بیشتر است`
				}
			};
		}

		// اعتبارسنجی نوع فایل
		if (!allowedMimeTypes.includes(fileData.mimeType)) {
			return {
				error: {
					code: 'BAD_REQUEST',
					message: `نوع فایل مجاز نیست. فقط فایل‌های ${allowedMimeTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')} مجاز هستند.`
				}
			};
		}

		// ذخیره فایل با استفاده از سرویس رسانه
		const buffer = fileData.buffer;
		const savedFile = await saveMediaFile(buffer, ctx.user.id, fileData.filename);

		// ایجاد رکورد رسانه در پایگاه داده
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
				message: `خطا در پردازش فایل: ${error.message}`
			}
		};
	}
};

export const kycRouter = t.router({
	// ارسال اطلاعات شخصی KYC و ایجاد OTP
	submitKycInfo: protectedProcedure.input(submitKycInfoSchema).mutation(async ({ input, ctx }) => {
		try {
			// بررسی اینکه آیا کاربر قبلاً رکورد تأیید KYC دارد یا خیر
			const existingKyc = await prisma.kycVerification.findUnique({
				where: {
					userId: ctx.user.id
				}
			});

			// دریافت یا ایجاد OTP منقضی نشده برای کاربر
			const { otp, isNew } = await getOrCreateNonExpiredOtp(ctx.user.id);

			if (existingKyc) {
				// اگر KYC موجود قبلاً تأیید شده، اجازه ارسال جدید داده نمی‌شود
				if (existingKyc.step2Status === 'APPROVED') {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'KYC قبلاً تأیید شده است. امکان ارسال درخواست جدید وجود ندارد.'
					});
				}

				// به‌روزرسانی رکورد تأیید KYC موجود
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

				// شروع تأیید KYC در پس‌زمینه
				performKycVerification(kycVerification.id, input.nationalId, input.mobile, input.birthDate);

				// OTP توسط getOrCreateNonExpiredOtp مدیریت می‌شود، بنابراین عملیات اضافی پایگاه داده در اینجا لازم نیست

				return {
					success: true,
					kycId: kycVerification.id,
					message: isNew
						? 'اطلاعات KYC با موفقیت ارسال شد. OTP جدید به شماره موبایل شما ارسال شده است.'
						: 'اطلاعات KYC با موفقیت ارسال شد. OTP موجود تمدید شده است.'
				};
			} else {
				// ایجاد رکورد تأیید KYC جدید
				const kycVerification = await prisma.kycVerification.create({
					data: {
						userId: ctx.user.id,
						nationalId: input.nationalId,
						mobile: input.mobile,
						birthDate: new Date(input.birthDate),
						step1Status: 'PENDING'
					}
				});

				// شروع تأیید KYC در پس‌زمینه
				performKycVerification(kycVerification.id, input.nationalId, input.mobile, input.birthDate);

				// The OTP is handled by getOrCreateNonExpiredOtp, so no additional database operations needed here

				return {
					success: true,
					kycId: kycVerification.id,
					message: isNew
						? 'اطلاعات KYC با موفقیت ارسال شد. OTP جدید به شماره موبایل شما ارسال شده است.'
						: 'اطلاعات KYC با موفقیت ارسال شد. OTP موجود تمدید شده است.'
				};
			}
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'خطا در ارسال اطلاعات KYC',
				cause: error
			});
		}
	}),

	// دریافت وضعیت فعلی KYC
	getKycStatus: protectedProcedure.input(getKycStatusSchema).query(async ({ ctx }) => {
		try {
			// دریافت رکورد تأیید KYC کاربر
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
				step1RejectedAt: kycVerification.step1RejectedAt,
				step2RejectedAt: kycVerification.step2RejectedAt,
				step1RejectionReason: kycVerification.step1RejectionReason || null,
				step2RejectionReason: kycVerification.step2RejectionReason || null,
				adminNotes: kycVerification.adminNotes || null,
				lastStepUpdatedAt: kycVerification.lastStepUpdatedAt.toISOString(),
				nationalId: kycVerification.nationalId,
				mobile: kycVerification.mobile,
				birthDate: kycVerification.birthDate,
				selfieMediaId: kycVerification.selfieMediaId || null,
				signedTextMediaId: kycVerification.signedTextMediaId || null,
				nationalCardMediaId: kycVerification.nationalCardMediaId || null
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'خطا در دریافت وضعیت KYC',
				cause: error
			});
		}
	}),

	// ادمین: فهرست درخواست‌های KYC در انتظار با فیلتر و صفحه‌بندی
	listKycRequests: adminProcedure.input(listPendingKycRequestsSchema).query(async ({ input }) => {
		try {
			// ساخت شرط where برای فیلتر کردن
			const whereClause: Prisma.KycVerificationWhereInput = {};

			// اضافه کردن فیلتر جستجو در صورت ارائه
			if (input.search) {
				whereClause.user = {
					OR: [{ username: { contains: input.search } }, { email: { contains: input.search } }]
				};
			}

			// اضافه کردن فیلتر step1Status در صورت ارائه
			if (input.step1Status) {
				whereClause.step1Status = input.step1Status;
			}

			// اضافه کردن فیلتر step2Status در صورت ارائه
			if (input.step2Status) {
				whereClause.step2Status = input.step2Status;
			}

			// دریافت تأییدات KYC همراه با اطلاعات کاربر
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

			// قالب‌بندی پاسخ
			return {
				kycRequests: kycVerifications,
				totalCount,
				limit: input.limit,
				offset: input.offset
			};
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'خطا در دریافت درخواست‌های KYC',
				cause: error
			});
		}
	}),

	// ارسال رسانه مرحله ۲ KYC (تصویر امضا شده، سلفی، کارت ملی)
	submitKycStep2Media: protectedProcedure
		.input(submitKycStep2MediaSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				// بررسی اینکه آیا کاربر رکورد تأیید KYC دارد یا خیر
				const kycVerification = await prisma.kycVerification.findUnique({
					where: {
						userId: ctx.user.id
					}
				});

				if (!kycVerification) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'رکورد تأیید KYC یافت نشد'
					});
				}

				// بررسی اینکه آیا مرحله ۱ تکمیل شده یا خیر
				if (kycVerification.step1Status !== 'APPROVED') {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'ابتدا باید تأیید مرحله ۱ تکمیل و تأیید شود'
					});
				}

				// پردازش فایل از context (اکنون همیشه یک فایل)
				const fileData = ctx.fileData as FileData | null;

				if (!fileData) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'هیچ داده فایلی ارائه نشده'
					});
				}

				// پردازش فایل
				const result = await processKycFile(fileData, ctx);
				if (result.error) {
					throw new TRPCError({
						code: result.error.code,
						message: result.error.message
					});
				}

				// به‌روزرسانی تأیید KYC با شناسه رسانه مناسب بر اساس نوع فایل
				const updateData: any = {
					lastStepUpdatedAt: new Date(),
					updatedAt: new Date()
				};

				// به‌روزرسانی شناسه رسانه مناسب بر اساس نوع فایل
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
					message: `${input.fileType} KYC با موفقیت آپلود شد.`
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'خطا در آپلود سند KYC',
					cause: error
				});
			}
		}),

	// نهایی کردن مرحله ۲ KYC با بررسی آپلود شدن هر ۳ فایل رسانه و تنظیم step2Status روی pending
	finalizeKycStep2: protectedProcedure.mutation(async ({ ctx }) => {
		try {
			// بررسی اینکه آیا کاربر رکورد تأیید KYC دارد یا خیر
			const kycVerification = await prisma.kycVerification.findUnique({
				where: {
					userId: ctx.user.id
				}
			});

			if (!kycVerification) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'رکورد تأیید KYC یافت نشد'
				});
			}

			// بررسی اینکه آیا مرحله ۱ تکمیل شده یا خیر
			if (kycVerification.step1Status !== 'APPROVED') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'ابتدا باید تأیید مرحله ۱ تکمیل و تأیید شود'
				});
			}

			// اعتبارسنجی اینکه هر ۳ فایل رسانه آپلود شده‌اند
			if (!kycVerification.signedTextMediaId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'سند متن امضا شده الزامی است'
				});
			}

			if (!kycVerification.selfieMediaId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'تصویر سلفی الزامی است'
				});
			}

			if (!kycVerification.nationalCardMediaId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'تصویر کارت ملی الزامی است'
				});
			}

			// به‌روزرسانی وضعیت تأیید KYC به pending برای مرحله ۲
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
				message: 'مرحله ۲ KYC با موفقیت نهایی شد. در انتظار بررسی ادمین.'
			};
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'خطا در نهایی کردن مرحله ۲ KYC',
				cause: error
			});
		}
	}),

	// ادمین: دریافت اطلاعات تفصیلی KYC برای کاربر خاص
	getKycDetails: adminProcedure.input(getKycDetailsSchema).query(async ({ input }) => {
		try {
			// دریافت رکورد تأیید KYC کاربر همراه با تمام داده‌های مرتبط
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
					message: 'رکورد تأیید KYC برای این کاربر یافت نشد'
				});
			}

			// قالب‌بندی پاسخ
			return {
				id: kycVerification.id,
				userId: kycVerification.userId,
				username: kycVerification.user?.username || null,
				email: kycVerification.user?.email || null,
				userCreatedAt: kycVerification.user?.createdAt,
				step1Status: kycVerification.step1Status,
				step2Status: kycVerification.step2Status,
				step1RejectedAt: kycVerification.step1RejectedAt,
				step2RejectedAt: kycVerification.step2RejectedAt,
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
				message: 'خطا در دریافت جزئیات KYC',
				cause: error
			});
		}
	}),

	// ادمین: تأیید درخواست KYC
	approveKycRequest: adminProcedure
		.input(approveKycRequestSchema)
		.mutation(
			async ({ input, ctx }: { input: z.infer<typeof approveKycRequestSchema>; ctx: any }) => {
				try {
					// دریافت رکورد تأیید KYC همراه با وضعیت مرحله با استفاده از تابع کمکی
					const kycVerification = await getKycVerificationById(input.kycId);

					// تعیین اینکه کدام مرحله بر اساس وضعیت فعلی تأیید شود و ایجاد داده‌های به‌روزرسانی
					const { updateData, message } = createApprovalUpdateData(
						kycVerification,
						input.adminNotes
					);

					// به‌روزرسانی وضعیت تأیید KYC
					const updatedKyc = await prisma.kycVerification.update({
						where: { id: kycVerification.id },
						data: updateData
					});

					// قالب‌بندی و بازگرداندن پاسخ با استفاده از تابع کمکی
					return formatKycResponse(kycVerification, message);
				} catch (error) {
					if (error instanceof TRPCError) {
						throw error;
					}

					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'خطا در تأیید درخواست KYC',
						cause: error
					});
				}
			}
		),

	// ادمین: رد درخواست KYC با دلیل
	rejectKycRequest: adminProcedure
		.input(rejectKycRequestSchema)
		.mutation(
			async ({ input, ctx }: { input: z.infer<typeof rejectKycRequestSchema>; ctx: any }) => {
				try {
					// دریافت رکورد تأیید KYC همراه با وضعیت مرحله با استفاده از تابع کمکی
					const kycVerification = await getKycVerificationById(input.kycId);

					// تعیین اینکه کدام مرحله بر اساس وضعیت فعلی رد شود و ایجاد داده‌های به‌روزرسانی
					const { updateData, message } = createRejectionUpdateData(
						kycVerification,
						input.rejectionReason,
						input.adminNotes
					);

					// به‌روزرسانی وضعیت تأیید KYC
					const updatedKyc = await prisma.kycVerification.update({
						where: { id: kycVerification.id },
						data: updateData
					});

					// قالب‌بندی و بازگرداندن پاسخ با استفاده از تابع کمکی
					return formatKycResponse(kycVerification, message);
				} catch (error) {
					if (error instanceof TRPCError) {
						throw error;
					}

					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'خطا در رد درخواست KYC',
						cause: error
					});
				}
			}
		)
});
