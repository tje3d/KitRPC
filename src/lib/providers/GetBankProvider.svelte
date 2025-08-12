<script lang="ts">
	import { detectIranianBank } from '$lib/helpers/IranianBanks.helper';
	import { BehaviorSubject } from 'rxjs';

	export let cardNumber: string = '';
	export let onBankFound: ((bank: App.BankDetail) => void) | undefined = undefined;

	const bankResponse = new BehaviorSubject<App.BankDetail | null>(null);

	export function getBankFromCardNumber(cardNumber: string) {
		const bank = detectIranianBank(cardNumber);

		if (bank) {
			bankResponse.next(bank);
			if (onBankFound) {
				onBankFound(bank);
			}
		} else {
			bankResponse.next(null);
		}
	}

	// Auto-detect bank when cardNumber prop changes (only need 6 chars)
	$: if (cardNumber && cardNumber.length >= 6) {
		getBankFromCardNumber(cardNumber);
	} else {
		bankResponse.next(null);
	}
</script>

<slot bank={$bankResponse} {getBankFromCardNumber} />
