<script lang="ts" module>
	// Action configuration type
	export type ActionConfig = {
		id: string;
		label: string;
		variant?: 'primary' | 'secondary' | 'gradient' | 'gradient-secondary' | 'gradient-success';
		iconClass?: string;
		confirmation?: {
			title: string;
			message: string;
			confirm: string;
			cancel?: string;
			color?: string;
		};
		inputDialog?: {
			title: string;
			message: string;
			placeholder: string;
			confirm: string;
			cancel?: string;
			required?: boolean;
		};
		onClick: (input?: string) => void;
	};
</script>

<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import Button from '$lib/kit/Button.svelte';

	/** @type {ActionConfig[]} - Array of action configurations */
	export let actions: ActionConfig[] = [];

	/** @type {boolean} - Whether actions are loading */
	export let loading: boolean = false;

	/** @type {string} - Additional CSS classes */
	export let className: string = '';

	/** @type {'horizontal' | 'vertical'} - Layout direction */
	export let direction: 'horizontal' | 'vertical' = 'horizontal';

	/** @type {string} - Gap between buttons */
	export let gap: string = 'gap-2';

	// Handle action click
	function handleActionClick(action: ActionConfig) {
		if (action.confirmation) {
			// Show confirmation dialog
			dialogStore.open({
				component: ConfirmDialog,
				props: {
					title: action.confirmation.title,
					message: action.confirmation.message,
					confirm: action.confirmation.confirm,
					cancel: action.confirmation.cancel || 'لغو',
					color: action.confirmation.color || 'blue',
					onConfirm: () => {
						action.onClick();
					}
				}
			});
		} else if (action.inputDialog) {
			// Show input dialog using ConfirmDialog component
			dialogStore.open({
				component: ConfirmDialog,
				props: {
					title: action.inputDialog.title,
					message: action.inputDialog.message,
					confirm: action.inputDialog.confirm,
					cancel: action.inputDialog.cancel || 'لغو',
					showTextInput: true,
					textInputRequired: action.inputDialog.required !== false,
					textInputLabel: action.inputDialog.title,
					textInputPlaceholder: action.inputDialog.placeholder,
					onConfirm: (textInputValue?: string) => {
						if (textInputValue) {
							action.onClick(textInputValue);
						}
					}
				}
			});
		} else {
			// Direct action
			action.onClick();
		}
	}

	// Get container classes
	$: containerClasses = `flex ${direction === 'vertical' ? 'flex-col' : 'flex-wrap'} ${gap} ${className}`;
</script>

<div class={containerClasses}>
	{#each actions as action}
		<Button
			variant={action.variant || 'primary'}
			on:click={() => handleActionClick(action)}
			disabled={loading}
			className="flex items-center"
		>
			{#if action.iconClass}
				<span class={`icon-[${action.iconClass}] me-1 h-4 w-4`}></span>
			{/if}
			{action.label}
		</Button>
	{/each}
</div>
