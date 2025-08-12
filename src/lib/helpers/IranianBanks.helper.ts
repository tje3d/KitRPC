// Iranian Bank Detection Helper
// Based on card number prefixes for Iranian banks

export interface IranianBankData {
	code: string;
	name: string;
	id: number;
	swift: string;
	prefixes: string[];
	color: string;
}

// Iranian banks data with their card number prefixes
const IRANIAN_BANKS: IranianBankData[] = [
	{
		id: 1,
		code: 'BMM',
		name: 'بانک ملت',
		swift: 'BKMTIR',
		prefixes: ['610433', '991975'],
		color: '#dc2626' // Red - Bank Mellat
	},
	{
		id: 2,
		code: 'BMI',
		name: 'بانک ملی ایران',
		swift: 'MELIIR',
		prefixes: ['170019', '603799'],
		color: '#9c9361' // Gold - National Bank of Iran
	},
	{
		id: 3,
		code: 'BEI',
		name: 'بانک اقتصاد نوین',
		swift: 'BKPAIR',
		prefixes: ['627412'],
		color: '#0d9488' // Teal - EN Bank
	},
	{
		id: 4,
		code: 'BAN',
		name: 'بانک انصار',
		swift: 'ANSBIR',
		prefixes: ['627381'],
		color: '#0891b2' // Cyan - Ansar Bank
	},
	{
		id: 5,
		code: 'BIZ',
		name: 'بانک ایران زمین',
		swift: 'IRZAIR',
		prefixes: ['505785'],
		color: '#65a30d' // Lime - Iran Zamin Bank
	},
	{
		id: 6,
		code: 'BPA',
		name: 'بانک پارسیان',
		swift: 'BKPAIR',
		prefixes: ['622106', '627884'],
		color: '#c2410c' // Orange - Parsian Bank
	},
	{
		id: 7,
		code: 'BPS',
		name: 'بانک پاسارگاد',
		swift: 'BKBPIR',
		prefixes: ['502229', '639347'],
		color: '#1d4ed8' // Blue - Pasargad Bank
	},
	{
		id: 8,
		code: 'BAY',
		name: 'بانک آینده',
		swift: 'AYBKIR',
		prefixes: ['636214'],
		color: '#8b5cf6' // Purple - Ayandeh Bank
	},
	{
		id: 9,
		code: 'BTV',
		name: 'بانک تجارت',
		swift: 'BTEJIR',
		prefixes: ['585983', '627353'],
		color: '#2563eb' // Blue - Tejarat Bank
	},
	{
		id: 10,
		code: 'BTO',
		name: 'بانک توسعه تعاون',
		swift: 'TTBIIR',
		prefixes: ['502908'],
		color: '#059669' // Green - Cooperative Development Bank
	},
	{
		id: 11,
		code: 'BTE',
		name: 'بانک توسعه صادرات',
		swift: 'EDBIIR',
		prefixes: ['207177', '627648'],
		color: '#10b981' // Emerald - Export Development Bank
	},
	{
		id: 12,
		code: 'BHI',
		name: 'بانک حکمت ایرانیان',
		swift: 'HEKMIR',
		prefixes: ['636949'],
		color: '#f59e0b' // Amber - Hekmat Iranian Bank
	},
	{
		id: 13,
		code: 'BDE',
		name: 'بانک دی',
		swift: 'DAYBIR',
		prefixes: ['502938'],
		color: '#0f766e' // Teal - Dey Bank
	},
	{
		id: 14,
		code: 'BRI',
		name: 'بانک رفاه کارگران',
		swift: 'REFAIR',
		prefixes: ['589463'],
		color: '#ea580c' // Orange - Refah Bank
	},
	{
		id: 15,
		code: 'BSA',
		name: 'بانک سامان',
		swift: 'SABCIR',
		prefixes: ['621986'],
		color: '#0369a1' // Blue - Saman Bank
	},
	{
		id: 16,
		code: 'BSE',
		name: 'بانک سپه',
		swift: 'SEPBIR',
		prefixes: ['589210'],
		color: '#1e40af' // Blue - Sepah Bank
	},
	{
		id: 17,
		code: 'BSR',
		name: 'بانک سرمایه',
		swift: 'SRMBIR',
		prefixes: ['639607'],
		color: '#7c3aed' // Violet - Sarmayeh Bank
	},
	{
		id: 18,
		code: 'BSI',
		name: 'بانک سینا',
		swift: 'SINAIR',
		prefixes: ['639346'],
		color: '#be185d' // Pink - Sina Bank
	},
	{
		id: 19,
		code: 'BSH',
		name: 'بانک شهر',
		swift: 'CIYBIR',
		prefixes: ['502806', '504706'],
		color: '#4338ca' // Indigo - Shahr Bank
	},
	{
		id: 20,
		code: 'BSI',
		name: 'بانک صادرات ایران',
		swift: 'BSIRIR',
		prefixes: ['603769', '903769'],
		color: '#059669' // Green - Export Bank of Iran
	},
	{
		id: 21,
		code: 'BSP',
		name: 'بانک صنعت و معدن',
		swift: 'BOIMIR',
		prefixes: ['627961'],
		color: '#7c3aed' // Purple - Industry and Mine Bank
	},
	{
		id: 22,
		code: 'BQM',
		name: 'بانک قرض الحسنه مهر',
		swift: '',
		prefixes: ['639370'],
		color: '#ef4444' // Red - Qarzol Hasaneh Mehr Bank
	},
	{
		id: 23,
		code: 'BQH',
		name: 'بانک قوامین',
		swift: 'GHAVIR',
		prefixes: ['639599'],
		color: '#06b6d4' // Cyan - Ghavamin Bank
	},
	{
		id: 24,
		code: 'BKA',
		name: 'بانک کارآفرین',
		swift: 'KBIDIR',
		prefixes: ['627488'],
		color: '#7c2d12' // Brown - Karafarin Bank
	},
	{
		id: 25,
		code: 'BKI',
		name: 'بانک کشاورزی',
		swift: 'KESHIR',
		prefixes: ['603770', '639217'],
		color: '#16a34a' // Green - Agricultural Bank
	},
	{
		id: 26,
		code: 'BGT',
		name: 'بانک گردشگری',
		swift: 'TOSMIR',
		prefixes: ['505416', '505426'],
		color: '#14b8a6' // Teal - Tourism Bank
	},
	{
		id: 27,
		code: 'BMC',
		name: 'بانک مرکزی ایران',
		swift: 'BMJIIR',
		prefixes: ['636797'],
		color: '#1f2937' // Gray - Central Bank of Iran
	},
	{
		id: 28,
		code: 'BMA',
		name: 'بانک مسکن',
		swift: 'BKMNIR',
		prefixes: ['628023'],
		color: '#ea580c' // Orange - Maskan Bank
	},
	{
		id: 29,
		code: 'BMI',
		name: 'بانک مهر ایران',
		swift: 'MEHRIR',
		prefixes: ['606373'],
		color: '#dc2626' // Red - Mehr Iran Bank
	},
	{
		id: 30,
		code: 'BPO',
		name: 'پست بانک ایران',
		swift: 'PBIRIR',
		prefixes: ['627760'],
		color: '#0891b2' // Cyan - Post Bank
	},
	{
		id: 31,
		code: 'BTO',
		name: 'موسسه اعتباری توسعه',
		swift: 'BTOSIR',
		prefixes: ['628157'],
		color: '#059669' // Green - Tosee Credit Institution
	},
	{
		id: 32,
		code: 'MKO',
		name: 'موسسه کوثر',
		swift: '',
		prefixes: ['505801'],
		color: '#6366f1' // Indigo - Kosar Institution
	},
	{
		id: 33,
		code: 'BRS',
		name: 'بانک رسالت',
		swift: 'RESBIR',
		prefixes: ['504172'],
		color: '#84cc16' // Lime - Resalat Bank
	},
	{
		id: 34,
		code: 'BKH',
		name: 'بانک خاورمیانه',
		swift: 'KHMIIR',
		prefixes: ['585949', '585947'],
		color: '#f97316' // Orange - Middle East Bank
	},
	{
		id: 35,
		code: 'MML',
		name: 'موسسه اعتباری ملل',
		swift: 'MELLIR',
		prefixes: ['606256'],
		color: '#8b5cf6' // Purple - Mellal Credit Institution
	}
];

/**
 * Generates icon path based on bank id
 * @param id - The bank id
 * @returns Icon path string
 */
function getBankIcon(id: number): string {
	return `/img/banks/${id}.svg`;
}

/**
 * Detects Iranian bank from card number
 * @param cardNumber - The card number (minimum 6 digits needed)
 * @returns BankDetail object or null if not found
 */
export function detectIranianBank(cardNumber: string): App.BankDetail | null {
	// Clean the card number (remove spaces, dashes, etc.)
	const cleanCardNumber = cardNumber.replace(/\D/g, '');

	// Need at least 6 digits to detect bank
	if (cleanCardNumber.length < 6) {
		return null;
	}

	// Check each bank's prefixes
	for (const bank of IRANIAN_BANKS) {
		for (const prefix of bank.prefixes) {
			if (cleanCardNumber.startsWith(prefix)) {
				return {
					id: bank.id,
					code: bank.code,
					name: bank.name,
					icon: getBankIcon(bank.id),
					swift: bank.swift,
					color: bank.color
				};
			}
		}
	}

	return null;
}

/**
 * Gets all available Iranian banks
 * @returns Array of all Iranian banks
 */
export function getAllIranianBanks(): App.BankDetail[] {
	return IRANIAN_BANKS.map((bank) => ({
		id: bank.id,
		code: bank.code,
		name: bank.name,
		icon: getBankIcon(bank.id),
		swift: bank.swift,
		color: bank.color
	}));
}

/**
 * Validates Iranian card number using Luhn algorithm
 * @param cardNumber - The card number to validate
 * @returns boolean indicating if the card number is valid
 */
export function validateIranianCardNumber(cardNumber: string): boolean {
	const cleanCardNumber = cardNumber.replace(/\D/g, '');

	if (cleanCardNumber.length !== 16) {
		return false;
	}

	// Luhn algorithm
	let sum = 0;
	let isEven = false;

	for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
		let digit = parseInt(cleanCardNumber.charAt(i), 10);

		if (isEven) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}

		sum += digit;
		isEven = !isEven;
	}

	return sum % 10 === 0;
}
