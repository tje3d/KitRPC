<script lang="ts">
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import Button from '$lib/kit/Button.svelte';
</script>

<PanelPageWrapper title="Projects">
	<svelte:fragment slot="actions">
		<Button className="px-4 py-2">Create New Project</Button>
	</svelte:fragment>

	<div class="rounded-lg bg-white p-6 shadow">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-gray-700">Active Projects</h2>
			<button class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
				Create New Project
			</button>
		</div>

		<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-lg border border-gray-200 p-4 hover:shadow-md">
				<div class="flex items-center">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							></path>
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="font-semibold text-gray-800">Website Redesign</h3>
						<p class="text-sm text-gray-500">Updated 2 hours ago</p>
					</div>
				</div>
				<div class="mt-4 flex items-center justify-between">
					<span class="text-sm text-gray-500">5/12 tasks completed</span>
					<span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
						>In Progress</span
					>
				</div>
				<div class="mt-2 h-2 rounded-full bg-gray-200">
					<div class="h-2 rounded-full bg-blue-600" style="width: 42%"></div>
				</div>
			</div>

			<div class="rounded-lg border border-gray-200 p-4 hover:shadow-md">
				<div class="flex items-center">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
							></path>
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="font-semibold text-gray-800">Mobile App Development</h3>
						<p class="text-sm text-gray-500">Updated 1 day ago</p>
					</div>
				</div>
				<div class="mt-4 flex items-center justify-between">
					<span class="text-sm text-gray-500">8/10 tasks completed</span>
					<span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
						>Almost Done</span
					>
				</div>
				<div class="mt-2 h-2 rounded-full bg-gray-200">
					<div class="h-2 rounded-full bg-green-600" style="width: 80%"></div>
				</div>
			</div>

			<div class="rounded-lg border border-gray-200 p-4 hover:shadow-md">
				<div class="flex items-center">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600"
					>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							></path>
						</svg>
					</div>
					<div class="ml-4">
						<h3 class="font-semibold text-gray-800">Analytics Dashboard</h3>
						<p class="text-sm text-gray-500">Updated 3 days ago</p>
					</div>
				</div>
				<div class="mt-4 flex items-center justify-between">
					<span class="text-sm text-gray-500">2/15 tasks completed</span>
					<span class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
						>Planning</span
					>
				</div>
				<div class="mt-2 h-2 rounded-full bg-gray-200">
					<div class="h-2 rounded-full bg-purple-600" style="width: 13%"></div>
				</div>
			</div>
		</div>
	</div>
</PanelPageWrapper>
