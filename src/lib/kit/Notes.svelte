<script lang="ts">
	import Card from '$lib/kit/Card.svelte';

	export let title: string = 'نکات مهم';
	export let notes: { text: string; type: 'warning' | 'info' | 'success' }[] = [];
	export let className: string = '';

	function getNoteStyle(type: string) {
		switch (type) {
			case 'warning':
				return 'rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-4';
			case 'info':
				return 'rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4';
			case 'success':
				return 'rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4';
			default:
				return 'rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4';
		}
	}

	function getIconClass(type: string) {
		switch (type) {
			case 'warning':
				return 'icon-[heroicons--exclamation-triangle] shrink-0 me-2 mt-0.5 h-5 w-5 text-yellow-600';
			case 'info':
				return 'icon-[heroicons--information-circle] shrink-0 me-2 mt-0.5 h-5 w-5 text-blue-600';
			case 'success':
				return 'icon-[heroicons--check-circle] shrink-0 me-2 mt-0.5 h-5 w-5 text-green-600';
			default:
				return 'icon-[heroicons--information-circle] shrink-0 me-2 mt-0.5 h-5 w-5 text-gray-600';
		}
	}

	function getTextClass(type: string) {
		switch (type) {
			case 'warning':
				return 'text-yellow-700';
			case 'info':
				return 'text-blue-700';
			case 'success':
				return 'text-green-700';
			default:
				return 'text-gray-700';
		}
	}
</script>

<Card variant="elevated" {className}>
	<h3 class="flex items-center text-sm font-semibold text-gray-800">
		<span class="icon-[heroicons--exclamation-triangle] me-2 h-5 w-5 text-yellow-500"></span>
		{title}
	</h3>
	<div class="mt-4 space-y-4 text-sm">
		{#each notes as note}
			<div class={getNoteStyle(note.type)}>
				<div class="flex">
					<span class={getIconClass(note.type)}></span>
					<p class={getTextClass(note.type)}>
						{note.text}
					</p>
				</div>
			</div>
		{/each}
	</div>
</Card>
