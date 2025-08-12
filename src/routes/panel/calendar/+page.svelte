<script lang="ts">
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import Button from '$lib/kit/Button.svelte';
	import Card from '$lib/kit/Card.svelte';
	
	// Sample calendar data
	const today = new Date();
	const currentMonth = today.toLocaleString('default', { month: 'long' });
	const currentYear = today.getFullYear();
	
	// Sample events
	const events = [
		{
			id: 1,
			title: 'Team Meeting',
			date: new Date(today.getFullYear(), today.getMonth(), 15, 10, 0),
			duration: 60,
			attendees: 5,
			project: 'Website Redesign'
		},
		{
			id: 2,
			title: 'Client Presentation',
			date: new Date(today.getFullYear(), today.getMonth(), 18, 14, 0),
			duration: 90,
			attendees: 8,
			project: 'Mobile App'
		},
		{
			id: 3,
			title: 'Sprint Planning',
			date: new Date(today.getFullYear(), today.getMonth(), 22, 9, 0),
			duration: 120,
			attendees: 12,
			project: 'Analytics Dashboard'
		}
	];
	
	// Generate calendar days
	const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
	
	// Create array of days
	const calendarDays = [];
	for (let i = 0; i < firstDayOfMonth; i++) {
		calendarDays.push(null);
	}
	for (let i = 1; i <= daysInMonth; i++) {
		calendarDays.push(i);
	}
</script>

<PanelPageWrapper title="Calendar" description="View and manage your schedule and events.">
	<svelte:fragment slot="actions">
		<Button variant="secondary" className="px-4 py-2">Today</Button>
		<Button className="px-4 py-2">Create Event</Button>
	</svelte:fragment>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
		<!-- Calendar View -->
		<Card className="lg:col-span-3">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-800">{currentMonth} {currentYear}</h2>
				<div class="flex space-x-2">
					<Button variant="secondary" size="sm">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
						</svg>
					</Button>
					<Button variant="secondary" size="sm">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</Button>
				</div>
			</div>
			
			<!-- Calendar Grid -->
			<div class="mt-6 grid grid-cols-7 gap-1">
				<!-- Day Headers -->
				{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
					<div class="py-2 text-center text-sm font-medium text-gray-500">{day}</div>
				{/each}
				
				<!-- Calendar Days -->
				{#each calendarDays as day, i}
					{#if day === null}
						<div class="h-24 border border-gray-100"></div>
					{:else}
						<div class={`h-24 border border-gray-100 p-1 ${day === today.getDate() ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
							<div class={`text-right text-sm ${day === today.getDate() ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
								{day}
							</div>
							<!-- Events for this day -->
							{#each events.filter(e => e.date.getDate() === day) as event}
								<div class="mt-1 truncate rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-800">
									{event.title}
								</div>
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		</Card>
		
		<!-- Upcoming Events -->
		<Card>
			<h2 class="text-lg font-bold text-gray-800">Upcoming Events</h2>
			<p class="mt-1 text-sm text-gray-600">Events happening in the next 30 days</p>
			
			<div class="mt-6 space-y-4">
				{#each events as event}
					<div class="rounded-lg border border-gray-200 p-4 hover:shadow-md">
						<div class="flex justify-between">
							<h3 class="font-medium text-gray-900">{event.title}</h3>
							<span class="text-sm text-gray-500">
								{event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</span>
						</div>
						<p class="mt-1 text-sm text-gray-500">{event.project}</p>
						<div class="mt-2 flex items-center justify-between">
							<div class="flex items-center">
								<svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
								</svg>
								<span class="ml-1 text-xs text-gray-500">{event.attendees}</span>
							</div>
							<span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
								{event.duration}m
							</span>
						</div>
					</div>
				{/each}
				
				{#if events.length === 0}
					<div class="py-8 text-center">
						<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
						</svg>
						<h3 class="mt-2 text-sm font-medium text-gray-900">No upcoming events</h3>
						<p class="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
						<div class="mt-6">
							<Button className="w-full">Create Event</Button>
						</div>
					</div>
				{/if}
			</div>
		</Card>
	</div>
	
	<!-- Event Details Modal Placeholder -->
	<!-- In a real app, this would be a modal that opens when an event is clicked -->
</PanelPageWrapper>