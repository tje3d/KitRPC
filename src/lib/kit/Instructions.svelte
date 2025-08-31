<script lang="ts">
	import Card from '$lib/kit/Card.svelte';

	export let title: string = 'دستورالعمل‌ها';
	export let items: string[] = [];
	export let iconColor: string = 'text-blue-500';
	export let className: string = '';
</script>

<Card variant="elevated" {className}>
	<h3 class="flex items-center text-sm font-semibold text-gray-800">
		<span class="icon-[heroicons--information-circle] me-2 h-5 w-5 {iconColor}"></span>
		{title}
	</h3>
	<div class="mt-4 space-y-4">
		<ul class="space-y-3">
			{#each items as item, i}
				<li class="flex items-start">
					<span class="icon-[heroicons--check-circle] me-2 mt-0.5 h-5 w-5 shrink-0 text-green-500"
					></span>
					<span class="text-sm text-gray-600">{item}</span>
				</li>
			{/each}
		</ul>
	</div>
</Card>
