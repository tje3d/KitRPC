<script lang="ts">
	import Card from '$lib/kit/Card.svelte';
	import Button from '$lib/kit/Button.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
</script>

<PanelPageWrapper title="Settings" description="Manage your account settings and preferences.">
	<svelte:fragment slot="actions">
		<Button variant="secondary" className="px-4 py-2">Cancel</Button>
		<Button className="px-4 py-2">Save Changes</Button>
	</svelte:fragment>

	<div class="space-y-6">
		<!-- Profile Settings -->
		<Card variant="flat">
			<h2 class="text-lg font-bold text-gray-800">Profile Information</h2>
			<p class="mt-1 text-sm text-gray-600">Update your profile details and contact information.</p>

			<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
					<input
						type="text"
						id="name"
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						placeholder="John Doe"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
					<input
						type="email"
						id="email"
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						placeholder="john@example.com"
					/>
				</div>

				<div>
					<label for="title" class="block text-sm font-medium text-gray-700">Job Title</label>
					<input
						type="text"
						id="title"
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						placeholder="Project Manager"
					/>
				</div>

				<div>
					<label for="department" class="block text-sm font-medium text-gray-700">Department</label>
					<input
						type="text"
						id="department"
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						placeholder="Engineering"
					/>
				</div>
			</div>

			<div class="mt-6">
				<label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
				<textarea
					id="bio"
					rows={4}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
					placeholder="Tell us about yourself..."
				></textarea>
			</div>
		</Card>

		<!-- Account Settings -->
		<Card variant="flat">
			<h2 class="text-lg font-bold text-gray-800">Account Settings</h2>
			<p class="mt-1 text-sm text-gray-600">
				Manage your account preferences and security settings.
			</p>

			<div class="mt-6 space-y-6">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
						<p class="text-sm text-gray-600">Add an extra layer of security to your account.</p>
					</div>
					<Button variant="secondary" size="sm">Enable</Button>
				</div>

				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-sm font-medium text-gray-900">Login Notifications</h3>
						<p class="text-sm text-gray-600">Receive notifications when you log in.</p>
					</div>
					<Button variant="secondary" size="sm">Enable</Button>
				</div>

				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-sm font-medium text-gray-900">Password</h3>
						<p class="text-sm text-gray-600">Last changed 3 months ago.</p>
					</div>
					<Button variant="secondary" size="sm">Change</Button>
				</div>
			</div>
		</Card>

		<!-- Notification Preferences -->
		<Card variant="flat">
			<h2 class="text-lg font-bold text-gray-800">Notification Preferences</h2>
			<p class="mt-1 text-sm text-gray-600">Choose how you want to be notified about activities.</p>

			<div class="mt-6 space-y-4">
				<div class="flex items-start">
					<div class="flex h-5 items-center">
						<input
							id="email-notifications"
							name="email-notifications"
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							checked
						/>
					</div>
					<div class="ml-3">
						<label for="email-notifications" class="block text-sm font-medium text-gray-700"
							>Email Notifications</label
						>
						<p class="text-sm text-gray-600">Receive email notifications for important updates.</p>
					</div>
				</div>

				<div class="flex items-start">
					<div class="flex h-5 items-center">
						<input
							id="push-notifications"
							name="push-notifications"
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
					</div>
					<div class="ml-3">
						<label for="push-notifications" class="block text-sm font-medium text-gray-700"
							>Push Notifications</label
						>
						<p class="text-sm text-gray-600">Receive push notifications on your devices.</p>
					</div>
				</div>

				<div class="flex items-start">
					<div class="flex h-5 items-center">
						<input
							id="sms-notifications"
							name="sms-notifications"
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							checked
						/>
					</div>
					<div class="ml-3">
						<label for="sms-notifications" class="block text-sm font-medium text-gray-700"
							>SMS Notifications</label
						>
						<p class="text-sm text-gray-600">Receive text messages for urgent notifications.</p>
					</div>
				</div>
			</div>
		</Card>

		<!-- Danger Zone -->
		<Card variant="flat" className="border-l-4 border-red-500">
			<h2 class="text-lg font-bold text-gray-800">Danger Zone</h2>
			<p class="mt-1 text-sm text-gray-600">
				Permanently delete your account and all associated data.
			</p>

			<div class="mt-6">
				<Button
					variant="secondary"
					className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
				>
					Delete Account
				</Button>
				<p class="mt-2 text-sm text-gray-600">
					This action cannot be undone. All your data will be permanently removed.
				</p>
			</div>
		</Card>
	</div>
</PanelPageWrapper>
