import { SvelteSubject } from '$lib/helpers/rxjs.helper';
import moment from 'moment-jalaali';

export type ValidationRule = {
	validate: (value: any, formData?: any) => boolean;
	message: (label: string) => string; // Changed to function that takes label
};

export type FieldConfig = {
	rules: ValidationRule[];
	label: string;
	condition?: (formData: any) => boolean;
};

export type FormConfig = {
	[key: string]: FieldConfig;
};

export type ValidationErrors = {
	[key: string]: string;
};

export const MESSAGES = {
	required: (label: string) => `${label} الزامی است`,
	email: (label: string) => `${label} نامعتبر است`,
	mobile: (label: string) => `${label} نامعتبر است`,
	strongPassword: (label: string) => `${label} ضعیف است`,
	passwordLength: (label: string) => `${label} باید حداقل ۸ کاراکتر باشد`,
	passwordMatch: (label: string) => `${label} با تکرار آن یکسان نیست`,
	verifyCodeLength: (label: string) => `${label} باید ۶ رقم باشد`,
	numeric: (label: string) => `${label} فقط باید شامل اعداد باشد`,
	nationalId: (label: string) => `${label} نامعتبر است`,
	jalaliDate: (label: string) => `${label} نامعتبر است`,
	gregorianDate: (label: string) => `${label} نامعتبر است`
};

export const rules = {
	required: {
		validate: (value: any) => !!value,
		message: MESSAGES.required
	},

	email: {
		validate: (value: string) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
		message: MESSAGES.email
	},

	mobile: {
		validate: (value: string) => value === '' || /^0?9[0-9]{9}$/.test(value),
		message: MESSAGES.mobile
	},

	minLength: (length: number) => ({
		validate: (value: string) => value === '' || value.length >= length,
		message: (label: string) => `${label} باید حداقل ${length} کاراکتر باشد`
	}),

	matches: (field: string, fieldLabel: string) => ({
		validate: (value: string, formData: any) => value === formData[field],
		message: (label: string) => `${label} با ${fieldLabel} یکسان نیست`
	}),

	notMatch: (field: string, fieldLabel: string) => ({
		validate: (value: string, formData: any) => value !== formData[field],
		message: (label: string) => `${label} با ${fieldLabel} نمیتواند یکسال باشد`
	}),

	numeric: {
		validate: (value: string) => value === '' || /^\d*\.?\d*$/.test(value),
		message: MESSAGES.numeric
	},

	nationalId: {
		validate: (value: string) => {
			if (!value) return true;

			const digits = value.replace(/\D/g, '');
			if (digits.length !== 10) return false;

			if (/^(\d)\1+$/.test(digits)) return false;

			const check = parseInt(digits[9]);
			let sum = 0;

			for (let i = 0; i < 9; i++) {
				sum += parseInt(digits[i]) * (10 - i);
			}

			const remainder = sum % 11;
			const calculatedCheck = remainder < 2 ? remainder : 11 - remainder;

			return check === calculatedCheck;
		},
		message: MESSAGES.nationalId
	},

	cardNumber: {
		validate: (value: string) => {
			if (!value) return true;

			// Remove any spaces or dashes
			const cleaned = value.replace(/[\s-]/g, '');

			// Check if it's exactly 16 digits
			return /^\d{16}$/.test(cleaned);
		},
		message: (label: string) => `${label} باید دقیقاً ۱۶ رقم باشد`
	},

	jalaliDate: (formats: string[] = ['jYYYY/jMM/jDD']) => ({
		validate: (value: string) => {
			if (!value) return true;

			for (const format of formats) {
				try {
					// Parse as Jalaali date using moment-jalaali
					const date = moment(value, format, true);
					if (date.isValid()) {
						return true;
					}
				} catch (error) {
					continue;
				}
			}
			return false; // None of the formats matched
		},
		message: MESSAGES.jalaliDate
	}),

	gregorianDate: (formats: string[] = ['YYYY/MM/DD']) => ({
		validate: (value: string) => {
			if (!value) return true;

			for (const format of formats) {
				if (value.length !== format.length) {
					continue;
				}

				// Use moment in Gregorian mode for validation
				const date = moment(value, format, true);
				if (date.isValid()) {
					return true;
				}
			}
			return false; // None of the formats matched
		},
		message: MESSAGES.gregorianDate
	})
};

export function useForm<T extends object>(formConfig: FormConfig) {
	const errors = new SvelteSubject<ValidationErrors | null>(null);
	const firstError = new SvelteSubject<string | null>(null);

	const validate = (formData: T) => {
		errors.next(null);
		firstError.next(null);

		let newErrors: ValidationErrors = {};
		let isEmpty = true;

		for (const [field, config] of Object.entries(formConfig)) {
			// Skip field validation if condition exists and is not met
			if (config.condition && !config.condition(formData)) {
				continue;
			}

			for (const rule of config.rules) {
				const isValid = rule.validate(formData[field as keyof T], formData);
				if (!isValid) {
					const msg = rule.message(config.label);

					if (firstError.value === null) {
						firstError.next(msg);
					}

					newErrors[field] = msg;
					isEmpty = false;
					break;
				}
			}
		}

		if (!isEmpty) {
			errors.next(newErrors);
		}

		return isEmpty;
	};

	const reset = () => {
		errors.next(null);
	};

	return {
		errors,
		validate,
		reset,
		firstError
	};
}
