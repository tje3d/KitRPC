<script lang="ts">
	import Card from '$lib/kit/Card.svelte';
	import Button from '$lib/kit/Button.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
</script>

<PanelPageWrapper title="Dashboard" description="Welcome back! Here's what's happening today.">
	<svelte:fragment slot="actions">
		<Button variant="secondary" className="px-4 py-2">Export Report</Button>
		<Button className="px-4 py-2">Create New</Button>
	</svelte:fragment>

	<div class="rounded-lg bg-white p-6 shadow">
		<!-- Summary Cards -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			<Card compact className="flex flex-col items-center justify-center text-center">
				<div class="rounded-full bg-blue-100 p-3 text-blue-600">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						></path>
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-semibold text-gray-800">Projects</h3>
				<p class="text-3xl font-bold text-blue-600">12</p>
				<p class="mt-1 text-sm text-gray-500">+2 from last month</p>
			</Card>

			<Card compact className="flex flex-col items-center justify-center text-center">
				<div class="rounded-full bg-amber-100 p-3 text-amber-600">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						></path>
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-semibold text-gray-800">Tasks</h3>
				<p class="text-3xl font-bold text-amber-600">29</p>
				<p class="mt-1 text-sm text-gray-500">5 pending</p>
			</Card>

			<Card compact className="flex flex-col items-center justify-center text-center">
				<div class="rounded-full bg-green-100 p-3 text-green-600">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-semibold text-gray-800">Completed</h3>
				<p class="text-3xl font-bold text-green-600">24</p>
				<p class="mt-1 text-sm text-gray-500">+3 from last week</p>
			</Card>

			<Card compact className="flex flex-col items-center justify-center text-center">
				<div class="rounded-full bg-purple-100 p-3 text-purple-600">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						></path>
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-semibold text-gray-800">Team</h3>
				<p class="text-3xl font-bold text-purple-600">8</p>
				<p class="mt-1 text-sm text-gray-500">2 online</p>
			</Card>
		</div>

		<!-- Chart and Recent Activity -->
		<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Chart Placeholder -->
			<Card>
				<h2 class="mb-4 text-xl font-bold text-gray-800">Performance Overview</h2>
				<div class="h-64 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600"
							>
								<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									></path>
								</svg>
							</div>
							<h3 class="text-lg font-semibold text-gray-800">Performance Chart</h3>
							<p class="mt-2 text-gray-600">Interactive data visualization</p>
							<Button variant="secondary" className="mt-4 px-4 py-2">View Detailed Report</Button>
						</div>
					</div>
				</div>
			</Card>

			<!-- Recent Activity -->
			<Card>
				<h2 class="mb-4 text-xl font-bold text-gray-800">Recent Activity</h2>
				<div class="space-y-4">
					<div class="flex items-start">
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								></path>
							</svg>
						</div>
						<div class="ml-4">
							<h3 class="font-medium text-gray-800">Project "Website Redesign" was updated</h3>
							<p class="mt-1 text-sm text-gray-600">by Alex Johnson</p>
							<p class="mt-1 text-xs text-gray-500">2 hours ago</p>
						</div>
					</div>

					<div class="flex items-start">
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<div class="ml-4">
							<h3 class="font-medium text-gray-800">Task "Create wireframes" was completed</h3>
							<p class="mt-1 text-sm text-gray-600">by Sarah Williams</p>
							<p class="mt-1 text-xs text-gray-500">5 hours ago</p>
						</div>
					</div>

					<div class="flex items-start">
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<div class="ml-4">
							<h3 class="font-medium text-gray-800">
								New task "Review documentation" was assigned
							</h3>
							<p class="mt-1 text-sm text-gray-600">by Michael Chen</p>
							<p class="mt-1 text-xs text-gray-500">1 day ago</p>
						</div>
					</div>

					<div class="flex items-start">
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								></path>
							</svg>
						</div>
						<div class="ml-4">
							<h3 class="font-medium text-gray-800">Team meeting scheduled for tomorrow</h3>
							<p class="mt-1 text-sm text-gray-600">by Team Admin</p>
							<p class="mt-1 text-xs text-gray-500">2 days ago</p>
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
</PanelPageWrapper>
