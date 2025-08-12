<script lang="ts">
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import Button from '$lib/kit/Button.svelte';
</script>

<PanelPageWrapper
	title="Test Page"
	description="This is a test page to demonstrate the PanelPageWrapper component"
>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-semibold">Section 1</h2>
			<p class="text-gray-600">
				This is the first section of content within the panel page wrapper.
			</p>
		</div>
		<div class="rounded-lg bg-white p-6 shadow">
			<h2 class="mb-4 text-xl font-semibold">Section 2</h2>
			<p class="text-gray-600">
				This is the second section of content within the panel page wrapper.
			</p>
		</div>
	</div>

	<svelte:fragment slot="actions">
		<Button variant="secondary" className="px-4 py-2">Cancel</Button>
		<Button className="px-4 py-2">Save</Button>
	</svelte:fragment>
</PanelPageWrapper>
