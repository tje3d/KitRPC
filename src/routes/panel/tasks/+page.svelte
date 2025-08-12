<script lang="ts">
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-800">Tasks</h1>

	<div class="rounded-lg bg-white p-6 shadow">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-gray-700">My Tasks</h2>
			<button class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
				Add New Task
			</button>
		</div>

		<div class="mt-6 space-y-4">
			<div class="flex items-center rounded-lg border border-gray-200 p-4 hover:shadow-md">
				<input
					type="checkbox"
					class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<div class="ml-4 flex-1">
					<h3 class="font-semibold text-gray-800">Create wireframes for mobile app</h3>
					<p class="text-sm text-gray-500">Due in 2 days</p>
				</div>
				<span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
					>High Priority</span
				>
			</div>

			<div class="flex items-center rounded-lg border border-gray-200 p-4 hover:shadow-md">
				<input
					type="checkbox"
					class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					checked
				/>
				<div class="ml-4 flex-1">
					<h3 class="font-semibold text-gray-800 line-through">Review project requirements</h3>
					<p class="text-sm text-gray-500">Completed yesterday</p>
				</div>
				<span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
					>Completed</span
				>
			</div>

			<div class="flex items-center rounded-lg border border-gray-200 p-4 hover:shadow-md">
				<input
					type="checkbox"
					class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<div class="ml-4 flex-1">
					<h3 class="font-semibold text-gray-800">Update documentation for API endpoints</h3>
					<p class="text-sm text-gray-500">Due next week</p>
				</div>
				<span class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
					>Medium Priority</span
				>
			</div>

			<div class="flex items-center rounded-lg border border-gray-200 p-4 hover:shadow-md">
				<input
					type="checkbox"
					class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<div class="ml-4 flex-1">
					<h3 class="font-semibold text-gray-800">Fix responsive issues on dashboard</h3>
					<p class="text-sm text-gray-500">Due in 3 days</p>
				</div>
				<span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
					>High Priority</span
				>
			</div>
		</div>
	</div>
</div>
