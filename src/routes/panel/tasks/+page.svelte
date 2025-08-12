<script lang="ts">
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
</script>

<PanelPageWrapper title="Tasks" description="Manage your tasks and track your progress.">
	<svelte:fragment slot="actions">
		<Button className="px-4 py-2">Add New Task</Button>
	</svelte:fragment>

	<!-- Task Overview Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card variant="flat" className="border-s-4 border-blue-500">
			<div class="flex items-center">
				<div class="rounded-full bg-blue-100 p-3 text-blue-600">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						></path>
					</svg>
				</div>
				<div class="ms-4">
					<p class="text-sm font-medium text-gray-600">Total Tasks</p>
					<p class="text-2xl font-bold text-gray-900">29</p>
				</div>
			</div>
		</Card>

		<Card variant="flat" className="border-s-4 border-green-500">
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
				<div class="ms-4">
					<p class="text-sm font-medium text-gray-600">Completed</p>
					<p class="text-2xl font-bold text-gray-900">12</p>
				</div>
			</div>
		</Card>

		<Card variant="flat" className="border-s-4 border-amber-500">
			<div class="flex items-center">
				<div class="rounded-full bg-amber-100 p-3 text-amber-600">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
				</div>
				<div class="ms-4">
					<p class="text-sm font-medium text-gray-600">Pending</p>
					<p class="text-2xl font-bold text-gray-900">17</p>
				</div>
			</div>
		</Card>

		<Card variant="flat" className="border-s-4 border-purple-500">
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
				<div class="ms-4">
					<p class="text-sm font-medium text-gray-600">High Priority</p>
					<p class="text-2xl font-bold text-gray-900">8</p>
				</div>
			</div>
		</Card>
	</div>

	<!-- Tasks List -->
	<Card variant="flat" className="mt-6">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-lg font-bold text-gray-800">All Tasks</h2>
				<p class="mt-1 text-sm text-gray-600">List of all your pending and completed tasks</p>
			</div>
			<div class="mt-4 flex space-x-3 sm:mt-0">
				<select
					class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
				>
					<option>All Statuses</option>
					<option>Pending</option>
					<option>In Progress</option>
					<option>Completed</option>
				</select>
				<select
					class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
				>
					<option>All Priorities</option>
					<option>Low</option>
					<option>Medium</option>
					<option>High</option>
				</select>
			</div>
		</div>

		<div class="mt-6 overflow-hidden rounded-lg border border-gray-200">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Task</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Project</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Priority</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Assignee</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Due Date</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Status</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					<tr class="hover:bg-gray-50">
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="flex items-center">
								<input
									type="checkbox"
									class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<div class="ms-4">
									<div class="text-sm font-medium text-gray-900">
										Create wireframes for mobile app
									</div>
									<div class="text-sm text-gray-500">Design team</div>
								</div>
							</div>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Mobile App</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full bg-amber-100 px-2 text-xs leading-5 font-semibold text-amber-800"
							>
								High
							</span>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
							<div class="flex items-center">
								<img
									class="h-8 w-8 rounded-full"
									src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
									alt="Assignee"
								/>
								<span class="ms-2">Sarah Williams</span>
							</div>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Jun 10, 2023</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800"
							>
								In Progress
							</span>
						</td>
						<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
							<Button variant="secondary" size="sm">Edit</Button>
						</td>
					</tr>
					<tr class="hover:bg-gray-50">
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="flex items-center">
								<input
									type="checkbox"
									class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									checked
								/>
								<div class="ms-4">
									<div class="text-sm font-medium text-gray-900 line-through">
										Review project requirements
									</div>
									<div class="text-sm text-gray-500">Documentation</div>
								</div>
							</div>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Website Redesign</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800"
							>
								Low
							</span>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
							<div class="flex items-center">
								<img
									class="h-8 w-8 rounded-full"
									src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
									alt="Assignee"
								/>
								<span class="ms-2">John Doe</span>
							</div>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Jun 5, 2023</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800"
							>
								Completed
							</span>
						</td>
						<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
							<Button variant="secondary" size="sm">Edit</Button>
						</td>
					</tr>
					<tr class="hover:bg-gray-50">
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="flex items-center">
								<input
									type="checkbox"
									class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<div class="ms-4">
									<div class="text-sm font-medium text-gray-900">
										Update documentation for API endpoints
									</div>
									<div class="text-sm text-gray-500">API Development</div>
								</div>
							</div>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Analytics Dashboard</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800"
							>
								Medium
							</span>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
							<div class="flex items-center">
								<img
									class="h-8 w-8 rounded-full"
									src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
									alt="Assignee"
								/>
								<span class="ms-2">Alex Johnson</span>
							</div>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Jun 15, 2023</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full bg-amber-100 px-2 text-xs leading-5 font-semibold text-amber-800"
							>
								Pending
							</span>
						</td>
						<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
							<Button variant="secondary" size="sm">Edit</Button>
						</td>
					</tr>
					<tr class="hover:bg-gray-50">
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="flex items-center">
								<input
									type="checkbox"
									class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<div class="ms-4">
									<div class="text-sm font-medium text-gray-900">
										Fix responsive issues on dashboard
									</div>
									<div class="text-sm text-gray-500">Frontend Development</div>
								</div>
							</div>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Analytics Dashboard</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full bg-amber-100 px-2 text-xs leading-5 font-semibold text-amber-800"
							>
								High
							</span>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
							<div class="flex items-center">
								<img
									class="h-8 w-8 rounded-full"
									src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
									alt="Assignee"
								/>
								<span class="ms-2">Michael Chen</span>
							</div>
						</td>
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Jun 12, 2023</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span
								class="inline-flex rounded-full bg-amber-100 px-2 text-xs leading-5 font-semibold text-amber-800"
							>
								Pending
							</span>
						</td>
						<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
							<Button variant="secondary" size="sm">Edit</Button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		<div class="mt-6 flex items-center justify-between">
			<div class="text-sm text-gray-700">
				Showing <span class="font-medium">1</span> to <span class="font-medium">4</span> of{' '}
				<span class="font-medium">29</span> results
			</div>
			<div class="flex space-x-2">
				<Button variant="secondary" size="sm">Previous</Button>
				<Button variant="secondary" size="sm">Next</Button>
			</div>
		</div>
	</Card>
</PanelPageWrapper>
