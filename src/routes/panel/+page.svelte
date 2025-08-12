<script lang="ts">
	import Card from '$lib/kit/Card.svelte';
	import Button from '$lib/kit/Button.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
</script>

<PanelPageWrapper
	title="Dashboard"
	description="Welcome back! Here's what's happening with your projects today."
>
	<svelte:fragment slot="actions">
		<Button variant="secondary" className="px-4 py-2">Export Report</Button>
		<Button className="px-4 py-2">Create New</Button>
	</svelte:fragment>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card variant="flat" className="border-l-4 !border-blue-500">
			<div class="flex items-center">
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
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Total Projects</p>
					<p class="text-2xl font-bold text-gray-900">12</p>
				</div>
			</div>
			<div class="mt-4">
				<span class="inline-flex items-center text-sm text-green-600">
					<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"
						></path>
					</svg>
					12.5% from last month
				</span>
			</div>
		</Card>

		<Card variant="flat" className="border-l-4 !border-amber-500">
			<div class="flex items-center">
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
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Pending Tasks</p>
					<p class="text-2xl font-bold text-gray-900">29</p>
				</div>
			</div>
			<div class="mt-4">
				<span class="inline-flex items-center text-sm text-amber-600">
					<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"
						></path>
					</svg>
					5 tasks due soon
				</span>
			</div>
		</Card>

		<Card variant="flat" className="border-l-4 !border-green-500">
			<div class="flex items-center">
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
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Completed</p>
					<p class="text-2xl font-bold text-gray-900">24</p>
				</div>
			</div>
			<div class="mt-4">
				<span class="inline-flex items-center text-sm text-green-600">
					<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"
						></path>
					</svg>
					85% completion rate
				</span>
			</div>
		</Card>

		<Card variant="flat" className="border-l-4 !border-purple-500">
			<div class="flex items-center">
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
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-600">Team Members</p>
					<p class="text-2xl font-bold text-gray-900">8</p>
				</div>
			</div>
			<div class="mt-4">
				<span class="inline-flex items-center text-sm text-blue-600">
					<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
						></path>
					</svg>
					2 online now
				</span>
			</div>
		</Card>
	</div>

	<!-- Charts and Activity Section -->
	<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Performance Chart -->
		<Card variant="flat" className="lg:col-span-2">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-800">Performance Overview</h2>
				<Button variant="secondary" size="sm">View Report</Button>
			</div>
			<div class="mt-4 h-72">
				<!-- Chart Placeholder with enhanced design -->
				<div
					class="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
				>
					<div class="w-full text-center">
						<div
							class="bg-opacity-80 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow"
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
						<h3 class="text-lg font-semibold text-gray-800">Interactive Performance Dashboard</h3>
						<p class="mt-2 text-gray-600">Track your project progress and team productivity</p>
						<div class="mt-6 grid grid-cols-3 gap-4">
							<div class="bg-opacity-70 rounded-lg bg-white p-3 shadow-sm">
								<p class="text-sm text-gray-600">Completion Rate</p>
								<p class="text-xl font-bold text-blue-600">82%</p>
							</div>
							<div class="bg-opacity-70 rounded-lg bg-white p-3 shadow-sm">
								<p class="text-sm text-gray-600">On Time</p>
								<p class="text-xl font-bold text-green-600">94%</p>
							</div>
							<div class="bg-opacity-70 rounded-lg bg-white p-3 shadow-sm">
								<p class="text-sm text-gray-600">Avg. Duration</p>
								<p class="text-xl font-bold text-amber-600">14d</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>

		<!-- Recent Activity -->
		<Card variant="flat">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-800">Recent Activity</h2>
				<Button variant="secondary" size="sm">View All</Button>
			</div>
			<div class="mt-4 space-y-4">
				<div class="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
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
					<div class="ml-3 min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-gray-900">
							Project "Website Redesign" updated
						</p>
						<p class="mt-1 text-xs text-gray-500">by Alex Johnson • 2 hours ago</p>
					</div>
				</div>

				<div class="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
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
					<div class="ml-3 min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-gray-900">
							Task "Create wireframes" completed
						</p>
						<p class="mt-1 text-xs text-gray-500">by Sarah Williams • 5 hours ago</p>
					</div>
				</div>

				<div class="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
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
					<div class="ml-3 min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-gray-900">New task assigned</p>
						<p class="mt-1 text-xs text-gray-500">by Michael Chen • 1 day ago</p>
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
					<div class="ml-3 min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-gray-900">Team meeting scheduled</p>
						<p class="mt-1 text-xs text-gray-500">by Team Admin • 2 days ago</p>
					</div>
				</div>
			</div>
		</Card>
	</div>

	<!-- Projects and Tasks Overview -->
	<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Projects Overview -->
		<Card variant="flat">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-800">Project Status</h2>
				<Button variant="secondary" size="sm">View All</Button>
			</div>
			<div class="mt-4 space-y-4">
				<div class="flex items-center justify-between rounded-lg border border-gray-200 p-4">
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
							<h3 class="font-medium text-gray-900">Website Redesign</h3>
							<p class="text-sm text-gray-500">5/12 tasks completed</p>
						</div>
					</div>
					<div class="flex items-center">
						<div class="mr-2 h-2 w-32 rounded-full bg-gray-200">
							<div class="h-2 rounded-full bg-blue-600" style="width: 42%"></div>
						</div>
						<span class="text-sm font-medium text-gray-700">42%</span>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border border-gray-200 p-4">
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
							<h3 class="font-medium text-gray-900">Mobile App</h3>
							<p class="text-sm text-gray-500">8/10 tasks completed</p>
						</div>
					</div>
					<div class="flex items-center">
						<div class="mr-2 h-2 w-32 rounded-full bg-gray-200">
							<div class="h-2 rounded-full bg-green-600" style="width: 80%"></div>
						</div>
						<span class="text-sm font-medium text-gray-700">80%</span>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border border-gray-200 p-4">
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
							<h3 class="font-medium text-gray-900">Analytics Dashboard</h3>
							<p class="text-sm text-gray-500">2/15 tasks completed</p>
						</div>
					</div>
					<div class="flex items-center">
						<div class="mr-2 h-2 w-32 rounded-full bg-gray-200">
							<div class="h-2 rounded-full bg-purple-600" style="width: 13%"></div>
						</div>
						<span class="text-sm font-medium text-gray-700">13%</span>
					</div>
				</div>
			</div>
		</Card>

		<!-- Upcoming Tasks -->
		<Card variant="flat">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-800">Upcoming Tasks</h2>
				<Button variant="secondary" size="sm">View All</Button>
			</div>
			<div class="mt-4 space-y-4">
				<div class="flex items-center justify-between rounded-lg border border-gray-200 p-4">
					<div class="flex items-start">
						<input
							type="checkbox"
							class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<div class="ml-3">
							<h3 class="font-medium text-gray-900">Create wireframes for mobile app</h3>
							<div class="mt-1 flex items-center">
								<span class="inline-flex items-center text-xs text-amber-600">
									<svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									Due in 2 days
								</span>
								<span class="mx-2 text-gray-300">•</span>
								<span class="text-xs text-gray-500">Mobile App</span>
							</div>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border border-gray-200 p-4">
					<div class="flex items-start">
						<input
							type="checkbox"
							class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<div class="ml-3">
							<h3 class="font-medium text-gray-900">Update documentation for API endpoints</h3>
							<div class="mt-1 flex items-center">
								<span class="inline-flex items-center text-xs text-blue-600">
									<svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										></path>
									</svg>
									Due next week
								</span>
								<span class="mx-2 text-gray-300">•</span>
								<span class="text-xs text-gray-500">API Project</span>
							</div>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-between rounded-lg border border-gray-200 p-4">
					<div class="flex items-start">
						<input
							type="checkbox"
							class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<div class="ml-3">
							<h3 class="font-medium text-gray-900">Fix responsive issues on dashboard</h3>
							<div class="mt-1 flex items-center">
								<span class="inline-flex items-center text-xs text-amber-600">
									<svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									Due in 3 days
								</span>
								<span class="mx-2 text-gray-300">•</span>
								<span class="text-xs text-gray-500">Dashboard</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	</div>
</PanelPageWrapper>
