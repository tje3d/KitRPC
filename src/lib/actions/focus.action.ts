interface FocusParams {
	delay?: number;
	disable?: boolean;
}

export default function Focus(node: HTMLElement, vars?: FocusParams) {
	// SSR guard - only run in browser environment
	if (typeof window === 'undefined') {
		return {
			update() {},
			destroy() {}
		};
	}

	const delay = vars?.delay || 0;
	let disable = !!vars?.disable;
	let timeoutId: number | null = null;

	function focusElement() {
		if (disable) return;
		
		if (delay > 0) {
			timeoutId = window.setTimeout(() => {
				node.focus();
			}, delay);
		} else {
			node.focus();
		}
	}

	// Focus the element when the action is applied
	focusElement();

	return {
		update(newVars?: FocusParams) {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			
			const newDelay = newVars?.delay || 0;
			const newDisable = !!newVars?.disable;
			
			if (delay !== newDelay || disable !== newDisable) {
				disable = newDisable;
				focusElement();
			}
		},
		destroy() {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		}
	};
}