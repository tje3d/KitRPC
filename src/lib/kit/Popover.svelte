<script lang="ts">
	import { onMount, tick } from 'svelte';

	/** @type {boolean} - Whether the popover is visible */
	export let visible: boolean = false;

	/** @type {string} - Position of the popover (top, bottom, left, right) */
	export let position: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'auto';

	/** @type {string} - Additional CSS classes for the popover container */
	export let className: string = '';

	/** @type {string} - Additional CSS classes for the trigger element */
	export let triggerClassName: string = '';

	/** @type {boolean} - Whether to show popover on hover */
	export let showOnHover: boolean = true;

	/** @type {boolean} - Whether to show popover on click */
	export let showOnClick: boolean = true;

	/** @type {number} - Offset from the trigger element in pixels */
	export let offset: number = 8;

	// State variables
	let isVisible = visible;
	let triggerElement: HTMLElement | null = null;
	let popoverElement: HTMLElement | null = null;
	let popoverStyles: Record<string, string> = {};

	// Update visibility when the visible prop changes
	$: isVisible = visible;

	// Handle hover events
	function handleMouseEnter() {
		if (showOnHover) {
			isVisible = true;
			// Wait for DOM update before calculating position
			tick().then(updatePosition);
		}
	}

	function handleMouseLeave() {
		if (showOnHover) {
			isVisible = false;
		}
	}

	// Handle click events
	function handleClick() {
		if (showOnClick) {
			isVisible = !isVisible;
			if (isVisible) {
				// Wait for DOM update before calculating position
				tick().then(updatePosition);
			}
		}
	}

	// Close popover when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (
			isVisible &&
			popoverElement &&
			!popoverElement.contains(event.target as Node) &&
			triggerElement &&
			!triggerElement.contains(event.target as Node)
		) {
			isVisible = false;
		}
	}

	// Update popover position
	function updatePosition() {
		if (!triggerElement || !popoverElement) return;

		const triggerRect = triggerElement.getBoundingClientRect();
		const popoverRect = popoverElement.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let top = 0;
		let left = 0;

		// Determine position based on available space if auto
		let finalPosition = position;
		if (position === 'auto') {
			// Calculate available space in each direction
			const spaceTop = triggerRect.top;
			const spaceBottom = viewportHeight - triggerRect.bottom;
			const spaceLeft = triggerRect.left;
			const spaceRight = viewportWidth - triggerRect.right;

			// Choose position with most available space
			const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
			if (maxSpace === spaceTop) finalPosition = 'top';
			else if (maxSpace === spaceBottom) finalPosition = 'bottom';
			else if (maxSpace === spaceLeft) finalPosition = 'left';
			else finalPosition = 'right';
		}

		// Calculate position based on finalPosition
		switch (finalPosition) {
			case 'top':
				top = triggerRect.top - popoverRect.height - offset;
				left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
				break;
			case 'bottom':
				top = triggerRect.bottom + offset;
				left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
				break;
			case 'left':
				top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
				left = triggerRect.left - popoverRect.width - offset;
				break;
			case 'right':
				top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
				left = triggerRect.right + offset;
				break;
		}

		// Ensure popover stays within viewport
		top = Math.max(0, Math.min(top, viewportHeight - popoverRect.height));
		left = Math.max(0, Math.min(left, viewportWidth - popoverRect.width));

		popoverStyles = {
			top: `${top}px`,
			left: `${left}px`
		};
	}

	// Lifecycle: Add event listeners
	function addEventListeners() {
		document.addEventListener('click', handleClickOutside);
		window.addEventListener('resize', updatePosition);
	}

	// Lifecycle: Remove event listeners
	function removeEventListeners() {
		document.removeEventListener('click', handleClickOutside);
		window.removeEventListener('resize', updatePosition);
	}

	onMount(() => {
		addEventListeners();
		if (isVisible) {
			// Wait for DOM update before calculating position
			tick().then(updatePosition);
		}

		return () => {
			removeEventListeners();
		};
	});
</script>

<div
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	on:click={handleClick}
	bind:this={triggerElement}
>
	<div class={triggerClassName}>
		<slot name="trigger" />
	</div>

	{#if isVisible}
		<div
			class={`fixed z-50 origin-center scale-100 transform rounded-lg border border-white/20 bg-white opacity-100 shadow-xl backdrop-blur-xl transition-all duration-200 ease-in-out ${className}`}
			bind:this={popoverElement}
			style={`top: ${popoverStyles.top}; left: ${popoverStyles.left};`}
		>
			<slot />
		</div>
	{/if}
</div>
