<script lang="ts">
	export let cardNumber: string;
	export let className: string = '';

	// Format card number for display (add spaces every 4 digits)
	function formatCardNumber(number: string): string {
		const cleaned = number.replace(/\D/g, '');
		return cleaned.replace(/(\d{4})/g, '$1 ').trim();
	}

	$: formattedNumber = formatCardNumber(cardNumber);
</script>

<span dir="ltr" class={className}>
	{formattedNumber}
</span>
