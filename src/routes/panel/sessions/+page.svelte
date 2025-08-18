<script lang="ts">
	import ConfirmDialog from '$lib/dialog/ConfirmDialog.svelte';
	import { dialogStore } from '$lib/dialog/store';
	import Card from '$lib/kit/Card.svelte';
	import DataTable from '$lib/kit/DataTable.svelte';
	import PanelPageWrapper from '$lib/kit/PanelPageWrapper.svelte';
	import SessionProvider from '$lib/providers/SessionProvider.svelte';
	import { toast } from '$lib/toast/store';
	import type { RouterOutputs } from '$lib/trpc/router';
	import { onMount, tick } from 'svelte';

	type Session = RouterOutputs['sessions']['getSessions'][number];

	// Provider reference
	let sessionProvider: SessionProvider;

	// State
	let error: string | null = null;
	let currentSessionError: string | null = null;
	let deleteError: string | null = null;

	// Format date for display
	function formatDate(date: Date): string {
		return new Date(date).toLocaleString();
	}

	// Format device type for display
	function formatDeviceType(deviceType: string | null): string {
		if (!deviceType) return 'Unknown';
		return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
	}

	// Format browser for display
	function formatBrowser(browser: string | null): string {
		if (!browser) return 'Unknown';
		return browser;
	}

	// Get device icon based on device type
	function getDeviceIcon(deviceType: string | null): string {
		if (!deviceType) return 'icon-[heroicons--device-phone-mobile]';

		switch (deviceType.toLowerCase()) {
			case 'mobile':
				return 'icon-[heroicons--device-phone-mobile]';
			case 'tablet':
				return 'icon-[heroicons--device-tablet]';
			default:
				return 'icon-[heroicons--computer-desktop]';
		}
	}

	// Get browser icon based on browser name
	function getBrowserIcon(browser: string | null): string {
		if (!browser) return 'icon-[heroicons--globe-alt]';

		const browserLower = browser.toLowerCase();
		if (browserLower.includes('chrome')) {
			return 'icon-[cib--chrome]';
		} else if (browserLower.includes('firefox')) {
			return 'icon-[cib--firefox]';
		} else if (browserLower.includes('safari')) {
			return 'icon-[cib--safari]';
		} else if (browserLower.includes('edge')) {
			return 'icon-[cib--microsoft-edge]';
		} else {
			return 'icon-[heroicons--globe-alt]';
		}
	}

	// Show delete confirmation dialog
	function confirmDelete(session: Session) {
		dialogStore.open({
			component: ConfirmDialog,
			props: {
				title: 'پایان دادن به نشست',
				message: `آیا مطمئن هستید که می‌خواهید نشست از ${formatDeviceType(session.deviceType)} در ${formatDate(new Date(session.createdAt))} را پایان دهید؟ این عمل قابل بازگشت نیست.`,
				confirm: 'پایان دادن',
				cancel: 'لغو',
				color: 'red',
				onConfirm: () => {
					history.back();

					tick().then(() => {
						deleteSession(session.id);
					});
				}
			}
		});
	}

	// Delete a session
	function deleteSession(sessionId: string) {
		if (sessionProvider) {
			sessionProvider.deleteSession(sessionId);
		}
	}

	// Handle delete success
	function handleDeleteSuccess() {
		toast.success('نشست با موفقیت پایان یافت');
		sessionProvider.getSessions(); // Refresh the list
	}

	// Handle delete error
	function handleDeleteError(error: string) {
		toast.error(error || 'پایان دادن به نشست ناموفق بود');
	}

	// Handle row actions
	function handleRowAction(event: Event, sessionList: Session[]) {
		const target = event.target as HTMLElement;
		const button = target.closest('button[data-action]');

		if (!button) return;

		const action = button.getAttribute('data-action');
		const id = button.getAttribute('data-id');

		if (!action || !id) return;

		switch (action) {
			case 'delete':
				// Find the session in the current list
				const session = sessionList?.find((s: Session) => s.id === id);
				if (session) {
					confirmDelete(session);
				}
				break;
		}
	}

	// Define columns for the DataTable
	const columns = [
		{
			key: 'deviceType',
			label: 'دستگاه',
			render: (value: string, row: Session) => `
				<div class="flex items-center">
					<span class="${getDeviceIcon(row.deviceType)} h-5 w-5 text-gray-500"></span>
					<span class="ms-2 text-sm font-medium text-gray-900">${formatDeviceType(row.deviceType)}</span>
				</div>
			`
		},
		{
			key: 'browser',
			label: 'مرورگر',
			render: (value: string, row: Session) => `
				<div class="flex items-center">
					<span class="${getBrowserIcon(row.browser)} h-5 w-5 text-gray-500"></span>
					<span class="ms-2 text-sm text-gray-900">${formatBrowser(row.browser)}</span>
				</div>
			`
		},
		{
			key: 'ipAddress',
			label: 'آدرس IP',
			render: (value: string) => `
				<div class="text-sm text-gray-500">
					${value || 'Unknown'}
				</div>
			`
		},
		{
			key: 'createdAt',
			label: 'زمان ورود',
			render: (value: Date) => `
				<div class="text-sm text-gray-500">
					${formatDate(value)}
				</div>
			`
		},
		{
			key: 'actions',
			label: 'عملیات',
			render: (value: any, row: Session) => `
				<div class="flex items-center justify-end gap-2">
					<button
						class="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
						data-action="delete"
						data-id="${row.id}"
						title="پایان دادن به نشست"
					>
						<span class="icon-[heroicons--trash] w-4 h-4"></span>
					</button>
				</div>
			`
		}
	];

	// Load sessions when component mounts
	onMount(() => {
		sessionProvider.getSessions();
	});
</script>

<SessionProvider
	bind:this={sessionProvider}
	onDeleteSuccess={handleDeleteSuccess}
	onDeleteError={handleDeleteError}
	let:sessions
	let:loading
	let:errorMessage
	let:deleteLoading
	let:deleteErrorMessage
	let:clearError
	let:clearDeleteError
	let:getSessions
	let:deleteSession
	let:currentSession
	onError={(message) => toast.error(message || 'Failed to fetch sessions')}
>
	<PanelPageWrapper
		title="مدیریت نشست‌ها"
		description="مشاهده و مدیریت نشست‌های فعال خود در دستگاه‌ها."
	>
		<!-- Current Session Section -->
		<Card variant="flat" className="mb-6">
			<div class="flex items-center justify-between border-b border-gray-200 pb-4">
				<div class="flex items-center space-x-2">
					<span class="icon-[heroicons--computer-desktop] h-5 w-5 text-gray-500"></span>
					<h2 class="text-lg font-semibold text-gray-800">نشست فعلی</h2>
				</div>
			</div>

			{#if loading}
				<div class="flex justify-center py-6">
					<span class="icon-[svg-spinners--bars-scale-fade] h-6 w-6 text-blue-500"></span>
				</div>
			{:else if currentSession}
				<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div class="rounded-lg border border-gray-200 p-4">
						<div class="flex items-center">
							<span class="{getDeviceIcon(currentSession.deviceType || null)} h-6 w-6 text-gray-500"
							></span>
							<span class="ms-2 text-sm font-medium text-gray-900">دستگاه</span>
						</div>
						<p class="mt-1 text-sm text-gray-500">
							{formatDeviceType(currentSession.deviceType || null)}
						</p>
					</div>

					<div class="rounded-lg border border-gray-200 p-4">
						<div class="flex items-center">
							<span class="{getBrowserIcon(currentSession.browser || null)} h-6 w-6 text-gray-500"
							></span>
							<span class="ms-2 text-sm font-medium text-gray-900">مرورگر</span>
						</div>
						<p class="mt-1 text-sm text-gray-500">
							{formatBrowser(currentSession.browser || null)}
						</p>
					</div>

					<div class="rounded-lg border border-gray-200 p-4">
						<div class="flex items-center">
							<span class="icon-[heroicons--globe-alt] h-6 w-6 text-gray-500"></span>
							<span class="ms-2 text-sm font-medium text-gray-900">آدرس IP</span>
						</div>
						<p class="mt-1 text-sm text-gray-500">{currentSession.ipAddress || 'Unknown'}</p>
					</div>

					<div class="rounded-lg border border-gray-200 p-4">
						<div class="flex items-center">
							<span class="icon-[heroicons--clock] h-6 w-6 text-gray-500"></span>
							<span class="ms-2 text-sm font-medium text-gray-900">زمان ورود</span>
						</div>
						<p class="mt-1 text-sm text-gray-500">
							{formatDate(new Date(currentSession.createdAt))}
						</p>
					</div>
				</div>
			{:else}
				<div class="py-6 text-center">
					<div class="mx-auto h-12 w-12 text-gray-400">
						<span class="icon-[heroicons--exclamation-triangle] h-12 w-12"></span>
					</div>
					<h3 class="mt-2 text-sm font-medium text-gray-900">نشست فعلی یافت نشد</h3>
					<p class="mt-1 text-sm text-gray-500">امکان دریافت اطلاعات نشست فعلی شما وجود ندارد.</p>
				</div>
			{/if}
		</Card>

		<!-- All Sessions Section -->
		<Card variant="flat">
			<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="text-lg font-bold text-gray-800">نشست‌های فعال</h2>
					<p class="mt-1 text-sm text-gray-600">فهرست تمام نشست‌های فعال شما در دستگاه‌ها</p>
				</div>
			</div>

			<!-- Loading State -->
			{#if loading}
				<div class="flex justify-center py-12">
					<span class="icon-[svg-spinners--bars-scale-fade] h-8 w-8 text-blue-500"></span>
				</div>
			{/if}

			<!-- Error State -->
			{#if errorMessage}
				<Card variant="flat" className="mb-6">
					<div class="rounded-md bg-red-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<span class="icon-[heroicons--x-circle] h-5 w-5 text-red-400"></span>
							</div>
							<div class="ms-3">
								<h3 class="text-sm font-medium text-red-800">خطا در بارگذاری نشست‌ها</h3>
								<div class="mt-2 text-sm text-red-700">
									<p>{errorMessage}</p>
									<button
										class="mt-2 text-sm text-red-600 underline hover:text-red-500"
										on:click={() => {
											clearError();
										}}
									>
										رد
									</button>
								</div>
							</div>
						</div>
					</div>
				</Card>
			{/if}

			<!-- Sessions Table -->
			{#if !loading && !errorMessage}
				{#if sessions?.length === 0}
					<div class="py-12 text-center">
						<div class="mx-auto h-12 w-12 text-gray-400">
							<span class="icon-[heroicons--document-text] h-12 w-12"></span>
						</div>
						<h3 class="mt-2 text-sm font-medium text-gray-900">نشست فعالی وجود ندارد</h3>
						<p class="mt-1 text-sm text-gray-500">شما هیچ نشست فعالی به جز نشست فعلی ندارید.</p>
					</div>
				{:else}
					<div on:click={(e) => handleRowAction(e, sessions?.filter((s) => !s.isCurrent) || [])}>
						<DataTable
							data={sessions?.filter((s) => !s.isCurrent)}
							{columns}
							itemsPerPage={10}
							totalItems={sessions?.filter((s) => !s.isCurrent).length || 0}
							currentPage={1}
							showPagination={false}
							onPageChange={() => {}}
							onSortChange={() => {}}
						/>
					</div>
				{/if}
			{/if}
		</Card>
	</PanelPageWrapper>
</SessionProvider>
