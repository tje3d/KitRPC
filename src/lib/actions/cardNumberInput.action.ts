interface CardNumberInputParams {
	maxLength?: number;
	disable?: boolean;
	onUpdate?: (formattedValue: string, cleanedValue: string) => void;
}

export default function cardNumberInput(node: HTMLInputElement, vars?: CardNumberInputParams) {
	// SSR guard - only run in browser environment
	if (typeof window === 'undefined') {
		return {
			update() {},
			destroy() {}
		};
	}

	const maxLength = vars?.maxLength || 16;
	let disable = !!vars?.disable;
	let onUpdate = vars?.onUpdate;

	// Format a card number value
	function formatValue(value: string): { formatted: string; cleaned: string } {
		const cleanedValue = value.replace(/\D/g, ''); // Remove non-digits
		const limitedValue = cleanedValue.substring(0, maxLength);
		const formattedValue = limitedValue.replace(/(\d{4})/g, '$1 ').trim();
		return { formatted: formattedValue, cleaned: limitedValue };
	}

	// Apply formatting on initialize
	if (!disable) {
		const initialValue = formatValue(node.value);
		node.value = initialValue.formatted;
		if (onUpdate) {
			onUpdate(initialValue.formatted, initialValue.cleaned);
		}
	}

	function handleInput(event: Event) {
		if (disable) return;

		const input = event.target as HTMLInputElement;
		let value = input.value.replace(/\D/g, ''); // Remove non-digits

		// Limit to specified max length
		if (value.length > maxLength) {
			value = value.substring(0, maxLength);
		}

		// Add spaces every 4 digits
		const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();

		// Update the input value
		input.value = formattedValue;

		// Call the update callback if provided
		if (onUpdate) {
			onUpdate(formattedValue, value);
		}
	}

	function handlePaste(event: ClipboardEvent) {
		if (disable) return;

		// Let the paste happen, then format it
		setTimeout(() => {
			handleInput(event);
		}, 0);
	}

	// Add event listeners
	node.addEventListener('input', handleInput);
	node.addEventListener('paste', handlePaste);

	return {
		update(newVars?: CardNumberInputParams) {
			const newMaxLength = newVars?.maxLength || 16;
			const newDisable = !!newVars?.disable;
			const newOnUpdate = newVars?.onUpdate;

			disable = newDisable;
			onUpdate = newOnUpdate;
		},
		destroy() {
			node.removeEventListener('input', handleInput);
			node.removeEventListener('paste', handlePaste);
		}
	};
}
