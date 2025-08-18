<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import PermissionCheck from '$lib/components/PermissionCheck.svelte';
	import { ActionButtons, Button, KycStatusIndicator, PanelPageWrapper } from '$lib/kit';
	import type { ActionConfig } from '$lib/kit/ActionButtons.svelte';
	import Card from '$lib/kit/Card.svelte';
	import ApproveKycRequestProvider from '$lib/providers/ApproveKycRequestProvider.svelte';
	import GetKycDetailsProvider from '$lib/providers/GetKycDetailsProvider.svelte';
	import RejectKycRequestProvider from '$lib/providers/RejectKycRequestProvider.svelte';
	import { toast } from '$lib/toast/store';

	// State
	let kycDetailsProvider: GetKycDetailsProvider;
	let kycApproveProvider: ApproveKycRequestProvider;
	let kycRejectProvider: RejectKycRequestProvider;

	$: kycId = $page.params.id;

	// Format date
	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Handle approval
	function handleApprove() {
		if (kycApproveProvider) {
			kycApproveProvider.approveKycRequest({ kycId });
		}
	}

	// Handle rejection
	function handleReject(reason: string) {
		if (kycRejectProvider) {
			kycRejectProvider.rejectKycRequest({ kycId, rejectionReason: reason });
		}
	}

	// Configure action buttons
	$: kycActions = [
		{
			id: 'approve',
			label: 'Approve',
			variant: 'gradient-success',
			iconClass: 'heroicons--check',
			confirmation: {
				title: 'Approve KYC Request',
				message: 'Are you sure you want to approve this KYC request? This action cannot be undone.',
				confirm: 'Approve',
				cancel: 'Cancel',
				color: 'blue'
			},
			onClick: () => {
				history.back();
				handleApprove();
			}
		},
		{
			id: 'reject',
			label: 'Reject',
			variant: 'gradient',
			iconClass: 'heroicons--x-mark',
			inputDialog: {
				title: 'Reject KYC Request',
				message:
					'Please provide a reason for rejecting this KYC request. This will be shown to the user.',
				placeholder: 'Enter rejection reason...',
				confirm: 'Reject',
				cancel: 'Cancel',
				required: true
			},
			onClick: (reason?: string) => {
				history.back();
				if (reason) {
					handleReject(reason);
				}
			}
		}
	] as ActionConfig[];

	// Handle action success
	function handleActionSuccess() {
		toast.success('Action completed successfully');
		kycDetailsProvider.refresh();
	}

	// Handle action error
	function handleActionError(error: string) {
		toast.error(error);
	}
</script>

<PanelPageWrapper
	title="KYC Request Details"
	description="Review and manage user KYC verification request"
>
	<PermissionCheck permission={{ resource: 'kyc', action: 'manage' }} redirect="/panel">
		<!-- KYC Details Provider -->
		<GetKycDetailsProvider
			bind:this={kycDetailsProvider}
			{kycId}
			let:loading={detailsLoading}
			let:errorMessage={detailsErrorMessage}
			let:kycDetails
		>
			<!-- KYC Approve Provider -->
			<ApproveKycRequestProvider
				bind:this={kycApproveProvider}
				onSuccess={handleActionSuccess}
				onError={handleActionError}
				let:loading={approveLoading}
			>
				<!-- KYC Reject Provider -->
				<RejectKycRequestProvider
					bind:this={kycRejectProvider}
					onSuccess={handleActionSuccess}
					onError={handleActionError}
					let:loading={rejectLoading}
				>
					{#if detailsLoading}
						<div class="p-8 text-center">
							<span class="icon-[svg-spinners--ring-resize] me-3 h-8 w-8 text-blue-500"></span>
						</div>
					{:else if detailsErrorMessage}
						<div class="p-6">
							<div class="rounded-lg border border-red-200 bg-red-50 p-4">
								<div class="flex items-center">
									<span class="icon-[heroicons--exclamation-triangle] me-2 h-5 w-5 text-red-500"
									></span>
									<span class="text-red-700">{detailsErrorMessage}</span>
								</div>
							</div>
						</div>
					{:else if kycDetails}
						<div class="space-y-6">
							<!-- User Information -->
							<Card variant="flat">
								<h3 class="mb-4 text-lg font-medium text-gray-900">User Information</h3>
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div>
										<p class="text-sm text-gray-500">Username</p>
										<p class="font-medium">{kycDetails.username || 'N/A'}</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Email</p>
										<p class="font-medium">{kycDetails.email || 'N/A'}</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Account Created</p>
										<p class="font-medium">
											{kycDetails.userCreatedAt ? formatDate(kycDetails.userCreatedAt) : 'N/A'}
										</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Step 1 Status</p>
										<div class="mt-1">
											<KycStatusIndicator status={kycDetails.step1Status} size="sm" />
										</div>
									</div>
									<div>
										<p class="text-sm text-gray-500">Step 2 Status</p>
										<div class="mt-1">
											<KycStatusIndicator status={kycDetails.step2Status} size="sm" />
										</div>
									</div>
								</div>
							</Card>

							<!-- National ID Information -->
							<Card variant="flat">
								<h3 class="mb-4 text-lg font-medium text-gray-900">National ID Information</h3>
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div>
										<p class="text-sm text-gray-500">National ID</p>
										<p class="font-medium">{kycDetails.nationalId || 'N/A'}</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Mobile Number</p>
										<p class="font-medium">{kycDetails.mobile || 'N/A'}</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Birth Date</p>
										<p class="font-medium">
											{kycDetails.birthDate ? formatDate(kycDetails.birthDate) : 'N/A'}
										</p>
									</div>
								</div>
							</Card>

							<!-- Status Information -->
							<Card variant="flat">
								<h3 class="mb-4 text-lg font-medium text-gray-900">Status Information</h3>
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div>
										<p class="text-sm text-gray-500">Step 1 Status</p>
										<div class="mt-1">
											<KycStatusIndicator status={kycDetails.step1Status} size="sm" />
										</div>
									</div>
									<div>
										<p class="text-sm text-gray-500">Step 2 Status</p>
										<div class="mt-1">
											<KycStatusIndicator status={kycDetails.step2Status} size="sm" />
										</div>
									</div>
									<div>
										<p class="text-sm text-gray-500">Step 1 Rejected At</p>
										<p class="font-medium">
											{kycDetails.step1RejectedAt ? formatDate(kycDetails.step1RejectedAt) : 'N/A'}
										</p>
									</div>
									<div>
										<p class="text-sm text-gray-500">Step 2 Rejected At</p>
										<p class="font-medium">
											{kycDetails.step2RejectedAt ? formatDate(kycDetails.step2RejectedAt) : 'N/A'}
										</p>
									</div>
									{#if kycDetails.step1RejectionReason}
										<div>
											<p class="text-sm text-gray-500">Step 1 Rejection Reason</p>
											<p class="font-medium">{kycDetails.step1RejectionReason}</p>
										</div>
									{/if}
									{#if kycDetails.step2RejectionReason}
										<div>
											<p class="text-sm text-gray-500">Step 2 Rejection Reason</p>
											<p class="font-medium">{kycDetails.step2RejectionReason}</p>
										</div>
									{/if}
									{#if kycDetails.adminNotes}
										<div class="sm:col-span-2">
											<p class="text-sm text-gray-500">Admin Notes</p>
											<p class="font-medium">{kycDetails.adminNotes}</p>
										</div>
									{/if}
									<div class="sm:col-span-2">
										<p class="text-sm text-gray-500">Last Step Updated At</p>
										<p class="font-medium">{formatDate(kycDetails.lastStepUpdatedAt)}</p>
									</div>
								</div>
							</Card>

							<!-- Media Files -->
							<Card variant="flat">
								<h3 class="mb-4 text-lg font-medium text-gray-900">Media Files</h3>
								<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
									<!-- Selfie Media -->
									<div>
										<h4 class="mb-2 font-medium text-gray-900">Selfie</h4>
										{#if kycDetails.selfieMediaId}
											<!-- We'll fetch media details separately or use a placeholder -->
											<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
												<div class="flex items-center justify-between">
													<div class="flex items-center">
														<span class="icon-[heroicons--photo] me-2 h-5 w-5 text-gray-500"></span>
														<div>
															<div class="text-sm font-medium text-gray-900">Selfie Image</div>
															<div class="text-xs text-gray-500">
																ID: {kycDetails.selfieMediaId}
															</div>
														</div>
													</div>
													<div class="flex space-x-2">
														<a
															href="/media/{kycDetails.selfieMediaId}"
															download="selfie.jpg"
															class="inline-flex items-center rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
														>
															<span class="icon-[heroicons--arrow-down-tray] me-1 h-4 w-4"></span>
															Download
														</a>
													</div>
												</div>
											</div>
										{:else}
											<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
												<span class="icon-[heroicons--camera] mx-auto mb-2 h-6 w-6 text-gray-400"
												></span>
												<p class="text-sm text-gray-500">No selfie uploaded</p>
											</div>
										{/if}
									</div>

									<!-- Signed Text Media -->
									<div>
										<h4 class="mb-2 font-medium text-gray-900">Signed Text</h4>
										{#if kycDetails.signedTextMediaId}
											<!-- We'll fetch media details separately or use a placeholder -->
											<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
												<div class="flex items-center justify-between">
													<div class="flex items-center">
														<span class="icon-[heroicons--document-text] me-2 h-5 w-5 text-gray-500"
														></span>
														<div>
															<div class="text-sm font-medium text-gray-900">Signed Document</div>
															<div class="text-xs text-gray-500">
																ID: {kycDetails.signedTextMediaId}
															</div>
														</div>
													</div>
													<div class="flex space-x-2">
														<a
															href="/media/{kycDetails.signedTextMediaId}"
															download="signed-text.jpg"
															class="inline-flex items-center rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
														>
															<span class="icon-[heroicons--arrow-down-tray] me-1 h-4 w-4"></span>
															Download
														</a>
													</div>
												</div>
											</div>
										{:else}
											<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
												<span
													class="icon-[heroicons--document-text] mx-auto mb-2 h-6 w-6 text-gray-400"
												></span>
												<p class="text-sm text-gray-500">No signed document uploaded</p>
											</div>
										{/if}
									</div>

									<!-- National Card Media -->
									<div>
										<h4 class="mb-2 font-medium text-gray-900">National Card</h4>
										{#if kycDetails.nationalCardMediaId}
											<!-- We'll fetch media details separately or use a placeholder -->
											<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
												<div class="flex items-center justify-between">
													<div class="flex items-center">
														<span
															class="icon-[heroicons--identification] me-2 h-5 w-5 text-gray-500"
														></span>
														<div>
															<div class="text-sm font-medium text-gray-900">National Card</div>
															<div class="text-xs text-gray-500">
																ID: {kycDetails.nationalCardMediaId}
															</div>
														</div>
													</div>
													<div class="flex space-x-2">
														<a
															href="/media/{kycDetails.nationalCardMediaId}"
															download="national-card.jpg"
															class="inline-flex items-center rounded-md bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
														>
															<span class="icon-[heroicons--arrow-down-tray] me-1 h-4 w-4"></span>
															Download
														</a>
													</div>
												</div>
											</div>
										{:else}
											<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
												<span
													class="icon-[heroicons--identification] mx-auto mb-2 h-6 w-6 text-gray-400"
												></span>
												<p class="text-sm text-gray-500">No national card uploaded</p>
											</div>
										{/if}
									</div>
								</div>
							</Card>

							<!-- Action Buttons -->
							{#if kycDetails.step1Status === 'PENDING' || kycDetails.step2Status === 'PENDING'}
								<div class="flex justify-end">
									<ActionButtons actions={kycActions} loading={approveLoading || rejectLoading} />
								</div>
							{/if}
						</div>
					{:else}
						<div class="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
							<span class="icon-[heroicons--user-circle] mx-auto h-12 w-12 text-gray-400"></span>
							<h3 class="mt-2 text-sm font-medium text-gray-900">KYC request not found</h3>
							<p class="mt-1 text-sm text-gray-500">
								The requested KYC request could not be found.
							</p>
							<div class="mt-6">
								<Button href="/panel/admin/kyc" variant="primary">
									<span class="icon-[heroicons--arrow-left] me-2 h-4 w-4"></span>
									Back to KYC Requests
								</Button>
							</div>
						</div>
					{/if}
				</RejectKycRequestProvider>
			</ApproveKycRequestProvider>
		</GetKycDetailsProvider>
	</PermissionCheck>
</PanelPageWrapper>
