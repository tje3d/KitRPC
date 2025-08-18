<script lang="ts">
	import { detectIranianBank } from '$lib/helpers/IranianBanks.helper';

	export let cardNumber: string;

	// Format card number for display (add spaces every 4 digits)
	function formatCardNumber(number: string): string {
		const cleaned = number.replace(/\D/g, '');
		return cleaned.replace(/(\d{4})/g, '$1 ').trim();
	}

	$: formattedNumber = formatCardNumber(cardNumber);
	$: bankInfo = detectIranianBank(cardNumber);
</script>

<slot bank={bankInfo} {formattedNumber} />
